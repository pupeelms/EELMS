const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Unique filename
  }
});

// Initialize upload with fileFilter
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Allow only specific file types
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' &&
        ext !== '.pdf' && ext !== '.xls' && ext !== '.xlsx') {
      return cb(new Error('Only images, PDFs, and Excel files are allowed'));
    }
    cb(null, true);
  }
});

module.exports = upload;
