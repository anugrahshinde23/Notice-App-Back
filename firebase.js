const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

// Parse the JSON from .env
let serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_JSON);

// Replace escaped \n with actual newlines
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
