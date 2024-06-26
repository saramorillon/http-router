import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      exclude: ['**/types.ts', '**/index.ts'],
    },
  },
})
