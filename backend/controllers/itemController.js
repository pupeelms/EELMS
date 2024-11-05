const Item = require('../models/ItemModel');
const Category = require('../models/CategoryModel');
const { createNotification } = require('../utils/notificationService');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');
const path = require('path'); 
const fs = require('fs');

const LOW_STOCK_THRESHOLD = 2;
const OUT_OF_STOCK_THRESHOLD = 0;

// Create new item
exports.createItem = async (req, res) => {
  console.log('Received fields:', req.body); // Log received fields
  console.log('Received file:', req.file);   // Log received file

  try {
    const file = req.file; // Get the uploaded file
    let imagePath = '';    // Variable to hold the Cloudinary URL

    const uploadFolder = 'items'; // Define the folder in Cloudinary

    // If a file is uploaded, upload it to Cloudinary
    if (file) {
      imagePath = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: uploadFolder, // Specify the folder for the image
          },
          (error, result) => {
            if (error) {
              return reject(new Error('Cloudinary upload failed: ' + error.message));
            }
            resolve(result.secure_url); // Resolve with the secure URL
          }
        );

        // Stream the buffer directly to Cloudinary
        require('streamifier').createReadStream(file.buffer).pipe(uploadStream);
      });
    } else {
      console.error('No file uploaded, creating item without image.');
    }

    const { itemName, quantity, condition, category, categoryName, newCategory, pmNeeded, pmFrequency } = req.body;

    if (!itemName || !quantity || !condition) {
      return res.status(400).json({ error: 'Item name, quantity, or status are required.' });
    }

    let categoryDoc;

    // Priority: Check for category ID, new category, then category name
    if (category && mongoose.isValidObjectId(category.trim())) {
      categoryDoc = await Category.findById(category.trim());
      if (!categoryDoc) {
        return res.status(400).json({ error: 'Invalid category ID.' });
      }
    } else if (newCategory && newCategory.trim() !== '') {
      // Create new category if provided
      categoryDoc = await Category.findOne({ categoryName: newCategory.trim() });
      if (!categoryDoc) {
        categoryDoc = new Category({ categoryName: newCategory.trim() });
        await categoryDoc.save();
      }
    } else if (categoryName && categoryName.trim() !== '') {
      // Check for existing category by name
      categoryDoc = await Category.findOne({ categoryName: categoryName.trim() });
      if (!categoryDoc) {
        return res.status(400).json({ error: 'Invalid category name provided.' });
      }
    } else {
      return res.status(400).json({ error: 'Category is required.' });
    }

    // Initialize maintenanceSchedule based on pmNeeded and pmFrequency
let maintenanceSchedule = [];

if (pmNeeded === 'Yes') {
  switch (pmFrequency) {
    case 'Daily':
      // Assuming daily means every week
      maintenanceSchedule = Array.from({ length: 52 }, (_, i) => ({
        week: `Week ${i + 1}`,
        status: 'Pending',
      }));
      break;
    case 'Weekly':
      // Weekly maintenance for every week of the year
      maintenanceSchedule = Array.from({ length: 52 }, (_, i) => ({
        week: `Week ${i + 1}`,
        status: 'Pending',
      }));
      break;
    case 'Monthly':
      // Hardcoded specific weeks for monthly maintenance
      maintenanceSchedule = [
        { week: `Week 2`, status: 'Pending' },
        { week: `Week 7`, status: 'Pending' },
        { week: `Week 11`, status: 'Pending' },
        { week: `Week 15`, status: 'Pending' },
        { week: `Week 19`, status: 'Pending' },
        { week: `Week 24`, status: 'Pending' },
        { week: `Week 28`, status: 'Pending' },
        { week: `Week 33`, status: 'Pending' },
        { week: `Week 37`, status: 'Pending' },
        { week: `Week 41`, status: 'Pending' },
        { week: `Week 46`, status: 'Pending' },
        { week: `Week 50`, status: 'Pending' },
      ];
      break;
    case 'Quarterly':
      // Hardcoded specific weeks for quarterly maintenance
      maintenanceSchedule = [
        { week: `Week 2`, status: 'Pending' },
        { week: `Week 15`, status: 'Pending' },
        { week: `Week 28`, status: 'Pending' },
        { week: `Week 41`, status: 'Pending' },
      ];
      break;
    case 'Annually':
      // Hardcoded specific week for annual maintenance
      maintenanceSchedule = [
        { week: `Week 5`, status: 'Pending' },
      ];
      break;
    default:
      maintenanceSchedule = []; // No maintenance if frequency is undefined or something else
  }
}


    // Create new item with the initialized maintenanceSchedule
    const newItem = new Item({
      ...req.body,
      category: categoryDoc ? categoryDoc._id : null,
      image: imagePath, // Assign the uploaded image URL
      maintenanceSchedule, // Add initialized schedule here
    });

    await newItem.save();

    // Increment category item count
    if (categoryDoc) {
      await Category.findByIdAndUpdate(categoryDoc._id, { $inc: { itemCount: 1 } });
    }

    // Notifications for stock levels
    if (newItem.quantity <= LOW_STOCK_THRESHOLD && newItem.quantity > OUT_OF_STOCK_THRESHOLD) {
      await createNotification('Low Stock', `Item ${newItem.itemName} has low stock.`);
    } else if (newItem.quantity <= OUT_OF_STOCK_THRESHOLD) {
      await createNotification('Out of Stock', `Item ${newItem.itemName} is out of stock.`);
    }

    // Notify admin of new item
    await createNotification('New Item Added', `A new item has been added: ${newItem.itemName}.`);

    res.status(201).json({ message: "Item created successfully", newItem });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
};

