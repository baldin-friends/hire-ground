// The same data in all three apps.
export type Job = { slug: string; title: string; location: string };

export const jobs: Job[] = [
    { slug: 'senior-qa-engineer', title: 'Senior QA Engineer', location: 'Berlin' },
    { slug: 'frontend-developer', title: 'Frontend Developer', location: 'Hamburg' },
    { slug: 'product-designer', title: 'Product Designer', location: 'Remote' },
];

export const workingModels = ['On site', 'Hybrid', 'Remote'];
