const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

module.exports.createOrder = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ userId: userId });
        if (!cart || cart.cartItems.length === 0) {
            return res.status(404).json({ error: 'No Items to Checkout' });
        }

        const order = new Order({
            userId: userId,
            productsOrdered: cart.cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                subtotal: item.subtotal || 0
            })),
            totalPrice: cart.totalPrice,
            orderedOn: new Date(),
            status: 'Pending',
        });

        await order.save();
        await Cart.findOneAndUpdate(
            { userId: userId },
            { cartItems: [], totalPrice: 0 }
        );

        res.status(201).json({ message: 'Ordered Successfully' });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.getUserOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const orders = await Order.find({ userId: userId })
            .populate({
                path: 'productsOrdered.productId',
                select: 'name price'
            });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'No orders found for this user.' });
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error retrieving user orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.getAllOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const orders = await Order.find()
            .populate({
                path: 'productsOrdered.productId',
                select: 'name price'
            })
            .populate({
                path: 'userId',
                select: 'firstName lastName'
            });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'No orders found.' });
        }

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            userId: order.userId ? order.userId : { firstName: 'Unknown', lastName: 'User' },
            productsOrdered: order.productsOrdered.map(item => ({
                productId: item.productId ? item.productId : { name: 'Unknown Product', price: 0 },
                quantity: item.quantity,
                subtotal: item.subtotal || 0,
                _id: item._id
            })),
            totalPrice: order.totalPrice,
            status: order.status,
            orderedOn: order.orderedOn,
            __v: order.__v
        }));

        res.status(200).json({ orders: formattedOrders });
    } catch (error) {
        console.error('Error retrieving all orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