//----------------------------------------------------------------
// Helper function to generate the maintenance schedule based on pmFrequency
const generateMaintenanceSchedule = (pmNeeded, pmFrequency) => {
  if (pmNeeded === 'Yes' && pmFrequency) {
    switch (pmFrequency) {
      case 'Daily':
        // Assuming daily means every week
        return Array.from({ length: 52 }, (_, i) => ({
          week: `Week ${i + 1}`,
          status: 'Pending',
        }));
      case 'Weekly':
        // Weekly maintenance for every week of the year
        return Array.from({ length: 52 }, (_, i) => ({
          week: `Week ${i + 1}`,
          status: 'Pending',
        }));
      case 'Monthly':
        // Hardcoded specific weeks for monthly maintenance
        return [
          { week: `Week 2`, status: 'Pending' },
          { week: `Week 7`, status: 'Pending' },
          { week: `Week 11`, status: 'Pending' },
          { week: `Week 15`, status: 'Pending' },
          { week: `Week 19`, status: 'Pending' },
          { week: `Week 24`, status: 'Pending' },
          { week: `Week 28`, status: 'Pending' },
          { week: `Week 33`, status: 'Pending' },
          { week: `Week 37`, status: 'Pending' },
          { week: `Week 41`, status: 'Pending' },
          { week: `Week 46`, status: 'Pending' },
          { week: `Week 50`, status: 'Pending' },
        ];
      case 'Quarterly':
        // Hardcoded specific weeks for quarterly maintenance
        return [
          { week: `Week 2`, status: 'Pending' },
          { week: `Week 15`, status: 'Pending' },
          { week: `Week 28`, status: 'Pending' },
          { week: `Week 41`, status: 'Pending' },
        ];
      case 'Annually':
        // Hardcoded specific week for annual maintenance
        return [
          { week: `Week 5`, status: 'Pending' },
        ];
      default:
        return []; // No maintenance if frequency is undefined or something else
    }
  }
  return []; // No maintenance if pmNeeded is not 'Yes'
};


/// Update item details
exports.updateItem = async (req, res) => {
  console.log('Received fields:', req.body); // Log received fields
  console.log('Received file:', req.file);   // Log received file

  try {
    const file = req.file;
    let imagePath = '';

    const uploadFolder = 'items';

    // If a file is uploaded, upload it to Cloudinary
    if (file) {
      imagePath = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: uploadFolder, // Specify the folder
          },
          (error, result) => {
            if (error) {
              return reject(new Error('Cloudinary upload failed: ' + error.message));
            }
            resolve(result.secure_url); // Resolve with the secure URL
          }
        );

        // Stream the buffer directly to Cloudinary
        require('streamifier').createReadStream(file.buffer).pipe(uploadStream);
      });
    }

    // Find the item by ID
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const oldCategoryId = item.category;
    const { category, newCategory, categoryName, quantity, pmNeeded, pmFrequency } = req.body;

    let categoryDoc;

    // Category update logic
    if (mongoose.isValidObjectId(category)) {
      categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({ error: 'Invalid category ID.' });
      }
    } else if (newCategory && newCategory.trim() !== '') {
      categoryDoc = await Category.findOne({ categoryName: newCategory.trim() });
      if (!categoryDoc) {
        categoryDoc = new Category({ categoryName: newCategory.trim() });
        await categoryDoc.save();
      }
    } else if (categoryName && categoryName.trim() !== '') {
      categoryDoc = await Category.findOne({ categoryName: categoryName.trim() });
      if (!categoryDoc) {
        return res.status(400).json({ error: 'Invalid category name provided.' });
      }
    }

    // Update item details
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        category: categoryDoc ? categoryDoc._id : oldCategoryId,
        image: imagePath || item.image, // Use the new image path if uploaded
         // Add this line to update the maintenance schedule
         maintenanceSchedule: generateMaintenanceSchedule(pmNeeded, pmFrequency)

      },
      { new: true }
    ).populate('category');

    // Adjust category counts if the category has changed
    if (oldCategoryId && oldCategoryId.toString() !== updatedItem.category.toString()) {
      await Category.findByIdAndUpdate(oldCategoryId, { $inc: { itemCount: -1 } });
      await Category.findByIdAndUpdate(updatedItem.category, { $inc: { itemCount: 1 } });
    }

    // Update quantity and trigger notifications
    const newQuantity = updatedItem.quantity;
    if (newQuantity !== undefined) {
      if (newQuantity <= OUT_OF_STOCK_THRESHOLD) {
        await createNotification('Out of Stock', `Item ${updatedItem.itemName} is out of stock.`);
      } else if (newQuantity <= LOW_STOCK_THRESHOLD) {
        await createNotification('Low Stock', `Item ${updatedItem.itemName} has low stock.`);
      }
    }

    res.status(200).json({ message: 'Item updated successfully', updatedItem });
  } catch (error) {
    console.error('Error updating item:', error.message);
    res.status(500).json({ error: error.message });
  }
};


