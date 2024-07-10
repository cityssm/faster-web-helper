# WorkTech Update

Performs two main tasks:

- **Synchronizes items issued on Direct Charges** in FASTER Web
  with resources consumed by WorkTech work orders.
  Useful when FASTER Web is being used to manage all stock-related transactions,
  but some of those transactions are related to non-fleet, general work orders in WorkTech.

- **Synchronizes active equipment** from FASTER Web with WorkTech's equipment list.
  Useful when equipment usage is tracked in WorkTech.

## Requirements

- 📂 **SFTP access** for transferring files from FASTER Web.
- 🔗 **SQL Server access** to the WorkTech database.

### Required Excel Reports Regularly Exported to FTP

#### Direct Charges

- 📄 **W217 - Direct Charge Transactions**, to capture the `Symptom` field for the Direct Charges.
- 📄 **W223 - Inventory Transaction Details Reports**, to capture items issued and returned on Direct Charges.

#### Active Equipment

❓❓❓
To Be Determined
