const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models
const { Users } = require('../models/users.model');
const { Products } = require('../models/products.model');
const { Orders } = require('../models/orders.model');
const { Carts } = require('../models/carts.model');
const { ProductsInCarts } = require('../models/productsInCart.model');
const { Categories } = require('../models/categories.model');

// Utils
const { errorHandler } = require('../utils/errorHandler.util');
const { AppError } = require('../utils/appError.util');
const { Email } = require('../utils/email.util');

// POST - create user
exports.createUser = errorHandler(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    const salt = await bcrypt.genSalt(12);
    const hashPass = await bcrypt.hash(password, salt);

    const newUser = await Users.create({
        username,
        email,
        password: hashPass,
        role,
    });

    newUser.password = undefined;

    await new Email(email).sendWelcome(username);

    res.status(201).json({ status: 'success', newUser });
});

// POST - login
exports.login = errorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const dbUser = await Users.findOne({
        where: {
            email,
            status: 'active',
        },
    });

    const comparePass = await bcrypt.compare(password, dbUser.password);

    if (!dbUser || !comparePass) {
        return next(new AppError('Invalid Credentials', 401));
    }

    const token = await jwt.sign({ id: dbUser.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({ status: 'success', token });
});

// GET - get products by user in session
exports.findProductsBySessionUser = errorHandler(async (req, res, next) => {
    const { id } = req.sessionUser;

    const products = await Products.findAll({ where: { userId: id } });

    res.status(200).json({ status: 'success', products });
});

// PATCH - update user
exports.updateUser = errorHandler(async (req, res, next) => {
    const { dbUser } = req;
    const { username, email } = req.body;

    await dbUser.update({ username, email });

    res.status(200).json({ status: 'updated' });
});

// DELETE - delete user
exports.deleteUser = errorHandler(async (req, res, next) => {
    const { dbUser } = req;

    await dbUser.update({ status: 'inactive' });

    res.status(200).json({ status: 'deleted' });
});

// GET - orders by user in session
exports.findOrdersBySessionUser = errorHandler(async (req, res, next) => {
    const { sessionUser } = req;

    const orders = await Orders.findAll({
        where: { userId: sessionUser.id },
        attributes: { exclude: ['userId', 'cartId'] },
        include: {
            model: Carts,
            attributes: ['id', 'status'],
            include: {
                model: ProductsInCarts,
                attributes: { exclude: ['cartId', 'productId'] },
                include: {
                    model: Products,
                    where: { status: 'purchased' },
                    attributes: ['id', 'title', 'description', 'price'],
                    include: { model: Categories, attributes: ['name'] },
                },
            },
        },
    });

    res.status(200).json({ orders });
});

// GET - order by ID
exports.findOrderById = errorHandler(async (req, res, next) => {
    const { orderId } = req.params;

    const dbOrder = await Orders.findOne({
        where: { id: orderId },
        attributes: { exclude: ['userId', 'cartId'] },
        include: {
            model: Carts,
            attributes: ['id', 'status'],
            include: {
                model: ProductsInCarts,
                attributes: { exclude: ['cartId', 'productId'] },
                include: {
                    model: Products,
                    where: { status: 'purchased' },
                    attributes: ['id', 'title', 'description', 'price'],
                    include: { model: Categories, attributes: ['name'] },
                },
            },
        },
    });

    if (!dbOrder) {
        return next(new AppError('Order not found', 404));
    }

    res.status(200).json({ dbOrder });
});
