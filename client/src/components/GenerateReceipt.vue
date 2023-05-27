<script>
import axios from 'axios';

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
      }
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
    }
  }
}
</script>

<template>
  <div>
    <h1>Online Bank Transfer Receipt Generator </h1>

    <form @submit.prevent="save">
      <p>From Account: <input v-model="details.senderNoAccount" /></p>
      <p>To Account: <input v-model="details.receiverNoAccount" /></p>
      <p>Account Holder Name: <input v-model="details.receiverName" /></p>
      <div>Transaction Type:</div>
      <input type="radio" id="one" value="IBG" v-model="details.transactionType" />
      <label for="one">IBG Transfer</label> <br>
      <input type="radio" id="two" value="Instant" v-model="details.transactionType" />
      <label for="two">Instant Transfer</label>
      <p>Amount: <input v-model="details.amount" placeholder="RM" /></p>
      <p>Reference 1: <input v-model="details.ref1" /></p>
      <p>Reference 2(optional): <input v-model="details.ref2" /></p>

      <button type="submit" class="btn">Generate</button>
    </form>
  </div>
</template>

<style scoped></style>
