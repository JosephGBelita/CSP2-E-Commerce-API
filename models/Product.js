const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product Name is Required']
    },
    description: {
        type: String,
        required: [true, 'Product Description is Required']
    },
    price: {
        type: Number,
        required: [true, 'Product Price is Required']
    },
    category: {
        type: String,
        enum: ['Laptops & Computers', 'Smartphones & Tablets', 'Gaming', 'Audio', 'Accessories'],
        default: 'Accessories',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        default: ''
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);