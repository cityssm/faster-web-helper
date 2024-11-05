<div align=center>

# FASTER Web Helper

<img src="public/images/logo.svg" height="200" />

🚧 **Under Active Development** 🚧

[![DeepSource](https://app.deepsource.com/gh/cityssm/faster-web-helper.svg/?label=active+issues&show_trend=true&token=u_wO1FIhQ1v-pNxtKl8dZxM4)](https://app.deepsource.com/gh/cityssm/faster-web-helper/)
[![Maintainability](https://api.codeclimate.com/v1/badges/f30a366c800b38bd9eb7/maintainability)](https://codeclimate.com/github/cityssm/faster-web-helper/maintainability)

A service to support integrations with the
[FASTER Web Fleet Management System](https://fasterasset.com/products/fleet-management-software/).

_This helper service is completely unofficial and is in no way affiliated with or endorsed by FASTER Asset Solutions or Transit Technologies._

</div>

## Available Modules

⭐ [**Inventory Scanner**](./modules/inventoryScanner/README.md) ⭐<br />
Uses the **Inventory Import Utility** integration to offer
a solution for issuing inventory using handheld barcode scanners.

[**WorkTech Update**](./modules/worktechUpdate/README.md)<br />
Synchronizes active equipment with WorkTech's equipment list.
Synchronizes items issued on Direct Charges in FASTER Web
with resources consumed by WorkTech work orders.

[**Autocomplete**](./modules/autocomplete/README.md)<br />
Creates and hosts JSON files compatible with Autocomplete userscripts.

## Other FASTER Web Projects

[FASTER Web Report Parser](https://github.com/cityssm/node-faster-report-parser)<br />
Parses select Excel and CSV reports from FASTER Web into usable data objects.

[Userscripts for FASTER Web](https://github.com/cityssm/userscripts?tab=readme-ov-file#userscripts-for-faster-web)<br />
Helps with some of the common irks when using FASTER Web.
Includes userscripts to enforce field validation, correct varying header heights,
and offer autocomplete.

## Other Related Projects

[Unofficial WorkTech API for Node](https://github.com/cityssm/node-worktech-api)<br />
Select queries to help with integrations with the WorkTech work order management system.