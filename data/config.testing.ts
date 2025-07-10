import type { Config } from '../types/config.types.js'

export const config: Config = {
  webServer: {
    httpPort: 9191,
    urlPrefix: '/fwhelper'
  },

  fasterWeb: {
    tenantOrBaseUrl: 'test-faster-tenant'
  },

  login: {
    domain: 'testing',

    authentication: {
      type: 'plainText',

      config: {
        users: {
          'testing/testing': 'testing'
        }
      }
    }
  },
  modules: {
    inventoryScanner: {
      isEnabled: true,
      items: {
        acceptNotValidated: true,
        itemNumberRegex: /^\d{2}-\d{4}-\d{5}$/
      },
      scannerIpAddressRegex: /:(192.168.100.54|192.168.124.\d+)$/,
      workOrders: {
        acceptWorkTech: true
      }
    }
  }
}

export default config
