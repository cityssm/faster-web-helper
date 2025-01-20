# WorkTech Integrity Checks

Performs various integrity checks between WorkTech and FASTER Web.

- Reports on assets in FASTER Web that have no complimentary record in WorkTech,
  and vice versa.

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
    worktechIntegrity: {
      isEnabled: true,
      equipment: {
        isEnabled: true
      }
    }
  }
}

export default config
```

## Equipment Integrity Task

Under development