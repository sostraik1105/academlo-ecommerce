const { Carts } = require('../models/carts.model');
const { Products } = require('../models/products.model');
const { ProductsInCarts } = require('../models/productsInCart.model');

// Utils
const { errorHandler } = require('../utils/errorHandler.util');
const { AppError } = require('../utils/appError.util');
const { Orders } = require('../models/orders.model');
const { Email } = require('../utils/email.util');

// GET - find cart by user
exports.findCartByUser = errorHandler(async (req, res, next) => {
    const { id } = req.sessionUser;

    const userCart = await Carts.findOne({
        where: { userId: id },
        include: {
            model: ProductsInCarts,
        },
    });

    res.status(200).json({ userCart });
});

// POST - add product to cart
exports.addProduct = errorHandler(async (req, res, next) => {
    const { id } = req.sessionUser;
    const { productId, quantity } = req.body;

    const product = await Products.findOne({
        where: { id: productId, status: 'active' },
    });

    if (!product) {
        return next(new AppError('Product not found', 404));
    } else if (quantity < 0 || quantity > product.quantity) {
        return next(
            new AppError(
                `This product only has ${product.quantity} items available`,
                400
            )
        );
    }

    const userCart = await Carts.findOne({
        where: { userId: id, status: 'active' },
    });

    if (!userCart) {
        const newCart = await Carts.create({ userId: id });

        await ProductsInCarts.create({
            cartId: newCart.id,
            productId,
            quantity,
        });
    } else {
        // remove all products from cart
        await ProductsInCarts.update(
            { status: 'removed', quantity: 0 },
            { where: { status: 'purchased', cartId: userCart.id } }
        );

        const productInCart = await ProductsInCarts.findOne({
            where: { productId, cartId: userCart.id },
        });

        if (productInCart && productInCart.status === 'active') {
            return next(new AppError('this product exists in the cart', 400));
        } else if (productInCart && productInCart.status === 'removed') {
            await productInCart.update({ quantity, status: 'active' });
        } else if (!productInCart) {
            await ProductsInCarts.create({
                cartId: userCart.id,
                productId,
                quantity,
            });
        }
    }

    res.status(201).json({ status: 'success' });
});

// PATCH - update product in cart
exports.updateProductInCart = errorHandler(async (req, res, next) => {
    const { id } = req.sessionUser;
    const { productId, newQty } = req.body;

    const userCart = await Carts.findOne({
        where: { userId: id, status: 'active' },
    });

    if (!userCart) {
        return next(new AppError('Create cart first', 400));
    }

    const productInCart = await ProductsInCarts.findOne({
        where: { cartId: userCart.id, productId },
        include: { model: Products },
    });

    if (!productInCart) {
        return next(new AppError('Product not found in this cart', 404));
    } else if (newQty < 0 || newQty > productInCart.product.quantity) {
        return next(
            new AppError(
                `This product only has ${productInCart.product.quantity} items available`,
                400
            )
        );
    }

    if (newQty === 0) {
        await productInCart.update({ quantity: 0, status: 'removed' });
    } else if (newQty > 0) {
        await productInCart.update({ quantity: newQty });
    } else if (productInCart.quantity === 0) {
        await productInCart.update({ quantity: newQty, status: 'active' });
    }

    res.status(200).json({ status: 'success' });
});

// DELETE - delete product in cart
exports.deleteProductInCart = errorHandler(async (req, res, next) => {
    const { productId } = req.params;

    const productInCart = await ProductsInCarts.findOne({
        where: { productId, status: 'active' },
    });

    if (!productInCart) {
        return next(new AppError('Product not found in this cart'));
    }

    await productInCart.update({ status: 'removed', quantity: 0 });

    res.status(200).json({ status: 'success' });
});

// POST - purchase cart
exports.purchaseCart = errorHandler(async (req, res, next) => {
    const { id, email } = req.sessionUser;

    let totalPrice = 0;

    const userCart = await Carts.findOne({
        where: { userId: id, status: 'active' },
        include: {
            model: ProductsInCarts,
            where: { status: 'active' },
            include: {
                model: Products,
                attributes: ['title', 'price', 'quantity'],
            },
        },
    });

    if (!userCart) {
        return next(new AppError('this account does not have a cart.', 404));
    }

    const cartPromises = userCart.productsInCarts.map(async productInCart => {
        const updateQty =
            productInCart.product.quantity - productInCart.quantity;

        await Products.update(
            { quantity: updateQty },
            { where: { id: productInCart.productId } }
        );

        const productPrice =
            productInCart.quantity * +productInCart.product.price;

        totalPrice += productPrice;
        return await productInCart.update({ status: 'purchased' });
    });

    await Promise.all(cartPromises);

    const newOrder = await Orders.create({
        userId: id,
        cartId: userCart.id,
        totalPrice,
    });

    const emailProducts = await ProductsInCarts.findAll({
        where: {
            cartId: newOrder.cartId,
            status: 'purchased',
        },
        include: [{ model: Products }],
    });

    await new Email(email).sendNewPurchase(newOrder, emailProducts);

    res.status(200).json({ status: 'success', newOrder });
});
