const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');
const Blog = require('./models/blog'); // Ensure this path is correct

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Appends the file extension
    }
});

const upload = multer({ storage: storage });

// DB Connection
const dbURI = 'Add your database link';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.static('uploads'));

app.get('/', async(req, res) => {
    try {
        const blogs = await Blog.find();
        res.render('index', { items: blogs });
    } catch (err) {
        res.status(500).render('error', { errorMessage: 'Failed to retrieve blogs.' });
    }
});

app.get('/create', (req, res) => {
    res.render('create', { error: '' });
});

app.post('/create', upload.single('photo'), async(req, res) => {
    const { name, details } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !details) {
        res.render('create', { error: 'All fields are required.' });
    } else {
        const newBlog = new Blog({ name, details, photo });
        try {
            await newBlog.save();
            res.redirect('/');
        } catch (err) {
            res.status(500).render('error', { errorMessage: 'Failed to create blog.' });
        }
    }
});

app.get('/blogs/:id', async(req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            res.render('show', { blog: blog });
        } else {
            res.status(404).render('error', { errorMessage: 'Blog not found.' });
        }
    } catch (err) {
        res.status(500).render('error', { errorMessage: 'Failed to retrieve blog.' });
    }
});

app.use((req, res) => {
    res.status(404).render('error', { errorMessage: 'Page not found' });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});