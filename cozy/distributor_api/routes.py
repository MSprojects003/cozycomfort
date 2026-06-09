from flask import request, jsonify
from database import db, Blanket, Distributor, DistributorOrder, DistributorInventory, SellerOrder, SellerInventory
from datetime import datetime
import random
import string

def generate_order_number():
    """Generate a unique order number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f"COZY-DIST-{timestamp}-{random_digits}"

def register_distributor_routes(app):
    
    # ============ DISTRIBUTOR MANAGEMENT ============
    
    @app.route('/api/distributor/register', methods=['POST'])
    def register_distributor():
        try:
            data = request.get_json()
            
            existing = Distributor.query.filter_by(email=data['email']).first()
            if existing:
                return jsonify({'error': 'Distributor with this email already exists'}), 400
            
            new_distributor = Distributor(
                name=data['name'],
                email=data['email'],
                phone=data.get('phone', ''),
                address=data.get('address', '')
            )
            
            db.session.add(new_distributor)
            db.session.commit()
            
            return jsonify({
                'message': 'Distributor registered successfully',
                'distributor': new_distributor.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/distributors', methods=['GET'])
    def get_all_distributors():
        try:
            distributors = Distributor.query.all()
            return jsonify({
                'count': len(distributors),
                'distributors': [d.to_dict() for d in distributors]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/distributor/<int:distributor_id>', methods=['GET'])
    def get_distributor_by_id(distributor_id):
        try:
            distributor = Distributor.query.get(distributor_id)
            if not distributor:
                return jsonify({'error': 'Distributor not found'}), 404
            return jsonify({'distributor': distributor.to_dict()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ VIEW AVAILABLE BLANKETS ============
    
    @app.route('/api/distributor/available-blankets', methods=['GET'])
    def get_available_products():
        try:
            available_blankets = Blanket.query.filter(Blanket.quantity > 0).all()
            return jsonify({
                'count': len(available_blankets),
                'available_blankets': [blanket.to_dict() for blanket in available_blankets]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ DISTRIBUTOR INVENTORY ============
    
    @app.route('/api/distributor/inventory', methods=['GET'])
    def get_distributor_stock():
        try:
            distributor_id = request.args.get('distributor_id', type=int)
            if not distributor_id:
                return jsonify({'error': 'distributor_id is required'}), 400
            
            all_blankets = Blanket.query.all()
            existing_inventory = DistributorInventory.query.filter_by(distributor_id=distributor_id).all()
            existing_dict = {inv.blanket_id: inv for inv in existing_inventory}
            
            inventory_list = []
            for blanket in all_blankets:
                if blanket.id in existing_dict:
                    inv = existing_dict[blanket.id]
                    inventory_list.append({
                        'id': inv.id,
                        'distributor_id': inv.distributor_id,
                        'blanket_id': inv.blanket_id,
                        'blanket_name': inv.blanket_name,
                        'quantity': inv.quantity,
                        'available_quantity': inv.quantity - inv.reserved_quantity,
                        'reserved_quantity': inv.reserved_quantity,
                        'reorder_level': inv.reorder_level,
                        'last_updated': inv.last_updated.strftime('%Y-%m-%d %H:%M:%S') if inv.last_updated else None
                    })
                else:
                    inventory_list.append({
                        'id': None,
                        'distributor_id': distributor_id,
                        'blanket_id': blanket.id,
                        'blanket_name': blanket.name,
                        'quantity': 0,
                        'available_quantity': 0,
                        'reserved_quantity': 0,
                        'reorder_level': 20,
                        'last_updated': None
                    })
            
            return jsonify({'inventory': inventory_list}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/distributor/inventory/update', methods=['PUT'])
    def update_distributor_stock():
        try:
            data = request.get_json()
            distributor_id = data.get('distributor_id')
            blanket_id = data.get('blanket_id')
            quantity_added = data.get('quantity', 0)
            
            inventory = DistributorInventory.query.filter_by(
                distributor_id=distributor_id,
                blanket_id=blanket_id
            ).first()
            
            if inventory:
                inventory.quantity += quantity_added
                inventory.last_updated = datetime.utcnow()
            else:
                blanket = Blanket.query.get(blanket_id)
                inventory = DistributorInventory(
                    distributor_id=distributor_id,
                    blanket_id=blanket_id,
                    blanket_name=blanket.name if blanket else 'Unknown',
                    quantity=quantity_added,
                    reserved_quantity=0,
                    reorder_level=20
                )
                db.session.add(inventory)
            
            db.session.commit()
            
            return jsonify({
                'message': f'Inventory updated. New quantity: {inventory.quantity}',
                'inventory': inventory.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ PLACE ORDERS TO MANUFACTURER ============
    
    @app.route('/api/distributor/place-order', methods=['POST'])
    def create_manufacturer_order():
        try:
            data = request.get_json()
            
            distributor_id = data.get('distributor_id')
            items = data.get('items', [])
            notes = data.get('notes', '')
            
            distributor = Distributor.query.get(distributor_id)
            if not distributor:
                return jsonify({'error': 'Distributor not found'}), 404
            
            if not items:
                return jsonify({'error': 'No items in order'}), 400
            
            orders_created = []
            total_order_amount = 0
            
            for item in items:
                blanket_id = item.get('blanket_id')
                quantity = item.get('quantity')
                
                blanket = Blanket.query.get(blanket_id)
                if not blanket:
                    return jsonify({'error': f'Blanket ID {blanket_id} not found'}), 404
                
                if blanket.quantity < quantity:
                    return jsonify({
                        'error': f'Insufficient stock for {blanket.name}. Available: {blanket.quantity}, Requested: {quantity}'
                    }), 400
                
                total_price = blanket.price * quantity
                total_order_amount += total_price
                order_number = generate_order_number()
                
                new_order = DistributorOrder(
                    order_number=order_number,
                    distributor_id=distributor_id,
                    blanket_id=blanket_id,
                    blanket_name=blanket.name,
                    quantity=quantity,
                    unit_price=blanket.price,
                    total_amount=total_price,
                    status='Pending',
                    notes=notes
                )
                
                blanket.quantity -= quantity
                
                db.session.add(new_order)
                orders_created.append(new_order)
            
            db.session.commit()
            
            return jsonify({
                'message': f'Order placed successfully! {len(orders_created)} item(s) ordered',
                'total_amount': total_order_amount,
                'orders': [order.to_dict() for order in orders_created]
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ VIEW DISTRIBUTOR REQUESTS (to manufacturer) ============
    
    @app.route('/api/distributor/<int:distributor_id>/orders', methods=['GET'])
    def get_distributor_requests(distributor_id):
        try:
            distributor = Distributor.query.get(distributor_id)
            if not distributor:
                return jsonify({'error': 'Distributor not found'}), 404
            
            status = request.args.get('status')
            query = DistributorOrder.query.filter_by(distributor_id=distributor_id)
            
            if status:
                query = query.filter_by(status=status)
            
            orders = query.order_by(DistributorOrder.order_date.desc()).all()
            
            return jsonify({
                'distributor': distributor.name,
                'total_orders': len(orders),
                'orders': [order.to_dict() for order in orders]
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ GET SINGLE REQUEST DETAILS ============
    
    @app.route('/api/distributor/order/<string:order_number>', methods=['GET'])
    def get_single_request(order_number):
        try:
            order = DistributorOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            return jsonify({'order': order.to_dict()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ UPDATE REQUEST STATUS (Called by Manufacturer) ============
    
    @app.route('/api/distributor/order/<string:order_number>/status', methods=['PUT'])
    def change_request_status(order_number):
        try:
            data = request.get_json()
            new_status = data.get('status')
            
            order = DistributorOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            valid_statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
            if new_status not in valid_statuses:
                return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
            
            old_status = order.status
            order.status = new_status
            
            if new_status == 'Shipped' and not order.shipped_date:
                order.shipped_date = datetime.utcnow()
            elif new_status == 'Delivered' and not order.delivered_date:
                order.delivered_date = datetime.utcnow()
            
            # When manufacturer confirms the order (status changes from Pending to Confirmed)
            # Update distributor inventory
            if old_status == 'Pending' and new_status == 'Confirmed':
                inventory = DistributorInventory.query.filter_by(
                    distributor_id=order.distributor_id,
                    blanket_id=order.blanket_id
                ).first()
                
                if inventory:
                    inventory.quantity += order.quantity
                    inventory.last_updated = datetime.utcnow()
                else:
                    blanket = Blanket.query.get(order.blanket_id)
                    inventory = DistributorInventory(
                        distributor_id=order.distributor_id,
                        blanket_id=order.blanket_id,
                        blanket_name=order.blanket_name,
                        quantity=order.quantity,
                        reserved_quantity=0,
                        reorder_level=20
                    )
                    db.session.add(inventory)
            
            db.session.commit()
            
            return jsonify({
                'message': f'Order {order_number} status updated to {new_status}',
                'order': order.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/distributor/order/<string:order_number>/cancel', methods=['POST'])
    def cancel_distributor_request(order_number):
        try:
            order = DistributorOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            if order.status not in ['Pending', 'Confirmed']:
                return jsonify({'error': f'Cannot cancel order with status: {order.status}'}), 400
            
            blanket = Blanket.query.get(order.blanket_id)
            if blanket:
                blanket.quantity += order.quantity
            
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
    
    
    # ============ REQUEST SUMMARY ============
    
    @app.route('/api/distributor/<int:distributor_id>/summary', methods=['GET'])
    def get_request_summary(distributor_id):
        try:
            distributor = Distributor.query.get(distributor_id)
            if not distributor:
                return jsonify({'error': 'Distributor not found'}), 404
            
            orders = DistributorOrder.query.filter_by(distributor_id=distributor_id).all()
            
            total_orders = len(orders)
            total_items = sum(order.quantity for order in orders)
            total_spent = sum(order.total_amount for order in orders)
            
            status_counts = {}
            for order in orders:
                status_counts[order.status] = status_counts.get(order.status, 0) + 1
            
            recent_orders = DistributorOrder.query.filter_by(distributor_id=distributor_id)\
                .order_by(DistributorOrder.order_date.desc()).limit(5).all()
            
            return jsonify({
                'distributor': distributor.to_dict(),
                'summary': {
                    'total_orders': total_orders,
                    'total_items_ordered': total_items,
                    'total_amount_spent': round(total_spent, 2),
                    'status_breakdown': status_counts
                },
                'recent_orders': [order.to_dict() for order in recent_orders]
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500


# ============ SELLER ORDER BROADCAST ROUTES ============

def register_distributor_seller_routes(app):
    """Separate function for seller order broadcast routes"""
    
    @app.route('/api/distributor/pending-orders', methods=['GET'])
    def get_broadcast_pending_orders():
        try:
            distributor_id = request.args.get('distributor_id', type=int)
            if not distributor_id:
                return jsonify({'error': 'distributor_id is required'}), 400
            
            pending_orders = SellerOrder.query.filter_by(status='Pending').all()
            
            orders_with_capability = []
            for order in pending_orders:
                inventory = DistributorInventory.query.filter_by(
                    distributor_id=distributor_id,
                    blanket_id=order.blanket_id
                ).first()
                
                available_quantity = inventory.quantity - inventory.reserved_quantity if inventory else 0
                
                orders_with_capability.append({
                    'order': order.to_dict(),
                    'can_fulfill': available_quantity >= order.quantity,
                    'available_quantity': available_quantity
                })
            
            return jsonify({
                'count': len(orders_with_capability),
                'orders': orders_with_capability
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/distributor/accept-order/<string:order_number>', methods=['POST'])
    def accept_broadcast_order(order_number):
        try:
            data = request.get_json()
            distributor_id = data.get('distributor_id')
            
            order = SellerOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            if order.status != 'Pending':
                return jsonify({'error': f'Order already {order.status} by another distributor'}), 400
            
            inventory = DistributorInventory.query.filter_by(
                distributor_id=distributor_id,
                blanket_id=order.blanket_id
            ).first()
            
            if not inventory:
                return jsonify({'error': 'You have not ordered this product from manufacturer yet'}), 400
            
            available_quantity = inventory.quantity - inventory.reserved_quantity
            
            if available_quantity < order.quantity:
                return jsonify({
                    'error': f'Insufficient stock. Available: {available_quantity}, Required: {order.quantity}'
                }), 400
            
            # Reserve stock from distributor
            inventory.reserved_quantity += order.quantity
            inventory.last_updated = datetime.utcnow()
            
            # Update order status
            order.status = 'Accepted'
            order.accepted_distributor_id = distributor_id
            order.accepted_date = datetime.utcnow()
            
            db.session.commit()
            
            # Deduct from distributor actual inventory
            inventory.quantity -= order.quantity
            inventory.reserved_quantity -= order.quantity
            
            # ============ UPDATE SELLER INVENTORY ============
            # When distributor accepts, add stock to seller's inventory
            from database import SellerInventory
            seller_inv = SellerInventory.query.filter_by(
                seller_id=order.seller_id,
                blanket_id=order.blanket_id
            ).first()
            
            if seller_inv:
                seller_inv.quantity += order.quantity
                seller_inv.purchased_price = order.unit_price
                seller_inv.selling_price = order.selling_price
                seller_inv.last_updated = datetime.utcnow()
            else:
                new_inventory = SellerInventory(
                    seller_id=order.seller_id,
                    blanket_id=order.blanket_id,
                    blanket_name=order.blanket_name,
                    quantity=order.quantity,
                    purchased_price=order.unit_price,
                    selling_price=order.selling_price
                )
                db.session.add(new_inventory)
            
            db.session.commit()
            
            return jsonify({
                'message': f'Order {order_number} accepted successfully! Stock added to seller inventory.',
                'order': order.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/distributor/my-accepted-orders', methods=['GET'])
    def get_my_accepted_broadcast_orders():
        try:
            distributor_id = request.args.get('distributor_id', type=int)
            if not distributor_id:
                return jsonify({'error': 'distributor_id is required'}), 400
            
            orders = SellerOrder.query.filter_by(
                accepted_distributor_id=distributor_id
            ).order_by(SellerOrder.accepted_date.desc()).all()
            
            return jsonify({
                'count': len(orders),
                'orders': [order.to_dict() for order in orders]
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/distributor/fulfill-order/<string:order_number>', methods=['PUT'])
    def fulfill_broadcast_order(order_number):
        try:
            data = request.get_json()
            distributor_id = data.get('distributor_id')
            new_status = data.get('status')
            
            order = SellerOrder.query.filter_by(
                order_number=order_number,
                accepted_distributor_id=distributor_id
            ).first()
            
            if not order:
                return jsonify({'error': 'Order not found or not assigned to you'}), 404
            
            if new_status == 'Delivered':
                order.status = 'Fulfilled'
                order.delivered_date = datetime.utcnow()
            elif new_status == 'Cancelled':
                inventory = DistributorInventory.query.filter_by(
                    distributor_id=distributor_id,
                    blanket_id=order.blanket_id
                ).first()
                if inventory:
                    inventory.quantity += order.quantity
                order.status = 'Cancelled'
            
            db.session.commit()
            
            return jsonify({
                'message': f'Order {order_number} updated to {order.status}',
                'order': order.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500