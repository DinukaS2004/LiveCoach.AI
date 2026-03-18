require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/coaching-app',

    // Firebase Admin SDK credentials (loaded from environment variables)
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        // Replace escaped newlines so the key is correctly formatted at runtime
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    },

    // CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8081',

    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
};

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
];

const missingVars = [];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        missingVars.push(varName);
        console.error(`Error: ${varName} is not defined in environment`);
    }
});

if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
    console.error('For Vercel deployment, ensure all variables are set in Project Settings > Environment Variables');
    process.exit(1);
}

module.exports = config;