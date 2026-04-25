/**
 * Migration: Reset all user activities (XP, streaks, score events).
 * Also sets registrationLevel = current level for all users.
 * Run with: node reset-activities.js
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { maxPoolSize: 1, serverSelectionTimeoutMS: 20000, family: 4 });
  console.log('✅ Connected!\n');

  const db = mongoose.connection.db;

  // 1. Save each user's current level as their registrationLevel
  const users = await db.collection('users').find({}).toArray();
  let regLevelUpdated = 0;
  for (const user of users) {
    if (!user.registrationLevel) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { registrationLevel: user.level || 'A1' } }
      );
      regLevelUpdated++;
    }
  }
  console.log(`📋 Set registrationLevel for ${regLevelUpdated} user(s).`);

  // 2. Reset all users' XP and streaks (keep their registrationLevel as current level)
  const resetResult = await db.collection('users').updateMany(
    {},
    [{
      $set: {
        totalScore: 0,
        level: { $ifNull: ['$registrationLevel', '$level'] },
        'streak.current': 0,
        'streak.longest': 0,
        'streak.lastActiveDate': '',
      }
    }]
  );
  console.log(`🔄 Reset XP/streaks for ${resetResult.modifiedCount} user(s).`);

  // 3. Delete all score events
  const eventsResult = await db.collection('scoreevents').deleteMany({});
  console.log(`🗑️  Deleted ${eventsResult.deletedCount} score event(s).`);

  // Summary
  console.log('\n✅ All activities reset successfully!');
  console.log('\n📊 Current user levels:');
  const summary = await db.collection('users')
    .find({}, { projection: { displayName: 1, email: 1, level: 1, registrationLevel: 1, totalScore: 1, role: 1 } })
    .toArray();

  for (const u of summary) {
    console.log(`   ${u.role === 'teacher' ? '👩‍🏫' : '👤'} ${u.displayName} (${u.email}) — Level: ${u.level} (reg: ${u.registrationLevel || u.level}), XP: ${u.totalScore}`);
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
