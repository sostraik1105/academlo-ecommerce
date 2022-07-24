const { DataTypes, db } = require('../utils/database.util');

exports.Orders = db.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'purchased']],
        },
    },
});
