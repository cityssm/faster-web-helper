"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const includeFilterElement = document.querySelector('#includeFilter--integrityChecker');
    const excludeFilterElement = document.querySelector('#excludeFilter--integrityChecker');
    const integrityTbodyElement = document.querySelector('#tbody--integrityChecker');
    // eslint-disable-next-line complexity
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
            trElement.innerHTML = `<td class="is-vcentered">
        ${cityssm.escapeHTML(record.assetNumber)}
        [${cityssm.escapeHTML(record.organization)}]
        </td>`;
            /*
             * VIN / Serial
             */
            // eslint-disable-next-line no-unsanitized/method
            trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
          <span title="FASTER Web VIN/Serial">
            ${cityssm.escapeHTML(record.vinSerial ?? '')}
          </span>
          ${record.vinSerialIsValid === 1
                ? `<span class="icon">
                <i class="fas fa-check-circle has-text-success" title="VIN is valid"></i>
                </span>`
                : ''}
          </td>`);
            /*
             * Year
             */
            trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
          <span title="FASTER Web Year">
            ${cityssm.escapeHTML(record.year?.toString() ?? '')}
          </span>
          </td>`);
            if (record.year === record.nhtsaYear) {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-equals" title="Matching Years" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light is-vcentered">
              <span title="NHTSA Year">
                ${cityssm.escapeHTML(record.nhtsaYear?.toString() ?? '')}
              </span>
            </td>`);
            }
            else {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-not-equal has-text-warning" title="Year Mismatch" aria-hidden="true"></i>
            </td>`);
                integrityWarningCount += 1;
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
              <span title="NHTSA Year">
                ${cityssm.escapeHTML(record.nhtsaYear?.toString() ?? '?')}
              </span>
            </td>`);
            }
            /*
             * Make
             */
            trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
          <span title="FASTER Web Make">
            ${cityssm.escapeHTML(record.make ?? '')}
          </span>
          </td>`);
            if (record.make?.toLowerCase() === record.nhtsaMake?.toLowerCase()) {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-equals" title="Matching Makes" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light is-vcentered">
              <span title="NHTSA Make">
                ${cityssm.escapeHTML(record.nhtsaMake ?? '')}
              </span>
            </td>`);
            }
            else {
                integrityErrorCount += 1;
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-not-equal has-text-warning" title="Make Mismatch" aria-hidden="true"></i>
            </td>
            <td class="is-vcentered">
              <span title="NHTSA Make">
                ${cityssm.escapeHTML(record.nhtsaMake ?? '?')}
              </span>
            </td>`);
            }
            /*
              * Model
              */
            trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
          <span title="FASTER Web Model">
            ${cityssm.escapeHTML(record.model ?? '')}
          </span>
          </td>`);
            if (record.model?.toLowerCase() === record.nhtsaModel?.toLowerCase()) {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-equals" title="Matching Models" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light is-vcentered">
              <span title="NHTSA Model">
                ${cityssm.escapeHTML(record.nhtsaModel ?? '')}
              </span>
            </td>`);
            }
            else {
                integrityErrorCount += 1;
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-not-equal has-text-warning" title="Model Mismatch" aria-hidden="true"></i>
            </td>
            <td class="is-vcentered">
              <span title="NHTSA Model">
                ${cityssm.escapeHTML(record.nhtsaModel ?? '?')}
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
