const { Router } = require('express');

// Controllers
const {
    createCategory,
    createProduct,
    deleteProduct,
    findAllCategories,
    findAllProducts,
    findProductById,
    updateCategory,
    updateProduct,
} = require('../controllers/products.controller');

// Middlewares
const {
    protectToken,
    protectUser,
    protectProductUser,
} = require('../middlewares/auth.middlewares');
const { productExists } = require('../middlewares/exists.middlewares');
const {
    productsValidators,
    categoriesValidators,
} = require('../middlewares/validators.middleware');
const { upload } = require('../utils/upload.util');

const productsRoutes = Router();

productsRoutes.get('/', findAllProducts);

productsRoutes.get('/categories', findAllCategories);

productsRoutes.get('/:productId', productExists, findProductById);

productsRoutes.use(protectToken);

productsRoutes.post(
    '/',
    upload.array('productImg', 5),
    productsValidators,
    createProduct
);

productsRoutes.post('/categories', categoriesValidators, createCategory);

productsRoutes.patch('/categories/:categoryId', updateCategory);

productsRoutes
    .use('/:productId', productExists, protectProductUser)
    .route('/:productId')
    .patch(updateProduct)
    .delete(deleteProduct);

module.exports = { productsRoutes };
