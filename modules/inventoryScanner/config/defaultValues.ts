import type {
  ConfigCountExportColumn,
  ConfigItemValidationDynamicsGP,
  ConfigItemValidationFaster
} from './types.js'

export default {
  'modules.inventoryScanner.isEnabled': false,

  'modules.inventoryScanner.apiIpAddressRegex': /^$/,
  'modules.inventoryScanner.scannerIpAddressRegex': /^$/,

  'modules.inventoryScanner.fasterSync.integrationId': undefined as unknown as
    | number
    | undefined,

  'modules.inventoryScanner.fasterSync.exportFileNamePrefix': '',

  'modules.inventoryScanner.fasterSync.ftpPath': '',

  'modules.inventoryScanner.fasterSync.defaultTechnicianId': 1,

  'modules.inventoryScanner.fasterSync.ntfy.isEnabled': false,
  'modules.inventoryScanner.fasterSync.ntfy.topic': undefined as
    | string
    | undefined,

  'modules.inventoryScanner.workOrders.acceptNotValidated': true,
  'modules.inventoryScanner.workOrders.fasterRegex': /^\d+$/,

  'modules.inventoryScanner.workOrders.acceptWorkTech': false,

  'modules.inventoryScanner.workOrders.workTechRegex':
    /^[A-Z]{2,3}.\d{2}.\d{5}$/,

  'modules.inventoryScanner.workOrders.validationSources': [] as Array<
    'fasterApi' | 'worktech'
  >,

  'modules.inventoryScanner.items.acceptNotValidated': true,
  'modules.inventoryScanner.items.itemNumberRegex': undefined as unknown as
    | RegExp
    | undefined,
  'modules.inventoryScanner.items.placeholder': '',
  'modules.inventoryScanner.items.validation': undefined as unknown as
    | ConfigItemValidationDynamicsGP
    | ConfigItemValidationFaster
    | undefined,

  'modules.inventoryScanner.fasterItemRequests.isEnabled': false,
  'modules.inventoryScanner.fasterItemRequests.ntfy.isEnabled': false,
  'modules.inventoryScanner.fasterItemRequests.ntfy.topic': undefined as
    | string
    | undefined,

  'modules.inventoryScanner.quantities.acceptNegatives': true,
  'modules.inventoryScanner.quantities.acceptOverages': true,

  'modules.inventoryScanner.countExport.columns': [
    'itemStoreroom',
    'itemNumber',
    'countedQuantity',
    'countedDate',
    'countedTime'
  ] as ConfigCountExportColumn[]
} satisfies Record<`modules.inventoryScanner.${string}`, unknown>
