from flask import request, jsonify
from database import db, Blanket, DistributorOrder, DistributorInventory
from datetime import datetime
import random
import string
import os
from werkzeug.utils import secure_filename

# Configure upload settings
UPLOAD_FOLDER = 'assets'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def register_manufacturer_routes(app):
    
    # Configure upload folder
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    # Create upload folder if not exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    # ============ BLANKET MANAGEMENT ============
    
    @app.route('/api/manufacturer/blankets', methods=['POST'])
    def add_product():
        """Add new blanket - supports both JSON and multipart/form-data"""
        try:
            if request.files:
                name = request.form.get('name')
                if not name:
                    return jsonify({'error': 'Blanket name is required'}), 400
                
                front_image_path = None
                if 'front_image' in request.files:
                    front_image = request.files['front_image']
                    if front_image and allowed_file(front_image.filename):
                        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_front_{front_image.filename}")
                        front_image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        front_image.save(front_image_path)
                        front_image_path = f"/assets/{filename}"
                
                back_image_path = None
                if 'back_image' in request.files:
                    back_image = request.files['back_image']
                    if back_image and allowed_file(back_image.filename):
                        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_back_{back_image.filename}")
                        back_image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        back_image.save(back_image_path)
                        back_image_path = f"/assets/{filename}"
                
                new_product = Blanket(
                    name=name,
                    price=float(request.form.get('price', 0)),
                    quantity=int(request.form.get('quantity', 0)),
                    material=request.form.get('material', ''),
                    size=request.form.get('size', ''),
                    color=request.form.get('color', ''),
                    front_image=front_image_path,
                    back_image=back_image_path
                )
            else:
                data = request.get_json()
                new_product = Blanket(
                    name=data['name'],
                    price=data['price'],
                    quantity=data['quantity'],
                    material=data.get('material', ''),
                    size=data.get('size', ''),
                    color=data.get('color', '')
                )
            
            db.session.add(new_product)
            db.session.commit()
            
            return jsonify({
                'message': 'Product added successfully',
                'product': new_product.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/manufacturer/blankets', methods=['GET'])
    def get_all_products():
        products = Blanket.query.all()
        return jsonify({
            'blankets': [p.to_dict() for p in products],
            'count': len(products)
        })
    
    
    @app.route('/api/manufacturer/blankets/<int:product_id>', methods=['GET'])
    def get_product(product_id):
        product = Blanket.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'product': product.to_dict()})
    
    
    @app.route('/api/manufacturer/blankets/<int:product_id>', methods=['PUT'])
    def update_product(product_id):
        try:
            product = Blanket.query.get(product_id)
            if not product:
                return jsonify({'error': 'Product not found'}), 404
            
            if request.files:
                if 'name' in request.form:
                    product.name = request.form['name']
                if 'quantity' in request.form:
                    product.quantity = int(request.form['quantity'])
                if 'material' in request.form:
                    product.material = request.form['material']
                if 'size' in request.form:
                    product.size = request.form['size']
                if 'color' in request.form:
                    product.color = request.form['color']
                if 'price' in request.form:
                    product.price = float(request.form['price'])
                
                if 'front_image' in request.files:
                    front_image = request.files['front_image']
                    if front_image and allowed_file(front_image.filename):
                        if product.front_image:
                            old_path = product.front_image.replace('/assets/', 'assets/')
                            if os.path.exists(old_path):
                                os.remove(old_path)
                        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_front_{front_image.filename}")
                        front_image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        front_image.save(front_image_path)
                        product.front_image = f"/assets/{filename}"
                
                if 'back_image' in request.files:
                    back_image = request.files['back_image']
                    if back_image and allowed_file(back_image.filename):
                        if product.back_image:
                            old_path = product.back_image.replace('/assets/', 'assets/')
                            if os.path.exists(old_path):
                                os.remove(old_path)
                        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_back_{back_image.filename}")
                        back_image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        back_image.save(back_image_path)
                        product.back_image = f"/assets/{filename}"
            else:
                data = request.get_json()
                if 'quantity' in data:
                    product.quantity = data['quantity']
                if 'price' in data:
                    product.price = data['price']
                if 'name' in data:
                    product.name = data['name']
                if 'material' in data:
                    product.material = data['material']
                if 'size' in data:
                    product.size = data['size']
                if 'color' in data:
                    product.color = data['color']
            
            db.session.commit()
            return jsonify({'message': 'Product updated', 'product': product.to_dict()})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/manufacturer/blankets/<int:product_id>/quantity', methods=['PATCH'])
    def update_quantity(product_id):
        product = Blanket.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        data = request.get_json()
        product.quantity = data['quantity']
        db.session.commit()
        
        return jsonify({
            'message': f'Quantity updated for {product.name}',
            'product': product.to_dict()
        })
    
    
    @app.route('/api/manufacturer/blankets/<int:product_id>', methods=['DELETE'])
    def delete_product(product_id):
        product = Blanket.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        if product.front_image:
            old_path = product.front_image.replace('/assets/', 'assets/')
            if os.path.exists(old_path):
                os.remove(old_path)
        if product.back_image:
            old_path = product.back_image.replace('/assets/', 'assets/')
            if os.path.exists(old_path):
                os.remove(old_path)
            
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'})
    
    
    @app.route('/api/manufacturer/low-stock', methods=['GET'])
    def get_low_stock():
        threshold = request.args.get('threshold', 20, type=int)
        low_stock_blankets = Blanket.query.filter(Blanket.quantity < threshold).all()
        
        return jsonify({
            'threshold': threshold,
            'count': len(low_stock_blankets),
            'low_stock_blankets': [blanket.to_dict() for blanket in low_stock_blankets]
        })
    
    
    # ============ DISTRIBUTOR ORDERS MANAGEMENT ============
    
    @app.route('/api/manufacturer/orders', methods=['GET'])
    def get_distributor_orders():
        try:
            orders = DistributorOrder.query.order_by(DistributorOrder.order_date.desc()).all()
            return jsonify({
                'orders': [order.to_dict() for order in orders],
                'count': len(orders)
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/manufacturer/order/<string:order_number>', methods=['GET'])
    def get_distributor_order(order_number):
        try:
            order = DistributorOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            return jsonify({'order': order.to_dict()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/manufacturer/order/<string:order_number>/accept', methods=['POST'])
    def accept_distributor_order(order_number):
        """
        Manufacturer accepts distributor order
        Updates distributor inventory with the requested quantity
        """
        try:
            order = DistributorOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            if order.status != 'Pending':
                return jsonify({'error': f'Order already {order.status}'}), 400
            
            # Update order status
            order.status = 'Confirmed'
            
            # ============ UPDATE DISTRIBUTOR INVENTORY ============
            # When manufacturer accepts, add stock to distributor's inventory
            inventory = DistributorInventory.query.filter_by(
                distributor_id=order.distributor_id,
                blanket_id=order.blanket_id
            ).first()
            
            if inventory:
                inventory.quantity += order.quantity
                inventory.last_updated = datetime.utcnow()
            else:
                # Create new inventory entry for this distributor
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
                'message': f'Order {order_number} accepted. Stock added to distributor inventory.',
                'order': order.to_dict(),
                'inventory_updated': inventory.quantity if inventory else order.quantity
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/manufacturer/order/<string:order_number>/reject', methods=['POST'])
    def reject_distributor_order(order_number):
        try:
            data = request.get_json()
            order = DistributorOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            if order.status != 'Pending':
                return jsonify({'error': f'Order already {order.status}'}), 400
            
            blanket = Blanket.query.get(order.blanket_id)
            if blanket:
                blanket.quantity += order.quantity
            
            order.status = 'Cancelled'
            db.session.commit()
            
            return jsonify({
                'message': f'Order {order_number} rejected',
                'order': order.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/manufacturer/order/<string:order_number>/status', methods=['PUT'])
    def update_distributor_order_status(order_number):
        try:
            data = request.get_json()
            new_status = data.get('status')
            
            order = DistributorOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            valid_statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
            if new_status not in valid_statuses:
                return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
            
            order.status = new_status
            
            if new_status == 'Shipped' and not order.shipped_date:
                order.shipped_date = datetime.utcnow()
            elif new_status == 'Delivered' and not order.delivered_date:
                order.delivered_date = datetime.utcnow()
            
            db.session.commit()
            
            return jsonify({
                'message': f'Order {order_number} status updated to {new_status}',
                'order': order.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/manufacturer/orders/stats', methods=['GET'])
    def get_manufacturer_order_stats():
        try:
            orders = DistributorOrder.query.all()
            
            total_orders = len(orders)
            pending_orders = len([o for o in orders if o.status == 'Pending'])
            processing_orders = len([o for o in orders if o.status == 'Processing'])
            shipped_orders = len([o for o in orders if o.status == 'Shipped'])
            delivered_orders = len([o for o in orders if o.status == 'Delivered'])
            cancelled_orders = len([o for o in orders if o.status == 'Cancelled'])
            
            total_revenue = sum(o.total_amount for o in orders if o.status == 'Delivered')
            total_items_sold = sum(o.quantity for o in orders if o.status == 'Delivered')
            
            return jsonify({
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'processing_orders': processing_orders,
                'shipped_orders': shipped_orders,
                'delivered_orders': delivered_orders,
                'cancelled_orders': cancelled_orders,
                'total_revenue': total_revenue,
                'total_items_sold': total_items_sold
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # Serve static images
    @app.route('/assets/<filename>')
    def serve_image(filename):
        from flask import send_from_directory
        return send_from_directory('assets', filename)