(() => {
    var _a, _b;
    const moduleUrlPrefix = `${(_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : ''}/admin`;
    let users = exports.users;
    const userSettingNames = exports.userSettingNames;
    const usersContainerElement = document.querySelector('#container--users');
    function openEditUserModal(clickEvent) {
        var _a, _b;
        const userIndex = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.userIndex) !== null && _b !== void 0 ? _b : '-1', 10);
        const user = users[userIndex];
        let closeModalFunction;
        function doUpdateUser(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${moduleUrlPrefix}/doUpdateUser`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    users = responseJSON.users;
                    renderUsers();
                    closeModalFunction === null || closeModalFunction === void 0 ? void 0 : closeModalFunction();
                }
                else {
                    bulmaJS.alert({
                        message: 'Please try again.',
                        title: 'Error Updating User',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        cityssm.openHtmlModal('userEdit', {
            onshow(modalElement) {
                var _a, _b, _c;
                const formElement = modalElement.querySelector('form');
                const userNameInputElement = formElement.querySelector('#updateUser--userName');
                userNameInputElement.value = user.userName;
                const fasterWebUserNameInputElement = formElement.querySelector('#updateUser--fasterWebUserName');
                fasterWebUserNameInputElement.value = (_a = user.fasterWebUserName) !== null && _a !== void 0 ? _a : '';
                const emailAddressInputElement = formElement.querySelector('#updateUser--emailAddress');
                emailAddressInputElement.value = (_b = user.emailAddress) !== null && _b !== void 0 ? _b : '';
                const settingsTbodyElement = formElement.querySelector('#updateUser--settingsTableBody');
                for (const settingName of userSettingNames) {
                    const trElement = document.createElement('tr');
                    trElement.innerHTML = `<td class="is-vcentered">
            <label for="updateUserSetting--${cityssm.escapeHTML(settingName)}" class="label">
            ${cityssm.escapeHTML(settingName)}
            </label>
            </td>
            <td>
              <input class="input"  name="${cityssm.escapeHTML(settingName)}"
                id="updateUserSetting--${cityssm.escapeHTML(settingName)}"
                value="${cityssm.escapeHTML((_c = user.settings[settingName]) !== null && _c !== void 0 ? _c : '')}"
                maxlength="500" />
            </td>`;
                    settingsTbodyElement.append(trElement);
                }
            },
            onshown(modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateUser);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function renderUsers() {
        var _a, _b, _c, _d;
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
            (_d = trElement
                .querySelector('button')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', openEditUserModal);
            tbodyElement.append(trElement);
        }
        usersContainerElement.append(tableElement);
    }
    renderUsers();
})();
