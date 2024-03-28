const mongoose = require("mongoose")

const Schema = mongoose.Schema;


// link for default image


// new schema to show listing and tell what data to take/show on listings
const productSchema = new Schema({
    name: String,
    description: String,
    image: String, // Store path to image
    page: String,
    articleNumber: String,
    category: String
});




// making our model so that we will be elilgible to insert data into db
const Product = mongoose.model("Product", productSchema);

module.exports = Product;