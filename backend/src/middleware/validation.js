const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const registerValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['athlete', 'coach'])
      .withMessage('Role must be either "athlete" or "coach"'),

    body('firebaseUid')
      .notEmpty()
      .withMessage('Firebase UID is required'),
  ];
};


const athleteValidationRules = () => {
  return [
    ...registerValidationRules(),

    body("athleteData.sport")
        .isIn(["Badminton", "Cricket", "Badminton,Cricket", "Cricket,Badminton"])
        .withMessage("Sport must be Badminton, Cricket, or both"),

    body('athleteData.age')
      .isInt({ min: 5, max: 120 })
      .withMessage('Age must be between 5 and 120'),

    body('athleteData.experienceLevel')
      .isIn(['beginner', 'intermediate', 'advanced', 'professional'])
      .withMessage('Invalid experience level'),

    body('athleteData.goals')
      .optional()
      .isArray()
      .withMessage('Goals must be an array'),
  ];
};

const coachValidationRules = () => {
  return [
    ...registerValidationRules(),

    body('coachData.specialization')
      .isArray({ min: 1 })
      .withMessage('At least one specialization is required'),

    body('coachData.yearsOfExperience')
      .isInt({ min: 0, max: 70 })
      .withMessage('Years of experience must be between 0 and 70'),

    body('coachData.certifications')
      .optional()
      .isArray()
      .withMessage('Certifications must be an array'),

    body('coachData.bio')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Bio must not exceed 1000 characters'),
  ];
};


const updateProfileValidationRules = () => {
  return [
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),

    body('phoneNumber')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),

    body('profilePicture')
      .optional()
      .isString()
      .withMessage('Profile picture must be a string')
      .custom((value) => {
        const isHttpUrl = /^https?:\/\//i.test(value);
        const isImageDataUrl = /^data:image\/(png|jpe?g|webp);base64,/i.test(value);

        if (!isHttpUrl && !isImageDataUrl) {
          throw new Error('Profile picture must be a valid URL or image data URL');
        }

        return true;
      })
      .isLength({ max: 8 * 1024 * 1024 })
      .withMessage('Profile picture payload is too large'),
  ];
};


const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return errorResponse(
      res,
      400,
      'Validation failed. Please check your input.',
      extractedErrors
    );
  }

  next();
};

module.exports = {
  registerValidationRules,
  athleteValidationRules,
  coachValidationRules,
  updateProfileValidationRules,
  checkValidation,
};