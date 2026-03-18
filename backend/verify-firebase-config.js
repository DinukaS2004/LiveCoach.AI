// Script to verify Firebase environment variables are set correctly
// Run this with: node verify-firebase-config.js

const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Firebase Environment Variables Verification');
console.log('===============================================\n');

const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL',
    'MONGODB_URI',
];

let allSet = true;
const results = [];

requiredVars.forEach((varName) => {
    const value = process.env[varName];
    const isSet = !!value;
    
    if (!isSet) {
        results.push(`❌ ${varName}: NOT SET`);
        allSet = false;
    } else {
        let displayValue = value;
        
        // Special handling for sensitive values
        if (varName === 'FIREBASE_PRIVATE_KEY' || varName === 'MONGODB_URI') {
            const length = value.length;
            displayValue = value.substring(0, 20) + '...' + value.substring(length - 10) + ` (${length} chars)`;
        }
        
        results.push(`✅ ${varName}: ${displayValue}`);
    }
});

results.forEach(r => console.log(r));

console.log('\n' + '='.repeat(50));

if (allSet) {
    console.log('✅ All environment variables are set!');
    
    // Additional checks
    console.log('\n📋 Additional Checks:');
    
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log('✅ FIREBASE_PRIVATE_KEY format looks correct');
    } else {
        console.log('⚠️  FIREBASE_PRIVATE_KEY might not be formatted correctly');
    }
    
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.includes('mongodb')) {
        console.log('✅ MONGODB_URI format looks correct');
    } else {
        console.log('⚠️  MONGODB_URI might not be formatted correctly');
    }
    
    console.log('\n✨ Ready to start the server!');
} else {
    console.log('❌ Some environment variables are missing!');
    console.log('\n📋 Next Steps:');
    console.log('1. For local development: Copy .env.example to .env and fill in values');
    console.log('2. For Vercel: Add all variables in Project Settings > Environment Variables');
    console.log('3. Re-deploy after setting variables');
    process.exit(1);
}
