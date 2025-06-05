"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a;
    const includeFilterElement = document.querySelector('#includeFilter--integrityChecker');
    const excludeFilterElement = document.querySelector('#excludeFilter--integrityChecker');
    const integrityTbodyElement = document.querySelector('#tbody--integrityChecker');
    // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
    function renderAssetIntegrityRecords() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
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
                        ((_b = (_a = record.make) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(includeFilterPiece)) !== null && _b !== void 0 ? _b : false) ||
                        ((_d = (_c = record.model) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(includeFilterPiece)) !== null && _d !== void 0 ? _d : false) ||
                        ((_f = (_e = record.vinSerial) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(includeFilterPiece)) !== null && _f !== void 0 ? _f : false))) {
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
                        ((_h = (_g = record.make) === null || _g === void 0 ? void 0 : _g.toLowerCase().includes(excludeFilterPiece)) !== null && _h !== void 0 ? _h : false) ||
                        ((_k = (_j = record.model) === null || _j === void 0 ? void 0 : _j.toLowerCase().includes(excludeFilterPiece)) !== null && _k !== void 0 ? _k : false) ||
                        ((_m = (_l = record.vinSerial) === null || _l === void 0 ? void 0 : _l.toLowerCase().includes(excludeFilterPiece)) !== null && _m !== void 0 ? _m : false)) {
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
            const worktechEquipmentDescription = `${(_o = record.worktechYear) !== null && _o !== void 0 ? _o : ''} ${(_p = record.worktechMake) !== null && _p !== void 0 ? _p : ''} ${(_q = record.worktechModel) !== null && _q !== void 0 ? _q : ''}`;
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
          ${cityssm.escapeHTML((_r = record.vinSerial) !== null && _r !== void 0 ? _r : '')}
          </span>
          </td>`);
            if (record.vinSerial === record.worktechVinSerial) {
                trElement.insertAdjacentHTML('beforeend', `<td>
            <i class="fas fa-equals" title="Matching VIN/Serial" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light">
              <span title="WorkTech VIN/Serial">
                ${cityssm.escapeHTML((_s = record.worktechVinSerial) !== null && _s !== void 0 ? _s : '')}
              </span>
            </td>`);
            }
            else {
                if (((_t = record.vinSerial) === null || _t === void 0 ? void 0 : _t.toLowerCase()) ===
                    ((_u = record.worktechVinSerial) === null || _u === void 0 ? void 0 : _u.toLowerCase())) {
                    integrityWarningCount += 1;
                }
                else {
                    integrityErrorCount += 1;
                }
                trElement.insertAdjacentHTML('beforeend', `<td class="${cityssm.escapeHTML(((_v = record.vinSerial) === null || _v === void 0 ? void 0 : _v.toLowerCase()) ===
                    ((_w = record.worktechVinSerial) === null || _w === void 0 ? void 0 : _w.toLowerCase())
                    ? 'has-background-warning-light'
                    : 'has-background-danger-light')}">
              <i class="fas fa-not-equal" title="Not Equal" aria-hidden="true"></i>
            </td>
            <td>
              <span title="WorkTech VIN/Serial">
                ${cityssm.escapeHTML((_x = record.worktechVinSerial) !== null && _x !== void 0 ? _x : '')}
              </span>
            </td>`);
            }
            /*
             * License Plate
             */
            trElement.insertAdjacentHTML('beforeend', `<td>
            <span title="FASTER Web License Plate">
              ${cityssm.escapeHTML((_y = record.license) !== null && _y !== void 0 ? _y : '')}
            </span>
          </td>`);
            if (record.license === record.worktechLicense) {
                trElement.insertAdjacentHTML('beforeend', `<td>
            <i class="fas fa-equals" title="Matching License Plate" aria-hidden="true"></i>
            </td>
            <td class="has-text-grey-light">
              <span title="WorkTech License Plate">
                ${cityssm.escapeHTML((_z = record.worktechLicense) !== null && _z !== void 0 ? _z : '')}
              </span>
            </td>`);
            }
            else {
                if (((_0 = record.license) === null || _0 === void 0 ? void 0 : _0.toLowerCase()) ===
                    ((_1 = record.worktechLicense) === null || _1 === void 0 ? void 0 : _1.toLowerCase())) {
                    integrityWarningCount += 1;
                }
                else {
                    integrityErrorCount += 1;
                }
                trElement.insertAdjacentHTML('beforeend', `<td class="${cityssm.escapeHTML(((_2 = record.license) === null || _2 === void 0 ? void 0 : _2.toLowerCase()) ===
                    ((_3 = record.worktechLicense) === null || _3 === void 0 ? void 0 : _3.toLowerCase())
                    ? 'has-background-warning-light'
                    : 'has-background-danger-light')}">
            <i class="fas fa-not-equal" title="Not Equal" aria-hidden="true"></i>
            </td>
            <td>
              <span title="WorkTech License Plate">
                ${cityssm.escapeHTML((_4 = record.worktechLicense) !== null && _4 !== void 0 ? _4 : '')}
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
