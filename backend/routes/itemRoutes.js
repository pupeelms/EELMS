const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const borrowReturnController = require('../controllers/borrowReturnController');
const authMiddleware = require('../middleware/authMiddleware'); 
const multer = require('multer');
const upload = require('../utils/upload')

// Routes
router.post('/create', upload.single('image'), authMiddleware, itemController.createItem);
router.put('/:id', upload.single('image'), authMiddleware, itemController.updateItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);
router.put('/:itemId/schedule/update', authMiddleware, itemController.updateMaintenanceStatus);
router.get('/item-conditions', itemController.getItemConditionCounts);

// Public routes
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.get('/category/:categoryId', itemController.getItemsByCategory);
router.get('/barcode/:itemBarcode', itemController.getItemByBarcode);
router.get('/items/low-stock', itemController.getLowStockItems);
router.get('/items/out-of-stock', itemController.getOutOfStockItems);
router.get('/barcode/:itemBarcode/transactions', borrowReturnController.getItemTransactions);

// Get the maintenance schedule for a specific item
router.get('/:itemId/schedule', itemController.getMaintenanceSchedule);

module.exports = router;
