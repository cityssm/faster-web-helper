# WorkTech Update

Performs two main tasks:

- [**Synchronizes items issued on Direct Charges**](#direct-charges-task) in FASTER Web
  with resources consumed by WorkTech work orders.
  Useful when FASTER Web is being used to manage all stock-related transactions,
  but some of those transactions are related to non-fleet, general work orders in WorkTech.

- [**Synchronizes active equipment**](#active-equipment-task) from FASTER Web with WorkTech's equipment list.
  Useful when equipment usage is tracked in WorkTech.

## General Requirements

- 📂 **SFTP access** for transferring files from FASTER Web.
- 🔗 **SQL Server access** to the WorkTech database.
- 📄 Necessary reports, scheduled for export to FTP.

See each task for additional requirements.

## Direct Charges Task

### Direct Change Specific Requirements

- 🔤 `Symptom` field on Direct Charges populated with WorkTech Work Order Numbers.
- An item in WorkTech for each FASTER storeroom with `itemId` = `'FASTER-' + storeroom`

### Necessary Direct Charge Reports

- 📄 **W217 - Direct Charge Transactions**, to capture the `Symptom` field for the Direct Charges.
  Make sure "Include Returns" is set to "Yes".
- 📄 **W223 - Inventory Transaction Details Report**, to capture items issued and returned on Direct Charges.

#### Why not just _W217 - Direct Charge Transactions_?

- ☹️ The dates do not include time,
  so identifying transactions with certainty when multiple exist on the same day is more difficult.

- ☹️ Transactions do not include created and modified times,
  which are more reliable to identify transactions.

#### Why not just _W223 - Inventory Transaction Details Report_?

- ☹️ The `Symptom` field is not included,
  so there is no way to know which WorkTech Work Order transactions correspond to.

- ☹️ When a return is done as a "Return to Vendor",
  a `RETURN BIN` transaction type is used, but there are no transaction details to indicate
  if that record is associated with a direct charge.

### FASTER Direct Charge to WorkTech Resource Mapping

| WorkTech Resource Field | FASTER Transaction Field (W223)                     |
| ----------------------- | --------------------------------------------------- |
| `workOrderNumber`       | `symptom` (retrieved from W217 cache)               |
| `itemId`                | `'FASTER-'` + `storeroom`                           |
| `workDescription`       | `documentNumber` - `itemNumber`<br />[ md5(), ... ] |
| `quantity`              | `quantity`                                          |
| `unitPrice`             | `unitTrueCost`                                      |
| `baseAmount`            | `extCost`                                           |
| `lockUnitPrice`         | `1`                                                 |
| `lockMargin`            | `1`                                                 |
| `startDateTime`         | `transactionDateTime` (from issue transaction)      |
| `endDateTime`           | `modifiedDateTime` (max from issue and returns)     |

#### Work Description Hash List

There is no primary key available for each transaction. 😔

To track recorded transactions, an MD5 hash for each resource record is calculated.

```javascript
md5(
  `${documentNumber}-${storeroom}-${itemNumber}-${quantity}-${unitTrueCost}-${createdDateTime}-${occuranceIndex}`
)
```

Where the `occuranceIndex` is a number that increments by `1` until the hash is not seen within the file.
Sadly with all of these fields, there is still the chance of two distinct records having the same hash.

### Direct Charge Process

🔽 Download _W217 - Direct Charge Transactions_.

Update cache that maps `Document Numbers` to `Symptoms`.

If `Symptom` (WorkTech Work Order Number) changes in FASTER,
do the following in WorkTech:

- Get all resources currently associated with the `Document Number`.

- Update those resources with the newly identified WorkTech Work Order,
  or if the `Symptom` is now blank, delete all records for resources associated with `Document Number`.

Also, record any `Return to Vendor` records for verification purposes.

🔽 Download _W223 - Inventory Transaction Details Report_.

Filter data to only include records where:

- `transactionType` = `'DC ISSUE'` or
- `transactionType` = `'RETURN BIN'` or
- `transactionType` = `'RETURN TO INV'` and<br/>
  `transactionDetails` starts with `'FROM DC ISSUE:'`

For each record:

- If it's a `RETURN BIN` record, it could be related to the direct charge, or not.
  If no `documentNumber` is included in the record, it needs to be verified with `W217`.

  - If verified, update the transaction with the document number and proceed with return process.

- Check the `WorkOrderNumberMappings` table if the `documentNumber` has a corresponding `workOrderNumber`.

  - If no mapping is available, discard record.

- Get all WorkTech resource records for the corresponding work order and direct charge document.

  - `workDescription` will start with the document number.

- Calculate the hash for the record.

  - If the hash is found in the WorkTech resources, ensure the transaction date/time is correct.

- If it's a `DC ISSUE` record, create a new resource record.

- If it's a `RETURN TO INV` record or a verified `RETURN BIN` record:

  - Find the most recent previous transaction that has a non-zero quantity.

  - Decrement the quantity, and update the `workDescription` hash list with
    the hash of the return transaction.
  - Repeat searching for previous transactions until full return is accounted for.

## Active Equipment Task

- ❓Report to be determined
