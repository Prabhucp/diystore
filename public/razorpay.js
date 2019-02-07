const Razorpay = require('razorpay');

  //Payment Gateway
  let rzp = new Razorpay({
    key_id: 'rzp_test_5kFMmaA0cmhkxN', // your `KEY_ID`
    key_secret: 'Glcfv0wiN3MZMzbQeol9AS4H' // your `KEY_SECRET`
  })


rzp.payments.capture('pay_BsXoE7Y5wpO2Sp' , '50000').then((data) => {
  console.log(data)
}).catch(error) => {
  console.log(error);
}
