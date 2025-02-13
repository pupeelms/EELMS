// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');
// require('dotenv').config();

// // Ensure the backup directory exists
// const backupDir = path.join(__dirname, '..', 'backups');
// fs.mkdirSync(backupDir, { recursive: true });

// // Full path to mongodump.exe (Modify this path based on your system)
// const mongoDumpPath = `"C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe"`; // Ensure correct path

// const backupDatabase = async () => {
//   try {
//     const fileName = `backup-${new Date().toISOString().replace(/:/g, '-')}.gz`;
//     const filePath = path.join(backupDir, fileName);

//     const mongoUri = process.env.MONGO_URI;
//     if (!mongoUri) {
//       console.error('Error: MONGO_URI is not defined in the environment variables.');
//       return;
//     }

//     console.log('Starting database backup...');
    
//     exec(`${mongoDumpPath} --uri="${mongoUri}" --archive="${filePath}" --gzip`, (err, stdout, stderr) => {
//       if (err) {
//         console.error('Error backing up database:', stderr);
//         return;
//       }
//       console.log('Database backup completed successfully:', filePath);
//       console.log(stdout);
//     });
//   } catch (error) {
//     console.error('Unexpected error during backup:', error);
//   }
// };

// module.exports = { backupDatabase };
