const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

// Parse service account JSON from .env
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_JSON);

// Replace escaped \n with real newlines
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
