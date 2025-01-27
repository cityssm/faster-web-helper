// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import type { ConfigModuleIntegrityCheckerMappingFunctions } from './types.js'

export default {
  'modules.integrityChecker.isEnabled': false,

  'modules.integrityChecker.fasterAssets.isEnabled': true,

  'modules.integrityChecker.nhtsaVehicles.isEnabled': true,

  'modules.integrityChecker.worktechEquipment.isEnabled': false,

  'modules.integrityChecker.worktechEquipment.mappingFunctions':
    {} as unknown as ConfigModuleIntegrityCheckerMappingFunctions
} satisfies Record<`modules.integrityChecker.${string}`, unknown>
