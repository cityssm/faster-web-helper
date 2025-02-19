import type { GPItemWithQuantity } from '@cityssm/dynamics-gp';
import type { ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults, ConfigModuleIntegrityCheckerMappingFunctions } from './types.js';
type GpItemFilterFunction = (item: GPItemWithQuantity) => boolean;
declare const _default: {
    'modules.integrityChecker.isEnabled': boolean;
    'modules.integrityChecker.fasterAssets.isEnabled': boolean;
    'modules.integrityChecker.nhtsaVehicles.isEnabled': boolean;
    'modules.integrityChecker.worktechEquipment.isEnabled': boolean;
    'modules.integrityChecker.worktechEquipment.mappingFunctions': ConfigModuleIntegrityCheckerMappingFunctions;
    'modules.integrityChecker.fasterInventory.isEnabled': boolean;
    'modules.integrityChecker.fasterInventory.storerooms': string[];
    'modules.integrityChecker.fasterInventory.validation.source': string;
    'modules.integrityChecker.fasterInventory.validation.gpLocationCodesToFasterStorerooms': Record<string, string>;
    'modules.integrityChecker.fasterInventory.validation.gpItemFilter': GpItemFilterFunction | undefined;
    'modules.integrityChecker.fasterInventory.validation.updateFaster': boolean;
    'modules.integrityChecker.fasterInventory.validation.createInvoiceDefaults': ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults | undefined;
};
export default _default;
