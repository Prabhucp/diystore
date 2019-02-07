//Function to Add Items to Cart on clicking Add to Cart
function addCart() {
  $('.add-cart').click(function() {
    var buttonid = this.id;
    console.log("button id ", buttonid);
    prodid = buttonid.substring(7,buttonid.length);
    quantity = document.getElementById('quantity_'+ prodid).value;
    price = document.getElementById('price_'+ prodid).innerHTML;

// POST routine to Add Product details in CART table
  if (userid != null) {
    console.log("Userid Parameter for Post : ", userid);
    console.log("price : ", price);
    $.ajax({
      url:  'product',
      type: 'POST',
      data: {
            user: userid,
            product: prodid,
            quantity: quantity,
            price: price,
            },
      success: (data) => {alert("Selected Item added to Cart");}
    }); //End of Ajax
  } else {
    alert("Session is Empty");
  }

  cartCount();  // Function to get the count of Items from Cart
  }); //End of Cart Class
}; // End of addCart Function

// cartLoad function fetches the total count of items in Cart
function cartCount(){
  $.ajax({
    url: 'cartcount',
    type: 'GET',
    datatype: 'json',
    success:(data) =>{
      $.each(data, function(key, value){
        console.log('value : ', value.count);
        cartCount = value.count;
        document.getElementById("cart-count").innerHTML = cartCount;

        $("#cart-count").replaceWith( '<li id="cart-count"><a href="#">' + cartCount + '</a></li>');
      }) // For Each Ends
    } // Data Ends
  }) // AJAX Ends
}; // Function cartload Ends

//Function to open Cart page
function goCart(){
  console.log("goCart Called");

    $('.go-cart').click(function() {
       window.location = '/cart.html'
    });
};

//Function to Delete Cancelled Cart
function cartCancel(){
 $('.cancel').click(function(){
    var cancelid = this.id;
    var prodid = cancelid.substring(7,cancelid.length);

    console.log('Cancel Id' ,cancelid);
    console.log('Product Id' ,prodid);

    $.ajax({
      url:  'cancel',
      type: 'POST',
      data: {
            product: prodid,
            },
      success: (data) => {

        alert("Selected Item Deleted from Cart");}
    }); //End of Ajax
  }); // End of Cancel Class
}; //End of Cancel Function
