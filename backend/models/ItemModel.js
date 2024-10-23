const mongoose = require('mongoose');
const bwipjs = require('bwip-js'); // Barcode generation library

// Custom function to generate barcode number and base64 image
function generateBarcode() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
  const barcodeNumber = `BC${randomNumber}`;

  // Generate barcode image and convert it to base64
  return new Promise((resolve, reject) => { 
    bwipjs.toBuffer({
      bcid: 'code128',       // Barcode type
      text: barcodeNumber,   // Text to encode
      scale: 3,              // 3x scaling factor
      height: 10,            // Bar height, in millimeters
      includetext: true,     // Show human-readable text
      textxalign: 'center',  // Align text to the center
    }, function (err, png) {
      if (err) {
        reject(err);
      } else {
        const base64Image = png.toString('base64'); // Convert image buffer to base64
        resolve({ barcodeNumber, base64Image });
      }
    });
  });
}

const ItemSchema = new mongoose.Schema({
  itemBarcode: { 
    type: String, 
    unique: true,
  },
  barcodeImage: { // Store barcode image as a base64 string
    type: String,
  },
  itemName: { 
    type: String,  
    required: true,
  },
  image: {
    type: String, // Store image URL or path
    default: '' // Optional: set a default value or leave it blank
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', 
  },
  brand: {
    type: String,
  },
  model: { 
    type: String 
  },
  manufacturer: {
    type: String, // Added Manufacturer field
  },
  description: { 
    type: String, 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  serialNumber: { 
    type: String, // Added Serial Number field
  },
  pupPropertyNumber: { 
    type: String, // Added PUP Property Number field
  },
  number: { 
    type: Number, // Added Number field (separate from quantity)
  },
  condition: {
    type: String,
    enum: ['Functional', 'Defective', 'For Disposal'], // Updated Condition options
    default: '',
  },
  location: { 
    type: String,  
  },
  pmNeeded: {
    type: String,
    enum: ['Yes', 'No'], 
    default: '',
    required: true
  }, 
  pmFrequency: { 
    type: String, // Changed from calibrationFrequency to pmFrequency
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Other'],
  },
  specification: {
    type: String, // Added Specification field
  },
  notesComments: {
    type: String,
  },
  maintenanceSchedule: [{
    week: { type: String }, // e.g., 'Week 1', 'Week 2'
    status: { type: String, enum: ['Pending', 'Completed', 'Skipped'], default: 'Pending' }
  }]
}, { 
  timestamps: true,
});

// Hook to generate barcode before saving the document
ItemSchema.pre('save', async function (next) {
  if (!this.itemBarcode || !this.barcodeImage) {
    try {
      const { barcodeNumber, base64Image } = await generateBarcode();
      this.itemBarcode = barcodeNumber;
      this.barcodeImage = base64Image;
    } catch (error) {
      next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Item', ItemSchema);
