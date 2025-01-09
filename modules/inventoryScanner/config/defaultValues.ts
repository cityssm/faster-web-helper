import type {
  ConfigItemValidationDynamicsGP,
  ConfigItemValidationFaster
} from './types.js'

export default {
  'modules.inventoryScanner.isEnabled': false,

  'modules.inventoryScanner.scannerIpAddressRegex': /^$/,

  'modules.inventoryScanner.fasterSync.integrationId': undefined as unknown as
    | number
    | undefined,

  // eslint-disable-next-line no-secrets/no-secrets
  'modules.inventoryScanner.fasterSync.exportFileNamePrefix': '',

  'modules.inventoryScanner.fasterSync.ftpPath': '',

  'modules.inventoryScanner.fasterSync.defaultTechnicianId': 1,

  'modules.inventoryScanner.workOrders.acceptNotValidated': true,
  'modules.inventoryScanner.workOrders.fasterRegex': /^\d+$/,

  // eslint-disable-next-line no-secrets/no-secrets
  'modules.inventoryScanner.workOrders.acceptWorkTech': false,

  // eslint-disable-next-line no-secrets/no-secrets
  'modules.inventoryScanner.workOrders.workTechRegex': /^[A-Z]{2}.\d{2}.\d{5}$/,

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
  'modules.inventoryScanner.fasterItemRequests.ntfy.topic': undefined as undefined | string,

  'modules.inventoryScanner.quantities.acceptOverages': true,
  'modules.inventoryScanner.quantities.acceptNegatives': true
} satisfies Record<`modules.inventoryScanner.${string}`, unknown>
