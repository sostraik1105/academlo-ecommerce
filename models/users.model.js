const { DataTypes, db } = require('../utils/database.util');

exports.Users = db.define(
    'user',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING(6),
            allowNull: false,
            defaultValue: 'normal',
            validate: {
                isIn: [['normal', 'admin']],
            },
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
