# ATHEEQ Project - System Diagrams

## 1. USE CASE DIAGRAM
Shows all actors and their interactions with the system.

```mermaid
graph TB
    subgraph Actors
        MFG["🏭 Manufacturer"]
        DIST["📦 Distributor"]
        SELLER["🛒 Seller"]
        CUST["👥 Customer"]
    end
    
    subgraph System["ATHEEQ - Blanket Supply Chain System"]
        UC1["Register Account"]
        UC2["Create/Manage Blankets"]
        UC3["Place Order to Distributor"]
        UC4["Place Broadcast Order"]
        UC5["Accept Seller Order"]
        UC6["Manage Inventory"]
        UC7["View Orders"]
        UC8["Update Order Status"]
        UC9["Cancel Order"]
        UC10["View Dashboard"]
        UC11["Sell from Inventory"]
    end
    
    MFG -->|Uses| UC1
    MFG -->|Uses| UC2
    MFG -->|Uses| UC6
    MFG -->|Uses| UC10
    
    DIST -->|Uses| UC1
    DIST -->|Uses| UC3
    DIST -->|Uses| UC5
    DIST -->|Uses| UC6
    DIST -->|Uses| UC7
    DIST -->|Uses| UC8
    DIST -->|Uses| UC10
    
    SELLER -->|Uses| UC1
    SELLER -->|Uses| UC4
    SELLER -->|Uses| UC6
    SELLER -->|Uses| UC7
    SELLER -->|Uses| UC9
    SELLER -->|Uses| UC10
    SELLER -->|Uses| UC11
    
    CUST -->|Uses| UC11
    
    style Actors fill:#f9f9f9,stroke:#000,color:#000
    style System fill:#ffffff,stroke:#000,color:#000
    style UC1 fill:#ffffff,stroke:#000,color:#000
    style UC2 fill:#ffffff,stroke:#000,color:#000
    style UC3 fill:#ffffff,stroke:#000,color:#000
    style UC4 fill:#ffffff,stroke:#000,color:#000
    style UC5 fill:#ffffff,stroke:#000,color:#000
    style UC6 fill:#ffffff,stroke:#000,color:#000
    style UC7 fill:#ffffff,stroke:#000,color:#000
    style UC8 fill:#ffffff,stroke:#000,color:#000
    style UC9 fill:#ffffff,stroke:#000,color:#000
    style UC10 fill:#ffffff,stroke:#000,color:#000
    style UC11 fill:#ffffff,stroke:#000,color:#000
```

---

## 2. ENTITY RELATIONSHIP (ER) DIAGRAM
Shows database schema and relationships.

```mermaid
erDiagram
    BLANKET ||--o{ DISTRIBUTOR_INVENTORY : "has"
    BLANKET ||--o{ DISTRIBUTOR_ORDER : "in"
    BLANKET ||--o{ SELLER_ORDER : "in"
    BLANKET ||--o{ SELLER_INVENTORY : "in"
    
    DISTRIBUTOR ||--o{ DISTRIBUTOR_ORDER : "places"
    DISTRIBUTOR ||--o{ DISTRIBUTOR_INVENTORY : "manages"
    DISTRIBUTOR ||--o{ SELLER_ORDER : "fulfills"
    
    SELLER ||--o{ SELLER_ORDER : "places"
    SELLER ||--o{ SELLER_INVENTORY : "manages"
    
    BLANKET {
        int id PK
        string name
        int quantity
        string material
        string size
        string color
        float price
        timestamp created_at
        timestamp updated_at
    }
    
    DISTRIBUTOR {
        int id PK
        string name
        string email UK
        string phone
        string address
        timestamp registration_date
    }
    
    DISTRIBUTOR_ORDER {
        int id PK
        string order_number UK
        int distributor_id FK
        int blanket_id FK
        string blanket_name
        int quantity
        float unit_price
        float total_amount
        string status
        timestamp order_date
        timestamp shipped_date
        timestamp delivered_date
    }
    
    DISTRIBUTOR_INVENTORY {
        int id PK
        int distributor_id FK
        int blanket_id FK
        string blanket_name
        int quantity
        int reserved_quantity
        int reorder_level
        timestamp last_updated
    }
    
    SELLER {
        int id PK
        string business_name
        string owner_name
        string email UK
        string phone
        string address
        string store_type
        string website
        timestamp registration_date
        boolean is_active
    }
    
    SELLER_ORDER {
        int id PK
        string order_number UK
        int seller_id FK
        int blanket_id FK
        string blanket_name
        int quantity
        float unit_price
        float selling_price
        float total_amount
        int accepted_distributor_id FK
        string status
        timestamp order_date
        timestamp accepted_date
        timestamp delivered_date
        string payment_status
    }
    
    SELLER_INVENTORY {
        int id PK
        int seller_id FK
        int blanket_id FK
        string blanket_name
        int quantity
        float purchased_price
        float selling_price
        timestamp last_updated
    }
```

