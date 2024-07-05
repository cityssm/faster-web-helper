import type { AccessOptions } from 'basic-ftp'

export interface Config {
  ftp: AccessOptions

  modules: {
    inventoryScanner?: {
      isEnabled: boolean
      reports: {
        /**
         * W200 - Inventory Report
         */
        w200: ConfigFtpPath

        /**
         * W311 - Active Work Orders by Shop
         */
        w311: ConfigFtpPath

        /**
         * W604 - Integration Log Viewer
         */
        w604: ConfigFtpPath
      }
    }
  }
}

export interface ConfigFtpPath {
  directory: string
  filePrefix?: string
  fileSuffix?: string
  doDelete?: boolean
}
