export const config = {
    webServer: {
        httpPort: 9191
    },
    fasterWeb: {
        tenantOrBaseUrl: 'test-faster-tenant'
    },
    login: {
        domain: 'testing',
        authentication: {
            type: 'plainText',
            config: {
                'testing/testing': 'testing'
            }
        }
    },
    modules: {
        inventoryScanner: {
            isEnabled: true,
            scannerIpAddressRegex: /:(192.168.100.54|192.168.124.\d+)$/,
            workOrders: {
                acceptWorkTech: true
            },
            items: {
                acceptNotValidated: true,
                itemNumberRegex: /^\d{2}-\d{4}-\d{5}$/
            }
        }
    }
};
export default config;
