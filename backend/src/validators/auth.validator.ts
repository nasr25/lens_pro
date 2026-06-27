import { body } from 'express-validator';

export const loginValidators = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ max: 50 })
    .escape(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 200 }),
];
