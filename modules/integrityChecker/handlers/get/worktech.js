import { getAssetIntegrityRecords } from '../../database/getAssetIntegrityRecords.js';
export default function handler(request, response) {
    const assetIntegrityRecords = getAssetIntegrityRecords();
    response.render('integrityChecker/worktech', {
        headTitle: 'WorkTech Integrity',
        assetIntegrityRecords
    });
}
