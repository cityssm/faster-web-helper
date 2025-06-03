import { DynamicsGP } from '@cityssm/dynamics-gp';
import { FasterApi } from '@cityssm/faster-api';
import fasterInventoryItemConstants from '@cityssm/faster-constants/inventory/items';
import { FasterUnofficialAPI } from '@cityssm/faster-unofficial-api';
import sqlite from 'better-sqlite3';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { hasFasterApi } from '../../../../helpers/fasterWeb.helpers.js';
import { createOrUpdateDynamicsGpInventoryItem } from '../../database/createOrUpdateDynamicsGpInventoryItem.js';
import { deleteExpiredRecords } from '../../database/deleteExpiredRecords.js';
import getDynamicsGpInventoryItemsToUpdateInFaster from '../../database/getDynamicsGpInventoryItemsToUpdateInFaster.js';
import { databasePath, timeoutMillis } from '../../database/helpers.database.js';
import { moduleName } from '../module.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:inventoryValidation:dynamicsGp`);
const fasterWebConfig = getConfigProperty('fasterWeb');
const dynamicsGPConfig = getConfigProperty('dynamicsGP');
const gpLocationCodesToFasterStorerooms = getConfigProperty('modules.integrityChecker.fasterItems.validation.gpLocationCodesToFasterStorerooms');
const gpItemFilter = getConfigProperty('modules.integrityChecker.fasterItems.validation.gpItemFilter');
export async function refreshDynamicsGpInventory() {
    if (dynamicsGPConfig === undefined) {
        debug('Missing Dynamics GP configuration.');
        return false;
    }
    /*
     * Call Dynamics GP API
     */
    const dynamicsGp = new DynamicsGP(dynamicsGPConfig);
    const dynamicsGpLocationCodes = Object.keys(gpLocationCodesToFasterStorerooms);
    const inventory = await dynamicsGp.getItemsByLocationCodes(dynamicsGpLocationCodes);
    /*
     * Update the database
     */
    debug(`Updating ${inventory.length} Dynamics GP inventory records...`);
    const database = sqlite(databasePath, {
        timeout: timeoutMillis
    });
    const rightNowMillis = Date.now();
    for (const item of inventory) {
        if (gpItemFilter?.(item) ?? true) {
            const storeroom = gpLocationCodesToFasterStorerooms[item.locationCode];
            createOrUpdateDynamicsGpInventoryItem({
                itemNumber: item.itemNumber,
                locationCode: item.locationCode,
                fasterStoreroom: storeroom,
                itemDescription: item.itemDescription,
                itemShortName: item.itemShortName,
                itemType: item.itemType,
                binNumber: item.binNumber,
                currentCost: item.currentCost,
                quantityOnHand: item.quantityOnHand,
                recordUpdate_timeMillis: rightNowMillis
            }, database);
        }
    }
    /*
     * Delete expired assets
     */
    const deleteCount = deleteExpiredRecords('DynamicsGpInventoryItems', rightNowMillis, database);
    database.close();
    if (deleteCount > 0) {
        debug(`Deleted ${deleteCount} expired items.`);
    }
    return true;
}
const notFoundInDynamicsGpBinLocation = 'NOT FOUND';
const createInvoiceDefaults = getConfigProperty('modules.integrityChecker.fasterItems.validation.createInvoiceDefaults');
// eslint-disable-next-line complexity
export async function updateInventoryInFaster() {
    /*
     * Declare FASTER APIs
     */
    if (fasterWebConfig.appUserName === undefined ||
        fasterWebConfig.appPassword === undefined) {
        debug('Missing FASTER app user configuration.');
        return;
    }
    const fasterUnofficialAPI = new FasterUnofficialAPI(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.appUserName, fasterWebConfig.appPassword);
    if (!hasFasterApi) {
        debug('FASTER API is not enabled.');
        return;
    }
    const fasterAPI = new FasterApi(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.apiUserName, fasterWebConfig.apiPassword);
    if (createInvoiceDefaults === undefined) {
        debug('Missing create invoice defaults configuration.');
        return;
    }
    /*
     * Get records to update
     */
    const recordsToUpdate = getDynamicsGpInventoryItemsToUpdateInFaster();
    if (recordsToUpdate.length === 0) {
        debug('No records to update.');
        return;
    }
    for (const [recordIndex, record] of recordsToUpdate.entries()) {
        const gpItemNameTruncated = (record.gpItemName ?? record.itemNumber).slice(0, fasterInventoryItemConstants.itemName.maxLength);
        if (record.fasterItemName === null) {
            if (record.gpQuantityInStock === 0) {
                continue;
            }
            debug(`Creating Dynamics GP item "${record.itemNumber} [${record.storeroom}]" in FASTER...`);
            const result = await fasterAPI.issueNonStockedPart({
                ...createInvoiceDefaults,
                invoiceNumber: `INV-${record.itemNumber}-${Date.now()}`,
                invoiceDate: new Date().toISOString(),
                invoiceTotal: (record.gpCurrentCost ?? 0) * (record.fasterQuantityInStock ?? 0),
                receivedQty: record.gpQuantityInStock ?? 1,
                unitPrice: record.gpCurrentCost ?? 0,
                shipping: 0,
                taxCost: 0,
                partNumber: record.itemNumber,
                partName: gpItemNameTruncated,
                partDesc: record.gpItemName ?? record.itemNumber,
                storeroom: record.storeroom,
                purchaseOrderDescription: '',
                purchaseOrderCardType: '',
                purchaseOrderCardLast4: '',
                purchaseOrderCardCardholderName: '',
                warrantyLength: 0,
                warrantyLengthUnit: 'Year',
                warrantyCycle: '',
                warrantyCycleCode: '',
                otherChargeTypeId: '',
                otherChargeUnitPrice: 0,
                otherChargeTaxCost: 0
            });
            if (!result.success) {
                debug(`Error creating Dynamics GP item "${record.itemNumber} [${record.storeroom}]" in FASTER: ${result.error.title}`);
                continue;
            }
            if (recordIndex < 10) {
                debug(JSON.stringify(result));
            }
        }
        else if (record.gpItemName === null) {
            if (record.fasterBinLocation === notFoundInDynamicsGpBinLocation) {
                continue;
            }
            debug(`Update FASTER item "${record.itemNumber} [${record.storeroom}]" bin to "${notFoundInDynamicsGpBinLocation}"...`);
            await fasterUnofficialAPI.updateInventoryItem(record.itemNumber, record.storeroom, {
                binLocation: notFoundInDynamicsGpBinLocation
            });
        }
        else if (record.fasterItemName !== gpItemNameTruncated ||
            record.fasterBinLocation !== record.gpBinLocation) {
            debug(`Update FASTER item "${record.itemNumber} [${record.storeroom}]"...`);
            try {
                await fasterUnofficialAPI.updateInventoryItem(record.itemNumber, record.storeroom, {
                    itemName: gpItemNameTruncated,
                    itemDescription: record.gpItemName,
                    alternateLocation: record.gpAlternateLocation ?? '',
                    binLocation: record.gpBinLocation ?? ''
                });
            }
            catch (error) {
                debug(`Error updating FASTER item "${record.itemNumber} [${record.storeroom}]".`);
                debug(error);
            }
        }
    }
}
