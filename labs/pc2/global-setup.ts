import type { FullConfig } from '@playwright/test';

// Every run starts from the seed data, on the pipeline and on your laptop.
export default async function globalSetup(config: FullConfig) {
    const { baseURL } = config.projects[0].use;
    const response = await fetch(`${baseURL}/api/test/reset`, { method: 'POST' });
    if (!response.ok) throw new Error(`Could not reset the app data: HTTP ${response.status}`);
}
