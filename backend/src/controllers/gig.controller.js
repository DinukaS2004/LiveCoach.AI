const Gig = require('../models/Gig');
const { successResponse, errorResponse } = require('../utils/response');

const createGig = async (req, res, next) => {
    try {
        const coachId = req.user._id;

        // NEW: Check if this coach already has a gig
        const existingGig = await Gig.findOne({ coachId });
        if (existingGig) {
            return errorResponse(res, 400, 'You can only publish one coaching gig.');
        }

        const { name, location, price, billingCycle, phone, email, sport } = req.body;

        const newGig = new Gig({
            coachId,
            name,
            location,
            price,
            billingCycle,
            phone,
            email,
            sport
        });

        await newGig.save(); 
        return successResponse(res, 201, 'Gig created successfully!', newGig);
    } catch (error) {
        next(error); 
    }
};

// const getAllGigs = async (req, res, next) => {
//     try {
//         // ADDED '_id' to the populate selection string
//         const gigs = await Gig.find().populate('coachId', 'firstName lastName email');
        
//         return successResponse(res, 200, 'Gigs retrieved successfully', gigs);
//     } catch (error) {
//         next(error);
//     }
// };

const getAllGigs = async (req, res, next) => {
    try {
        // Use object syntax for populate to ensure _id is included
        const gigs = await Gig.find().populate({
            path: 'coachId',
            select: '_id firstName lastName email'
        });
        
        return successResponse(res, 200, 'Gigs retrieved successfully', gigs);
    } catch (error) {
        next(error);
    }
};


const updateGig = async (req, res, next) => {
    try {
        const coachId = req.user._id;
        const updates = req.body;

        // Find the gig belonging to this coach and update it
        const updatedGig = await Gig.findOneAndUpdate(
            { coachId: coachId },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedGig) {
            return errorResponse(res, 404, 'Gig not found');
        }

        return successResponse(res, 200, 'Gig updated successfully!', updatedGig);
    } catch (error) {
        next(error);
    }
};

const deleteGig = async (req, res, next) => {
    try {
        const coachId = req.user._id; // Extracted from attachUser middleware

        // Find and delete the one gig belonging to this coach
        const deletedGig = await Gig.findOneAndDelete({ coachId: coachId });

        if (!deletedGig) {
            return errorResponse(res, 404, 'Gig not found or already deleted');
        }

        return successResponse(res, 200, 'Gig deleted successfully!');
    } catch (error) {
        next(error);
    }
};

// Update your module.exports at the bottom
module.exports = {
    createGig,
    getAllGigs,
    updateGig,
    deleteGig // <--- Add this
};