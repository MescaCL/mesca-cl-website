import { createAdminUser } from './lib/auth';

async function main() {
  try {
    await createAdminUser('test@mesca.cl', 'TestPass1234!');
    console.log('Admin user created successfully');
  } catch (e: any) {
    console.log('Error:', e.message);
  }
}

main();