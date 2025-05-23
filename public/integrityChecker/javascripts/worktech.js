"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const includeFilterElement = document.querySelector('#includeFilter--integrityChecker');
    const excludeFilterElement = document.querySelector('#excludeFilter--integrityChecker');
    const integrityTbodyElement = document.querySelector('#tbody--integrityChecker');
    // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
    function renderAssetIntegrityRecords() {
        let integrityWarningCount = 0;
        let integrityErrorCount = 0;
        const includeFilter = includeFilterElement.value.trim().toLowerCase();
        const includeFilterPieces = includeFilter.split(' ');
        const excludeFilter = excludeFilterElement.value.trim().toLowerCase();
        const excludeFilterPieces = excludeFilter.split(' ');
        const rowElements = [];
        for (const record of exports.integrityRecords) {
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
                            false) ||
                        (record.vinSerial?.toLowerCase().includes(includeFilterPiece) ??
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
                        (record.model?.toLowerCase().includes(excludeFilterPiece) ??
                            false) ||
                        (record.vinSerial?.toLowerCase().includes(excludeFilterPiece) ??
                            false)) {
                        isRecordIncluded = false;
                        break;
                    }
                }
            }
            if (!isRecordIncluded) {
                continue;
            }
            const trElement = document.createElement('tr');
            trElement.innerHTML = `<td>
        ${cityssm.escapeHTML(record.assetNumber)}
        [${cityssm.escapeHTML(record.organization)}]
        </td>`;
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
                trElement.insertAdjacentHTML('beforeend', `<td>
            <i class="fas fa-equals" title="Matching Descriptions" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light">
              <span title="WorkTech Equipment Description">
                ${cityssm.escapeHTML(worktechEquipmentDescription)}
              </span>
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
              <i class="fas fa-not-equal" title="Not Equal" aria-hidden="true"></i>
            </td>
            <td>
              <span title="WorkTech Equipment Description">
                ${cityssm.escapeHTML(worktechEquipmentDescription)}
              </span>
            </td>`);
            }
            /*
             * VIN / Serial
             */
            trElement.insertAdjacentHTML('beforeend', `<td>
          <span title="FASTER Web VIN/Serial">
          ${cityssm.escapeHTML(record.vinSerial ?? '')}
          </span>
          </td>`);
            if (record.vinSerial === record.worktechVinSerial) {
                trElement.insertAdjacentHTML('beforeend', `<td>
            <i class="fas fa-equals" title="Matching VIN/Serial" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light">
              <span title="WorkTech VIN/Serial">
                ${cityssm.escapeHTML(record.worktechVinSerial ?? '')}
              </span>
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
              <i class="fas fa-not-equal" title="Not Equal" aria-hidden="true"></i>
            </td>
            <td>
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
                trElement.insertAdjacentHTML('beforeend', `<td>
            <i class="fas fa-equals" title="Matching License Plate" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light">
              <span title="WorkTech License Plate">
                ${cityssm.escapeHTML(record.worktechLicense ?? '')}
              </span>
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
            <i class="fas fa-not-equal" title="Not Equal" aria-hidden="true"></i>
            </td>
            <td>
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
        .querySelector('#button--integrityChecker')
        ?.addEventListener('click', renderAssetIntegrityRecords);
})();
