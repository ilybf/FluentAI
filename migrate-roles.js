/**
 * One-off migration: ensures all users without a role are set to 'student'.
 * Run with: node migrate-roles.js
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });
  console.log('✅ Connected!\n');

  const db = mongoose.connection.db;

  // Find users without a role field (or with null/empty role)
  const result = await db.collection('users').updateMany(
    { $or: [{ role: { $exists: false } }, { role: null }, { role: '' }] },
    { $set: { role: 'student' } }
  );

  console.log(`✅ Updated ${result.modifiedCount} user(s) to role "student".`);

  if (result.modifiedCount === 0) {
    console.log('   All users already have a role assigned.');
  }

  // Show summary of all roles
  const summary = await db.collection('users').aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  console.log('\n📊 Current role distribution:');
  summary.forEach((r) => {
    console.log(`   ${r._id || '(none)'}: ${r.count} user(s)`);
  });

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
