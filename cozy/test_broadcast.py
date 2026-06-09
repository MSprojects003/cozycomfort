import requests
import time
import json

BASE_URL = "http://localhost:5000/api"

def test_broadcast_system():
    print("="*60)
    print("TESTING BROADCAST SYSTEM")
    print("="*60)
    
    # First, clear existing data? No, just create new ones
    print("\n1. Checking existing distributors...")
    existing_dists = requests.get(f"{BASE_URL}/distributors").json()
    print(f"   Existing distributors: {existing_dists.get('count', 0)}")
    
    # 1. Register 3 distributors
    print("\n2. Registering 3 distributors...")
    
    # Distributor 1
    resp1 = requests.post(f"{BASE_URL}/distributor/register", json={
        "name": "Distributor Alpha", 
        "email": "alpha@dist.com", 
        "phone": "111-1111", 
        "address": "123 Alpha St"
    })
    print(f"   Status Code: {resp1.status_code}")
    dist1 = resp1.json()
    print(f"   Response: {dist1}")
    dist1_id = dist1.get('distributor', {}).get('id') if 'distributor' in dist1 else None
    print(f"   Distributor Alpha ID: {dist1_id}")
    
    # Distributor 2
    resp2 = requests.post(f"{BASE_URL}/distributor/register", json={
        "name": "Distributor Beta", 
        "email": "beta@dist.com", 
        "phone": "222-2222", 
        "address": "456 Beta St"
    })
    dist2 = resp2.json()
    dist2_id = dist2.get('distributor', {}).get('id') if 'distributor' in dist2 else None
    print(f"   Distributor Beta ID: {dist2_id}")
    
    # Distributor 3
    resp3 = requests.post(f"{BASE_URL}/distributor/register", json={
        "name": "Distributor Gamma", 
        "email": "gamma@dist.com", 
        "phone": "333-3333", 
        "address": "789 Gamma St"
    })
    dist3 = resp3.json()
    dist3_id = dist3.get('distributor', {}).get('id') if 'distributor' in dist3 else None
    print(f"   Distributor Gamma ID: {dist3_id}")
    
    # Get all distributors to verify
    print("\n3. All distributors after registration:")
    all_dists = requests.get(f"{BASE_URL}/distributors").json()
    for d in all_dists.get('distributors', []):
        print(f"   ID: {d['id']}, Name: {d['name']}, Email: {d['email']}")
    
    # Use the IDs we got or fetch them
    if not dist1_id and all_dists.get('distributors'):
        dist1_id = all_dists['distributors'][0]['id'] if len(all_dists['distributors']) > 0 else None
        dist2_id = all_dists['distributors'][1]['id'] if len(all_dists['distributors']) > 1 else None
        dist3_id = all_dists['distributors'][2]['id'] if len(all_dists['distributors']) > 2 else None
        print(f"\n   Using fetched IDs: {dist1_id}, {dist2_id}, {dist3_id}")
    
    # 4. Register a seller
    print("\n4. Registering a seller...")
    resp_seller = requests.post(f"{BASE_URL}/seller/register", json={
        "business_name": "Test Seller Store", 
        "owner_name": "Test Owner", 
        "email": "seller@teststore.com",
        "phone": "444-4444", 
        "address": "789 Seller St", 
        "store_type": "online"
    })
    print(f"   Status Code: {resp_seller.status_code}")
    seller = resp_seller.json()
    seller_id = seller.get('seller', {}).get('id') if 'seller' in seller else None
    print(f"   Seller ID: {seller_id}")
    
    # 5. Get available blankets
    print("\n5. Getting available blankets...")
    blankets_resp = requests.get(f"{BASE_URL}/distributor/available-blankets")
    blankets = blankets_resp.json()
    print(f"   Response: {blankets}")
    blanket_id = None
    if blankets.get('available_blankets'):
        blanket_id = blankets['available_blankets'][0]['id']
        print(f"   Blanket ID: {blanket_id}")
    else:
        print("   ERROR: No blankets found! Please add blankets first.")
        return
    
    # 6. Initialize inventory for distributors
    print("\n6. Initializing inventory for distributors...")
    for dist_id in [dist1_id, dist2_id, dist3_id]:
        if dist_id:
            quantity = 50 if dist_id == dist1_id else (30 if dist_id == dist2_id else 80)
            inv_resp = requests.put(f"{BASE_URL}/distributor/inventory/update", json={
                "distributor_id": dist_id,
                "blanket_id": blanket_id,
                "quantity": quantity
            })
            print(f"   Distributor {dist_id}: {quantity} units - Status: {inv_resp.status_code}")
    
    # 7. Seller places order (broadcast to ALL distributors)
    print(f"\n7. Seller placing order with seller_id={seller_id}...")
    order_data = {
        "seller_id": seller_id,
        "items": [{"blanket_id": blanket_id, "quantity": 25, "selling_price": 89.99}],
        "notes": "Test broadcast order"
    }
    print(f"   Request data: {order_data}")
    
    order_resp = requests.post(f"{BASE_URL}/seller/place-order", json=order_data)
    print(f"   Status Code: {order_resp.status_code}")
    order = order_resp.json()
    print(f"   Response: {order}")
    
    order_number = None
    if order.get('orders'):
        order_number = order['orders'][0].get('order_number')
    print(f"   Order Number: {order_number}")
    
    if not order_number:
        print("   ERROR: Failed to create order!")
        return
    
    # 8. Check pending orders for each distributor
    print("\n8. Checking pending orders for each distributor...")
    for dist_id in [dist1_id, dist2_id, dist3_id]:
        if dist_id:
            pending_resp = requests.get(f"{BASE_URL}/distributor/pending-orders?distributor_id={dist_id}")
            pending = pending_resp.json()
            print(f"   Distributor {dist_id}: Status {pending_resp.status_code}")
            if pending.get('orders'):
                for p in pending['orders']:
                    print(f"      Order: {p['order']['order_number']}, Can fulfill: {p['can_fulfill']}, Available: {p['available_quantity']}")
            else:
                print(f"      No pending orders")
    
    # 9. Distributor 2 accepts the order (first come first serve)
    print(f"\n9. Distributor {dist2_id} attempting to accept order {order_number}...")
    accept_resp = requests.post(f"{BASE_URL}/distributor/accept-order/{order_number}", 
                                json={"distributor_id": dist2_id})
    print(f"   Status Code: {accept_resp.status_code}")
    print(f"   Response: {accept_resp.json()}")
    
    # 10. Check pending orders again (order should be gone)
    print("\n10. Checking pending orders after acceptance...")
    for dist_id in [dist1_id, dist2_id, dist3_id]:
        if dist_id:
            pending_resp = requests.get(f"{BASE_URL}/distributor/pending-orders?distributor_id={dist_id}")
            pending = pending_resp.json()
            print(f"   Distributor {dist_id}: {pending.get('count', 0)} pending orders")
    
    # 11. Check who accepted the order
    print("\n11. Checking which distributor accepted the order...")
    order_details = requests.get(f"{BASE_URL}/seller/order/{order_number}").json()
    print(f"   Response: {order_details}")
    accepted_by = order_details.get('order', {}).get('accepted_distributor_id')
    print(f"   Order accepted by Distributor ID: {accepted_by}")
    
    # 12. Check inventory after acceptance
    print("\n12. Checking inventory after order acceptance...")
    for dist_id in [dist1_id, dist2_id, dist3_id]:
        if dist_id:
            inv = requests.get(f"{BASE_URL}/distributor/inventory?distributor_id={dist_id}").json()
            for item in inv.get('inventory', []):
                if item['blanket_id'] == blanket_id:
                    print(f"   Distributor {dist_id}: {item['available_quantity']} units available")
    
    print("\n" + "="*60)
    print("✅ BROADCAST SYSTEM TEST COMPLETE!")
    print("="*60)

if __name__ == "__main__":
    test_broadcast_system()