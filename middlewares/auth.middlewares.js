const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models
const { Users } = require('../models/users.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { errorHandler } = require('../utils/errorHandler.util');

exports.protectToken = errorHandler(async (req, res, next) => {
    let token;

    // Extract token from headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // ['Bearer', 'token']
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Session invalid', 403));
    }

    // Validate token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // decoded returns -> { id: 1, iat: 1651713776, exp: 1651717376 }
    const dbUser = await Users.findOne({
        where: { id: decoded.id, status: 'active' },
    });

    if (!dbUser) {
        return next(
            new AppError('The owner of this token is no longer available', 403)
        );
    }

    req.sessionUser = dbUser;
    next();
});

exports.protectUser = errorHandler(async (req, res, next) => {
    const { sessionUser, dbUser } = req;

    if (sessionUser.id !== dbUser.id) {
        return next(new AppError('Access not granted', 403));
    }

    next();
});

exports.protectProductUser = errorHandler(async (req, res, next) => {
    const { sessionUser, dbProduct } = req;

    if (sessionUser.id !== dbProduct.userId) {
        return next(new AppError('Access not granted', 403));
    }

    next();
});
