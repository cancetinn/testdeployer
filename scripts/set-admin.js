const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'can@admin.com';

    console.log(`Checking user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User ${email} not found!`);
        return;
    }

    console.log(`Current role: ${user.role}`);

    const updated = await prisma.user.update({
        where: { email },
        data: { role: 'FOUNDER' },
    });

    console.log(`New role: ${updated.role}`);
    console.log('Success! Please re-login to see changes.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
