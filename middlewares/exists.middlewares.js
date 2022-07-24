// Models
const { Users } = require('../models/users.model');
const { Products } = require('../models/products.model');

// Utils
const { errorHandler } = require('../utils/errorHandler.util');
const { AppError } = require('../utils/appError.util');
const { ProductImgs } = require('../models/productImgs.model');

exports.userExists = errorHandler(async (req, res, next) => {
    const { userId } = req.params;

    const dbUser = await Users.findOne({
        where: { id: userId, status: 'active' },
        attributes: { exclude: ['password'] },
    });

    if (!dbUser) {
        return next(new AppError('User not found', 404));
    }

    req.dbUser = dbUser;

    console.log(dbUser);

    next();
});

exports.productExists = errorHandler(async (req, res, next) => {
    const { productId } = req.params;

    const dbProduct = await Products.findOne({
        where: { id: productId, status: 'active' },
        include: { model: ProductImgs },
    });

    if (!dbProduct) {
        return next(new AppError('Product not found', 404));
    }

    req.dbProduct = dbProduct;

    next();
});
