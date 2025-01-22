import { getAssetIntegrityRecords } from '../../database/getAssetIntegrityRecords.js';
export default function handler(request, response) {
    const assetIntegrityRecords = getAssetIntegrityRecords();
    response.render('worktechIntegrity/index', {
        headTitle: 'WorkTech Integrity',
        assetIntegrityRecords
    });
}
