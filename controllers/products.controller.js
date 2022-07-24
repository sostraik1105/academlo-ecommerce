const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Models
const { Products } = require('../models/products.model');
const { Categories } = require('../models/categories.model');
const { ProductImgs } = require('../models/productImgs.model');

// Utils
const { errorHandler } = require('../utils/errorHandler.util');
const { AppError } = require('../utils/appError.util');
const { storage } = require('../utils/firebase.util');

// POST - create product
exports.createProduct = errorHandler(async (req, res, next) => {
    const { sessionUser } = req;
    const { title, description, price, categoryId, quantity } = req.body;

    const newProduct = await Products.create({
        title,
        description,
        quantity,
        price,
        categoryId,
        userId: sessionUser.id,
    });

    if (req.files.length > 0) {
        const imgsPromises = req.files.map(async productImg => {
            // image name
            const imgRef = ref(
                storage,
                `products/${newProduct.id}_${title}/${Date.now()}_${
                    productImg.originalname
                }`
            );
            //
            const imgRes = await uploadBytes(imgRef, productImg.buffer);

            ProductImgs.create({
                productId: newProduct.id,
                imgUrl: imgRes.metadata.fullPath,
            });
        });

        await Promise.all(imgsPromises);
    }

    res.status(201).json({ status: 'success' });
});

// GET - find all products
exports.findAllProducts = errorHandler(async (req, res, next) => {
    const products = await Products.findAll({
        where: { status: 'active' },
        include: { model: ProductImgs },
    });

    const response = products.map(async product => {
        // Map async
        const productsImgsPromises = product.productImgs.map(
            async productImg => {
                const imgRef = ref(storage, productImg.imgUrl);

                const imgFullPath = await getDownloadURL(imgRef);

                productImg.imgUrl = imgFullPath;
            }
        );

        // Resolve promises in parallel
        await Promise.all(productsImgsPromises);
    });

    await Promise.all(response);

    res.status(200).json({ products });
});

// GET - find products by id
exports.findProductById = errorHandler(async (req, res, next) => {
    const { dbProduct } = req;

    // Map async
    const productsImgsPromises = dbProduct.productImgs.map(async productImg => {
        const imgRef = ref(storage, productImg.imgUrl);

        const imgFullPath = await getDownloadURL(imgRef);

        productImg.imgUrl = imgFullPath;
    });

    // Resolve promises in parallel
    await Promise.all(productsImgsPromises);

    res.status(200).json({ dbProduct });
});

// PATCH - update product
exports.updateProduct = errorHandler(async (req, res, next) => {
    const { dbProduct } = req;
    const { title, description, price, quantity } = req.body;

    await dbProduct.update({ title, description, price, quantity });

    res.status(200).json({ status: 'updated' });
});

// DELETE - delete product
exports.deleteProduct = errorHandler(async (req, res, next) => {
    const { dbProduct } = req;

    await dbProduct.update({ status: 'inactive' });

    res.status(200).json({ status: 'deleted' });
});

// GET - find products by category
exports.findAllCategories = errorHandler(async (req, res, next) => {
    const categories = await Categories.findAll({
        where: { status: 'active' },
    });

    res.status(201).json({ categories });
});

// POST - create new category
exports.createCategory = errorHandler(async (req, res, next) => {
    const { name } = req.body;
    const newCategory = await Categories.create({
        name,
    });

    res.status(201).json({ status: 'success', newCategory });
});

// PATCH - update category
exports.updateCategory = errorHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    const dbCategory = await Categories.findOne({
        where: { id: categoryId, status: 'active' },
    });

    if (!dbCategory) {
        return next(new AppError('Category not found', 404));
    }

    await dbCategory.update({ name });

    res.status(200).json({ status: 'updated' });
});
