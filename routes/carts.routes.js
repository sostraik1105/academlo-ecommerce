const { Router } = require('express');

// Controller
const {
    addProduct,
    deleteProductInCart,
    purchaseCart,
    updateProductInCart,
    findCartByUser,
} = require('../controllers/carts.controller');

// Middlewares
const { protectToken } = require('../middlewares/auth.middlewares');

const cartsRoutes = Router();

cartsRoutes.use(protectToken);

cartsRoutes.get('/', findCartByUser);

cartsRoutes.post('/add-product', addProduct);

cartsRoutes.patch('/update-cart', updateProductInCart);

cartsRoutes.delete('/:productId', deleteProductInCart);

cartsRoutes.post('/purchase', purchaseCart);

module.exports = { cartsRoutes };
