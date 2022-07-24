const { DataTypes, db } = require('../utils/database.util');

exports.ProductImgs = db.define('productImg', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    imgUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
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
});
