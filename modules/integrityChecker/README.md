# Integrity Checker

🧑‍💻 **Under development**

Performs various integrity checks on data in FASTER Web.

## Asset Checks

- Reports on assets with invalid VIN numbers.
- Reports on assets in FASTER Web that have no complimentary record in WorkTech,
  and vice versa.

## Item Checks

**Under development**

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
