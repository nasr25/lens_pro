import { body, query } from 'express-validator';

export const slotMonthQueryValidator = [
  query('month')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('month must be in YYYY-MM format'),
];

export const createSlotValidators = [
  body('dates')
    .isArray({ min: 1 }).withMessage('dates must be a non-empty array'),
  body('dates.*')
    .isDate().withMessage('Each date must be a valid date in YYYY-MM-DD format'),

  body('times')
    .optional()
    .isArray().withMessage('times must be an array'),
  body('times.*')
    .optional()
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Each time must be in HH:MM format'),

  body('status')
    .optional()
    .isIn(['available', 'blocked']).withMessage('Status must be available or blocked'),

  body('label')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .escape(),
];

export const updateSlotValidators = [
  body('status')
    .isIn(['available', 'blocked']).withMessage('Status must be available or blocked'),
];
