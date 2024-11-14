import crypto from 'node:crypto';
import { WorkTechAPI } from '@cityssm/worktech-api';
import { getConfigProperty } from '../../../helpers/functions.config.js';
const worktech = new WorkTechAPI(getConfigProperty('worktech'));
function buildWorkOrderResourceItemId(storeroomData) {
    return `FASTER-${storeroomData.storeroom}`.slice(0, 15);
}
export async function getOrCreateStoreroomResourceItem(storeroomData) {
    const storeroomItemId = buildWorkOrderResourceItemId(storeroomData);
    let worktechStoreroomResourceItem = await worktech.getItemByItemId(storeroomItemId);
    if (worktechStoreroomResourceItem === undefined) {
        await worktech.addResourceItem({
            itemId: storeroomItemId,
            externalItemId: storeroomData.storeroom,
            itemDescription: storeroomData.storeroomDescription,
            itemClass: getConfigProperty('modules.worktechUpdate.resourceItem.itemClass'),
            itemType: getConfigProperty('modules.worktechUpdate.resourceItem.itemType'),
            stock: 0,
            quantityOnHand: 0,
            unit: getConfigProperty('modules.worktechUpdate.resourceItem.unit'),
            unitCost: 0,
        });
        worktechStoreroomResourceItem = (await worktech.getItemByItemId(storeroomItemId));
    }
    return worktechStoreroomResourceItem;
}
export function buildWorkOrderResourceDescriptionHash(storeroomData, transactionData, occuranceIndex) {
    const keys = [
        transactionData.documentNumber.toString(),
        storeroomData.storeroom,
        transactionData.itemNumber,
        transactionData.quantity.toString(),
        transactionData.unitTrueCost.toFixed(3),
        transactionData.createdDateTime,
        occuranceIndex.toString()
    ];
    // eslint-disable-next-line sonarjs/hashing
    return crypto.createHash('md5').update(keys.join('::')).digest('hex');
}
export async function getWorkOrderResources(workOrderNumberMapping) {
    const unfilteredWorkOrderResources = await worktech.getWorkOrderResourcesByWorkOrderNumber(workOrderNumberMapping.workOrderNumber);
    return unfilteredWorkOrderResources.filter((possibleResourceRecord) => possibleResourceRecord.workDescription.startsWith(workOrderNumberMapping.documentNumber.toString()));
}
