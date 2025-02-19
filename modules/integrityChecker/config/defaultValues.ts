// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import type { GPItemWithQuantity } from '@cityssm/dynamics-gp'

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

  'modules.integrityChecker.fasterInventory.isEnabled': true,

  'modules.integrityChecker.fasterInventory.storerooms': [] as string[],

  'modules.integrityChecker.fasterInventory.validation.source': '',

  'modules.integrityChecker.fasterInventory.validation.gpLocationCodesToFasterStorerooms':
    {} as unknown as Record<string, string>,

  'modules.integrityChecker.fasterInventory.validation.gpItemFilter':
    undefined as unknown as GpItemFilterFunction | undefined,

  'modules.integrityChecker.fasterInventory.validation.updateFaster': false,

  'modules.integrityChecker.fasterInventory.validation.createInvoiceDefaults':
    undefined as unknown as
      | ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults
      | undefined
} satisfies Record<`modules.integrityChecker.${string}`, unknown>
