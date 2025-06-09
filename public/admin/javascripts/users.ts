import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { FasterWebHelperUser } from '../../../types/users.types.js'

declare const exports: {
  users: FasterWebHelperUser[]
  userSettingNames: string[]
}

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/admin`

  let users = exports.users
  const userSettingNames = exports.userSettingNames

  const usersContainerElement = document.querySelector(
    '#container--users'
  ) as HTMLElement

  function openEditUserModal(clickEvent: MouseEvent): void {
    const userIndex = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).closest('tr')?.dataset
        .userIndex ?? '-1',
      10
    )

    const user = users[userIndex]

    let closeModalFunction: (() => void) | undefined

    function doUpdateUser(formEvent: SubmitEvent): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${moduleUrlPrefix}/doUpdateUser`,
        formEvent.currentTarget as HTMLFormElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            users: FasterWebHelperUser[]
          }

          if (responseJSON.success) {
            users = responseJSON.users
            renderUsers()

            closeModalFunction?.()
          } else {
            bulmaJS.alert({
              message: 'Please try again.',
              title: 'Error Updating User',

              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('userEdit', {
      onshow(modalElement): void {
        const formElement = modalElement.querySelector(
          'form'
        ) as HTMLFormElement

        const userNameInputElement = formElement.querySelector(
          '#updateUser--userName'
        ) as HTMLInputElement
        userNameInputElement.value = user.userName

        const fasterWebUserNameInputElement = formElement.querySelector(
          '#updateUser--fasterWebUserName'
        ) as HTMLInputElement
        fasterWebUserNameInputElement.value = user.fasterWebUserName ?? ''

        const emailAddressInputElement = formElement.querySelector(
          '#updateUser--emailAddress'
        ) as HTMLInputElement
        emailAddressInputElement.value = user.emailAddress ?? ''

        const settingsTbodyElement = formElement.querySelector(
          '#updateUser--settingsTableBody'
        ) as HTMLTableSectionElement

        for (const settingName of userSettingNames) {
          const trElement = document.createElement('tr')

          trElement.innerHTML = `<td class="is-vcentered">
            <label for="updateUserSetting--${cityssm.escapeHTML(settingName)}" class="label">
            ${cityssm.escapeHTML(settingName)}
            </label>
            </td>
            <td>
              <input class="input"  name="${cityssm.escapeHTML(settingName)}"
                id="updateUserSetting--${cityssm.escapeHTML(settingName)}"
                value="${cityssm.escapeHTML(user.settings[settingName] ?? '')}"
                maxlength="500" />
            </td>`

          settingsTbodyElement.append(trElement)
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateUser)
      },

      onremoved(): void {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

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

      trElement
        .querySelector('button')
        ?.addEventListener('click', openEditUserModal)

      tbodyElement.append(trElement)
    }

    usersContainerElement.append(tableElement)
  }

  renderUsers()
})()
