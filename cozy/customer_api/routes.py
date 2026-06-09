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
        """
        Register a new customer
        Expected JSON:
        {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "555-1234",
            "address": "123 Home St",
            "city": "Metropolis",
            "state": "ST",
            "zip_code": "12345"
        }
        """
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
        """
        Customer login by email
        Expected JSON: {"email": "john@example.com"}
        """
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
    def get_customer(customer_id):
        """Get customer details by ID"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return jsonify({'error': 'Customer not found'}), 404
            return jsonify({'customer': customer.to_dict()}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # ============ BROWSE PRODUCTS ============
    
    @app.route('/api/customer/products', methods=['GET'])
    def get_all_products_for_customers():
        """
        Get all available blankets for customers to browse
        Can filter by: ?search=wool&min_price=50&max_price=100
        """
        try:
            query = Blanket.query.filter(Blanket.quantity > 0)
            
            # Search by name
            search = request.args.get('search')
            if search:
                query = query.filter(Blanket.name.contains(search))
            
            # Filter by price range
            min_price = request.args.get('min_price', type=float)
            if min_price:
                query = query.filter(Blanket.price >= min_price)
            
            max_price = request.args.get('max_price', type=float)
            if max_price:
                query = query.filter(Blanket.price <= max_price)
            
            # Filter by material
            material = request.args.get('material')
            if material:
                query = query.filter(Blanket.material == material)
            
            # Filter by size
            size = request.args.get('size')
            if size:
                query = query.filter(Blanket.size == size)
            
            # Filter by color
            color = request.args.get('color')
            if color:
                query = query.filter(Blanket.color == color)
            
            # Sort
            sort = request.args.get('sort', 'name')
            if sort == 'price_asc':
                query = query.order_by(Blanket.price.asc())
            elif sort == 'price_desc':
                query = query.order_by(Blanket.price.desc())
            elif sort == 'newest':
                query = query.order_by(Blanket.created_at.desc())
            else:
                query = query.order_by(Blanket.name.asc())
            
            products = query.all()
            
            # Get average ratings for each product
            from database import Review
            products_with_ratings = []
            for product in products:
                product_data = product.to_dict()
                reviews = Review.query.filter_by(blanket_id=product.id).all()
                if reviews:
                    avg_rating = sum(r.rating for r in reviews) / len(reviews)
                    product_data['average_rating'] = round(avg_rating, 1)
                    product_data['review_count'] = len(reviews)
                else:
                    product_data['average_rating'] = None
                    product_data['review_count'] = 0
                products_with_ratings.append(product_data)
            
            return jsonify({
                'count': len(products_with_ratings),
                'products': products_with_ratings
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/customer/product/<int:product_id>', methods=['GET'])
    def get_product_details(product_id):
        """Get detailed information about a specific product"""
        try:
            product = Blanket.query.get(product_id)
            if not product:
                return jsonify({'error': 'Product not found'}), 404
            
            product_data = product.to_dict()
            
            # Get reviews for this product
            from database import Review, Customer
            reviews = Review.query.filter_by(blanket_id=product_id).all()
            reviews_with_customers = []
            for review in reviews:
                customer = Customer.query.get(review.customer_id)
                review_data = review.to_dict()
                if customer:
                    review_data['customer_name'] = customer.to_dict()['full_name']
                reviews_with_customers.append(review_data)
            
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
                product_data['average_rating'] = round(avg_rating, 1)
                product_data['review_count'] = len(reviews)
            else:
                product_data['average_rating'] = None
                product_data['review_count'] = 0
            
            product_data['reviews'] = reviews_with_customers
            
            return jsonify({'product': product_data}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # ============ SHOPPING CART ============
    
    @app.route('/api/customer/<int:customer_id>/cart', methods=['GET'])
    def get_cart(customer_id):
        """Get customer's shopping cart"""
        try:
            cart_items = Cart.query.filter_by(customer_id=customer_id).all()
            total = sum(item.quantity * item.unit_price for item in cart_items)
            
            return jsonify({
                'items': [item.to_dict() for item in cart_items],
                'total_items': len(cart_items),
                'total_quantity': sum(item.quantity for item in cart_items),
                'total_amount': round(total, 2)
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/customer/<int:customer_id>/cart/add', methods=['POST'])
    def add_to_cart(customer_id):
        """
        Add item to cart
        Expected JSON: {"blanket_id": 1, "quantity": 2}
        """
        try:
            data = request.get_json()
            blanket_id = data.get('blanket_id')
            quantity = data.get('quantity', 1)
            
            blanket = Blanket.query.get(blanket_id)
            if not blanket:
                return jsonify({'error': 'Product not found'}), 404
            
            if blanket.quantity < quantity:
                return jsonify({'error': f'Only {blanket.quantity} items available'}), 400
            
            # Check if item already in cart
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
                'cart_item': cart_item.to_dict()
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/customer/<int:customer_id>/cart/update', methods=['PUT'])
    def update_cart_item(customer_id):
        """
        Update cart item quantity
        Expected JSON: {"cart_id": 1, "quantity": 3}
        """
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
    def remove_from_cart(customer_id, cart_id):
        """Remove item from cart"""
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
    def checkout(customer_id):
        """
        Checkout and place order
        Expected JSON:
        {
            "seller_id": 1,
            "payment_method": "Credit Card",
            "shipping_address": "123 Home St, City, ST 12345",
            "notes": "Leave at front door"
        }
        """
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return jsonify({'error': 'Customer not found'}), 404
            
            # Get cart items
            cart_items = Cart.query.filter_by(customer_id=customer_id).all()
            if not cart_items:
                return jsonify({'error': 'Cart is empty'}), 400
            
            data = request.get_json()
            seller_id = data.get('seller_id')
            payment_method = data.get('payment_method', 'Credit Card')
            shipping_address = data.get('shipping_address', customer.address)
            notes = data.get('notes', '')
            
            orders_created = []
            total_amount = 0
            
            for cart_item in cart_items:
                blanket = Blanket.query.get(cart_item.blanket_id)
                if not blanket or blanket.quantity < cart_item.quantity:
                    return jsonify({
                        'error': f'{cart_item.blanket_name} is out of stock'
                    }), 400
                
                total = cart_item.quantity * cart_item.unit_price
                total_amount += total
                
                order_number = generate_customer_order_number()
                
                new_order = CustomerOrder(
                    order_number=order_number,
                    customer_id=customer_id,
                    seller_id=seller_id,
                    blanket_id=cart_item.blanket_id,
                    blanket_name=cart_item.blanket_name,
                    quantity=cart_item.quantity,
                    unit_price=cart_item.unit_price,
                    total_amount=total,
                    status='Pending',
                    shipping_address=shipping_address,
                    payment_method=payment_method,
                    payment_status='Pending',
                    notes=notes
                )
                
                # Reduce inventory
                blanket.quantity -= cart_item.quantity
                
                # Update seller inventory
                seller_inv = SellerInventory.query.filter_by(
                    seller_id=seller_id,
                    blanket_id=cart_item.blanket_id
                ).first()
                if seller_inv:
                    seller_inv.quantity -= cart_item.quantity
                
                db.session.add(new_order)
                orders_created.append(new_order)
                
                # Delete cart item
                db.session.delete(cart_item)
            
            # Update customer stats
            customer.total_purchases += len(orders_created)
            customer.total_spent += total_amount
            
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
    def get_customer_orders(customer_id):
        """Get customer's order history"""
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
    def get_customer_order_details(order_number):
        """Get specific order details"""
        try:
            order = CustomerOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            return jsonify({'order': order.to_dict()}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/customer/order/<string:order_number>/status', methods=['PUT'])
    def update_customer_order_status(order_number):
        """
        Update customer order status (for sellers)
        Expected JSON: {"status": "Delivered"}
        """
        try:
            order = CustomerOrder.query.filter_by(order_number=order_number).first()
            if not order:
                return jsonify({'error': 'Order not found'}), 404
            
            data = request.get_json()
            new_status = data.get('status')
            
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
    def add_review(customer_id):
        """
        Add product review
        Expected JSON:
        {
            "blanket_id": 1,
            "rating": 5,
            "comment": "Great blanket!"
        }
        """
        try:
            data = request.get_json()
            
            # Check if customer actually purchased this product
            has_purchased = CustomerOrder.query.filter_by(
                customer_id=customer_id,
                blanket_id=data['blanket_id'],
                status='Delivered'
            ).first()
            
            if not has_purchased:
                return jsonify({'error': 'You can only review products you have purchased'}), 400
            
            # Check if already reviewed
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
    def get_customer_dashboard(customer_id):
        """Get customer dashboard with statistics"""
        try:
            customer = Customer.query.get(customer_id)
            if not customer:
                return jsonify({'error': 'Customer not found'}), 404
            
            orders = CustomerOrder.query.filter_by(customer_id=customer_id).all()
            reviews = Review.query.filter_by(customer_id=customer_id).all()
            
            # Order statistics
            total_orders = len(orders)
            total_spent = sum(order.total_amount for order in orders)
            pending_orders = len([o for o in orders if o.status == 'Pending'])
            delivered_orders = len([o for o in orders if o.status == 'Delivered'])
            
            # Recent orders
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
    def get_filter_options():
        """Get available filter options for products"""
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