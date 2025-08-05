// Firestore Data Audit Script
// ---------------------------------------------
// This script scans your Firestore collections for documents with missing or invalid required fields.
// It only logs issues and does NOT modify or delete any data.
//
// USAGE:
// 1. Install dependencies: npm install firebase-admin
// 2. Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON file.
// 3. Run: node scripts/firestore-data-audit.js
// ---------------------------------------------

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Utility to check if a value is a Firestore Timestamp
function isTimestamp(val) {
  return val && typeof val.toDate === 'function';
}

async function auditStories() {
  const snapshot = await db.collection('stories').get();
  let bad = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!isTimestamp(data.expiresAt)) {
      console.log(`[stories] Bad doc: ${doc.id} missing/invalid expiresAt`, data);
      bad++;
    }
  });
  console.log(`[stories] Checked ${snapshot.size} docs, found ${bad} bad.`);
}

async function auditMessages() {
  const snapshot = await db.collection('messages').get();
  let bad = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!Array.isArray(data.participants) || data.participants.length < 2 || !data.conversationId || !isTimestamp(data.createdAt)) {
      console.log(`[messages] Bad doc: ${doc.id} missing/invalid participants/conversationId/createdAt`, data);
      bad++;
    }
  });
  console.log(`[messages] Checked ${snapshot.size} docs, found ${bad} bad.`);
}

async function auditUsers() {
  const snapshot = await db.collection('users').get();
  let bad = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.username || !data.displayName || !isTimestamp(data.createdAt)) {
      console.log(`[users] Bad doc: ${doc.id} missing/invalid username/displayName/createdAt`, data);
      bad++;
    }
  });
  console.log(`[users] Checked ${snapshot.size} docs, found ${bad} bad.`);
}

async function auditPosts() {
  const snapshot = await db.collection('posts').get();
  let bad = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.userId || !isTimestamp(data.createdAt) || !data.imageUrl) {
      console.log(`[posts] Bad doc: ${doc.id} missing/invalid userId/createdAt/imageUrl`, data);
      bad++;
    }
  });
  console.log(`[posts] Checked ${snapshot.size} docs, found ${bad} bad.`);
}

async function auditPlans() {
  const snapshot = await db.collection('plans').get();
  let bad = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.userId || !data.title || !isTimestamp(data.createdAt)) {
      console.log(`[plans] Bad doc: ${doc.id} missing/invalid userId/title/createdAt`, data);
      bad++;
    }
  });
  console.log(`[plans] Checked ${snapshot.size} docs, found ${bad} bad.`);
}

async function main() {
  await auditStories();
  await auditMessages();
  await auditUsers();
  await auditPosts();
  await auditPlans();
  console.log('Firestore data audit complete. Review the logs above for any issues.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error running Firestore data audit:', err);
  process.exit(1);
}); 