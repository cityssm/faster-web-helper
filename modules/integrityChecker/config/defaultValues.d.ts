import type { GPItemWithQuantity } from '@cityssm/dynamics-gp';
import type { ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults, ConfigModuleIntegrityCheckerMappingFunctions } from './types.js';
type GpItemFilterFunction = (item: GPItemWithQuantity) => boolean;
declare const _default: {
    'modules.integrityChecker.isEnabled': boolean;
    'modules.integrityChecker.fasterAssets.isEnabled': boolean;
    'modules.integrityChecker.nhtsaVehicles.isEnabled': boolean;
    'modules.integrityChecker.worktechEquipment.isEnabled': boolean;
    'modules.integrityChecker.worktechEquipment.mappingFunctions': ConfigModuleIntegrityCheckerMappingFunctions;
    'modules.integrityChecker.fasterItems.isEnabled': boolean;
    'modules.integrityChecker.fasterItems.storerooms': string[];
    'modules.integrityChecker.fasterItems.validation.source': string;
    'modules.integrityChecker.fasterItems.validation.gpLocationCodesToFasterStorerooms': Record<string, string>;
    'modules.integrityChecker.fasterItems.validation.gpItemFilter': GpItemFilterFunction | undefined;
    'modules.integrityChecker.fasterItems.validation.updateFaster': boolean;
    'modules.integrityChecker.fasterItems.validation.createInvoiceDefaults': ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults | undefined;
};
export default _default;
