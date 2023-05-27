const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");

const Model = require("./model.js");

const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const fs = require("fs");
const PDFParser = require("pdf-parse");

const bodyParser = require("body-parser");

const port = 3000;



const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://zyqhpz:LpyaTun3O4AgHXSG@eventeq.obgaljj.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

app.post("/generateReceipt", async (req, res) => {
  // Create a new receipt

  // get the data in JSON format
  req = req.body;

  // get current date GMT +8 in YYYYMMDD format
  const date = new Date();
  const year = date.getFullYear().toString();

  var month = (date.getMonth() + 1).toString();
  // add a zero in front of the month if the month is less than 10
  if (month < 10) {
    month = "0" + month;
  }

  var day = date.getDate().toString();
  // add a zero in front of the day if the day is less than 10
  if (day < 10) {
    day = "0" + day;
  }

  const currentDate = year + month + day;

  // get the BIC code
  const bicCode = "M0000221";

  // get the transaction type
  const transactionType = "861";

  // get the originator
  const originator = "O";

  // get the channel code
  const channelCode = "BA";

  // get the sequence number
  // get the unix timestamp
  const unixTimestamp = Math.round(+new Date() / 1000);

  // get the last 8 digits of the unix timestamp
  const sequenceNumber = unixTimestamp.toString().slice(-8);

  // refId format YYYYMMDDBBBBBBBBXXXOCCSSSSSSSS
  const refId =
    currentDate.toString() +
    bicCode +
    transactionType +
    originator +
    channelCode +
    sequenceNumber;

  var status = "";

  if (req.transactionType == "Instant Transfer") {
    status = "success";
  } else {
    status = "pending";
  }

  const receipt = new Model({
    referenceId: refId,
    date: new Date().toISOString().slice(0, 19).replace("T", " "),
    amount: req.amount,
    ref1: req.ref1,
    ref2: req.ref2,
    transactionType: req.transactionType,
    senderNoAccount: req.senderNoAccount,
    receiverNoAccount: req.receiverNoAccount,
    receiverName: req.receiverName,
    receipientBank: "ABC BANK",
    status: status,
  });

  MongoClient.connect(uri, { useUnifiedTopology: true })
    .then((client) => {
      console.log("Connected to MongoDB");
      const db = client.db("eventeq");
      const receiptsCollection = db.collection("receipts");

      receiptsCollection
        .insertOne(receipt)
        .then((result) => {
          console.log("Receipt saved:", receipt);
          res.header(
            "Access-Control-Allow-Origin",
            "http://localhost:5173"
          );
          res.status(200).json(receipt);
        })
        .catch((error) => console.error(error));
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB:", error);
    });
});

/*         
 * POST /readReceipts
  * @param
  * @return json data of all read receipts
  * @description 
  * 
  * Read the receipts and get the Reference ID
  * Recheck in the database if the Reference ID exists
  * If exists, get the data and return the data from db to the client
  * If not exists, return error message
// */
// app.post('/uploadReceipts', (req, res) => {
//     if (!req.file) {
//       res.status(400).json({ error: "No file uploaded" });
//       return;
//     }

//     // Read the uploaded PDF file
//     const pdfPath = req.file.path;
//     const reader = new pdfReader.PdfReader();

//     const pages = [];
//     reader.parseFileItems(pdfPath, (err, item) => {
//       if (err) {
//         console.error(err);
//         res.status(500).json({ error: "Failed to read the PDF file" });
//         return;
//       }

//       if (!item || item.page) {
//         return;
//       }

//       pages.push(item.text);
//     });

//     reader.on("end", () => {
//       // Process the pages array as needed
//       res.status(200).json({ pages });
//     });
// })

// Set up Multer for file upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Define a route to handle PDF uploads
app.post("/upload", upload.array("pdfFiles"), async (req, res) => {
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
    console.log(extractedTexts);
    // Send the extracted text as a response
    res.json({ extractedTexts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to extract text from PDFs" });
  }
});

// Function to extract reference number from text
function extractReferenceNumber(text) {
  const regex = /Reference\sNo\.\s*(\d+)/i;
  const match = text.match(regex);
  if (match && match.length > 1) {
    return match[1];
  } else {
    return "N/A";
  }
}

/**
 * validatorFunction to check if the file is a PDF
 * run the pdf reader to read the file and return the data
 */
const validatorFunction = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    cb(new Error("Only PDF files are allowed"));
    return;
  }

  cb(null, true);
};

app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  // Read the uploaded PDF file
  const pdfPath = req.file.path;

  console.log(pdfPath);

  try {
    // Import the pdfreader library using dynamic import
    const pdfReader = await import("pdfreader");

    const reader = new pdfReader.PdfReader();

    const pages = [];
    reader.parseFileItems(pdfPath, (err, item) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read the PDF file" });
        return;
      }

      if (!item || item.page) {
        return;
      }
      pages.push(item.text);
    });

    reader.on("end", () => {
      // Process the pages array as needed
      res.status(200).json({ pages });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to import the pdfreader library" });
  }
});

app.get("/items", async (req, res) => {
  Item.find()
    .then((items) => {
      res.json(items);
    })
    .catch((error) => {
      console.error("Failed to retrieve items:", error);
      res.status(500).json({ error: "Failed to retrieve items" });
    });
});

app.use(cors());
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
