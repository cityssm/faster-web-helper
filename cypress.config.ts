import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9191/fwhelper',
    projectId: 'gb2jfr',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false
  }
})