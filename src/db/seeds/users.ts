import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const sampleUsers = [
        {
            email: 'demo1@nexus.ai',
            password: await bcrypt.hash('demo123', 10),
            createdAt: new Date().toISOString(),
        },
        {
            email: 'demo2@nexus.ai',
            password: await bcrypt.hash('demo123', 10),
            createdAt: new Date().toISOString(),
        },
        {
            email: 'demo3@nexus.ai',
            password: await bcrypt.hash('demo123', 10),
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});