---

## 3. SEQUENCE DIAGRAM
Shows the order broadcast and fulfillment workflow.

```mermaid
sequenceDiagram
    actor Seller as Seller
    participant System as ATHEEQ System
    participant MFG_DB as Manufacturer DB
    participant Distributor
    participant DIST_DB as Distributor DB
    actor Customer as Customer
    
    Seller->>System: Place Order (Broadcast)
    activate System
    System->>MFG_DB: Check Blanket Stock
    alt Stock Available
        System->>MFG_DB: Deduct from Manufacturer Inventory
        System->>System: Create SellerOrder (Pending)
        System-->>Seller: Order Placed Successfully
    else Insufficient Stock
        System-->>Seller: Error - Insufficient Stock
    end
    deactivate System
    
    Note over System: Order is Broadcasted to All Distributors
    
    Distributor->>System: View Pending Orders
    System-->>Distributor: List of Available Orders
    Distributor->>DIST_DB: Check Distributor Inventory
    
    alt Distributor has Stock
        Distributor->>System: Accept Seller Order
        activate System
        System->>DIST_DB: Check Reserved Quantity
        alt Stock Available
            System->>DIST_DB: Update Distributor Inventory (Reserve)
            System->>DIST_DB: Update Seller Inventory
            System->>System: Update SellerOrder (Accepted)
            System-->>Distributor: Order Accepted Successfully
            System-->>Seller: Order Accepted by Distributor
        else Insufficient Stock
            System-->>Distributor: Error - Insufficient Stock
        end
        deactivate System
    else No Stock
        Distributor->>System: Cannot Accept Order
    end
    
    Distributor->>System: Fulfill Order (Ship)
    activate System
    System->>DIST_DB: Update Distributor Inventory (Final Deduct)
    System->>System: Update SellerOrder Status (Fulfilled)
    System-->>Distributor: Order Fulfilled
    System-->>Seller: Order Shipped/Delivered
    deactivate System
    
    Seller->>System: Sell from Inventory to Customer
    activate System
    System->>DIST_DB: Deduct from Seller Inventory
    System-->>Seller: Sale Recorded
    deactivate System
    
    Customer->>Seller: Receive Blanket
```

---

## 4. CLASS DIAGRAM
Shows the class structure and relationships.

