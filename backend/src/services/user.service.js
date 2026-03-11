//User service to handle all user-related database operations
const User = require('../models/User');
const Athlete = require('../models/Athlete');
const Coach = require('../models/Coach');
const logger = require('../utils/logger');

//Create new user in database after successful Firebase authentication
const createUser = async (userData) => {
    try {
        const { role, firebaseUid, email, firstName, lastName, gender, authProviders } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ firebaseUid });
        if (existingUser) {
            return {
                success: false,
                error: 'User already exists',
                user: existingUser
            };
        }

        let newUser;

        if (role === 'athlete') {
            // Create athlete
            newUser = new Athlete({
                firebaseUid,
                email,
                firstName,
                lastName,
                gender,
                role: 'athlete',
                authProviders: authProviders || ['email'],
                ...userData.athleteData,
            });
        } else if (role === 'coach') {
            // Create coach
            newUser = new Coach({
                firebaseUid,
                email,
                firstName,
                lastName,
                gender,
                role: 'coach',
                authProviders: authProviders || ['email'],
                ...userData.coachData,
            });
        } else {
            return { success: false, error: 'Invalid role' };
        }

        await newUser.save();
        logger.success('User created in database:', email);

        return { success: true, user: newUser };

    } catch (error) {
        logger.error('Error creating user:', error.message);
        return { success: false, error: error.message };
    }
};

//Get user by Firebase UID
const getUserByFirebaseUid = async (firebaseUid) => {
    try {
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, user };

    } catch (error) {
        logger.error('Error fetching user:', error.message);
        return { success: false, error: error.message };
    }
};

//Get user by email
const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, user };

    } catch (error) {
        logger.error('Error fetching user by email:', error.message);
        return { success: false, error: error.message };
    }
};

//Update user profile information
const updateUserProfile = async (firebaseUid, updateData) => {
    try {
        const user = await User.findOne({ firebaseUid });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Update allowed fields
        const allowedUpdates = [
            'firstName',
            'lastName',
            'gender',
            'phoneNumber',
            'profilePicture',
            'isFirstTimeUser',
        ];

        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field];
            }
        });

        // Update role-specific data
        if (user.role === 'athlete' && updateData.athleteData) {
            Object.assign(user, updateData.athleteData);
        } else if (user.role === 'coach' && updateData.coachData) {
            Object.assign(user, updateData.coachData);
        }

        await user.save();
        logger.success('User profile updated:', user.email);

        return { success: true, user };

    } catch (error) {
        logger.error('Error updating user:', error.message);
        return { success: false, error: error.message };
    }
};

//Update last login timestamp
const updateLastLogin = async (firebaseUid) => {
    try {
        await User.findOneAndUpdate(
            { firebaseUid },
            { lastLogin: new Date() }
        );

        return { success: true };

    } catch (error) {
        logger.error('Error updating last login:', error.message);
        return { success: false, error: error.message };
    }
};

//Delete user from database (used when account is deleted from Firebase)
const deleteUser = async (firebaseUid) => {
    try {
        const result = await User.findOneAndDelete({ firebaseUid });

        if (!result) {
            return { success: false, error: 'User not found' };
        }

        logger.success('User deleted from database:', result.email);
        return { success: true };

    } catch (error) {
        logger.error('Error deleting user:', error.message);
        return { success: false, error: error.message };
    }
};

//Mark onboarding as complete for first-time users
const completeOnboarding = async (firebaseUid) => {
    try {
        const user = await User.findOneAndUpdate(
            { firebaseUid },
            { isFirstTimeUser: false },
            { new: true }
        );

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, user };

    } catch (error) {
        logger.error('Error completing onboarding:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    createUser,
    getUserByFirebaseUid,
    getUserByEmail,
    updateUserProfile,
    updateLastLogin,
    deleteUser,
    completeOnboarding,
};