from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Manufacturer's Blanket Model
class Blanket(db.Model):
    __tablename__ = 'blankets'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    material = db.Column(db.String(100))
    size = db.Column(db.String(50))
    color = db.Column(db.String(50))
    price = db.Column(db.Float)
    front_image = db.Column(db.String(500))
    back_image = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'material': self.material,
            'size': self.size,
            'color': self.color,
            'price': self.price,
            'front_image': self.front_image,
            'back_image': self.back_image,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }


# Distributor Model
class Distributor(db.Model):
    __tablename__ = 'distributors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'registration_date': self.registration_date.strftime('%Y-%m-%d %H:%M:%S')
        }


# Distributor Order (to Manufacturer)
class DistributorOrder(db.Model):
    __tablename__ = 'distributor_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True)
    distributor_id = db.Column(db.Integer, db.ForeignKey('distributors.id'), nullable=False)
    blanket_id = db.Column(db.Integer, db.ForeignKey('blankets.id'), nullable=False)
    blanket_name = db.Column(db.String(100))
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float)
    total_amount = db.Column(db.Float)
    status = db.Column(db.String(50), default='Pending')
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    shipped_date = db.Column(db.DateTime, nullable=True)
    delivered_date = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'distributor_id': self.distributor_id,
            'blanket_id': self.blanket_id,
            'blanket_name': self.blanket_name,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'total_amount': self.total_amount,
            'status': self.status,
            'order_date': self.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            'shipped_date': self.shipped_date.strftime('%Y-%m-%d %H:%M:%S') if self.shipped_date else None,
            'delivered_date': self.delivered_date.strftime('%Y-%m-%d %H:%M:%S') if self.delivered_date else None,
            'notes': self.notes
        }


# Distributor Inventory - MUST have reserved_quantity column
class DistributorInventory(db.Model):
    __tablename__ = 'distributor_inventory'
    
    id = db.Column(db.Integer, primary_key=True)
    distributor_id = db.Column(db.Integer, db.ForeignKey('distributors.id'), nullable=False)
    blanket_id = db.Column(db.Integer, db.ForeignKey('blankets.id'), nullable=False)
    blanket_name = db.Column(db.String(100))
    quantity = db.Column(db.Integer, default=0)
    reserved_quantity = db.Column(db.Integer, default=0)  # IMPORTANT: This column is required
    reorder_level = db.Column(db.Integer, default=20)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'distributor_id': self.distributor_id,
            'blanket_id': self.blanket_id,
            'blanket_name': self.blanket_name,
            'quantity': self.quantity,
            'available_quantity': self.quantity - self.reserved_quantity,
            'reserved_quantity': self.reserved_quantity,
            'reorder_level': self.reorder_level,
            'last_updated': self.last_updated.strftime('%Y-%m-%d %H:%M:%S') if self.last_updated else None
        }


# Seller Model
class Seller(db.Model):
    __tablename__ = 'sellers'
    
    id = db.Column(db.Integer, primary_key=True)
    business_name = db.Column(db.String(100), nullable=False)
    owner_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    store_type = db.Column(db.String(50))
    website = db.Column(db.String(200))
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'business_name': self.business_name,
            'owner_name': self.owner_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'store_type': self.store_type,
            'website': self.website,
            'registration_date': self.registration_date.strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': self.is_active
        }


# Seller Order - MUST have total_amount column
class SellerOrder(db.Model):
    __tablename__ = 'seller_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('sellers.id'), nullable=False)
    blanket_id = db.Column(db.Integer, db.ForeignKey('blankets.id'), nullable=False)
    blanket_name = db.Column(db.String(100))
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float)
    selling_price = db.Column(db.Float)
    total_amount = db.Column(db.Float)  # IMPORTANT: This column is required
    accepted_distributor_id = db.Column(db.Integer, db.ForeignKey('distributors.id'), nullable=True)
    status = db.Column(db.String(50), default='Pending')
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    accepted_date = db.Column(db.DateTime, nullable=True)
    delivered_date = db.Column(db.DateTime, nullable=True)
    payment_status = db.Column(db.String(50), default='Pending')
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'seller_id': self.seller_id,
            'blanket_id': self.blanket_id,
            'blanket_name': self.blanket_name,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'selling_price': self.selling_price,
            'total_amount': self.total_amount,
            'accepted_distributor_id': self.accepted_distributor_id,
            'status': self.status,
            'order_date': self.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            'accepted_date': self.accepted_date.strftime('%Y-%m-%d %H:%M:%S') if self.accepted_date else None,
            'delivered_date': self.delivered_date.strftime('%Y-%m-%d %H:%M:%S') if self.delivered_date else None,
            'payment_status': self.payment_status,
            'notes': self.notes
        }


