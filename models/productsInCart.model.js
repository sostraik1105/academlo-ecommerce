const { DataTypes, db } = require('../utils/database.util');

exports.ProductsInCarts = db.define('productsInCart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(9),
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'removed', 'purchased']],
        },
    },
});
