# WorkTech Update

Performs various syncing processes between Worktech and FASTER Web.

- [**Synchronizes active equipment**](#active-equipment-task) from FASTER Web with WorkTech's equipment list.
  Useful when equipment usage is tracked in WorkTech.

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
    worktechUpdate: {
      isEnabled: true,
      activeEquipment: {
        isEnabled: true
      }
    }
  }
}

export default config
```

## Active Equipment Task

- ❓Report to be determined
