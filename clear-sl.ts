import { db } from './src/lib/db';

async function main() {
  await db.shortLink.deleteMany({});
  console.log('Cleared all short links');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
