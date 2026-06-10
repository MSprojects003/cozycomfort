from flask import request, jsonify
from database import db, Customer, CustomerOrder, Cart, Review, Blanket, Seller, SellerInventory
from datetime import datetime
import random
import string

def generate_customer_order_number():
    """Generate a unique customer order number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f"CUST-ORD-{timestamp}-{random_digits}"

def register_customer_routes(app):
    
    # ============ CUSTOMER REGISTRATION ============
    
    @app.route('/api/customer/register', methods=['POST'])
    def register_customer():
        try:
            data = request.get_json()
            
            existing = Customer.query.filter_by(email=data['email']).first()
            if existing:
                return jsonify({'error': 'Customer with this email already exists'}), 400
            
            new_customer = Customer(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                phone=data.get('phone', ''),
                address=data.get('address', ''),
                city=data.get('city', ''),
                state=data.get('state', ''),
                zip_code=data.get('zip_code', '')
            )
            
            db.session.add(new_customer)
            db.session.commit()
            
            return jsonify({
                'message': 'Customer registered successfully',
                'customer': new_customer.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/login', methods=['POST'])
    def customer_login():
        try:
            data = request.get_json()
            email = data.get('email')
            
            customer = Customer.query.filter_by(email=email).first()
            if not customer:
                return jsonify({'error': 'Customer not found'}), 404
            
            return jsonify({
                'message': 'Login successful',
                'customer': customer.to_dict()
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/<int:customer_id>', methods=['GET'])
    def get_customer_by_id(customer_id):
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return jsonify({'error': 'Customer not found'}), 404
            return jsonify({'customer': customer.to_dict()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ BROWSE PRODUCTS ============
    
    @app.route('/api/customer/products', methods=['GET'])
    def get_customer_products():
        try:
            blankets = Blanket.query.all()
            
            products_list = []
            for blanket in blankets:
                products_list.append({
                    'id': blanket.id,
                    'name': blanket.name,
                    'price': blanket.price,
                    'quantity': blanket.quantity,
                    'material': blanket.material,
                    'size': blanket.size,
                    'color': blanket.color,
                    'front_image': blanket.front_image,
                    'back_image': blanket.back_image,
                    'description': f"Beautiful {blanket.material} blanket in {blanket.color} color, size {blanket.size}",
                    'in_stock': blanket.quantity > 0
                })
            
            return jsonify({
                'count': len(products_list),
                'products': products_list
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/product/<int:product_id>', methods=['GET'])
    def get_customer_product_details(product_id):
        try:
            blanket = Blanket.query.get(product_id)
            if not blanket:
                return jsonify({'error': 'Product not found'}), 404
            
            product_data = {
                'id': blanket.id,
                'name': blanket.name,
                'price': blanket.price,
                'quantity': blanket.quantity,
                'material': blanket.material,
                'size': blanket.size,
                'color': blanket.color,
                'front_image': blanket.front_image,
                'back_image': blanket.back_image,
                'description': f"Beautiful {blanket.material} blanket in {blanket.color} color, size {blanket.size}",
                'in_stock': blanket.quantity > 0
            }
            
            reviews = Review.query.filter_by(blanket_id=product_id).all()
            reviews_list = []
            for review in reviews:
                customer = Customer.query.get(review.customer_id)
                reviews_list.append({
                    'id': review.id,
                    'rating': review.rating,
                    'comment': review.comment,
                    'customer_name': f"{customer.first_name} {customer.last_name}" if customer else 'Anonymous',
                    'review_date': review.review_date.strftime('%Y-%m-%d %H:%M:%S') if review.review_date else None
                })
            
            product_data['reviews'] = reviews_list
            product_data['review_count'] = len(reviews_list)
            
            if reviews_list:
                avg_rating = sum(r['rating'] for r in reviews_list) / len(reviews_list)
                product_data['average_rating'] = round(avg_rating, 1)
            else:
                product_data['average_rating'] = None
            
            return jsonify({'product': product_data}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ SHOPPING CART ============
    
    @app.route('/api/customer/<int:customer_id>/cart', methods=['GET'])
    def get_customer_cart(customer_id):
        try:
            cart_items = Cart.query.filter_by(customer_id=customer_id).all()
            items_list = []
            total = 0
            
            for item in cart_items:
                items_list.append({
                    'id': item.id,
                    'product_id': item.blanket_id,
                    'product_name': item.blanket_name,
                    'quantity': item.quantity,
                    'price': item.unit_price,
                    'subtotal': item.quantity * item.unit_price
                })
                total += item.quantity * item.unit_price
            
            return jsonify({
                'items': items_list,
                'total_items': len(cart_items),
                'total_quantity': sum(item.quantity for item in cart_items),
                'total_amount': round(total, 2)
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/<int:customer_id>/cart/add', methods=['POST'])
    def add_to_customer_cart(customer_id):
        try:
            data = request.get_json()
            blanket_id = data.get('product_id') or data.get('blanket_id')
            quantity = data.get('quantity', 1)
            
            blanket = Blanket.query.get(blanket_id)
            if not blanket:
                return jsonify({'error': 'Product not found'}), 404
            
            cart_item = Cart.query.filter_by(
                customer_id=customer_id,
                blanket_id=blanket_id
            ).first()
            
            if cart_item:
                cart_item.quantity += quantity
            else:
                cart_item = Cart(
                    customer_id=customer_id,
                    blanket_id=blanket_id,
                    blanket_name=blanket.name,
                    quantity=quantity,
                    unit_price=blanket.price
                )
                db.session.add(cart_item)
            
            db.session.commit()
            
            return jsonify({
                'message': 'Item added to cart',
                'cart_item': {
                    'id': cart_item.id,
                    'product_id': cart_item.blanket_id,
                    'product_name': cart_item.blanket_name,
                    'quantity': cart_item.quantity,
                    'price': cart_item.unit_price
                }
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/<int:customer_id>/cart/update', methods=['PUT'])
    def update_customer_cart_item(customer_id):
        try:
            data = request.get_json()
            cart_id = data.get('cart_id')
            quantity = data.get('quantity')
            
            cart_item = Cart.query.get(cart_id)
            if not cart_item or cart_item.customer_id != customer_id:
                return jsonify({'error': 'Cart item not found'}), 404
            
            if quantity <= 0:
                db.session.delete(cart_item)
            else:
                cart_item.quantity = quantity
            
            db.session.commit()
            
            return jsonify({'message': 'Cart updated successfully'}), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/<int:customer_id>/cart/remove/<int:cart_id>', methods=['DELETE'])
    def remove_from_customer_cart(customer_id, cart_id):
        try:
            cart_item = Cart.query.get(cart_id)
            if not cart_item or cart_item.customer_id != customer_id:
                return jsonify({'error': 'Cart item not found'}), 404
            
            db.session.delete(cart_item)
            db.session.commit()
            
            return jsonify({'message': 'Item removed from cart'}), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ CHECKOUT & PLACE ORDER ============
    
    @app.route('/api/customer/<int:customer_id>/checkout', methods=['POST'])
    def customer_checkout(customer_id):
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return jsonify({'error': 'Customer not found'}), 404
            
            data = request.get_json()
            items = data.get('items', [])
            payment_method = data.get('payment_method', 'Credit Card')
            shipping_address = data.get('shipping_address', customer.address)
            notes = data.get('notes', '')
            
            if not items:
                return jsonify({'error': 'No items in order'}), 400
            
            seller = Seller.query.first()
            if not seller:
                return jsonify({'error': 'No seller available'}), 400
            
            seller_id = seller.id
            orders_created = []
            total_amount = 0
            
            for item in items:
                blanket_id = item.get('product_id')
                quantity = item.get('quantity')
                
                blanket = Blanket.query.get(blanket_id)
                if not blanket:
                    return jsonify({'error': f'Product not found'}), 404
                
                total = blanket.price * quantity
                total_amount += total
                
                order_number = generate_customer_order_number()
                
                new_order = CustomerOrder(
                    order_number=order_number,
                    customer_id=customer_id,
                    seller_id=seller_id,
                    blanket_id=blanket_id,
                    blanket_name=blanket.name,
                    quantity=quantity,
                    unit_price=blanket.price,
                    total_amount=total,
                    status='Pending',
                    shipping_address=shipping_address,
                    payment_method=payment_method,
                    payment_status='Pending',
                    notes=notes
                )
                
                db.session.add(new_order)
                orders_created.append(new_order)
            
            customer.total_purchases += len(orders_created)
            customer.total_spent += total_amount
            
            db.session.commit()
            
            # Clear cart items for this customer
            Cart.query.filter_by(customer_id=customer_id).delete()
            db.session.commit()
            
            return jsonify({
                'message': 'Order placed successfully!',
                'order_number': orders_created[0].order_number if orders_created else None,
                'total_amount': round(total_amount, 2),
                'orders': [order.to_dict() for order in orders_created]
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ VIEW ORDERS ============
    
    @app.route('/api/customer/<int:customer_id>/orders', methods=['GET'])
    def get_customer_orders_list(customer_id):
        try:
            orders = CustomerOrder.query.filter_by(customer_id=customer_id)\
                .order_by(CustomerOrder.order_date.desc()).all()
            
            return jsonify({
                'total_orders': len(orders),
                'orders': [order.to_dict() for order in orders]
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/order/<string:order_number>', methods=['GET'])
    def get_customer_order_by_number(order_number):
        try:
            order = CustomerOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            return jsonify({'order': order.to_dict()}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    @app.route('/api/customer/order/<string:order_number>/status', methods=['PUT'])
    def update_customer_order_status(order_number):
        try:
            data = request.get_json()
            new_status = data.get('status')
            
            order = CustomerOrder.query.filter_by(order_number=order_number).first()
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
            
            db.session.commit()
            
            return jsonify({
                'message': f'Order {order_number} status updated from {old_status} to {new_status}',
                'order': order.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ PRODUCT REVIEWS ============
    
    @app.route('/api/customer/<int:customer_id>/review', methods=['POST'])
    def add_customer_review(customer_id):
        try:
            data = request.get_json()
            
            has_purchased = CustomerOrder.query.filter_by(
                customer_id=customer_id,
                blanket_id=data['blanket_id'],
                status='Delivered'
            ).first()
            
            if not has_purchased:
                return jsonify({'error': 'You can only review products you have purchased'}), 400
            
            existing_review = Review.query.filter_by(
                customer_id=customer_id,
                blanket_id=data['blanket_id']
            ).first()
            
            if existing_review:
                return jsonify({'error': 'You have already reviewed this product'}), 400
            
            new_review = Review(
                customer_id=customer_id,
                blanket_id=data['blanket_id'],
                rating=data['rating'],
                comment=data.get('comment', '')
            )
            
            db.session.add(new_review)
            db.session.commit()
            
            return jsonify({
                'message': 'Review added successfully',
                'review': new_review.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    
    # ============ CUSTOMER DASHBOARD ============
    
    @app.route('/api/customer/<int:customer_id>/dashboard', methods=['GET'])
    def get_customer_dashboard_stats(customer_id):
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return jsonify({'error': 'Customer not found'}), 404
            
            orders = CustomerOrder.query.filter_by(customer_id=customer_id).all()
            reviews = Review.query.filter_by(customer_id=customer_id).all()
            
            total_orders = len(orders)
            total_spent = sum(order.total_amount for order in orders)
            pending_orders = len([o for o in orders if o.status == 'Pending'])
            delivered_orders = len([o for o in orders if o.status == 'Delivered'])
            
            recent_orders = CustomerOrder.query.filter_by(customer_id=customer_id)\
                .order_by(CustomerOrder.order_date.desc()).limit(5).all()
            
            return jsonify({
                'customer': customer.to_dict(),
                'statistics': {
                    'total_orders': total_orders,
                    'total_spent': round(total_spent, 2),
                    'pending_orders': pending_orders,
                    'delivered_orders': delivered_orders,
                    'total_reviews': len(reviews)
                },
                'recent_orders': [order.to_dict() for order in recent_orders]
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    
    # ============ FILTER OPTIONS ============
    
    @app.route('/api/customer/filters', methods=['GET'])
    def get_customer_filter_options():
        try:
            materials = db.session.query(Blanket.material.distinct()).filter(Blanket.material != '').all()
            sizes = db.session.query(Blanket.size.distinct()).filter(Blanket.size != '').all()
            colors = db.session.query(Blanket.color.distinct()).filter(Blanket.color != '').all()
            
            return jsonify({
                'materials': [m[0] for m in materials if m[0]],
                'sizes': [s[0] for s in sizes if s[0]],
                'colors': [c[0] for c in colors if c[0]],
                'price_range': {
                    'min': 0,
                    'max': 200
                }
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500