const { DataTypes, db } = require('../utils/database.util');

exports.Carts = db.define(
    'cart',
    {
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
        status: {
            type: DataTypes.STRING(8),
            allowNull: false,
            defaultValue: 'active',
            validate: {
                isIn: [['active', 'inactive', 'purchased']],
            },
        },
    },
    { timestamps: false }
);
