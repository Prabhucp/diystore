<form action="/purchase" method="POST">
<!-- Note that the amount is in paise = 50 INR -->
    <script
        src="https://checkout.razorpay.com/v1/checkout.js"
        data-key="<YOUR_KEY_ID>"
        data-amount="5000"
        data-buttontext="Pay with Razorpay"
        data-name="Merchant Name"
        data-description="Purchase Description"
        data-image="https://your-awesome-site.com/your_logo.jpg"
        data-prefill.name="Gaurav Kumar"
        data-prefill.email="test@test.com"
        data-theme.color="#F37254"
    ></script>
    <input type="hidden" value="Hidden Element" name="hidden">
</form>
