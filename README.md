<div align=center>

# FASTER Web Helper

<img src="public/images/logo.svg" height="200" />

🚧 **Under Active Development** 🚧

[![DeepSource](https://app.deepsource.com/gh/cityssm/faster-web-helper.svg/?label=active+issues&show_trend=true&token=u_wO1FIhQ1v-pNxtKl8dZxM4)](https://app.deepsource.com/gh/cityssm/faster-web-helper/)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=cityssm_faster-web-helper&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=cityssm_faster-web-helper)

A service to support integrations with the
[FASTER Web Fleet Management System](https://fasterasset.com/products/fleet-management-software/).

_This helper service is completely unofficial and is in no way affiliated with or endorsed by FASTER Asset Solutions or Transit Technologies._

</div>

## Available Modules

⭐ [**Inventory Scanner**](./modules/inventoryScanner/README.md) ⭐<br />
Uses the **Inventory Import Utility** integration to offer
a solution for issuing inventory using handheld barcode scanners.

[**Integrity Checks**](./modules/integrityChecker/README.md)<br />
Reports on assets in FASTER Web that may have errors.
Reports on assets that have no complimentary record in WorkTech, and vice versa.
Updates FASTER inventory and vendor records from external systems.

[**Autocomplete**](./modules/autocomplete/README.md)<br />
Creates and hosts JSON files compatible with Autocomplete userscripts.

## Note About FASTER API Calls

Calls to the FASTER Web API are made using the `@cityssm/faster-api` package.
Unfortunately, due to FASTER's Non-Disclosure Agreement, that package is private,
and marked as optional by this project. 😔

Some of the processes the FASTER Web API is used for:

- **Inventory Scanner** - Retrieving repair-related information.
- **Inventory Scanner** - Adding upload information to integration logs.
- **Integrity Checks** - Synchronizing vendor lists.

If you want access and can prove you have access to the FASTER Web APIs,
read-only or collaborator access can be granted.

## Other FASTER Web Projects

This application is made possible through several FASTER Web specific projects.

_Building an intergration with FASTER Web?_

[Have a look at the City's open source projects related to FASTER Web](https://github.com/cityssm/faster-web-projects).

## Other Related Projects

[Unofficial WorkTech API for Node](https://github.com/cityssm/node-worktech-api)<br />
Select queries to help with integrations with the WorkTech work order management system.
