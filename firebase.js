const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Resolve service account path from .env
const serviceAccountPath = path.resolve(
  __dirname,
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

// Load service account JSON
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
