import { defineConfig } from '@playwright/test';

// No browser and no app here: five plain tests of TypeScript itself.
export default defineConfig({
    testDir: '.',
    reporter: 'list',
});
