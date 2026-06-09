# ATHEEQ System Diagrams - PNG Export Guide

## 📊 Diagrams Created

All four diagrams have been created with **white background** and **black & white** styling:

### 1. ✅ **1-usecase-diagram.mmd**
   - Shows all actors (Manufacturer, Distributor, Seller, Customer)
   - Shows all use cases and interactions

### 2. ✅ **2-er-diagram.mmd**
   - Entity Relationship diagram
   - Shows all 7 database entities and their relationships
   - Includes attributes with data types

### 3. ✅ **3-sequence-diagram.mmd**
   - Order broadcast workflow
   - Shows interactions between Seller, System, Manufacturer, Distributor, and Customer
   - Step-by-step process flow

### 4. ✅ **4-class-diagram.mmd**
   - Class structure diagram
   - Shows classes, attributes, methods
   - Shows relationships between classes

### 5. ✅ **ALL_DIAGRAMS.html**
   - Combined HTML file with all 4 diagrams
   - Can be opened in any browser
   - Ready for screenshot or export to PNG

---

## 📥 How to Export to PNG

### **Option 1: From HTML File (Easiest)**
1. Open `ALL_DIAGRAMS.html` in your browser
2. Right-click on any diagram
3. Select **"Save image as..."**
4. Choose PNG format and save
5. Repeat for each diagram

### **Option 2: Using Mermaid CLI (Best Quality)**

**Install Mermaid CLI:**
```bash
npm install -g @mermaid-js/mermaid-cli
```

**Convert Individual Diagrams:**
```bash
# For each .mmd file:
mmdc -i 1-usecase-diagram.mmd -o 1-usecase-diagram.png -b white
mmdc -i 2-er-diagram.mmd -o 2-er-diagram.png -b white
mmdc -i 3-sequence-diagram.mmd -o 3-sequence-diagram.png -b white
mmdc -i 4-class-diagram.mmd -o 4-class-diagram.png -b white
```

### **Option 3: Using Online Tools**
1. Visit: https://mermaid.live
2. Copy content from .mmd files
3. Paste into the editor
4. Click **Download** → **PNG**

### **Option 4: Using VS Code Extension**
1. Install "Markdown Preview Mermaid Support" extension
2. Open .mmd files in VS Code
3. Preview and export to PNG

---

## 📂 File Structure

```
diagrams/
├── 1-usecase-diagram.mmd      # Use Case Diagram
├── 2-er-diagram.mmd            # ER Diagram
├── 3-sequence-diagram.mmd      # Sequence Diagram
├── 4-class-diagram.mmd         # Class Diagram
├── ALL_DIAGRAMS.html           # Combined HTML (recommended)
└── README.md                   # This file
```

---

## 🎨 Diagram Specifications

- **Background:** White (#ffffff)
- **Text Color:** Black (#000000)
- **Border Color:** Black (#000000)
- **Line Color:** Black (#000000)
- **Style:** Professional, clean, high-contrast

---

## 📋 Diagram Descriptions

### **Use Case Diagram**
- **Purpose:** Shows what actors can do in the system
- **Actors:** Manufacturer, Distributor, Seller, Customer
- **Use Cases:** 11 different operations

### **ER Diagram**
- **Purpose:** Shows database structure
- **Entities:** 7 tables (Blanket, Distributor, DistributorOrder, DistributorInventory, Seller, SellerOrder, SellerInventory)
- **Relationships:** 1-to-many relationships

### **Sequence Diagram**
- **Purpose:** Shows how the system works step-by-step
- **Flow:** Order placement → Broadcasting → Acceptance → Fulfillment
- **Actors:** Seller, System, Manufacturer, Distributor, Customer

### **Class Diagram**
- **Purpose:** Shows Java/Python class structure
- **Classes:** 7 main classes + Manager classes
- **Methods:** All key methods documented
- **Relationships:** Associations and multiplicities

---

## 💾 Quick Export Commands

**Windows (PowerShell):**
```powershell
# Navigate to diagrams folder
cd "d:\ams projects\atheeq\diagrams"

# Install mermaid-cli if not already installed
npm install -g @mermaid-js/mermaid-cli

# Export all diagrams
mmdc -i 1-usecase-diagram.mmd -o 1-usecase-diagram.png -b white
mmdc -i 2-er-diagram.mmd -o 2-er-diagram.png -b white
mmdc -i 3-sequence-diagram.mmd -o 3-sequence-diagram.png -b white
mmdc -i 4-class-diagram.mmd -o 4-class-diagram.png -b white
```

**Linux/Mac:**
```bash
cd ~/ams\ projects/atheeq/diagrams

npm install -g @mermaid-js/mermaid-cli

mmdc -i 1-usecase-diagram.mmd -o 1-usecase-diagram.png -b white
mmdc -i 2-er-diagram.mmd -o 2-er-diagram.png -b white
mmdc -i 3-sequence-diagram.mmd -o 3-sequence-diagram.png -b white
mmdc -i 4-class-diagram.mmd -o 4-class-diagram.png -b white
```

---

## 📸 Using ALL_DIAGRAMS.html

1. Open the HTML file in a browser (Chrome, Firefox, Edge, Safari)
2. All 4 diagrams will render automatically
3. To export a single diagram:
   - Right-click the diagram
   - Select "Save image as PNG"
4. To print all diagrams:
   - Press `Ctrl+P` or `Cmd+P`
   - Choose "Save as PDF"
   - Convert PDF to PNG if needed

---

## ✨ Features

✅ All diagrams have white background  
✅ Black & white professional styling  
✅ High contrast for printing  
✅ Mermaid format (industry standard)  
✅ Easy to edit and update  
✅ Multiple export options  
✅ HTML preview available  

---

## 🔗 System Overview

The ATHEEQ system is a **3-tier blanket supply chain:**

```
Tier 1: Manufacturer (creates & manages blankets)
   ↓
Tier 2: Distributors (order from manufacturer, accept seller orders)
   ↓
Tier 3: Sellers (broadcast orders, sell to customers)
```

---

## 📞 Need Help?

- **Mermaid Docs:** https://mermaid.js.org
- **Mermaid Live Editor:** https://mermaid.live
- **Export Documentation:** https://mermaid.js.org/ecosystem/integrations.html

---

**Created:** 2026-06-10  
**Project:** ATHEEQ Blanket Supply Chain  
**Format:** Mermaid Diagrams with PNG Export  
