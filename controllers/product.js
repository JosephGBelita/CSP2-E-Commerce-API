const Product = require("../models/Product");
const User = require("../models/User");
const { errorHandler } = require("../auth");

module.exports.addProduct = (req, res) => {
    let newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category || 'Accessories',
        imageUrl: req.body.imageUrl || ''
    });

    Product.findOne({ name: req.body.name })
    .then(existingProduct => {
        if (existingProduct) {
            return res.status(409).send({ error: 'Product already exists' });
        } else {
            return newProduct.save()
            .then(result => res.status(201).send({
                success: true,
                message: 'Product added successfully',
                result: result
            }))
            .catch(error => errorHandler(error, req, res));
        }
    }).catch(error => errorHandler(error, req, res));
};

module.exports.getAllProducts = (req, res) => {
    return Product.find({})
    .then(result => {
        if (result.length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ error: 'No products found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getAllActiveProducts = (req, res) => {
    Product.find({ isActive: true })
    .then(result => {
        if (result.length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ error: 'No active products found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getProduct = (req, res) => {
    Product.findById(req.params.productId)
    .then(product => {
        if (product) {
            return res.status(200).send(product);
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.updateProduct = (req, res) => {
    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        imageUrl: req.body.imageUrl
    };

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {
            res.status(200).send({ 
                success: true, 
                message: 'Product updated successfully'
            });
        } else {
            res.status(404).send({ error: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.archiveProduct = (req, res) => {
    let updateActiveField = { isActive: false };

    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (product) {
            if (!product.isActive) {
                return res.status(200).send({ 
                    message: 'Product already archived',
                    archivedProduct: product
                });
            }
            return res.status(200).send({ 
                success: true, 
                message: 'Product archived successfully' 
            });
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.activateProduct = (req, res) => {
    let updateActiveField = { isActive: true };

    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (product) {
            if (product.isActive) {
                return res.status(200).send({ 
                    message: 'Product already active',
                    activateProduct: product
                });
            }
            return res.status(200).send({ 
                success: true, 
                message: 'Product activated successfully' 
            });
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.searchProductsByName = async (req, res) => {
    try {
        const { productName } = req.body;

        console.log('Search query received:', productName);

        if (!productName || productName.trim() === '') {
            return res.status(400).json({ 
                success: false,
                message: 'Product name is required',
                error: 'MISSING_PRODUCT_NAME'
            });
        }

        // Use exact phrase matching instead of splitting words
        const searchRegex = new RegExp(productName.trim(), 'i');
        
        const products = await Product.find({
            name: searchRegex,
            isActive: true
        });

        console.log('Exact match products:', products.length);
        console.log('Exact match product names:', products.map(p => p.name));

        if (products.length > 0) {
            return res.status(200).json({
                success: true,
                message: `Found ${products.length} product(s) matching "${productName}"`,
                data: products,
                count: products.length
            });
        } else {
            return res.status(404).json({
                success: false,
                message: `No products found matching "${productName}"`,
                data: [],
                count: 0
            });
        }

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during search',
            error: 'SEARCH_SERVER_ERROR'
        });
    }
};

module.exports.searchProductsByPrice = (req, res) => {
    let minPrice = req.body.minPrice || 0;
    let maxPrice = req.body.maxPrice || Number.MAX_SAFE_INTEGER;

    Product.find({ 
        price: { $gte: minPrice, $lte: maxPrice },
        isActive: true 
    })
    .then(products => {
        if (products.length > 0) {
            return res.status(200).send(products);
        } else {
            return res.status(404).send({ error: 'No products found within the price range' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const validCategories = ['Laptops & Computers', 'Smartphones & Tablets', 'Gaming', 'Audio', 'Accessories'];
        
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category',
                error: 'INVALID_CATEGORY'
            });
        }

        const products = await Product.find({
            category: category,
            isActive: true
        });

        if (products.length > 0) {
            return res.status(200).json({
                success: true,
                message: `Found ${products.length} products in ${category} category`,
                data: products,
                count: products.length
            });
        } else {
            return res.status(404).json({
                success: false,
                message: `No products found in ${category} category`,
                data: [],
                count: 0
            });
        }
    } catch (error) {
        console.error('Category search error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'CATEGORY_SEARCH_ERROR'
        });
    }
};

module.exports.uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No image file uploaded' 
            });
        }

        const imageUrl = `/images/products/${req.file.filename}`;
        
        res.json({ 
            success: true, 
            imageUrl: imageUrl,
            message: 'Image uploaded successfully'
        });
        
    } catch (error) {
        console.error('Upload error details:', error);
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'Image must be less than 2MB' 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// ADD THIS EXPORT - THIS IS WHAT'S MISSING!
module.exports.getNewArrivals = (req, res) => {
    Product.find({ 
        isActive: true,
        isNewArrival: true 
    })
    .sort({ createdOn: -1 })
    .limit(8)
    .then(result => {
        console.log('Found new arrivals:', result.length);
        // ALWAYS return an array, even if empty
        return res.status(200).send(result);
    })
    .catch(error => {
        console.error('Error in getNewArrivals:', error);
        // Return empty array instead of error object
        return res.status(200).send([]);
    });
};