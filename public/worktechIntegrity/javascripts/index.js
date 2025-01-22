"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const includeFilterElement = document.querySelector('#includeFilter--worktechIntegrity');
    const excludeFilterElement = document.querySelector('#excludeFilter--worktechIntegrity');
    const integrityTbodyElement = document.querySelector('#tbody--worktechIntegrity');
    // eslint-disable-next-line complexity
    function renderAssetIntegrityRecords() {
        let integrityWarningCount = 0;
        let integrityErrorCount = 0;
        const includeFilter = includeFilterElement.value.trim().toLowerCase();
        const includeFilterPieces = includeFilter.split(' ');
        const excludeFilter = excludeFilterElement.value.trim().toLowerCase();
        const excludeFilterPieces = excludeFilter.split(' ');
        const rowElements = [];
        for (const record of exports.assetIntegrityRecords) {
            let isRecordIncluded = true;
            if (includeFilter !== '') {
                for (const includeFilterPiece of includeFilterPieces) {
                    if (includeFilterPiece === '') {
                        continue;
                    }
                    else if (!(record.assetNumber.toLowerCase().includes(includeFilterPiece) ||
                        (record.make?.toLowerCase().includes(includeFilterPiece) ??
                            false) ||
                        (record.model?.toLowerCase().includes(includeFilterPiece) ??
                            false))) {
                        isRecordIncluded = false;
                        break;
                    }
                }
            }
            if (!isRecordIncluded) {
                continue;
            }
            if (excludeFilter !== '') {
                for (const excludeFilterPiece of excludeFilterPieces) {
                    if (excludeFilterPiece === '') {
                        continue;
                    }
                    else if (record.assetNumber.toLowerCase().includes(excludeFilterPiece) ||
                        (record.make?.toLowerCase().includes(excludeFilterPiece) ??
                            false) ||
                        (record.model?.toLowerCase().includes(excludeFilterPiece) ?? false)) {
                        isRecordIncluded = false;
                        break;
                    }
                }
            }
            if (!isRecordIncluded) {
                continue;
            }
            const trElement = document.createElement('tr');
            trElement.innerHTML = `<td>${cityssm.escapeHTML(record.assetNumber)}</td>`;
            /*
             * Asset Description
             */
            const fasterAssetDescription = `${record.year} ${record.make} ${record.model}`;
            const worktechEquipmentDescription = `${record.worktechYear ?? ''} ${record.worktechMake ?? ''} ${record.worktechModel ?? ''}`;
            trElement.insertAdjacentHTML('beforeend', `<td>
          <span title="FASTER Web Asset Description">
          ${cityssm.escapeHTML(fasterAssetDescription)}
          </span>
          </td>`);
            if (fasterAssetDescription === worktechEquipmentDescription) {
                trElement.insertAdjacentHTML('beforeend', `<td class="has-text-centered">
            <i class="fas fa-circle-check has-text-success" title="Matching Descriptions" aria-hidden="true"></i>
            </td>`);
            }
            else {
                if (fasterAssetDescription.toLowerCase() ===
                    worktechEquipmentDescription.toLowerCase()) {
                    integrityWarningCount += 1;
                }
                else {
                    integrityErrorCount += 1;
                }
                trElement.insertAdjacentHTML('beforeend', `<td class="${cityssm.escapeHTML(fasterAssetDescription.toLowerCase() ===
                    worktechEquipmentDescription.toLowerCase()
                    ? 'has-background-warning-light'
                    : 'has-background-danger-light')}">
            <span title="WorkTech Equipment Description">
              ${cityssm.escapeHTML(worktechEquipmentDescription)}
            </span>
            </td>`);
            }
            /*
             * VIN / Serial
             */
            trElement.insertAdjacentHTML('beforeend', `<td class="${cityssm.escapeHTML(record.vinSerialIsValid === 1 ? 'has-background-success-light' : '')}">
          <span title="FASTER Web VIN/Serial">
          ${cityssm.escapeHTML(record.vinSerial ?? '')}
          </span>
          </td>`);
            if (record.vinSerial === record.worktechVinSerial) {
                trElement.insertAdjacentHTML('beforeend', `<td class="has-text-centered">
            <i class="fas fa-circle-check has-text-success" title="Matching VIN/Serial" aria-hidden="true"></i>
            </td>`);
            }
            else {
                if (record.vinSerial?.toLowerCase() ===
                    record.worktechVinSerial?.toLowerCase()) {
                    integrityWarningCount += 1;
                }
                else {
                    integrityErrorCount += 1;
                }
                trElement.insertAdjacentHTML('beforeend', `<td class="${cityssm.escapeHTML(record.vinSerial?.toLowerCase() ===
                    record.worktechVinSerial?.toLowerCase()
                    ? 'has-background-warning-light'
                    : 'has-background-danger-light')}">
            <span title="WorkTech VIN/Serial">
              ${cityssm.escapeHTML(record.worktechVinSerial ?? '')}
            </span>
            </td>`);
            }
            /*
             * License Plate
             */
            trElement.insertAdjacentHTML('beforeend', `<td>
          <span title="FASTER Web License Plate">
          ${cityssm.escapeHTML(record.license ?? '')}
          </span>
          </td>`);
            if (record.license === record.worktechLicense) {
                trElement.insertAdjacentHTML('beforeend', `<td class="has-text-centered">
            <i class="fas fa-circle-check has-text-success" title="Matching Licence Plate" aria-hidden="true"></i>
            </td>`);
            }
            else {
                if (record.license?.toLowerCase() ===
                    record.worktechLicense?.toLowerCase()) {
                    integrityWarningCount += 1;
                }
                else {
                    integrityErrorCount += 1;
                }
                trElement.insertAdjacentHTML('beforeend', `<td class="${cityssm.escapeHTML(record.license?.toLowerCase() ===
                    record.worktechLicense?.toLowerCase()
                    ? 'has-background-warning-light'
                    : 'has-background-danger-light')}">
            <span title="WorkTech License Plate">
              ${cityssm.escapeHTML(record.worktechLicense ?? '')}
            </span>
            </td>`);
            }
            rowElements.push(trElement);
        }
        integrityTbodyElement.replaceChildren(...rowElements);
    }
    renderAssetIntegrityRecords();
    document
        .querySelector('#button--worktechIntegrity')
        ?.addEventListener('click', renderAssetIntegrityRecords);
})();
