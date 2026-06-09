from flask import request, jsonify
from database import db, Seller, SellerOrder, SellerInventory, Blanket, Distributor
from datetime import datetime, timedelta
import random
import string

def generate_seller_order_number():
    """Generate a unique seller order number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f"SELLER-ORD-{timestamp}-{random_digits}"

def register_seller_routes(app):
    
    # ============ SELLER REGISTRATION & MANAGEMENT ============
    
    @app.route('/api/seller/register', methods=['POST'])
    def register_seller():
        try:
            data = request.get_json()
            
            existing = Seller.query.filter_by(email=data['email']).first()
            if existing:
                return jsonify({'error': 'Seller with this email already exists'}), 400
            
            new_seller = Seller(
                business_name=data['business_name'],
                owner_name=data.get('owner_name', ''),
                email=data['email'],
                phone=data.get('phone', ''),
                address=data.get('address', ''),
                store_type=data.get('store_type', 'physical'),
                website=data.get('website', ''),
                is_active=True
            )
            
            db.session.add(new_seller)
            db.session.commit()
            
            return jsonify({
                'message': 'Seller registered successfully',
                'seller': new_seller.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/sellers', methods=['GET'])
    def get_all_sellers():
        try:
            sellers = Seller.query.all()
            return jsonify({
                'count': len(sellers),
                'sellers': [s.to_dict() for s in sellers]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/seller/<int:seller_id>', methods=['GET'])
    def get_seller(seller_id):
        try:
            seller = Seller.query.get(seller_id)
            if not seller:
                return jsonify({'error': 'Seller not found'}), 404
            return jsonify({'seller': seller.to_dict()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ VIEW AVAILABLE BLANKETS (for seller to order) ============
    
    @app.route('/api/seller/available-blankets', methods=['GET'])
    def get_available_blankets_for_seller():
        """Get all blankets available from manufacturers"""
        try:
            # Show all blankets that have quantity > 0 in manufacturer
            available_blankets = Blanket.query.filter(Blanket.quantity > 0).all()
            
            # Get all distributors
            distributors = Distributor.query.all()
            
            # For each blanket, show available distributors
            result = []
            for blanket in available_blankets:
                blanket_data = blanket.to_dict()
                blanket_data['available_distributors'] = [d.to_dict() for d in distributors]
                result.append(blanket_data)
            
            return jsonify({
                'count': len(result),
                'available_blankets': result
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ PLACE ORDER (BROADCAST TO ALL DISTRIBUTORS) ============
    
    @app.route('/api/seller/place-order', methods=['POST'])
    def place_seller_order():
        """
        Seller places order - BROADCAST to ALL distributors
        Do NOT update seller inventory here - only when distributor accepts
        """
        try:
            data = request.get_json()
            
            seller_id = data.get('seller_id')
            items = data.get('items', [])
            notes = data.get('notes', '')
            
            seller = Seller.query.get(seller_id)
            if not seller:
                return jsonify({'error': 'Seller not found'}), 404
            
            if not items:
                return jsonify({'error': 'No items in order'}), 400
            
            orders_created = []
            total_cost = 0
            
            for item in items:
                blanket_id = item.get('blanket_id')
                quantity = item.get('quantity')
                selling_price = item.get('selling_price', 0)
                
                blanket = Blanket.query.get(blanket_id)
                if not blanket:
                    return jsonify({'error': f'Blanket ID {blanket_id} not found'}), 404
                
                # Check manufacturer stock
                if blanket.quantity < quantity:
                    return jsonify({
                        'error': f'Insufficient stock from manufacturer for {blanket.name}. Available: {blanket.quantity}'
                    }), 400
                
                unit_price = blanket.price
                item_total = blanket.price * quantity
                total_cost += item_total
                
                order_number = generate_seller_order_number()
                
                # Create order - NO distributor_id, only seller_id
                # accepted_distributor_id will be NULL until a distributor accepts
                new_order = SellerOrder(
                    order_number=order_number,
                    seller_id=seller_id,
                    blanket_id=blanket_id,
                    blanket_name=blanket.name,
                    quantity=quantity,
                    unit_price=unit_price,
                    selling_price=selling_price if selling_price > 0 else unit_price * 1.3,
                    total_amount=item_total,
                    status='Pending',
                    notes=notes,
                    accepted_distributor_id=None
                )
                
                # Reduce manufacturer inventory
                blanket.quantity -= quantity
                
                # DO NOT update seller inventory here - wait for distributor acceptance
                
                db.session.add(new_order)
                orders_created.append(new_order)
            
            db.session.commit()
            
            return jsonify({
                'message': f'Order placed successfully! Broadcasted to all distributors.',
                'total_cost': round(total_cost, 2),
                'orders': [order.to_dict() for order in orders_created]
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ VIEW SELLER'S ORDERS ============
    
    @app.route('/api/seller/<int:seller_id>/orders', methods=['GET'])
    def get_seller_orders(seller_id):
        try:
            seller = Seller.query.get(seller_id)
            if not seller:
                return jsonify({'error': 'Seller not found'}), 404
            
            query = SellerOrder.query.filter_by(seller_id=seller_id)
            
            status = request.args.get('status')
            if status:
                query = query.filter_by(status=status)
            
            limit = request.args.get('limit', 100, type=int)
            orders = query.order_by(SellerOrder.order_date.desc()).limit(limit).all()
            
            # Add accepted distributor name if order is accepted
            orders_data = []
            for order in orders:
                order_dict = order.to_dict()
                if order.accepted_distributor_id:
                    distributor = Distributor.query.get(order.accepted_distributor_id)
                    order_dict['accepted_distributor_name'] = distributor.name if distributor else None
                orders_data.append(order_dict)
            
            return jsonify({
                'seller': seller.business_name,
                'total_orders': len(orders_data),
                'orders': orders_data
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/seller/order/<string:order_number>', methods=['GET'])
    def get_seller_order_details(order_number):
        try:
            order = SellerOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            order_dict = order.to_dict()
            if order.accepted_distributor_id:
                distributor = Distributor.query.get(order.accepted_distributor_id)
                order_dict['accepted_distributor_name'] = distributor.name if distributor else None
            
            return jsonify({'order': order_dict}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/seller/order/<string:order_number>/cancel', methods=['POST'])
    def cancel_seller_order(order_number):
        try:
            order = SellerOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            if order.status not in ['Pending']:
                return jsonify({'error': f'Cannot cancel order with status: {order.status}'}), 400
            
            # Return stock to manufacturer
            blanket = Blanket.query.get(order.blanket_id)
            if blanket:
                blanket.quantity += order.quantity
            
            # Remove from seller inventory
            inventory = SellerInventory.query.filter_by(
                seller_id=order.seller_id,
                blanket_id=order.blanket_id
            ).first()
            
            if inventory:
                inventory.quantity -= order.quantity
                if inventory.quantity <= 0:
                    db.session.delete(inventory)
            
            order.status = 'Cancelled'
            db.session.commit()
            
            return jsonify({
                'message': f'Order {order_number} has been cancelled',
                'stock_restored': order.quantity,
                'order': order.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ SELLER INVENTORY (Shows 0 for products not in inventory) ============
    
    @app.route('/api/seller/<int:seller_id>/inventory', methods=['GET'])
    def get_seller_inventory(seller_id):
        """
        Get seller's inventory - shows 0 for products not yet purchased
        """
        try:
            seller = Seller.query.get(seller_id)
            if not seller:
                return jsonify({'error': 'Seller not found'}), 404
            
            # Get all blankets from manufacturer
            all_blankets = Blanket.query.all()
            
            # Get seller's existing inventory
            existing_inventory = SellerInventory.query.filter_by(seller_id=seller_id).all()
            existing_dict = {inv.blanket_id: inv for inv in existing_inventory}
            
            # Build complete inventory list (including products with 0 quantity)
            inventory_list = []
            for blanket in all_blankets:
                if blanket.id in existing_dict:
                    inv = existing_dict[blanket.id]
                    inventory_list.append({
                        'id': inv.id,
                        'seller_id': inv.seller_id,
                        'blanket_id': inv.blanket_id,
                        'blanket_name': inv.blanket_name,
                        'quantity': inv.quantity,
                        'purchased_price': inv.purchased_price,
                        'selling_price': inv.selling_price,
                        'last_updated': inv.last_updated.strftime('%Y-%m-%d %H:%M:%S') if inv.last_updated else None
                    })
                else:
                    # Product not in inventory yet - show 0 quantity
                    inventory_list.append({
                        'id': None,
                        'seller_id': seller_id,
                        'blanket_id': blanket.id,
                        'blanket_name': blanket.name,
                        'quantity': 0,
                        'purchased_price': blanket.price,
                        'selling_price': blanket.price * 1.3,
                        'last_updated': None
                    })
            
            return jsonify({
                'seller': seller.business_name,
                'total_items': sum(item['quantity'] for item in inventory_list),
                'inventory': inventory_list
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/seller/<int:seller_id>/inventory/sell', methods=['POST'])
    def sell_from_inventory(seller_id):
        """Record a sale from seller's inventory"""
        try:
            seller = Seller.query.get(seller_id)
            if not seller:
                return jsonify({'error': 'Seller not found'}), 404
            
            data = request.get_json()
            blanket_id = data.get('blanket_id')
            quantity_sold = data.get('quantity')
            
            inventory = SellerInventory.query.filter_by(
                seller_id=seller_id,
                blanket_id=blanket_id
            ).first()
            
            if not inventory:
                return jsonify({'error': 'Product not found in inventory'}), 404
            
            if inventory.quantity < quantity_sold:
                return jsonify({
                    'error': f'Insufficient inventory. Available: {inventory.quantity}'
                }), 400
            
            inventory.quantity -= quantity_sold
            inventory.last_updated = datetime.utcnow()
            
            db.session.commit()
            
            return jsonify({
                'message': f'Sold {quantity_sold} units of {inventory.blanket_name}',
                'remaining_quantity': inventory.quantity,
                'inventory': inventory.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ SELLER DASHBOARD ============
    
    @app.route('/api/seller/<int:seller_id>/dashboard', methods=['GET'])
    def get_seller_dashboard(seller_id):
        try:
            seller = Seller.query.get(seller_id)
            if not seller:
                return jsonify({'error': 'Seller not found'}), 404
            
            orders = SellerOrder.query.filter_by(seller_id=seller_id).all()
            
            total_orders = len(orders)
            pending_orders = len([o for o in orders if o.status == 'Pending'])
            accepted_orders = len([o for o in orders if o.status == 'Accepted'])
            fulfilled_orders = len([o for o in orders if o.status in ['Delivered', 'Fulfilled']])
            total_spent = sum(order.total_amount for order in orders)
            
            # Get all inventory (including zero quantity items)
            all_blankets = Blanket.query.all()
            existing_inventory = SellerInventory.query.filter_by(seller_id=seller_id).all()
            existing_dict = {inv.blanket_id: inv for inv in existing_inventory}
            
            total_inventory_value = 0
            total_items_in_stock = 0
            
            for blanket in all_blankets:
                if blanket.id in existing_dict:
                    inv = existing_dict[blanket.id]
                    total_inventory_value += inv.quantity * inv.purchased_price
                    total_items_in_stock += inv.quantity
            
            recent_orders = SellerOrder.query.filter_by(seller_id=seller_id)\
                .order_by(SellerOrder.order_date.desc()).limit(5).all()
            
            recent_orders_data = []
            for order in recent_orders:
                order_dict = order.to_dict()
                if order.accepted_distributor_id:
                    distributor = Distributor.query.get(order.accepted_distributor_id)
                    order_dict['accepted_distributor_name'] = distributor.name if distributor else None
                recent_orders_data.append(order_dict)
            
            return jsonify({
                'seller': seller.to_dict(),
                'summary': {
                    'total_orders_placed': total_orders,
                    'pending_orders': pending_orders,
                    'accepted_orders': accepted_orders,
                    'fulfilled_orders': fulfilled_orders,
                    'total_amount_spent': round(total_spent, 2),
                    'total_inventory_value': round(total_inventory_value, 2),
                    'total_items_in_stock': total_items_in_stock
                },
                'recent_orders': recent_orders_data
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500