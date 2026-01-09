
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const bots = await prisma.bot.findMany({
        include: { team: true, owner: true }
    });

    console.log('--- BOTS ---');
    bots.forEach(b => {
        console.log(`Bot: ${b.name} (${b.id})`);
        console.log(` - Owner: ${b.owner?.email}`);
        console.log(` - Team: ${b.team?.name || 'NONE'} (ID: ${b.teamId})`);
    });
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
