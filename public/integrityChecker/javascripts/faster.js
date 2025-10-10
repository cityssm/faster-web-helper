(() => {
    var _a;
    const includeFilterElement = document.querySelector('#includeFilter--integrityChecker');
    const excludeFilterElement = document.querySelector('#excludeFilter--integrityChecker');
    const integrityTbodyElement = document.querySelector('#tbody--integrityChecker');
    // eslint-disable-next-line complexity
    function renderAssetIntegrityRecords() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        let integrityWarningCount = 0;
        let integrityErrorCount = 0;
        const includeFilter = includeFilterElement.value.trim().toLowerCase();
        const includeFilterPieces = includeFilter.split(' ');
        const excludeFilter = excludeFilterElement.value.trim().toLowerCase();
        const excludeFilterPieces = excludeFilter.split(' ');
        const rowElements = [];
        for (const record of exports.integrityRecords) {
            let isRecordIncluded = true;
            const recordSearchString = [
                record.assetNumber.toLowerCase(),
                (_b = (_a = record.make) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '',
                (_d = (_c = record.model) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : '',
                (_f = (_e = record.vinSerial) === null || _e === void 0 ? void 0 : _e.toLowerCase()) !== null && _f !== void 0 ? _f : ''
            ].join(' ');
            if (includeFilter !== '') {
                for (const includeFilterPiece of includeFilterPieces) {
                    if (!recordSearchString.includes(includeFilterPiece)) {
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
                    if (recordSearchString.includes(excludeFilterPiece)) {
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
            ${cityssm.escapeHTML((_g = record.vinSerial) !== null && _g !== void 0 ? _g : '')}
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
            ${cityssm.escapeHTML((_j = (_h = record.year) === null || _h === void 0 ? void 0 : _h.toString()) !== null && _j !== void 0 ? _j : '')}
          </span>
          </td>`);
            if (record.year === record.nhtsaYear) {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-equals" title="Matching Years" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light is-vcentered">
              <span title="NHTSA Year">
                ${cityssm.escapeHTML((_l = (_k = record.nhtsaYear) === null || _k === void 0 ? void 0 : _k.toString()) !== null && _l !== void 0 ? _l : '')}
              </span>
            </td>`);
            }
            else {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-not-equal has-text-warning" title="Year Mismatch" aria-hidden="true"></i>
            </td>`);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                integrityWarningCount += 1;
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
              <span title="NHTSA Year">
                ${cityssm.escapeHTML((_o = (_m = record.nhtsaYear) === null || _m === void 0 ? void 0 : _m.toString()) !== null && _o !== void 0 ? _o : '?')}
              </span>
            </td>`);
            }
            /*
             * Make
             */
            trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
          <span title="FASTER Web Make">
            ${cityssm.escapeHTML((_p = record.make) !== null && _p !== void 0 ? _p : '')}
          </span>
          </td>`);
            if (((_q = record.make) === null || _q === void 0 ? void 0 : _q.toLowerCase()) === ((_r = record.nhtsaMake) === null || _r === void 0 ? void 0 : _r.toLowerCase())) {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-equals" title="Matching Makes" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light is-vcentered">
              <span title="NHTSA Make">
                ${cityssm.escapeHTML((_s = record.nhtsaMake) !== null && _s !== void 0 ? _s : '')}
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
                ${cityssm.escapeHTML((_t = record.nhtsaMake) !== null && _t !== void 0 ? _t : '?')}
              </span>
            </td>`);
            }
            /*
             * Model
             */
            trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
          <span title="FASTER Web Model">
            ${cityssm.escapeHTML((_u = record.model) !== null && _u !== void 0 ? _u : '')}
          </span>
          </td>`);
            if (((_v = record.model) === null || _v === void 0 ? void 0 : _v.toLowerCase()) === ((_w = record.nhtsaModel) === null || _w === void 0 ? void 0 : _w.toLowerCase())) {
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-equals" title="Matching Models" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light is-vcentered">
              <span title="NHTSA Model">
                ${cityssm.escapeHTML((_x = record.nhtsaModel) !== null && _x !== void 0 ? _x : '')}
              </span>
            </td>`);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                integrityErrorCount += 1;
                trElement.insertAdjacentHTML('beforeend', `<td class="is-vcentered">
            <i class="fas fa-not-equal has-text-warning" title="Model Mismatch" aria-hidden="true"></i>
            </td>
            <td class="is-vcentered">
              <span title="NHTSA Model">
                ${cityssm.escapeHTML((_y = record.nhtsaModel) !== null && _y !== void 0 ? _y : '?')}
              </span>
            </td>`);
            }
            rowElements.push(trElement);
        }
        integrityTbodyElement.replaceChildren(...rowElements);
    }
    renderAssetIntegrityRecords();
    (_a = document
        .querySelector('#button--integrityChecker')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', renderAssetIntegrityRecords);
})();
