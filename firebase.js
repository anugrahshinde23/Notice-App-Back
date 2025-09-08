const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Parse JSON content directly from environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
