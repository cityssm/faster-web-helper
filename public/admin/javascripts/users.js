"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b;
    const moduleUrlPrefix = `${(_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : ''}/admin`;
    let users = exports.users;
    const userSettingNames = exports.userSettingNames;
    const usersContainerElement = document.querySelector('#container--users');
    function renderUsers() {
        var _a, _b, _c;
        usersContainerElement.replaceChildren();
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-hoverable';
        tableElement.innerHTML = `<thead>
      <tr>
        <th>User Name</th>
        <th>FASTER Web User Name</th>
        <th>Email Address</th>
        <th>Settings</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>`;
        const tbodyElement = tableElement.querySelector('tbody');
        for (const [userIndex, user] of users.entries()) {
            const userSettingTagsElement = document.createElement('div');
            userSettingTagsElement.className = 'field is-grouped is-grouped-multiline';
            for (const [settingName, settingValue] of Object.entries(user.settings)) {
                const tagElement = document.createElement('div');
                tagElement.className = 'control';
                tagElement.innerHTML = `<div class="tags has-addons">
          <span class="tag is-light">${cityssm.escapeHTML(settingName)}</span>
          <span class="tag is-primary">${cityssm.escapeHTML(settingValue !== null && settingValue !== void 0 ? settingValue : '')}</span>
          </div>`;
                userSettingTagsElement.append(tagElement);
            }
            const trElement = document.createElement('tr');
            trElement.dataset.userIndex = userIndex.toString();
            trElement.innerHTML = `<td>${cityssm.escapeHTML(user.userName)}</td>
        <td>${cityssm.escapeHTML((_a = user.fasterWebUserName) !== null && _a !== void 0 ? _a : '')}</td>
        <td>${cityssm.escapeHTML((_b = user.emailAddress) !== null && _b !== void 0 ? _b : '')}</td>
        <td class="container--tags"></td>
        <td>
          <button class="button is-small is-info" type="button">
            <span class="icon is-small">
              <i class="fas fa-pencil-alt" aria-hidden="true"></i>
            </span>
            <span>Edit</span>
          </button>
        </td>`;
            (_c = trElement
                .querySelector('.container--tags')) === null || _c === void 0 ? void 0 : _c.append(userSettingTagsElement);
            tbodyElement.append(trElement);
        }
        usersContainerElement.append(tableElement);
    }
    renderUsers();
})();
