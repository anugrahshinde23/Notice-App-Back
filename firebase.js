const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

try {
  // Parse the service account JSON from environment variable
  const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_JSON);

  // Replace escaped \n with actual newlines for PEM key
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  // Initialize Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase initialized successfully!");
} catch (err) {
  console.error("❌ Firebase initialization error:", err.message);
  process.exit(1);
}

module.exports = admin;