# Seller Inventory
class SellerInventory(db.Model):
    __tablename__ = 'seller_inventory'
    
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('sellers.id'), nullable=False)
    blanket_id = db.Column(db.Integer, db.ForeignKey('blankets.id'), nullable=False)
    blanket_name = db.Column(db.String(100))
    quantity = db.Column(db.Integer, default=0)
    purchased_price = db.Column(db.Float)
    selling_price = db.Column(db.Float)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'seller_id': self.seller_id,
            'blanket_id': self.blanket_id,
            'blanket_name': self.blanket_name,
            'quantity': self.quantity,
            'purchased_price': self.purchased_price,
            'selling_price': self.selling_price,
            'last_updated': self.last_updated.strftime('%Y-%m-%d %H:%M:%S')
        }


# Customer Model
class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    zip_code = db.Column(db.String(20))
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_purchases = db.Column(db.Integer, default=0)
    total_spent = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'registration_date': self.registration_date.strftime('%Y-%m-%d %H:%M:%S'),
            'total_purchases': self.total_purchases,
            'total_spent': self.total_spent
        }


# Customer Order Model
class CustomerOrder(db.Model):
    __tablename__ = 'customer_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('sellers.id'), nullable=False)
    blanket_id = db.Column(db.Integer, db.ForeignKey('blankets.id'), nullable=False)
    blanket_name = db.Column(db.String(100))
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float)
    total_amount = db.Column(db.Float)
    status = db.Column(db.String(50), default='Pending')
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    shipped_date = db.Column(db.DateTime, nullable=True)
    delivered_date = db.Column(db.DateTime, nullable=True)
    shipping_address = db.Column(db.String(200))
    tracking_number = db.Column(db.String(100))
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(50), default='Pending')
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'customer_id': self.customer_id,
            'seller_id': self.seller_id,
            'blanket_id': self.blanket_id,
            'blanket_name': self.blanket_name,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'total_amount': self.total_amount,
            'status': self.status,
            'order_date': self.order_date.strftime('%Y-%m-%d %H:%M:%S'),
            'shipped_date': self.shipped_date.strftime('%Y-%m-%d %H:%M:%S') if self.shipped_date else None,
            'delivered_date': self.delivered_date.strftime('%Y-%m-%d %H:%M:%S') if self.delivered_date else None,
            'shipping_address': self.shipping_address,
            'tracking_number': self.tracking_number,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'notes': self.notes
        }


# Cart Model
class Cart(db.Model):
    __tablename__ = 'carts'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    blanket_id = db.Column(db.Integer, db.ForeignKey('blankets.id'), nullable=False)
    blanket_name = db.Column(db.String(100))
    quantity = db.Column(db.Integer, default=1)
    unit_price = db.Column(db.Float)
    added_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'blanket_id': self.blanket_id,
            'blanket_name': self.blanket_name,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'subtotal': self.quantity * self.unit_price,
            'added_date': self.added_date.strftime('%Y-%m-%d %H:%M:%S')
        }


# Review Model
class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    blanket_id = db.Column(db.Integer, db.ForeignKey('blankets.id'), nullable=False)
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    review_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'blanket_id': self.blanket_id,
            'rating': self.rating,
            'comment': self.comment,
            'review_date': self.review_date.strftime('%Y-%m-%d %H:%M:%S')
        }