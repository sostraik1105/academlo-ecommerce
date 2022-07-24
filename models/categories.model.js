const { DataTypes, db } = require('../utils/database.util');

exports.Categories = db.define(
    'category',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(8),
            allowNull: false,
            defaultValue: 'active',
            validate: {
                isIn: [['active', 'inactive']],
            },
        },
    },
    { timestamps: false }
);
