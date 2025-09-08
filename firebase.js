const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

try {
  // Parse the JSON from .env
  const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_JSON);

  // Replace escaped newlines with real newlines
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  // Initialize Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase initialized successfully!");
} catch (error) {
  console.error("Firebase initialization error:", error);
  process.exit(1); // Stop execution if Firebase fails
}

module.exports = admin;
