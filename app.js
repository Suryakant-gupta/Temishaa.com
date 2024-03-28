const express = require("express");
const mongoose = require("mongoose")
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Product = require("./models/product");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");


// making connection with mongodb and checking if any error occured
main().then(() => {
    console.log("connected to the DB");
}).catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Temishaa");
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use('/temishaa/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
    res.redirect("/temishaa/home");
})

app.get("/temishaa/home", async (req, res) => {
    try {
        // Query the database for products related to the Jwellery page
        const products = await Product.find({ page: "index" });
        const currentPage = "index";
        res.render("index", { products, currentPage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
})

app.get("/temishaa/about", (req, res) => {
    res.render("about");
})

app.get("/temishaa/newarrivals", async (req, res) => {
    try {
        // Query the database for products related to anotherPage
        const products = await Product.find({ page: "newArrivals" });
        const currentPage = "newArrivals";
        res.render("newArrivals", { products, currentPage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
})

app.get("/temishaa/homedecor", async (req, res) => {
    try {
        // Query the database for products related to the Jwellery page
        const products = await Product.find({ page: "homeDecor" });
        const currentPage = "homeDecor";
        res.render("homeDecor", { products, currentPage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
})

app.get("/temishaa/jwellery", async (req, res) => {
    try {
        const products = await Product.find({ page: "jwellery" });
        // console.log(products);
        const currentPage = "jwellery";
        res.render("jwellery", { products, currentPage });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get("/temishaa/contact", (req, res) => {
    res.render("contact");
})

app.get("/temishaa/admin", (req, res) => {
    res.render("admin");
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const extension = file.originalname.split('.').pop();
        const filename = `${uuidv4()}.${extension}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

const generateUniqueArticleNumber = async () => {
    let articleNumber;
    const existingArticleNumbers = new Set();
    while (!articleNumber || existingArticleNumbers.has(articleNumber)) {
        // Generate random numbers and letters
        const randomDigits = Math.floor(100 + Math.random() * 900);
        const randomLetters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));

        // Combine random numbers and letters
        articleNumber = `${randomDigits}${randomLetters}`;

        // Check uniqueness
        const existingProduct = await Product.findOne({ articleNumber });
        if (!existingProduct) {
            break;
        }
        existingArticleNumbers.add(articleNumber);
    }
    return articleNumber;
};

app.post('/temishaa/admin', upload.single('image'), async (req, res) => {
    try {
        const { description, page, name } = req.body;
        const image = req.file.path;
        const category = page;
        const articleNumber = await generateUniqueArticleNumber();

        // Save form data to the database
        const product = new Product({ description, image, page, articleNumber, name, category });
        // console.log(product);
        // console.log(product);

        // Logic to determine where to redirect after product upload
        let redirectPage = "/temishaa/newArrivals"; // Default page
        if (page === "jwellery") {
            redirectPage = "/temishaa/jwellery";
        } else if (page === "homeDecor") {
            redirectPage = "/temishaa/homedecor";
        }
        else if (page === "index") {
            // redirectPage = "/temishaa/home";
            redirectPage = "/temishaa/home";
        }
        // Add other page redirects as needed

        await product.save();
        res.redirect(redirectPage);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/temishaa/:productId', async (req, res) => {
    try {
        const page = req.params.page;
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        // console.log(product);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('view', { product, currentPage: page });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/temishaa/details', (req, res) => {
    // Extract form data
    const formData = req.body;
    // console.log("Form data:", formData);
    let message = "Form Data:\n";
    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            message += `${key}: ${formData[key]}\n`;
        }
    }

    // Create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'temishaainfo@gmail.com', // Replace with your Gmail email
            pass: 'xnow eize ydgh rjpo' // Replace with your Gmail password
        }
    });

    // Construct email message
    let mailOptions = {
        from: 'temishaainfo@gmail.com', // Replace with your Gmail email
        to: 'temishaainfo@gmail.com', // Replace with recipient's email
        subject: 'New Form Submission',
        text: message
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            res.status(500).send("Error sending email");
        } else {
            console.log("Email sent:", info.response);
            const referer = req.header('referer') || '/'; // Default to home page if referer is not present
            res.redirect(referer);
        }
    });
});

app.all("*", (req, res) => {
    res.render("error");
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
})