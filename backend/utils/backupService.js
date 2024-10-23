const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to back up the MongoDB database
const backupDatabase = async () => {
  const fileName = `backup-${new Date().toISOString()}.gz`;
  const filePath = path.join(__dirname, '..', 'backups', fileName);

  exec(`mongodump --uri=${process.env.MONGO_URI} --archive=${filePath} --gzip`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error backing up database:', stderr);
      return;
    }
    console.log('Database backup completed:', filePath);
  });
};

module.exports = { backupDatabase };
