import getWorktechEquipmentIntegrityRecords from '../../database/getWorktechEquipmentIntegrityRecords.js';
export default function handler(request, response) {
    const integrityRecords = getWorktechEquipmentIntegrityRecords();
    response.render('integrityChecker/worktech', {
        headTitle: 'WorkTech Integrity',
        integrityRecords,
        menu: 'worktech'
    });
}
