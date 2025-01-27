import getFasterAssetIntegrityRecords from '../../database/getFasterAssetIntegrityRecords.js';
export default function handler(request, response) {
    const integrityRecords = getFasterAssetIntegrityRecords();
    response.render('integrityChecker/faster', {
        headTitle: 'FASTER Web Integrity',
        integrityRecords,
        menu: 'faster'
    });
}
