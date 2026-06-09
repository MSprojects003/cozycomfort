from flask import Flask
from flask_cors import CORS
from database import db, Blanket
from manufacturer_api.routes import register_manufacturer_routes
from distributor_api.routes import register_distributor_routes, register_distributor_seller_routes
from seller_api.routes import register_seller_routes
import os

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cozycomfort.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Register all routes
register_manufacturer_routes(app)
register_distributor_routes(app)
register_distributor_seller_routes(app)
register_seller_routes(app)

# Create database tables (without adding sample data)
with app.app_context():
    db.create_all()
    print("✓ Database tables ready!")

@app.route('/')
def home():
    return {
        'company': 'Cozy Comfort',
        'system': 'Manufacturing & Distribution System',
        'version': '2.0',
        'status': 'running'
    }

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏭 COZY COMFORT - BROADCAST SYSTEM")
    print("="*60)
    print("📦 Database: cozycomfort.db (SQLite)")
    print("🌐 Server: http://localhost:5000")
    print("="*60)
    print("\n🚀 Server is running...\n")
    app.run(debug=True, port=5000)