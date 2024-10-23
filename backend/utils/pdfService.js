// utils/pdfUtils.js
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib'); // Include StandardFonts for text width measurement
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Generate QR code function
const generateQRCode = async (data) => {
    try {
        const filePath = path.join(__dirname, '..', 'uploads', 'qr-code.png');
        await QRCode.toFile(filePath, data);
        return filePath;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

// Create PDF with QR code, logo, and text
const createPDFWithQRCode = async (qrCodeFilePath, userName, outputFilePath) => {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();

        // Embed font for accurate text measurement
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Read QR code image
        const qrCodeImage = fs.readFileSync(qrCodeFilePath);
        const qrCodeImageEmbed = await pdfDoc.embedPng(qrCodeImage);
        const qrCodeImageDims = qrCodeImageEmbed.scale(216 / qrCodeImageEmbed.width); // Scale to 216 points

        // Read logo image
        const logoFilePath = path.join(__dirname, '..', 'uploads', 'logo-pdf.png');
        const logoImage = fs.readFileSync(logoFilePath);
        const logoImageEmbed = await pdfDoc.embedPng(logoImage);
        const logoImageDims = logoImageEmbed.scale(170 / logoImageEmbed.width); // Scale logo size

        // Center the logo, QR code, and text horizontally
        const logoX = width / 2 - logoImageDims.width / 2;
        const logoY = height - logoImageDims.height - 200; // Adjust spacing from the top

        const qrCodeX = width / 2 - qrCodeImageDims.width / 2;
        const qrCodeY = logoY - qrCodeImageDims.height - 0; // Reduced space between logo and QR code

        const userNameFontSize = 16;
        const spacing = 10; // Adjust spacing between QR code and text

        // Add logo to PDF
        page.drawImage(logoImageEmbed, {
            x: logoX,
            y: logoY,
            width: logoImageDims.width,
            height: logoImageDims.height,
        });

        // Add QR code to PDF
        page.drawImage(qrCodeImageEmbed, {
            x: qrCodeX,
            y: qrCodeY,
            width: qrCodeImageDims.width,
            height: qrCodeImageDims.height,
        });

        // Measure the exact width of the userName text for proper centering
        const userNameTextWidth = font.widthOfTextAtSize(userName, userNameFontSize);
        const userNameX = width / 2 - userNameTextWidth / 2;

        // Add userName text below QR code
        page.drawText(userName, {
            x: userNameX,
            y: qrCodeY - userNameFontSize - spacing, // Position text below QR code
            size: userNameFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Save the PDF and write to output
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputFilePath, pdfBytes);

        console.log('PDF created successfully:', outputFilePath);
    } catch (error) {
        console.error('Error creating PDF:', error);
        throw error;
    }
};

module.exports = { generateQRCode, createPDFWithQRCode };
