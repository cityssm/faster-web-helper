import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9191',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
    projectId: 'gb2jfr'
  }
})