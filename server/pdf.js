// Import required modules
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf-parse');

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Set up Multer for file upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Define a route to handle PDF uploads
app.post('/upload', upload.array('pdfFiles'), async (req, res) => {
  try {
    // Access the uploaded files from the request object
    const pdfFiles = req.files;

    // Array to store extracted text from each PDF
    const extractedTexts = [];

    // Process each PDF file
    for (const pdfFile of pdfFiles) {
      // Read the PDF file
      const dataBuffer = fs.readFileSync(pdfFile.path);

      // Convert PDF data to text using pdf-parse
      const pdfText = await PDFParser(dataBuffer);

      // Extracted text from the PDF
      const extractedText = pdfText.text;

      // Extract reference number from the text
      const referenceNumber = extractReferenceNumber(extractedText);

      // Push the reference number to the array
      extractedTexts.push(referenceNumber);
    }
    console.log(extractedTexts)
    // Send the extracted text as a response
    res.json({ extractedTexts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to extract text from PDFs' });
  }
});

// Function to extract reference number from text
function extractReferenceNumber(text) {
  const regex = /Reference\sNo\.\s*(\d+)/i;
  const match = text.match(regex);
  if (match && match.length > 1) {
    return match[1];
  } else {
    return 'N/A';
  }
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
