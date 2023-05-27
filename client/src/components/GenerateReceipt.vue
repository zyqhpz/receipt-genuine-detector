<script>
import axios from 'axios';
import html2pdf from "html2pdf.js";

export default {
  name: 'GenerateReceipt',
  data() {
    return {
      details: {
        senderNoAccount: '',
        receiverNoAccount: '',
        receiverName: '',
        transactionType: '',
        amount: '',
        ref1: '',
        ref2: '',
        referenceID: ''
      },
      elementDisplay: "none",
      formDisplay: "block",
      buttonDisplay: "none"
    };
  },
  methods: {
    save() {
      axios.post("http://localhost:3000/generateReceipt", JSON.stringify(this.details), { headers: { 'Content-Type': 'application/json' } })
         .then(
           ({ data }) => {
              console.log(data.receipt)
              alert("Receipt generated.");
           }
         )
      this.formDisplay = "none";
      this.elementDisplay = "block";
      this.buttonDisplay = "block";
    },
    exportToPDF() {
      // axios.get("http://127.0.0.1:8000/api/save")
      //   .then(response => this.details.referenceID = response.data.referenceID);
      
      html2pdf(document.getElementById("element-to-convert"), {
        margin: 1,
        filename: "Receipt.pdf",
      });
    },
  }
}
</script>

<template>
  <div>
  <form id="form" :style="{ display: formDisplay }" @submit.prevent="save">
    <h1>Bank Receipt Generation</h1>
    <table>
      <tr>
        <td>From Account:</td>
        <td><input v-model="details.senderNoAccount" /></td>
      </tr>
      <tr>
        <td>To Account:</td>
        <td><input v-model="details.receiverNoAccount" /></td>
      </tr>
      <tr>
        <td>Account Holder Name:</td>
        <td><input v-model="details.receiverName" /></td>
      </tr>
      <tr>
        <td>Transaction Type:</td>
        <td>
          <input type="radio" id="one" class="radio" value="IBG Transfer" v-model="details.transactionType" />
          <label for="one">IBG Transfer</label>
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          <input type="radio" id="two" value="Instant Transfer" v-model="details.transactionType" />
          <label for="two">Instant Transfer</label>
        </td>
      </tr>
      <tr>
        <td>Amount(RM):</td>
        <td><input v-model="details.amount" /></td>
      </tr>
      <tr>
        <td>Reference 1:</td>
        <td><input v-model="details.ref1" /></td>
      </tr>
      <tr>
        <td>Reference 2(optional):</td>
        <td><input v-model="details.ref2" /></td>
      </tr>
    </table>

    <button class="btn">Generate Receipt</button>
  </form>

  <div id="element-to-convert" :style="{ display: elementDisplay }" style="margin: 20px 80px">
    <h3>RV Bank Receipt</h3>
    <hr>
    <p><strong>Reference No.:</strong> </p>
    <p><strong>Transaction Status:</strong> Successful</p>
    <p><strong>Transaction DateTime:</strong> </p>
    <p><strong>From Account:</strong> {{ details.senderNoAccount }}</p>
    <p><strong>Amount:</strong> RM {{ details.amount }}</p>
    <br>
    <p><strong>Beneficiary Account:</strong> {{ details.receiverNoAccount }}</p>
    <p><strong>Beneficiary Account Type:</strong> {{ details.transactionType }}</p>
    <p><strong>Beneficiary Name:</strong> {{ details.receiverName }}</p>
    <p><strong>Recipient Reference:</strong> {{ details.ref1 }}</p>
    <p><strong>Other Payment Details(optional):</strong> {{ details.ref2 }}</p>
    <br>
    <p>Note: This is a computer generated receipt and does not require a signature.</p>
  </div>
  <button @click="exportToPDF" class="btn" :style="{ display: buttonDisplay }" style="margin-left: 80px">Export as PDF</button>
</div>
</template>

<style></style>
