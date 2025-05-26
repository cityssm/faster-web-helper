import { DynamicsGP } from '@cityssm/dynamics-gp'
import {
  type VendorResult,
  type VendorSyncRequestParameters,
  FasterApi
} from '@cityssm/faster-api'
import fasterVendorConstants from '@cityssm/faster-constants/vendors/vendors.js'
import camelCase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../../debug.config.js'
import { normalizeCityProvinceCountry } from '../../../../helpers/address.helpers.js'
import { getConfigProperty } from '../../../../helpers/config.helpers.js'
import { splitVendorCategoryString } from '../fasterVendors.helpers.js'
import { moduleName } from '../module.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelCase(moduleName)}:inventoryValidation:dynamicsGp`
)

const fasterWebConfig = getConfigProperty('fasterWeb')

const dynamicsGpConfig = getConfigProperty('dynamicsGP')

// eslint-disable-next-line complexity
export async function updateVendorsInFaster(
  fasterVendors: VendorResult[]
): Promise<void> {
  /*
   * Build a map of active vendor codes to vendors
   */

  const vendorCodesToIgnore = getConfigProperty(
    'modules.integrityChecker.fasterVendors.update.vendorCodesToIgnore'
  )

  const vendorCodeToVendor = new Map<string, VendorResult>()

  for (const vendor of fasterVendors) {
    if (
      vendorCodesToIgnore.includes(vendor.vendorCode) ||
      vendor.vendorStatus === 'Obsolete'
    ) {
      continue
    }

    vendorCodeToVendor.set(vendor.vendorCode, vendor)
  }

  /*
   * Get vendors from Dynamics GP
   */

  if (dynamicsGpConfig === undefined) {
    debug('Missing Dynamics GP configuration.')
    return
  }

  const dynamicsGp = new DynamicsGP(dynamicsGpConfig)

  const gpVendors = await dynamicsGp.getVendors(
    getConfigProperty('modules.integrityChecker.fasterVendors.update.gpFilters')
  )

  debug(`Syncing ${gpVendors.length} vendors from Dynamics GP...`)

  /*
   * Create / Update the vendors in FASTER that are in GP
   */

  const fasterApi = new FasterApi(
    fasterWebConfig.tenantOrBaseUrl,
    fasterWebConfig.apiUserName ?? '',
    fasterWebConfig.apiPassword ?? ''
  )

  let syncQueue: VendorSyncRequestParameters[] = []
  const maxQueueSize = 500

  for (const gpVendor of gpVendors) {
    if (vendorCodesToIgnore.includes(gpVendor.vendorId)) {
      continue
    }

    if (
      getConfigProperty(
        'modules.integrityChecker.fasterVendors.update.gpVendorFilter'
      )
    ) {
      const vendorFilter = getConfigProperty(
        'modules.integrityChecker.fasterVendors.update.gpVendorFilter'
      )

      if (typeof vendorFilter === 'function') {
        if (!(await vendorFilter(gpVendor))) {
          continue
        }
      } else {
        debug('Invalid gpVendorFilter function. Skipping vendor filter check.')
      }
    }

    const fasterVendor = vendorCodeToVendor.get(gpVendor.vendorId)

    const { city, country, province } = normalizeCityProvinceCountry(
      gpVendor.city,
      gpVendor.state,
      gpVendor.country
    )

    debug(`Syncing vendor ${gpVendor.vendorId} (${gpVendor.vendorName})...`)

    syncQueue.push({
      vendorID: (fasterVendor?.vendorID ?? '').toString(),

      vendorCode: gpVendor.vendorId.slice(
        0,
        fasterVendorConstants.vendorCode.maxLength
      ),

      vendorBusinessName: gpVendor.shortName
        .trim()
        .slice(0, fasterVendorConstants.vendorBusinessName.maxLength),

      vendorName: gpVendor.vendorName
        .trim()
        .slice(0, fasterVendorConstants.vendorName.maxLength),

      vendorStatus: 'Active',

      vendorAddress: gpVendor.address1
        .trim()
        .slice(0, fasterVendorConstants.vendorAddress.maxLength),

      vendorCity: city.slice(0, fasterVendorConstants.vendorCity.maxLength),

      vendorState: province
        .padEnd(fasterVendorConstants.vendorState.minLength, ' ')
        .slice(0, fasterVendorConstants.vendorState.maxLength),

      vendorZip: gpVendor.zipCode,

      vendorCountry: country,

      vendorFax: gpVendor.faxNumber,
      vendorPhone: gpVendor.phoneNumber1,

      federalTaxID: '',
      vendorWebsite: '',

      vendorCategoryList:
        fasterVendor === undefined
          ? ['Asset', 'Inventory', 'Sublet']
          : splitVendorCategoryString(fasterVendor.vendorCategory)
    })

    vendorCodeToVendor.delete(gpVendor.vendorId)

    if (syncQueue.length >= maxQueueSize) {
      await fasterApi.syncVendors(syncQueue)
      syncQueue = []
    }
  }

  /*
   * Inactivate any vendors in FASTER that are not in GP
   */

  if (vendorCodeToVendor.size > 0) {
    debug(`Inactivating ${vendorCodeToVendor.size} vendors in FASTER...`)
  }

  for (const vendor of vendorCodeToVendor.values()) {
    if (
      vendorCodesToIgnore.includes(vendor.vendorCode) ||
      vendor.vendorStatus === 'Obsolete'
    ) {
      continue
    }

    syncQueue.push({
      vendorID: vendor.vendorID.toString(),
      vendorCode: vendor.vendorCode,
      vendorStatus: 'Obsolete',

      vendorBusinessName: vendor.vendorBusinessName,
      vendorName: vendor.vendorName,

      vendorAddress: vendor.vendorAddress,
      vendorCity: vendor.vendorCity,
      vendorState: vendor.vendorState,
      vendorZip: vendor.vendorZip,
      vendorCountry: vendor.vendorCountry,

      vendorFax: vendor.vendorFax,
      vendorPhone: vendor.vendorPhone,

      federalTaxID: vendor.federalTaxID,
      vendorWebsite: vendor.vendorWebsite,

      vendorCategoryList: []
    })

    if (syncQueue.length >= maxQueueSize) {
      await fasterApi.syncVendors(syncQueue)
      syncQueue = []
    }
  }

  if (syncQueue.length > 0) {
    await fasterApi.syncVendors(syncQueue)
  }
}
