// This controller handles user registration, login, and token verification.
const { successResponse, errorResponse } = require('../utils/response');
const userService = require('../services/user.service');
const firebaseService = require('../services/firebase.service');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
    try {
        const { firebaseUid, email, firstName, lastName, gender, role, athleteData, coachData, authProvider } = req.body;

        logger.info('Registration attempt for:', email);

        // Check if user already exists in MongoDB
        const existingUser = await userService.getUserByFirebaseUid(firebaseUid);

        if (existingUser.success) {
            return errorResponse(
                res,
                409,
                'User already registered',
                { user: existingUser.user }
            );
        }

        // Verify the user exists in Firebase
        const firebaseUser = await firebaseService.getUserByUid(firebaseUid);

        if (!firebaseUser.success) {
            return errorResponse(
                res,
                404,
                'Firebase user not found. Please ensure user is created in Firebase first.',
                { firebaseUid }
            );
        }

        if (!['male', 'female'].includes((gender || '').toLowerCase())) {
            return errorResponse(
                res,
                400,
                'Valid gender is required'
            );  
        }

        // Prepare user data
        const userData = {
            firebaseUid,
            email: email.toLowerCase(),
            firstName,
            lastName,
            gender: gender.toLowerCase(),
            role,
            authProviders: [authProvider || 'email'],
            isEmailVerified: firebaseUser.data.emailVerified || false,
        };

        // Add role-specific data
        if (role === 'athlete') {
            if (!athleteData) {
                return errorResponse(
                    res,
                    400,
                    'Athlete data is required for athlete registration'
                );
            }
            userData.athleteData = athleteData;
        } else if (role === 'coach') {
            if (!coachData) {
                return errorResponse(
                    res,
                    400,
                    'Coach data is required for coach registration'
                );
            }
            userData.coachData = coachData;
        }

        // Create user in MongoDB
        const result = await userService.createUser(userData);

        if (!result.success) {
            return errorResponse(
                res,
                500,
                'Failed to create user',
                { error: result.error }
            );
        }

        logger.success('User registered successfully:', email);

        // Return success response
        return successResponse(
            res,
            201,
            'User registered successfully',
            {
                userId: result.user._id,
                firebaseUid: result.user.firebaseUid,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                gender: result.user.gender,
                role: result.user.role,
                isFirstTimeUser: result.user.isFirstTimeUser,
                isEmailVerified: result.user.isEmailVerified,
                createdAt: result.user.createdAt,
            }
        );

    } catch (error) {
        logger.error('Registration error:', error);
        next(error);
    }
};

// Login Endpoint
const login = async (req, res, next) => {
    try {
        // req.firebaseUser is set by verifyFirebaseToken middleware
        const { uid, email } = req.firebaseUser;

        logger.info('Login attempt for:', email);

        // Get user from MongoDB
        const result = await userService.getUserByFirebaseUid(uid);

        if (!result.success) {
            return errorResponse(
                res,
                404,
                'User not found. Please complete registration first.',
                {
                    firebaseUid: uid,
                    email,
                    hint: 'Call POST /api/auth/register to complete registration'
                }
            );
        }

        const user = result.user;

        // Update last login timestamp
        await userService.updateLastLogin(uid);

        logger.success('User logged in successfully:', email);

        // Prepare response data based on role
        let responseData = {
            userId: user._id,
            firebaseUid: user.firebaseUid,
            email: user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            gender: result.user.gender,
            role: user.role,
            profilePicture: user.profilePicture,
            isFirstTimeUser: user.isFirstTimeUser,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
        };

        // Add role-specific data
        if (user.role === 'athlete') {
            responseData.athleteData = {
                sport: user.sport,
                age: user.age,
                bio: user.bio,
                currentCoach: user.currentCoach,
            };
        } else if (user.role === 'coach') {
            responseData.coachData = {
                specialization: user.specialization,
                yearsOfExperience: user.yearsOfExperience,
                bio: user.bio,
                hourlyRate: user.hourlyRate,
                isAvailable: user.isAvailable,
                rating: user.rating,
                totalRatings: user.totalRatings,
                maxAthletes: user.maxAthletes,
                currentAthletes: user.currentAthletes,
            };
        }

        return successResponse(
            res,
            200,
            'Login successful',
            responseData
        );

    } catch (error) {
        logger.error('Login error:', error);
        next(error);
    }
};

// Token Verification Endpoint
const verifyToken = async (req, res, next) => {
    try {
        // If this endpoint is reached, token is valid (middleware already verified it)
        const { uid, email, emailVerified } = req.firebaseUser;

        return successResponse(
            res,
            200,
            'Token is valid',
            {
                firebaseUid: uid,
                email,
                emailVerified,
                isAuthenticated: true,
            }
        );

    } catch (error) {
        logger.error('Token verification error:', error);
        next(error);
    }
};

// Check if user exists by Firebase UID
const checkUserExists = async (req, res, next) => {
    try {
        const { firebaseUid } = req.body;

        if (!firebaseUid) {
            return errorResponse(res, 400, 'Firebase UID is required');
        }

        const result = await userService.getUserByFirebaseUid(firebaseUid);

        if (result.success) {
            return successResponse(
                res,
                200,
                'User exists',
                {
                    exists: true,
                    isFirstTimeUser: result.user.isFirstTimeUser,
                    role: result.user.role,
                    email: result.user.email,
                }
            );
        } else {
            return successResponse(
                res,
                200,
                'User does not exist',
                {
                    exists: false,
                    isFirstTimeUser: true,
                }
            );
        }

    } catch (error) {
        logger.error('Check user error:', error);
        next(error);
    }
};

// Complete Onboarding Endpoint
const completeOnboarding = async (req, res, next) => {
    try {
        const { uid } = req.firebaseUser;

        const result = await userService.completeOnboarding(uid);

        if (!result.success) {
            return errorResponse(res, 404, 'User not found');
        }

        return successResponse(
            res,
            200,
            'Onboarding completed successfully',
            {
                isFirstTimeUser: result.user.isFirstTimeUser,
            }
        );

    } catch (error) {
        logger.error('Complete onboarding error:', error);
        next(error);
    }
};

module.exports = {
    register,
    login,
    verifyToken,
    checkUserExists,
    completeOnboarding,
};