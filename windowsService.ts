import type { ServiceConfig } from 'node-windows'

export const serviceConfig: ServiceConfig = {
  name: 'FASTER Web Helper',
  description: 'A helper service for the FASTER Web application.',
  script: 'index.js'
}
