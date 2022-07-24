const { body, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError.util');

const checkValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Array has errors
        const errorMsgs = errors.array().map(err => err.msg);

        const message = errorMsgs.join('. ');

        return next(new AppError(message, 400));
    }

    next();
};

exports.usersValidators = [
    body('username').notEmpty().withMessage('Username cannot be empty'),
    body('email').isEmail().withMessage('Must provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .isAlphanumeric()
        .withMessage('Password must contain letters and numbers'),
    checkValidation,
];

exports.productsValidators = [
    body('title').notEmpty().withMessage('Title cannot be empty'),
    body('description').notEmpty().withMessage('Description cannot be empty'),
    body('price')
        .notEmpty()
        .withMessage('Price cannot be empty')
        .isInt()
        .withMessage('This field only acepted integer values'),
    body('categoryId')
        .notEmpty()
        .withMessage('Category cannot be empty')
        .isInt()
        .withMessage('This field only acepted integer values'),
    body('quantity')
        .notEmpty()
        .withMessage('Quantity cannot be empty')
        .isInt()
        .withMessage('This field only acepted integer values'),
    checkValidation,
];

exports.categoriesValidators = [
    body('name').notEmpty().withMessage('Title cannot be empty'),
];