```mermaid
classDiagram
    class Blanket {
        -int id
        -string name
        -int quantity
        -string material
        -string size
        -string color
        -float price
        -string front_image
        -string back_image
        -datetime created_at
        -datetime updated_at
        +to_dict()
    }
    
    class Distributor {
        -int id
        -string name
        -string email
        -string phone
        -string address
        -datetime registration_date
        +register()
        +to_dict()
    }
    
    class DistributorOrder {
        -int id
        -string order_number
        -int distributor_id
        -int blanket_id
        -string blanket_name
        -int quantity
        -float unit_price
        -float total_amount
        -string status
        -datetime order_date
        -datetime shipped_date
        -datetime delivered_date
        -string notes
        +place_order()
        +update_status()
        +cancel_order()
        +to_dict()
    }
    
    class DistributorInventory {
        -int id
        -int distributor_id
        -int blanket_id
        -string blanket_name
        -int quantity
        -int reserved_quantity
        -int reorder_level
        -datetime last_updated
        +update_stock()
        +reserve_stock()
        +to_dict()
    }
    
    class Seller {
        -int id
        -string business_name
        -string owner_name
        -string email
        -string phone
        -string address
        -string store_type
        -string website
        -datetime registration_date
        -boolean is_active
        +register()
        +get_dashboard()
        +to_dict()
    }
    
    class SellerOrder {
        -int id
        -string order_number
        -int seller_id
        -int blanket_id
        -string blanket_name
        -int quantity
        -float unit_price
        -float selling_price
        -float total_amount
        -int accepted_distributor_id
        -string status
        -datetime order_date
        -datetime accepted_date
        -datetime delivered_date
        -string payment_status
        -string notes
        +place_order()
        +accept_order()
        +cancel_order()
        +fulfill_order()
        +to_dict()
    }
    
    class SellerInventory {
        -int id
        -int seller_id
        -int blanket_id
        -string blanket_name
        -int quantity
        -float purchased_price
        -float selling_price
        -datetime last_updated
        +add_stock()
        +sell_stock()
        +to_dict()
    }
    
    class OrderManager {
        +place_order()
        +accept_order()
        +update_status()
        +cancel_order()
        +get_order_details()
    }
    
    class InventoryManager {
        +update_inventory()
        +reserve_stock()
        +get_available_quantity()
        +check_reorder_level()
    }
    
    Blanket "1" -- "*" DistributorOrder: "ordered by"
    Blanket "1" -- "*" SellerOrder: "ordered by"
    Blanket "1" -- "*" DistributorInventory: "stored in"
    Blanket "1" -- "*" SellerInventory: "stored in"
    
    Distributor "1" -- "*" DistributorOrder: "places"
    Distributor "1" -- "*" DistributorInventory: "manages"
    Distributor "1" -- "*" SellerOrder: "fulfills"
    
    Seller "1" -- "*" SellerOrder: "places"
    Seller "1" -- "*" SellerInventory: "manages"
    
    DistributorOrder --> OrderManager: "uses"
    SellerOrder --> OrderManager: "uses"
    DistributorInventory --> InventoryManager: "uses"
    SellerInventory --> InventoryManager: "uses"
    
    style Blanket fill:#ffffff,stroke:#000,color:#000
    style Distributor fill:#ffffff,stroke:#000,color:#000
    style DistributorOrder fill:#ffffff,stroke:#000,color:#000
    style DistributorInventory fill:#ffffff,stroke:#000,color:#000
    style Seller fill:#ffffff,stroke:#000,color:#000
    style SellerOrder fill:#ffffff,stroke:#000,color:#000
    style SellerInventory fill:#ffffff,stroke:#000,color:#000
    style OrderManager fill:#f0f0f0,stroke:#000,color:#000
    style InventoryManager fill:#f0f0f0,stroke:#000,color:#000
```

---

## System Overview

### Three-Tier Architecture:
1. **Manufacturer (Tier 1)**: Produces blankets
2. **Distributors (Tier 2)**: Order from manufacturer, fulfill seller orders
3. **Sellers (Tier 3)**: Order from any distributor via broadcast, sell to customers

### Key Workflows:

#### 📊 Distributor Order Flow:
- Distributor places order to manufacturer
- Manufacturer deducts stock
- Distributor receives order (inventory updated)
- Distributor reserves stock for seller orders

#### 📤 Seller Order Broadcast Flow:
- Seller places order (broadcasted to all distributors)
- Order status: Pending
- Any distributor can accept if they have stock
- When accepted:
  - Distributor inventory updated (reserved → actual deduction)
  - Seller inventory updated automatically
  - Order status: Accepted
- Distributor fulfills and delivers
- Order status: Fulfilled

#### 💼 Seller Inventory & Sales:
- Inventory only updates when distributor accepts order
- Seller can sell from inventory to customers
- Tracks purchased price and selling price

---

## Status Codes

| Status | Entity | Meaning |
|--------|--------|---------|
| Pending | SellerOrder | Broadcasted, waiting for distributor |
| Accepted | SellerOrder | Distributor accepted, stock allocated |
| Fulfilled/Delivered | SellerOrder | Order completed |
| Cancelled | Any Order | Order cancelled, stock restored |

---

## Key Features

✅ **Broadcast Order System** - One seller order can be fulfilled by any distributor  
✅ **Inventory Tracking** - Separate inventory for each tier  
✅ **Reserved Quantities** - Distributors can reserve stock  
✅ **Dynamic Pricing** - Sellers set their selling prices  
✅ **Multi-tier Supply Chain** - Manufacturer → Distributor → Seller → Customer  
✅ **Order Status Management** - Track orders through complete lifecycle
