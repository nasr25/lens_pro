import { body } from 'express-validator';

export const bookingValidators = [
  body('slot_id')
    .isInt({ min: 1 })
    .withMessage('Slot ID must be a positive integer'),

  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 150 }).withMessage('Full name must not exceed 150 characters')
    .escape(),

  body('phone_number')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9\s\-()]{7,20}$/).withMessage('Invalid phone number format'),

  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .isLength({ max: 255 }),

  body('event_type')
    .isIn(['wedding', 'graduation', 'commercial', 'portrait'])
    .withMessage('Invalid event type'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 255 }).withMessage('Location must not exceed 255 characters')
    .escape(),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes must not exceed 2000 characters')
    .escape(),

  body('terms_accepted')
    .isBoolean().withMessage('Terms acceptance must be a boolean')
    .equals('true').withMessage('You must accept the terms and conditions'),
];
