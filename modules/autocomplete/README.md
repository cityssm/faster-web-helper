# FASTER Autocomplete Fields

Creates and hosts an `itemNumbers.json` file,
compatible with the Item Numbers Autocomplete userscript.

## Requirements

- 📂 **SFTP access** for sending and receiving files.

### Required Excel Reports Regularly Exported to FTP

- 📄 **W200 - Inventory Report**, for building `itemNumbers.json`.

## Usage

Install the **Item Numbers Autocomplete** userscript
from [the City's userscript library](https://cityssm.github.io/userscripts/#userscripts-for-faster-web).

Navigate to an "Issue Part" page. Under the options menu for the userscript,
look for the option _Set "itemNumbers.json" path_.

The path will be something like this, depending on your configuration settings.

```text
http://serverNameOrIp:8080/autocomplete/itemNumbers.json
```
