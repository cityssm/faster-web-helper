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
  `${DEBUG_NAMESPACE}:${camelCase(moduleName)}:vendorValidation:dynamicsGp`
)

const fasterWebConfig = getConfigProperty('fasterWeb')

const dynamicsGpConfig = getConfigProperty('dynamicsGP')

const vendorCodesToIgnore = getConfigProperty(
  'modules.integrityChecker.fasterVendors.update.vendorCodesToIgnore'
)

export async function updateVendorsInFaster(
  fasterVendors: VendorResult[]
): Promise<void> {
  /*
   * Connect to Dynamics GP
   */

  if (dynamicsGpConfig === undefined) {
    debug('Missing Dynamics GP configuration.')
    return
  }

  const dynamicsGp = new DynamicsGP(dynamicsGpConfig)

  /*
   * Update the vendors in FASTER that are in GP
   */

  const fasterApi = new FasterApi(
    fasterWebConfig.tenantOrBaseUrl,
    fasterWebConfig.apiUserName ?? '',
    fasterWebConfig.apiPassword ?? ''
  )

  let syncQueue: VendorSyncRequestParameters[] = []
  const maxQueueSize = 500

  for (const fasterVendor of fasterVendors) {
    if (vendorCodesToIgnore.includes(fasterVendor.vendorCode)) {
      continue
    }

    const gpVendor = await dynamicsGp.getVendorByVendorId(
      fasterVendor.vendorCode
    )

    if (gpVendor === undefined) {
      debug(
        `Vendor ${fasterVendor.vendorCode} not found in Dynamics GP. Skipping...`
      )
      continue
    }

    const { city, country, province } = normalizeCityProvinceCountry(
      gpVendor.city,
      gpVendor.state,
      gpVendor.country
    )

    debug(`Syncing vendor ${gpVendor.vendorId} (${gpVendor.vendorName})...`)

    syncQueue.push({
      vendorID: fasterVendor.vendorID.toString(),

      vendorCode: fasterVendor.vendorCode,

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

      vendorCategoryList: splitVendorCategoryString(fasterVendor.vendorCategory)
    })

    if (syncQueue.length >= maxQueueSize) {
      await fasterApi.syncVendors(syncQueue)
      syncQueue = []
    }
  }

  await fasterApi.syncVendors(syncQueue)
}