//----------------------------------------------------------
// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('category', 'categoryName');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format' });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const itemsByCategory = await Item.find({ category: categoryId }).populate('category');
    if (!itemsByCategory || itemsByCategory.length === 0) {
      return res.status(404).json({ message: 'No items found for this category' });
    }

    res.status(200).json(itemsByCategory);
  } catch (err) {
    console.error('Error fetching items by category:', err.message);
    res.status(500).json({ error: 'An error occurred while fetching items' });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const categoryId = item.category;
    await Item.findByIdAndDelete(req.params.id);

    await Category.findByIdAndUpdate(categoryId, { $inc: { itemCount: -1 } });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get item by barcode
exports.getItemByBarcode = async (req, res) => {
  try {
    const { itemBarcode } = req.params;
    if (!itemBarcode) {
      return res.status(400).json({ message: 'Item barcode is required' });
    }

    const item = await Item.findOne({ itemBarcode });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Item.find({ 
      quantity: { $gt: OUT_OF_STOCK_THRESHOLD, $lte: LOW_STOCK_THRESHOLD } 
    });
    res.status(200).json(lowStockItems);
  } catch (err) {
    console.error("Error fetching low stock items:", err); // Log the error for debugging
    res.status(500).json({ error: "An error occurred while fetching low stock items" });
  }
};

// Get out-of-stock items
exports.getOutOfStockItems = async (req, res) => {
  try {
    const outOfStockItems = await Item.find({ quantity: { $lte: OUT_OF_STOCK_THRESHOLD } });
    res.status(200).json(outOfStockItems);
  } catch (err) {
    console.error("Error fetching out-of-stock items:", err); // Log the error for debugging
    res.status(500).json({ error: "An error occurred while fetching out-of-stock items" });
  }
};

// Get all maintenance schedules for an item by item ID
exports.getMaintenanceSchedule = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Find the item by its ID and return its maintenance schedule
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(item.maintenanceSchedule);
  } catch (err) {
    console.error('Error retrieving maintenance schedule:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update the maintenance status for a specific week
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { weekNumber, status } = req.body; // Accept the week number and new status
    const itemId = req.params.itemId;

    // Check for valid inputs
    if (!weekNumber || !status) {
      return res.status(400).json({ error: 'Week number and status are required.' });
    }

    // Ensure weekNumber is a valid number between 1 and 52
    const weekNum = parseInt(weekNumber);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 52) {
      return res.status(400).json({ error: 'Week number must be a number between 1 and 52.' });
    }

    // Find the item by its ID
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Determine the maintenance frequency of the item
    const pmFrequency = item.pmFrequency; // Assuming pmFrequency is a field in your item model

    // Format the week number based on the frequency
    let formattedWeek;
    switch (pmFrequency) {
      case "Annually":
        formattedWeek = `Week ${weekNum}`; // Only one maintenance per year (assumed to be the first week)
        break;
      case "Quarterly":
        formattedWeek = `Week ${weekNum}`; // Convert week number to quarterly format
        break;
      case "Monthly":
        formattedWeek = `Week ${weekNum}`; // Format as 'Week X'
        break;
      case "Weekly":
        formattedWeek = `Week ${weekNum}`; // Format as 'Week X'
        break;
      case "Daily":
        formattedWeek = `Week ${weekNum}`; // Format as 'Day X' (optional, as typically this would not fit a weekly structure)
        break;  
      default:
        return res.status(400).json({ error: 'Invalid maintenance frequency.' });
    }

    // Update the specific week in the maintenance schedule
    const updatedSchedule = item.maintenanceSchedule.map((schedule) =>
      schedule.week === formattedWeek ? { ...schedule, status } : schedule
    );

    item.maintenanceSchedule = updatedSchedule;

    // Save the updated item and handle potential errors
    try {
      await item.save();
    } catch (saveError) {
      console.error('Error saving item:', saveError);
      return res.status(500).json({ error: 'Failed to update item in the database.' });
    }

    // Log the updated schedule for verification
    console.log("Updated Schedule:", updatedSchedule);

    res.status(200).json({ message: 'Maintenance status updated successfully', updatedSchedule });
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    res.status(500).json({ error: err.message });
  }
};
