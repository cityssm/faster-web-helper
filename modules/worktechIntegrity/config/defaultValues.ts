// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import type { ConfigModuleWorktechIntegrityMappingFunctions } from './types.js'

export default {
  'modules.worktechIntegrity.isEnabled': false,

  'modules.worktechIntegrity.equipment.isEnabled': false,

  'modules.worktechIntegrity.equipment.mappingFunctions':
    {} as unknown as ConfigModuleWorktechIntegrityMappingFunctions
} satisfies Record<`modules.worktechIntegrity.${string}`, unknown>
