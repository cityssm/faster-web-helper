// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import type { ConfigModuleWorktechUpdateMappingFunctions } from './types.js'

export default {
  'modules.worktechUpdate.isEnabled': false,

  'modules.worktechUpdate.activeEquipment.isEnabled': false,

  'modules.worktechUpdate.activeEquipment.mappingFunctions':
    {} as unknown as ConfigModuleWorktechUpdateMappingFunctions
} satisfies Record<`modules.worktechUpdate.${string}`, unknown>
