# Integrity Checker

🧑‍💻 **Under development**

Performs various integrity checks and synchronizations of data in FASTER Web.

## Asset Checks

- Reports on assets with invalid VIN numbers.
- Reports on assets in FASTER Web that have no complimentary record in WorkTech,
  and vice versa.

## Item Checks

- Synchronizes basic inventory item details from Dynamics GP with FASTER inventory.

## Vendor Checks

- Synchronizes vendors from Dynamics GP with the FASTER vendor list.

## General Requirements

- 🔗 **SQL Server access** to the WorkTech database.
- 🔒 Access to the @cityssm/faster-api package.

See each task for additional requirements.

## Sample of the Necessary Configuration

Configuration located at `data/config.js`.

```javascript
export const config: Config = {
  worktech: {
    server: 'sqlServer',
    user: 'sqlUser',
    password: 'sqlP@ssw0rd',
    database: 'WT_DB'
  },

  modules: {
    integrityChecker: {
      isEnabled: true,
      worktechEquipment: {
        isEnabled: true
      }
    }
  }
}

export default config
```
