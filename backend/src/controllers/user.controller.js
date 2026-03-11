// User Controller
const { successResponse, errorResponse } = require('../utils/response');
const userService = require('../services/user.service');
const logger = require('../utils/logger');

// Get User Profile
const getProfile = async (req, res, next) => {
    try {
        // req.user is set by attachUser middleware
        const user = req.user;

        // Prepare response data
        let profileData = {
            userId: user._id,
            firebaseUid: user.firebaseUid,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            isFirstTimeUser: user.isFirstTimeUser,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        // Add role-specific data
        if (user.role === 'athlete') {
            profileData.athleteData = {
                sport: user.sport,
                age: user.age,
                bio: user.bio,
                currentCoach: user.currentCoach,
            };
        } else if (user.role === 'coach') {
            profileData.coachData = {
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
            'Profile retrieved successfully',
            profileData
        );

    } catch (error) {
        logger.error('Get profile error:', error);
        next(error);
    }
};

// Update User Profile
const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.firebaseUser;
        const updateData = req.body;

        logger.info('Updating profile for:', req.user.email);

        const result = await userService.updateUserProfile(uid, updateData);

        if (!result.success) {
            return errorResponse(
                res,
                500,
                'Failed to update profile',
                { error: result.error }
            );
        }

        logger.success('Profile updated successfully:', req.user.email);

        return successResponse(
            res,
            200,
            'Profile updated successfully',
            {
                userId: result.user._id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                gender: result.user.gender,
                phoneNumber: result.user.phoneNumber,
                profilePicture: result.user.profilePicture,
                updatedAt: result.user.updatedAt,
            }
        );

    } catch (error) {
        logger.error('Update profile error:', error);
        next(error);
    }
};

// Delete User Profile
const deleteProfile = async (req, res, next) => {
    try {
        const { uid } = req.firebaseUser;
        const email = req.user.email;

        logger.warn('Account deletion requested for:', email);

        // Delete from MongoDB
        const mongoResult = await userService.deleteUser(uid);

        if (!mongoResult.success) {
            return errorResponse(
                res,
                500,
                'Failed to delete user from database',
                { error: mongoResult.error }
            );
        }

        // Delete from Firebase
        const firebaseResult = await firebaseService.deleteFirebaseUser(uid);

        if (!firebaseResult.success) {
            logger.error('Failed to delete from Firebase, but MongoDB deletion succeeded');
        }

        logger.success('User account deleted:', email);

        return successResponse(
            res,
            200,
            'Account deleted successfully'
        );

    } catch (error) {
        logger.error('Delete profile error:', error);
        next(error);
    }
};

// Get User by ID (Public Endpoint)
const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const User = require('../models/User');
        const user = await User.findById(userId);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Return limited public information
        const publicData = {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            role: user.role,
            profilePicture: user.profilePicture,
            isActive: user.isActive,
        };

        // Add role-specific public data
        if (user.role === 'coach') {
            publicData.coachData = {
                specialization: user.specialization,
                yearsOfExperience: user.yearsOfExperience,
                bio: user.bio,
                rating: user.rating,
                totalRatings: user.totalRatings,
                isAvailable: user.isAvailable,
            };
        }

        return successResponse(
            res,
            200,
            'User data retrieved',
            publicData
        );

    } catch (error) {
        logger.error('Get user by ID error:', error);
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    deleteProfile,
    getUserById,
};