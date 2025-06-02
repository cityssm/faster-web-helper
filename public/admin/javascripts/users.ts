import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { FasterWebHelperUser } from '../../../types/users.types.js'

declare const exports: {
  users: FasterWebHelperUser[]
  userSettingNames: string[]
}

declare const cityssm: cityssmGlobal
;(() => {
  const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/admin`

  let users = exports.users
  const userSettingNames = exports.userSettingNames

  const usersContainerElement = document.querySelector(
    '#container--users'
  ) as HTMLElement

  function renderUsers(): void {
    usersContainerElement.replaceChildren()

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-hoverable'

    tableElement.innerHTML = `<thead>
      <tr>
        <th>User Name</th>
        <th>FASTER Web User Name</th>
        <th>Email Address</th>
        <th>Settings</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>`

    const tbodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const [userIndex, user] of users.entries()) {
      const userSettingTagsElement = document.createElement('div')
      userSettingTagsElement.className = 'field is-grouped is-grouped-multiline'

      for (const [settingName, settingValue] of Object.entries(user.settings)) {
        const tagElement = document.createElement('div')
        tagElement.className = 'control'

        tagElement.innerHTML = `<div class="tags has-addons">
          <span class="tag is-light">${cityssm.escapeHTML(settingName)}</span>
          <span class="tag is-primary">${cityssm.escapeHTML(settingValue ?? '')}</span>
          </div>`

        userSettingTagsElement.append(tagElement)
      }

      const trElement = document.createElement('tr')
      trElement.dataset.userIndex = userIndex.toString()

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
        </td>`

      trElement
        .querySelector('.container--tags')
        ?.append(userSettingTagsElement)

      tbodyElement.append(trElement)
    }

    usersContainerElement.append(tableElement)
  }

  renderUsers()
})()
