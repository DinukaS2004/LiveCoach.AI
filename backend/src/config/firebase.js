const admin = require('firebase-admin');
const config = require('./environment');

let firebaseApp;

const initializeFirebase = () => {
    try {
        const { projectId, privateKeyId, privateKey, clientEmail, clientId, clientX509CertUrl } = config.firebase;

        // Validate all required credentials are present
        if (!projectId) throw new Error('FIREBASE_PROJECT_ID is missing');
        if (!privateKeyId) throw new Error('FIREBASE_PRIVATE_KEY_ID is missing');
        if (!privateKey) throw new Error('FIREBASE_PRIVATE_KEY is missing');
        if (!clientEmail) throw new Error('FIREBASE_CLIENT_EMAIL is missing');
        if (!clientId) throw new Error('FIREBASE_CLIENT_ID is missing');
        if (!clientX509CertUrl) throw new Error('FIREBASE_CLIENT_X509_CERT_URL is missing');

        const serviceAccount = {
            type: 'service_account',
            project_id: projectId,
            private_key_id: privateKeyId,
            private_key: privateKey,
            client_email: clientEmail,
            client_id: clientId,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: clientX509CertUrl,
            universe_domain: 'googleapis.com',
        };

        // Initialize Firebase Admin
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('✅ Firebase Admin initialized successfully');

    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        console.error('\n📋 Troubleshooting:');
        console.error('1. Verify all FIREBASE_* environment variables are set');
        console.error('2. For Vercel: Go to Project Settings > Environment Variables');
        console.error('3. Ensure FIREBASE_PRIVATE_KEY contains the full private key with line breaks');
        console.error('4. Check that there are no extra spaces or quotes in the values');
        process.exit(1);
    }
};

const getFirebaseAdmin = () => {
    if (!firebaseApp) {
        throw new Error('Firebase Admin not initialized');
    }
    return admin;
};


const getFirebaseAuth = () => {
    if (!firebaseApp) {
        throw new Error('Firebase Admin not initialized');
    }
    return admin.auth();
};

module.exports = {
    initializeFirebase,
    getFirebaseAdmin,
    getFirebaseAuth,
};