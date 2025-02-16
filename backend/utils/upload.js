/* This JavaScript code snippet is setting up a file upload configuration using the `multer` middleware
in a Node.js application. Here's a breakdown of what each part of the code is doing: */

const multer = require('multer');
const path = require('path');

// Only keep memory storage (no files saved to disk)
const storage = multer.memoryStorage();

// Initialize upload with fileFilter
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Allow only specific file types
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' &&
        ext !== '.pdf' && ext !== '.xls' && ext !== '.xlsx') {
      return cb(new Error('Only images, PDFs, and Excel files are allowed'));
    }
    cb(null, true);
  }
});

module.exports = upload;
