const express = require("express")
const app = express()
app.use(express.json());

const cors = require("cors");



const multer = require("multer");
// const pdfReader = require("pdfreader");

// import { pdfReader } from "pdfreader";


const upload = multer({ dest: "uploads/" });


const port = 3000

app.post('/generateReceipt', (req, res) => {
    // Create a new receipt

    // get the data in JSON format
    req = req.body;

    // get current date GMT +8 in YYYYMMDD format
    const date = new Date();
    const year = date.getFullYear().toString();
    
    var month = (date.getMonth() + 1).toString();
    // add a zero in front of the month if the month is less than 10
    if (month < 10) {
      month = "0" + month
    }
    
    var day = date.getDate().toString();
    // add a zero in front of the day if the day is less than 10
    if (day < 10) {
      day = "0" + day
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
    const unixTimestamp = Math.round(+new Date()/1000);

    // get the last 8 digits of the unix timestamp
    const sequenceNumber = unixTimestamp.toString().slice(-8);

    // refId format YYYYMMDDBBBBBBBBXXXOCCSSSSSSSS
    const refId = currentDate.toString() + bicCode + transactionType + originator + channelCode + sequenceNumber;

    var status = "";

    if (req.transactionType == "Instant") {
        status = "success";
    } else {
        status = "pending";
    }

    const receipt = {
      referenceId: refId,
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      amount: req.amount,
      ref1: req.ref1,
      ref2: req.ref2,
      transactionType: req.transactionType,
      senderNoAccount: req.senderNoAccount,
      receiverNoAccount: req.receiverNoAccount,
      receiverName: req.receiverName,
      receipientBank: "ABC BANK",
      status: status,
    };

    res.header("Access-Control-Allow-Origin", "http://localhost:5173");

    // Return the new receipt
    res.status(200).json({ receipt });
})

const data = {
    referenceId: "1234567890",
    date: "2021-01-01",
    amount: 100,
    ref1: "ref1",
    ref2: "ref2",
}

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
app.use(cors());
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})