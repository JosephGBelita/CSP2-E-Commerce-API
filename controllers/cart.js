const Cart = require("../models/Cart");
const Product = require('../models/Product'); 
const auth = require("../auth");
const { errorHandler } = auth;

module.exports.addToCart = async (req, res) => { 
    if (req.user.isAdmin) {
        return res.status(403).send({ error: 'Admin is forbidden' });
    }

    try {
        const cartItems = req.body.cartItems;

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).send({ error: 'No products provided' });
        }

        const productIds = cartItems.map(item => item.productId);
        const products = await Product.find({ '_id': { $in: productIds } });

        if (products.length === 0) {
            return res.status(404).send({ error: 'No products found' });
        }

        const updatedCartItems = products.map(product => {
            const cartItem = cartItems.find(item => item.productId.toString() === product._id.toString());
            return {
                productId: product._id,
                productName: product.name, 
                quantity: cartItem.quantity,
                subtotal: product.price * cartItem.quantity,
                price: product.price 
            };
        });

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, cartItems: [], totalPrice: 0 });
        }

        updatedCartItems.forEach(newItem => {
            const existingItem = cart.cartItems.find(item => item.productId.toString() === newItem.productId.toString());

            if (existingItem) {
                existingItem.quantity += newItem.quantity;
                existingItem.subtotal += newItem.subtotal;
            } else {
                cart.cartItems.push(newItem);
            }
        });

        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        const savedCart = await cart.save();
        return res.status(201).send({
            success: true,
            message: 'Items added to cart successfully',
            cart: savedCart
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.getCart = (req, res) => {
    Cart.findOne({ userId: req.user.id })
        .then(cart => {
            if (cart) {
                return res.status(200).send({ cart });
            }
            return res.status(404).send({ error: 'Cart is empty' });
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.updateCartQuantity = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const userId = req.user.id;

        if (!itemId || quantity === undefined || quantity <= 0) {
            return res.status(400).send({ error: 'Valid item ID and positive quantity are required.' });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found.' });
        }

        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

        const item = cart.cartItems[itemIndex];
        const product = await Product.findById(item.productId);
        
        if (!product) {
            return res.status(404).send({ error: 'Product not found.' });
        }

        item.quantity = quantity;
        item.subtotal = product.price * quantity;

        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        const updatedCart = await cart.save();

        return res.status(200).send({
            message: 'Item quantity updated successfully',
            updatedCart
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.removeFromCart = async (req, res) => {
    try {
        if (!req.user || req.user.isAdmin) {
            return res.status(403).send({ error: 'Access forbidden for admin users.' });
        }
        
        const { productId } = req.params;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).send({ error: 'Product ID is required.' });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found.' });
        }

        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

        const removedItem = cart.cartItems[itemIndex];
        cart.cartItems.splice(itemIndex, 1);

        cart.totalPrice -= removedItem.subtotal;
        const updatedCart = await cart.save();

        return res.status(200).send({
            message: 'Item removed from cart successfully',
            updatedCart
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.clearCart = async (req, res) => {
    try {
        if (!req.user || req.user.isAdmin) {
            return res.status(403).send({ error: 'Access forbidden for admin users.' });
        }

        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found.' });
        }

        cart.cartItems = [];
        cart.totalPrice = 0;

        const updatedCart = await cart.save();

        return res.status(200).send({
            message: 'Cart cleared successfully',
            cart: updatedCart
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};