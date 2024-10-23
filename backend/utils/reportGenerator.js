// server/utils/reportUtils.js
const BorrowReturnLog = require('../models/BorrowReturnLogModel');
const Item = require('../models/ItemModel');

const dailyReport = async () => {
    try {
        // Set the start of the day to 7 AM
        const startOfDay = new Date();
        startOfDay.setHours(15, 0, 0, 0);

        // Set the end of the day to 10 PM
        const endOfDay = new Date();
        endOfDay.setHours(22, 0, 0, 0);

        // Fetch initial stock values from the Item collection
        const items = await Item.find({});
        const startingStock = {};
        items.forEach(item => {
            if (item.itemName) {
                startingStock[item.itemName] = item.quantity;
            } else {
                console.warn('Item name is missing or undefined:', item);
            }
        });

        // Fetch transactions for the day
        const transactions = await BorrowReturnLog.find({
            dateTime: { $gte: startOfDay, $lte: endOfDay }
        });

        let totalBorrowed = 0;
        let totalReturned = 0;
        const endingStock = { ...startingStock }; // Copy starting stock to calculate ending stock
        const pendingReturns = [];
        const overdueItems = [];
        const itemUsage = {};
        const userActivity = {};

        transactions.forEach((transaction) => {
            console.log('Processing transaction:', transaction); // Log transaction data

            // Calculate totals based on quantityBorrowed and quantityReturned
            if (transaction.transactionType === 'Returned') {
                totalBorrowed += transaction.items.reduce((acc, item) => acc + item.quantityBorrowed, 0);
                totalReturned += transaction.items.reduce((acc, item) => acc + item.quantityReturned, 0);
            }

            // Track stock levels
            transaction.items.forEach((item) => {
                const itemName = item.itemName;
                console.log('Item from transaction:', itemName); // Log item names
                if (itemName) {
                    if (!endingStock[itemName]) {
                        endingStock[itemName] = startingStock[itemName] || 0;
                    }

                    if (transaction.transactionType === 'Borrowed') {
                        endingStock[itemName] -= item.quantityBorrowed;
                    } else if (transaction.transactionType === 'Returned') {
                        endingStock[itemName] += item.quantityReturned;
                    }

                    // Track item usage
                    if (!itemUsage[itemName]) {
                        itemUsage[itemName] = 0;
                    }
                    itemUsage[itemName] += item.quantityBorrowed + item.quantityReturned;
                } else {
                    console.warn('Item name is missing or undefined in transaction:', item);
                }
            });

            // Track user activity
            if (!userActivity[transaction.userName]) {
                userActivity[transaction.userName] = 0;
            }
            userActivity[transaction.userName] += transaction.items.reduce((acc, item) => acc + item.quantityBorrowed + item.quantityReturned, 0);

            // Track pending returns
            if (transaction.returnStatus === 'Pending') {
                console.log('Found pending transaction:', transaction); // Log pending transactions
                pendingReturns.push({
                    _id: transaction._id,
                    itemName: transaction.items
                        .map(item => item.itemName) // Extract item names
                        .join(', '), // Join names into a string
                    userName: transaction.userName,
                    dueDate: transaction.borrowedDuration, // Assume borrowedDuration is the due date
                    status: transaction.returnStatus,
                });
            }

            // Track overdue items
            if (transaction.returnStatus === 'Overdue') {
                    overdueItems.push({
                        _id: transaction._id,
                        itemName: transaction.items
                            .map(item => item.itemName) // Extract item names
                            .join(', '), // Join names into a string
                        userName: transaction.userName,
                        dueDate: transaction.borrowedDuration,
                        status: transaction.returnStatus,
                    });
                }
            
        });

        // Determine top borrower and top borrowed item
        const topBorrower = Object.keys(userActivity).reduce((a, b) => userActivity[a] > userActivity[b] ? a : b, null);
        const topBorrowedItem = Object.keys(itemUsage).reduce((a, b) => itemUsage[a] > itemUsage[b] ? a : b, null);

        // Low stock alerts
        const lowStockAlerts = Object.keys(endingStock).filter(itemName => endingStock[itemName] < 2); // Adjust threshold if needed

        // Return the report
        return {
            date: new Date().toDateString(),
            summary: {
                totalBorrowed,
                totalReturned,
                totalTransactions: transactions.length,
            },
            transactionLog: transactions,
            startingStock,
            endingStock,
            pendingReturns,
            userActivitySummary: {
                topBorrower: topBorrower || 'None',
                topBorrowedItem: topBorrowedItem || 'None'
            },
            alertsNotifications: {
                lowStockAlerts,
                overdueItems
            },
            commentsFeedback: 'No feedback recorded.' // Placeholder, integrate your feedback logic here
        };
    } catch (error) {
        console.error("Error generating daily report:", error);
        throw new Error("Error generating daily report");
    }
};

module.exports = {
    dailyReport,
};
