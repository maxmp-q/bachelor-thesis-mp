import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Configure your E2E tests here
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,ts}",
    defaultCommandTimeout: 20000,   // 20 Sekunden
    pageLoadTimeout: 60000,        // 60 Sekunden
    requestTimeout: 20000,
    responseTimeout: 20000,
  },
})