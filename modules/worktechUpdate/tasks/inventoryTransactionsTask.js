import { parseW223ExcelReport } from '@cityssm/faster-report-parser/xlsx';
import { dateStringToInteger } from '@cityssm/utils-datetime';
import { WorkTechAPI } from '@cityssm/worktech-api';
import camelCase from 'camelcase';
import Debug from 'debug';
import { getConfigProperty } from '../../../helpers/functions.config.js';
import { downloadFilesToTemp } from '../../../helpers/functions.sftp.js';
import getReturnToVendorRecord from '../database/getReturnToVendorRecord.js';
import getWorkOrderNumberMapping from '../database/getWorkOrderNumberMapping.js';
import { moduleName } from '../helpers/moduleHelpers.js';
import { buildWorkOrderResourceDescriptionHash, getOrCreateStoreroomResourceItem, getWorkOrderResources } from '../helpers/worktechHelpers.js';
export const taskName = 'Inventory Transactions Task';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`);
const worktech = new WorkTechAPI(getConfigProperty('worktech'));
const inventoryTransactionsConfig = getConfigProperty('modules.worktechUpdate.reports.w223');
export default async function runInventoryTransactionsTask() {
    if (inventoryTransactionsConfig === undefined) {
        return;
    }
    debug(`Running "${taskName}"...`);
    const tempInventoryTransactionsReportFiles = await downloadFilesToTemp(inventoryTransactionsConfig.ftpPath);
    /*
     * Loop through files
     */
    debug(`${tempInventoryTransactionsReportFiles.length} file(s) to process...`);
    for (const reportFile of tempInventoryTransactionsReportFiles) {
        try {
            const report = parseW223ExcelReport(reportFile, {
                inverseAmounts: true
            });
            const transactionHashCache = new Set();
            for (const storeroomData of report.data) {
                /*
                 * Ensure storeroom item is available
                 */
                const worktechStoreroomResourceItem = await getOrCreateStoreroomResourceItem(storeroomData);
                /*
                 * Loop through transactions
                 */
                for (const transactionData of storeroomData.transactions) {
                    /*
                     * Discard transactions that are not an applicable type.
                     */
                    if (transactionData.transactionType !== 'DC ISSUE' &&
                        transactionData.transactionType !== 'RETURN TO INV' &&
                        transactionData.transactionType !== 'RETURN BIN') {
                        continue;
                    }
                    /*
                     * Check if "RETURN BIN" records are Direct Charge related.
                     */
                    if (transactionData.transactionType === 'RETURN BIN' &&
                        transactionData.documentNumber === undefined) {
                        const returnToVendorRecord = getReturnToVendorRecord({
                            storeroom: storeroomData.storeroom,
                            itemNumber: transactionData.itemNumber,
                            transactionDate: dateStringToInteger(transactionData.transactionDateTime.split(' ')[0]),
                            quantity: transactionData.quantity,
                            cost: transactionData.extCost
                        });
                        if (returnToVendorRecord === undefined) {
                            continue;
                        }
                        transactionData.documentNumber = returnToVendorRecord.documentNumber;
                    }
                    /*
                     * Get Worktech work order number.
                     */
                    if (transactionData.documentNumber === undefined) {
                        debug(`Transaction has no associated documentNumber: ${JSON.stringify(transactionData)}`);
                        continue;
                    }
                    const workOrderNumberMapping = getWorkOrderNumberMapping(transactionData.documentNumber);
                    if (workOrderNumberMapping === undefined ||
                        workOrderNumberMapping.workOrderNumber === '') {
                        debug(`No mapping available for documentNumber = ${transactionData.documentNumber}`);
                        continue;
                    }
                    /*
                     * Get all of the work order / document number resources.
                     */
                    const workOrderResources = await getWorkOrderResources(workOrderNumberMapping);
                    /*
                     * Calculate record hash
                     */
                    let occuranceIndex = 0;
                    let transactionHash = '';
                    while (transactionHashCache.has(transactionHash)) {
                        occuranceIndex += 1;
                        transactionHash = buildWorkOrderResourceDescriptionHash(storeroomData, transactionData, occuranceIndex);
                    }
                    // Save used hash
                    transactionHashCache.add(transactionHash);
                    /*
                     * Check if hash has already been recorded.
                     */
                    const transactionIsRecorded = workOrderResources.some((possibleResourceRecord) => possibleResourceRecord.workDescription.includes(transactionHash));
                    if (transactionIsRecorded) {
                        debug(`Transaction already recorded: ${JSON.stringify(transactionData)}`);
                        continue;
                    }
                    /*
                     * Record the transaction
                     */
                    if (transactionData.transactionType === 'DC ISSUE') {
                        await worktech.addWorkOrderResource({
                            workOrderNumber: workOrderNumberMapping.workOrderNumber,
                            itemSystemId: worktechStoreroomResourceItem.itemSystemId,
                            itemId: worktechStoreroomResourceItem.itemId,
                            workDescription: `${transactionData.documentNumber} - ${transactionData.itemNumber} \n[${transactionHash}]`,
                            quantity: transactionData.quantity,
                            unitPrice: transactionData.unitTrueCost,
                            baseAmount: transactionData.extCost,
                            lockUnitPrice: 1,
                            lockMargin: 1,
                            startDateTime: new Date(transactionData.transactionDateTime),
                            endDateTime: new Date(transactionData.modifiedDateTime)
                        });
                    }
                    else {
                        const debitableWorkOrderResources = workOrderResources
                            .filter((possibleResourceItem) => (possibleResourceItem.itemId ===
                            worktechStoreroomResourceItem.itemId &&
                            possibleResourceItem.workDescription.includes(transactionData.itemNumber) &&
                            possibleResourceItem.quantity > 0 &&
                            possibleResourceItem.unitPrice ===
                                transactionData.unitTrueCost))
                            .reverse();
                        let remainingQuantityToDebit = Math.abs(transactionData.quantity);
                        for (const workOrderResourceToDebit of debitableWorkOrderResources) {
                            if (remainingQuantityToDebit <= 0) {
                                break;
                            }
                            const newResourceItemQuantity = Math.max(workOrderResourceToDebit.quantity - remainingQuantityToDebit, 0);
                            const newResourceItemBaseAmount = newResourceItemQuantity * workOrderResourceToDebit.unitPrice;
                            const transactionEndDate = new Date(transactionData.modifiedDateTime);
                            const newResourceItemEndDateTime = transactionEndDate.getTime() >
                                workOrderResourceToDebit.endDateTime.getTime()
                                ? transactionEndDate
                                : workOrderResourceToDebit.endDateTime;
                            remainingQuantityToDebit -=
                                workOrderResourceToDebit.quantity - newResourceItemQuantity;
                            const newResourceItemWorkDescription = `${workOrderResourceToDebit.workDescription.slice(0, -1)}, ${transactionHash}]`;
                            await worktech.updateWorkOrderResource({
                                serviceRequestItemSystemId: workOrderResourceToDebit.serviceRequestItemSystemId,
                                workDescription: newResourceItemWorkDescription,
                                quantity: newResourceItemQuantity,
                                unitPrice: workOrderResourceToDebit.unitPrice,
                                baseAmount: newResourceItemBaseAmount,
                                endDateTime: newResourceItemEndDateTime
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            debug(error);
        }
    }
    debug(`Finished "${taskName}".`);
}
