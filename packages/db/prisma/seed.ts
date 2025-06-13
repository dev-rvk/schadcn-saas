import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log(\`Start seeding ...\`);

  // Create User 1
  const user1Auth0Id = 'auth0|seeduser1'; // Placeholder Auth0 ID
  const user1 = await prisma.user.upsert({
    where: { auth0Id: user1Auth0Id },
    update: {},
    create: {
      auth0Id: user1Auth0Id,
      email: 'seeduser1@example.com',
      name: 'Seed User 1',
    },
  });
  console.log(\`Created/Found user: \${user1.name} with auth0Id: \${user1.auth0Id}\`);

  // Create User 2
  const user2Auth0Id = 'auth0|seeduser2'; // Placeholder Auth0 ID
  const user2 = await prisma.user.upsert({
    where: { auth0Id: user2Auth0Id },
    update: {},
    create: {
      auth0Id: user2Auth0Id,
      email: 'seeduser2@example.com',
      name: 'Seed User 2',
    },
  });
  console.log(\`Created/Found user: \${user2.name} with auth0Id: \${user2.auth0Id}\`);

  // Create posts for User 1
  await prisma.post.createMany({
    data: [
      {
        title: 'User 1 - First Post',
        content: 'This is the first post by Seed User 1.',
        authorId: user1.auth0Id,
        published: true,
      },
      {
        title: 'User 1 - Second Post',
        content: 'This is another interesting post by Seed User 1.',
        authorId: user1.auth0Id,
        published: false,
      },
    ],
    skipDuplicates: true, // Avoid errors if posts with same title/content exist (though unlikely with cuid)
  });
  console.log(\`Created posts for \${user1.name}\`);

  // Create posts for User 2
  await prisma.post.createMany({
    data: [
      {
        title: 'User 2 - Thoughts on Development',
        content: 'Seed User 2 shares some thoughts on modern web development.',
        authorId: user2.auth0Id,
        published: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log(\`Created posts for \${user2.name}\`);

  console.log(\`Seeding finished.\`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\$disconnect();
  });
