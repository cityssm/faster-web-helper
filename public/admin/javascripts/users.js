"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/admin`;
    let users = exports.users;
    const userSettingNames = exports.userSettingNames;
    const usersContainerElement = document.querySelector('#container--users');
    function renderUsers() {
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
          <span class="tag is-primary">${cityssm.escapeHTML(settingValue ?? '')}</span>
          </div>`;
                userSettingTagsElement.append(tagElement);
            }
            const trElement = document.createElement('tr');
            trElement.dataset.userIndex = userIndex.toString();
            trElement.innerHTML = `<td>${cityssm.escapeHTML(user.userName)}</td>
        <td>${cityssm.escapeHTML(user.fasterWebUserName ?? '')}</td>
        <td>${cityssm.escapeHTML(user.emailAddress ?? '')}</td>
        <td class="container--tags"></td>
        <td>
          <button class="button is-small is-info" type="button">
            <span class="icon is-small">
              <i class="fas fa-pencil-alt" aria-hidden="true"></i>
            </span>
            <span>Edit</span>
          </button>
        </td>`;
            trElement
                .querySelector('.container--tags')
                ?.append(userSettingTagsElement);
            tbodyElement.append(trElement);
        }
        usersContainerElement.append(tableElement);
    }
    renderUsers();
})();
