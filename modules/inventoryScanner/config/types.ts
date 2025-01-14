import type { GPItemWithQuantity } from '@cityssm/dynamics-gp'

import type {
  ConfigFileSuffixXlsx,
  ConfigNtfyTopic,
  ConfigScheduledFtpReport
} from '../../../types/config.helperTypes.js'

export interface ConfigItemValidationDynamicsGP {
  source: 'dynamicsGP'
  gpLocationCodesToFasterStorerooms: Record<string, string>
  gpItemFilter?: (item: GPItemWithQuantity) => boolean
}

export interface ConfigItemValidationFaster {
  source: 'faster'

  /** W200 - Inventory Report */
  w200?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
}

export interface ConfigModuleInventoryScanner {
  scannerIpAddressRegex?: RegExp

  fasterSync?: {
    integrationId?: number
    exportFileNamePrefix?: string
    ftpPath?: string
    defaultTechnicianId?: number
  }

  // worktechSync?: {}

  workOrders?: {
    acceptNotValidated?: boolean
    fasterRegex?: RegExp
    acceptWorkTech?: boolean
    workTechRegex?: RegExp
    validationSources?: Array<'fasterApi' | 'worktech'>
  }

  items?: {
    acceptNotValidated?: boolean
    itemNumberRegex?: RegExp
    placeholder?: string
    validation?: ConfigItemValidationDynamicsGP | ConfigItemValidationFaster
  }

  fasterItemRequests?: {
    isEnabled?: boolean
    ntfy?: ConfigNtfyTopic
  }

  quantities?: {
    acceptOverages?: boolean
    acceptNegatives?: boolean
  }
}
