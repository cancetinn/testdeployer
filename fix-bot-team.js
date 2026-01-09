
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const botId = 'cmk6lq0aw0001l6l1gwoyelh2'; // test1
    const teamId = 'cmk6n7xet0000l6ql82r0no72'; // The team with 2 members

    console.log(`Assigning bot ${botId} to team ${teamId}...`);

    await prisma.bot.update({
        where: { id: botId },
        data: { teamId: teamId }
    });

    console.log('Done!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
