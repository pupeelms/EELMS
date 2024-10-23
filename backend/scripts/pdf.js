// generatePDF.js
const { generateQRCode, createPDFWithQRCode } = require('../utils/pdfService'); // Assuming pdfUtils is in 'utils' folder
const path = require('path');
const fs = require('fs');

// Test data for the PDF
const userName = 'John Dela Crus Albama'; // Replace with the user name you want to test
const dataForQRCode = 'https://example.com'; // This will be the content of the QR code
const outputFilePath = path.join(__dirname, 'output', 'test-pdf.pdf'); // Adjust output path

// Create 'output' directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const runTest = async () => {
    try {
        // Step 1: Generate QR Code
        const qrCodeFilePath = await generateQRCode(dataForQRCode);
        console.log('QR Code generated:', qrCodeFilePath);

        // Step 2: Create PDF with QR code, logo, and user name
        await createPDFWithQRCode(qrCodeFilePath, userName, outputFilePath);

        console.log(`PDF created successfully at: ${outputFilePath}`);
    } catch (error) {
        console.error('Error during PDF creation:', error);
    }
};

runTest();
