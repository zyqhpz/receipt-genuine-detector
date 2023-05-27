const mongoose = require("mongoose");
const receiptSchema = new mongoose.Schema(
  {
    referenceId: String,
    date: Date,
    amount: Number,
    ref1: String,
    ref2: String,
    transactionType: String,
    senderNoAccount: String,
    receiverNoAccount: String,
    receiverName: String,
    recipientBank: String,
    status: String,
  }
);

module.exports = mongoose.model("Receipt", receiptSchema);
