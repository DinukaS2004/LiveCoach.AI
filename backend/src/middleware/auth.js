const { getFirebaseAuth } = require('../config/firebase');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const User = require('../models/User');

//Verify Firebase Token Middleware

const verifyFirebaseToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(
                res,
                401,
                'Access denied. No token provided or invalid format.',
                { hint: 'Include Authorization header: Bearer <token>' }
            );
        }

        // Extract the token
        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            return errorResponse(res, 401, 'Access denied. Token is empty.');
        }

        // Verify the token with Firebase
        const decodedToken = await getFirebaseAuth().verifyIdToken(token);

        // Token is valid, attach decoded data to request
        req.firebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            provider: decodedToken.firebase.sign_in_provider,
        };

        logger.debug('Token verified for user:', decodedToken.email);

        // Continue to next middleware
        next();

    } catch (error) {
        logger.error('Token verification failed:', error.message);

        // Handle Firebase errors
        if (error.code === 'auth/id-token-expired') {
            return errorResponse(res, 401, 'Token has expired. Please login again.');
        }

        if (error.code === 'auth/id-token-revoked') {
            return errorResponse(res, 401, 'Token has been revoked. Please login again.');
        }

        return errorResponse(res, 401, 'Invalid token. Authentication failed.');
    }
};

//Attach User from Database Middleware

const attachUser = async (req, res, next) => {
    try {
        // req.firebaseUser is set by verifyFirebaseToken middleware
        if (!req.firebaseUser) {
            return errorResponse(res, 401, 'Firebase user not found in request.');
        }

        // Find user in MongoDB by Firebase UID
        const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });

        if (!user) {
            return errorResponse(
                res,
                404,
                'User not found in database. Please complete registration.',
                { firebaseUid: req.firebaseUser.uid }
            );
        }

        // Attach full user data to request
        req.user = user;

        logger.debug('User attached to request:', user.email);

        next();

    } catch (error) {
        logger.error('Error attaching user:', error.message);
        return errorResponse(res, 500, 'Error retrieving user data.');
    }
};

//Role-based Access Control Middleware

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated.');
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                403,
                'Access forbidden. Insufficient permissions.',
                {
                    requiredRole: allowedRoles,
                    userRole: req.user.role
                }
            );
        }

        next();
    };
};

module.exports = {
    verifyFirebaseToken,
    attachUser,
    requireRole,
};

const auth = [verifyFirebaseToken, attachUser];

module.exports = auth;
module.exports.verifyFirebaseToken = verifyFirebaseToken;
module.exports.attachUser = attachUser;
module.exports.requireRole = requireRole;