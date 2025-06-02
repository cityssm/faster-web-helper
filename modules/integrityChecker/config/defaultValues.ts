import type {
  GPItemWithQuantity
} from '@cityssm/dynamics-gp'

import type {
  ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults,
  ConfigModuleIntegrityCheckerMappingFunctions
} from './types.js'

type GpItemFilterFunction = (item: GPItemWithQuantity) => boolean

export default {
  'modules.integrityChecker.isEnabled': false,

  'modules.integrityChecker.fasterAssets.isEnabled': true,

  'modules.integrityChecker.nhtsaVehicles.isEnabled': true,

  'modules.integrityChecker.worktechEquipment.isEnabled': false,

  'modules.integrityChecker.worktechEquipment.mappingFunctions':
    {} as unknown as ConfigModuleIntegrityCheckerMappingFunctions,

  'modules.integrityChecker.fasterItems.isEnabled': true,

  'modules.integrityChecker.fasterItems.storerooms': [] as string[],

  'modules.integrityChecker.fasterItems.validation.source': '',

  'modules.integrityChecker.fasterItems.validation.gpLocationCodesToFasterStorerooms':
    {} as unknown as Record<string, string>,

  'modules.integrityChecker.fasterItems.validation.gpItemFilter':
    undefined as unknown as GpItemFilterFunction | undefined,

  'modules.integrityChecker.fasterItems.validation.updateFaster': false,

  'modules.integrityChecker.fasterItems.validation.createInvoiceDefaults':
    undefined as unknown as
      | ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults
      | undefined,

  'modules.integrityChecker.fasterVendors.isEnabled': false,

  'modules.integrityChecker.fasterVendors.update.source': '',

  'modules.integrityChecker.fasterVendors.update.vendorCodesToIgnore':
    [] as string[]
} satisfies Record<`modules.integrityChecker.${string}`, unknown>
