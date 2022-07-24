// Models
const { Orders } = require('../models/orders.model');
const { Products } = require('../models/products.model');
const { Users } = require('../models/users.model');
const { Carts } = require('../models/carts.model');
const { Categories } = require('../models/categories.model');
const { ProductImgs } = require('../models/productImgs.model');
const { ProductsInCarts } = require('../models/productsInCart.model');

exports.relations = () => {
    Users.hasMany(Orders);
    Orders.belongsTo(Users);

    Carts.hasOne(Orders);
    Orders.belongsTo(Carts);

    Carts.hasMany(ProductsInCarts);
    ProductsInCarts.belongsTo(Carts);

    Users.hasOne(Carts);
    Carts.belongsTo(Users);

    Users.hasMany(Products);
    Products.belongsTo(Users);

    Products.hasOne(ProductsInCarts);
    ProductsInCarts.belongsTo(Products);

    Categories.hasMany(Products);
    Products.belongsTo(Categories);

    Products.hasMany(ProductImgs);
    ProductImgs.belongsTo(Products);
};
