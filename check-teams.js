
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Users...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);
    users.forEach(u => console.log(`- ${u.email} (${u.id})`));

    console.log('\nChecking Teams...');
    const teams = await prisma.team.findMany({
        include: { members: true }
    });
    console.log(`Found ${teams.length} teams.`);
    teams.forEach(t => {
        console.log(`- [${t.id}] ${t.name} (Slug: ${t.slug})`);
        console.log(`  Members: ${t.members.length}`);
        t.members.forEach(m => console.log(`    - UserID: ${m.userId} | Role: ${m.role}`));
    });

    if (teams.length === 0) {
        console.log('No teams found! Creation might be failing.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
