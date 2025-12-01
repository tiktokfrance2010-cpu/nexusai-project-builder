import { db } from '@/db';
import { projects } from '@/db/schema';

async function main() {
    const sampleProjects = [
        {
            userId: 1,
            description: 'E-commerce store for selling electronics and gadgets',
            projectType: 'website',
            imageUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 1,
            description: 'Portfolio website for professional photographer showcasing work',
            projectType: 'website',
            imageUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 2,
            description: 'Mobile app for fitness tracking and workout planning',
            projectType: 'app',
            imageUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 2,
            description: 'Presentation about AI technology and machine learning advancements',
            projectType: 'presentation',
            imageUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 3,
            description: 'Restaurant menu and online ordering website',
            projectType: 'website',
            imageUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 3,
            description: 'Task management app with collaboration features',
            projectType: 'app',
            imageUrl: null,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 1,
            description: 'Company pitch deck presentation for investors',
            projectType: 'presentation',
            imageUrl: null,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(projects).values(sampleProjects);
    
    console.log('✅ Projects seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});