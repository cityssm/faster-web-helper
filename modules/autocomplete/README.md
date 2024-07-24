# FASTER Autocomplete Fields

Creates and hosts JSON files compatible with Autocomplete userscripts.

## Requirements

- 📂 **SFTP access** for sending and receiving files.

### Required Excel Reports Regularly Exported to FTP

- 📄 **W114 - Asset Master List**, for building `assetNumbers.json`.
- 📄 **W200 - Inventory Report**, for building `itemNumbers.json`.

## Sample of the Necessary Configuration

Configuration located at `data/config.js`.

```javascript
export const config = {
  ftp: {
    host: 'ftp.example.com',
    port: 990,
    user: 'ftpUser',
    password: 'p@ssw0rd'
  },
  webServer: {
    httpPort: 9000
  },
  modules: {
    autocomplete: {
      isEnabled: true,
      runOnStartup: true,
      reports: {
         w114: {
          ftpPath: {
            directory: 'autocomplete',
            filePrefix: 'assetMasterList_',
            fileSuffix: '.xlsx',
            doDelete: true
          },
          schedule: {
            dayOfWeek: [1, 2, 3, 4, 5],
            hour: 6,
            minute: 10
          }
        },
        w200: {
          ftpPath: {
            directory: 'autocomplete',
            filePrefix: 'inventory_',
            fileSuffix: '.xlsx',
            doDelete: true
          },
          schedule: {
            dayOfWeek: [1, 2, 3, 4, 5],
            hour: 6,
            minute: 15
          }
        }
      }
    }
  }
}

export default config
```

### Configuration Tips

- For assistance with the available `ftp` options, see the [basic-ftp](https://www.npmjs.com/package/basic-ftp) documentation.

- For assistance with the available `schedule` options, see the [node-schedule](https://www.npmjs.com/package/node-schedule) documentation.

- Schedule retrieval from FTP ten or so minutes after the report is scheduled in FASTER to ensure the report is ready.

## Usage

Install the **Asset Numbers Autocomplete** userscript
and/or the **Item Numbers Autocomplete** userscript
from [the City's userscript library](https://cityssm.github.io/userscripts/#userscripts-for-faster-web).

Navigate to a page with an asset number or item number text field.

Under the options menu for the userscript,
look for the option _Set "xxx.json" path_.

The path will be something like this, depending on your configuration settings.

```text
http://serverNameOrIp:9000/autocomplete/assetNumbers.json
-- or --
http://serverNameOrIp:9000/autocomplete/itemNumbers.json
```
