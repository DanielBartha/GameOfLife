const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Multer setup for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve static files from the 'public' directory (your Vite-built frontend)
app.use(express.static(path.join(__dirname, 'public')));

// POST endpoint for saving uploaded image
app.post('/save-image', upload.single('file'), (req, res) => {
    res.sendStatus(200);
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
