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
        w200: ConfigFtpXlsxPath

        /**
         * W311 - Active Work Orders by Shop
         */
        w311: ConfigFtpXlsxPath

        /**
         * W604 - Integration Log Viewer
         */
        w604: ConfigFtpXlsxPath
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

export interface ConfigFtpXlsxPath extends ConfigFtpPath {
  fileSuffix: `${string}.xlsx` | `${string}.XLSX`
}