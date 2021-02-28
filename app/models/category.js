const mongoose = require('mongoose');
const { strike } = require('pdfkit');

const Category = new mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String, required: true},
    image: {type: String, default: ''}
});

module.exports = mongoose.model('Category', Category);