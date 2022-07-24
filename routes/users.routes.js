const { Router } = require('express');

// Controllers
const {
    createUser,
    deleteUser,
    findOrderById,
    findOrdersBySessionUser,
    findProductsBySessionUser,
    login,
    updateUser,
} = require('../controllers/users.controller');

// Middlewares
const {
    protectToken,
    protectUser,
} = require('../middlewares/auth.middlewares');
const { userExists } = require('../middlewares/exists.middlewares');
const { usersValidators } = require('../middlewares/validators.middleware');

const usersRoutes = Router();

usersRoutes.post('/', usersValidators, createUser);

usersRoutes.post('/login', login);

usersRoutes.use(protectToken);

usersRoutes.get('/me', findProductsBySessionUser);

usersRoutes.get('/orders', findOrdersBySessionUser);

usersRoutes.get('/orders/:orderId', findOrderById);

usersRoutes
    .use('/:userId', userExists, protectUser)
    .route('/:userId')
    .patch(updateUser)
    .delete(deleteUser);

module.exports = { usersRoutes };
