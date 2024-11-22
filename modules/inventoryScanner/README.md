# FASTER Web Inventory Scanner

🧑‍💻 **Under development**

A solution for issuing inventory using handheld barcode scanners.

- Lets storeroom staff use handheld scanners to issue parts on FASTER Web work orders.

- Generates a log of inventory usage transactions that are later synchronized with FASTER Web
  using the Inventory Import Utility (IIU) integration.

- Optionally collects inventory usage transactions for another work order system (i.e. WorkTech)
  using the same common scanning interface.

## Layout

```mermaid
flowchart
    faster["FASTER Web"]
    sftp["SFTP"]
    helper["`**FASTER Web Helper**`"]
    scanner["Handheld Inventory Scanner"]
    inventory(["Optional Inventory System (Dynamics GP)"])
    workOrder(["Optional Work Order System (WorkTech)"])

    faster-->|Export reports|sftp
    sftp-->|Download reports|helper

    faster-.->|Optional inventory update|inventory
    inventory-.->|Optional inventory list|helper

    scanner-->|FASTER Web Inventory transactions|helper
    scanner-.->|Optional WO System Inventory transactions|helper

    helper-->|FASTER Web Inventory transactions|faster
    helper-.->|Optional WO System Inventory transactions|workOrder
```

## Requirements

- ⚙️ **Inventory Import Utility** integration.
- 📂 **SFTP access** for sending and receiving files.

### Optional Requirements

- Access to the FASTER Web API and `@cityssm/faster-api` package.
