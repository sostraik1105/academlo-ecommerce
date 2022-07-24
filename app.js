const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Routes
const { usersRoutes } = require('./routes/users.routes');
const { productsRoutes } = require('./routes/products.routes');
const { cartsRoutes } = require('./routes/carts.routes');

// Utils
const { AppError } = require('./utils/appError.util');

// Globar error controller
const { globalErrorHandler } = require('./controllers/error.controller');

const app = express();

app.use(express.json());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// rate-limit
const limiter = rateLimit({
    max: 10000,
    windowMs: 1 * 60 * 60 * 1000,
    message: 'Number of request have been exceeded',
});
app.use(limiter);

app.use(helmet());

app.use(compression());

process.env.NODE_ENV === 'production'
    ? app.use(morgan('combined'))
    : app.use(morgan('dev'));

// Endpoints
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/carts', cartsRoutes);

// Handle incoming unknown routes to the server
app.all('*', (req, res, next) => {
    next(
        new AppError(
            `${req.method} ${req.originalUrl} not found in this server`,
            404
        )
    );
});

app.use(globalErrorHandler);

module.exports = { app };
