var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var uuidv1 = require('uuid/v1');
const debug = require('debug');
const razorpay = require('razorpay');

//MVC Model
//var order = require('./controller/order_control');
var purchase = require('./controller/purchase_control');
//var session = require('express-session');

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.set('view engine', 'ejs');

//express.static('diy_local');
//app.use('/assets', express.static('assets'));
//app.use(express.static('diy_local'));
app.use(express.static('public'));
app.use(cookieParser());

// SQLite3 Database Connection
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./public/diy.db');

//Fire controllers
//order(app, db);
purchase(app, db);

// Checking if Cookie Exists Already
app.get('/', function(req, res) {
  if (req.cookies.userId) {
    console.log('Cookie already set:', req.cookies.userId);

//    var totalCart = cartCount(req.cookies.userId);
//    console.log("Cart Count after Cookie Check : ", totalCart);
/*  db.all('SELECT count(*) count FROM cart WHERE user_id = $userid', {$userid: req.cookies.userId}, (err, rows) => {
      if (err) { console.log('err', err); };
      console.log('Cart Count Data :', rows);

      if (rows.length > 0) { res.send(rows); };
    }) // End of DB Select */
  } else {  // Set New Cookie
    var uuid = uuidv1();
//    res.cookie('userId', uuid,   {maxAge: 900000} ); // 25 minutes
    res.cookie('userId', uuid,   {maxAge: 10 * 365 * 24 * 60 * 60 * 1000} ); // 10 years
    console.log('Cookie set. UUID: ', uuid);
  }
    res.sendFile('public/main.html', {root: __dirname, uuid});
});

// ***  CLIENT has sent Request Parameters - Page Name & CATID ***
// Product Data retrieval based on the Category ID

app.get('/product/:catid', (req, res) => {
  var catid = req.params.catid;  // Assigning the request parameter from Client side
  userid = req.cookies.userId; // Getting cookie data from serverside
  console.log('Category Id : ', catid);
  console.log('User Id : ', userid);

  switch (catid)
    {
      case 'solder':
           catid = 1;
           break;
      case 'module':
           catid = 2;
           break;
      case 'active':
           catid = 3;
           break;
      case 'passive':
           catid = 4;
           break;
    }

/*  var userCartQuery = 'SELECT DISTINCT a.prd_id,a.cat_id,a.prd_name,a.prd_detail,a.image,a.price,a.stock,b.user_id,b.quantity' +
  ' FROM cart b CROSS JOIN product a on a.prd_id = b.prd_id and a.cat_id=$catid and b.user_id=$userid';
  var categoryProductQuery = 'SELECT * FROM product WHERE cat_id=$catid';*/

  /* This Query picks up all the details of Product and Quantity from CART */
  var productCartQuery = 'SELECT product.*, cart.quantity'
                        + ' FROM product'
                        + ' LEFT JOIN cart'
                        + ' ON cart.prd_id = product.prd_id'
                        + ' AND cart.user_id = $userid'
                        + ' WHERE product.cat_id = $catid';

  db.all(productCartQuery, {$catid: catid, $userid: userid}, (err, rows) => {
    if (err) {console.log('err', err);}
    res.send(rows);
  }); // End of DB Select
}); // End of GET Products

/*
function cartCount(userid){
  console.log('cartCount Called');
//    var userid = req.cookies.userId;
    console.log('Inside Cart Count Data userid:', userid);

    db.all('SELECT count(*) count FROM cart WHERE user_id = $userid', {$userid: userid}, (err, rows) => {
      if (err) {
        console.log('err', err);
      }
      console.log('Cart Count Data :', rows);

      if (rows.length > 0) {
//        res.send(rows);
        return rows[0];
      };
    }) // End of DB Select
}; // End of cartCount

*/


//Cart Item Retrieval based on User ID
//function cartCount(){
//  console.log('cartCount Called');
  app.get('/cartcount', (req, res) =>{
    var userid = req.cookies.userId;
    console.log('Inside Cart Count Data userid:', userid);

    db.all('SELECT count(*) count FROM cart WHERE user_id = $userid', {$userid: userid}, (err, rows) => {
      if (err) {
        console.log('err', err);
      }
      console.log('Cart Count Data :', rows);

      if (rows.length > 0) { res.send(rows); };
    }) // End of DB Select
  }); // End of APP GET
//};  //End of cartCount


app.get('/order', (req, res) => {
  userid = req.cookies.userId;
  console.log("Inside Order");
    console.log("User id ", userid);
  /* This Query picks up all the details of Product and Quantity from CART */
  var orderDetailQuery = 'SELECT * FROM order_tbl WHERE user_id = $userid';
  db.all(orderDetailQuery, {$userid: userid}, (err, rows) => {
    if (err) {console.log('err', err);}
    res.send(rows);
  }); // End of DB Select
}); // End of APP GET Order

//Post request is for posting NEW Data to the server

app.use(bodyParser.urlencoded({extended: true})); // hook up with your App

//function cartData(cartQuery){
app.post('/product', (req, res) => {
  var userid = req.cookies.userId;
  var prodid = req.body.product;
//var cartCount = checkCart(userid); // Check DB if userid already exists
  console.log('Product :', prodid);

// Query to check if it is an EXISTING USER has added Items into Cart Already
  db.all('SELECT count(*) count FROM cart WHERE user_id = $userid and prd_id = $prodid', {$userid: userid, $prodid: prodid}, (err, rows) => {
    if (err) {console.log('err', err);}
    cartCount = rows[0].count;
  //  res.send(rows);
    console.log('Cart Count in Insert update :', cartCount);
    console.log('Product :', prodid);
    console.log('Userid :', userid);
    if (cartCount> 0) {   // Quantity Updated to Cart
      var cartQuery = 'UPDATE cart SET quantity = $qty WHERE user_id = $userid and prd_id = $prodid and price = $price';
    } else {             // New Items Added to Cart
      var cartQuery = 'INSERT INTO cart VALUES ($userid, $prodid, $qty, $price)';
    }

    console.log('Query :', cartQuery);

    db.run(cartQuery, {$userid: req.body.user, $prodid: req.body.product, $qty: req.body.quantity, $price: req.body.price}, (err) => {
      if (err) {
        res.send({message: 'error in app.post(/users)'});
      } else {
        res.send({message: 'Successfully Inserted Item from Cart'});
      }
    }); // End of Database Run
      console.log('Successfully Inserted/Updated Item into Cart');
  }); // End of Select Statement
}); // End of APP Post

app.post('/cart', (req, res) =>{
  console.log("Inside Order Payment");
  var userid = req.cookies.userId;
  console.log("user id ", req.body.userid);
  console.log("orderNum ", req.body.orderNum);
  console.log("orderDate", req.body.orderDate);
  console.log("orderAmount", req.body.orderAmt);
  console.log("orderStat", req.body.orderStat);

  var ordQuery = 'INSERT INTO order_tbl VALUES ($orderNum, $userid, $orderDate, $orderAmt, $orderStat)';
  db.run(ordQuery, {$orderNum: req.body.orderNum, $userid: req.body.userid, $orderDate: req.body.orderDate, $orderAmt: req.body.orderAmt, $orderStat: req.body.orderStat}, (err) => {
//  db.run(ordQuery, {$orderNum: '1', $userid: userid, $orderDate: '2019-01-28', $orderAmt: 500, $orderStat: 'C'}, (err) => {
    if (err) {
      res.send({message: 'error in app.post(/users)'});
    } else {
      res.send({message: 'Successfully Inserted Data into Order Table'});
    }
  }); // End of Database Run
      console.log('Successfully Inserted Item into Order');
}); // End of APP Post

//INSERT INTO CONTACT details
app.post('/client', urlencodedParser, function(req, res){
  console.log(req.body);
  var clientQuery = 'INSERT INTO client VALUES ($clientFName, $clientLName, $clientAddress, $clientPhone, $clientEmail)';
  db.run(clientQuery, {$clientFName: req.body.fname, $clientLName: req.body.lname, $clientAddress: req.body.address, $clientPhone: req.body.phone, $clientEmail: req.body.email}, (err) => {
    if (err) {
      res.send({message: 'error in app.post(/users)'});
    } else {
      res.send({message: 'Successfully Inserted Data into Client Table'});
    }
  }); // End of Database Run
      console.log('Successfully Inserted Item into Order');
}); // End of APP Post

/*
function checkCart(userid){
  db.all('SELECT count(*) count FROM cart WHERE user_id = $userid', {$userid: userid}, (err, rows) => {
    if (err) {console.log('err', err);}
    //res.send(rows);  // Cart Count
    cartCount = rows[0].count;
    console.log('Cart Count :', cartCount);

    if (cartCount> 0) {
      var cartQuery = 'UPDATE cart SET quantity = $qty WHERE user_id = $userid and prd_id = $prodid';
      console.log('Query :', cartQuery);
//      cartData(cartQuery);
    } else {
      var cartQuery = 'INSERT INTO cart VALUES ($userid, $prodid, $qty)';
      console.log('Query :', cartQuery);
//      cartData(cartQuery);
    }

     //Post request is for posting NEW Data to the server
//     app.post('/product', (req, res) => {
      console.log('Quantity :', req.body.quantity);
      db.run(cartQuery, {$userid: req.body.user, $prodid: req.body.product, $qty: req.body.quantity}, (err) => {
        if (err) {
          res.send({message: 'error in app.post(/users)'});
        } else {
          res.send({message: 'Successfully Inserted Item from Cart'});
        }
      }); // End of Database Run
          console.log('Query after db:', $qty);
//    }); // End of Post
          console.log('Successfully Inserted/Updated Item into Cart');
  }); // End of Select Statement
}; // End of Function checkCart
*/


// Cart Data retrieval based on the User ID
app.get('/cart/:userid', (req, res) => {
  var userid = req.params.userid;
  console.log('Userid from Cart Page : ', userid);

  db.all('SELECT a.image, a.prd_name, a.price, a.shipment, b.quantity, b.prd_id FROM product a, cart b WHERE a.prd_id = b.prd_id and b.user_id = $userid', {$userid: userid},
  (err, rows) => {
        if (err) {console.log('err', err);};
/*    if (err) {
      res.send({message: 'Cart Items selection unsuccessful'});
    } else {
      res.send({message: 'Successfully selected items from Cart'});
    } */

    if (rows.length > 0){
  //     checkOrder(userid); // Check if Order exists for this user
       res.send(rows);
       console.log('Row Length', rows.length);
          for (i=0; i<=rows.length; i++){
            console.log('Row data', rows[i]);}
      } else {
        res.send({}); //failed, returning empty objects
       console.log("Query failed as userid changed ", userid);
      }
  }); // End of SELECT DB
});  // End of APP GET CART

// Cart Data retrieval based on the User ID
/*app.get('/payment/:userid', (req, res) => {
  var userid = req.params.userid;
  console.log('Userid from Payment Page : ', userid);

  db.all('SELECT a.image, a.prd_name, a.price, b.quantity, b.prd_id FROM product a, cart b WHERE a.prd_id = b.prd_id and b.user_id = $userid', {$userid: userid},
  (err, rows) => {
          if (rows.length > 0){
             res.send(rows);
             console.log('Row Length', rows.length);
                for (i=0; i<=rows.length; i++){
                  console.log('Row data', rows[i]);}
            } else {
              res.send({}); //failed, returning empty objects
             console.log("Query failed as userid changed ", userid);
            }
    (err) => {
      if (err) {
        res.send({message: 'Cart Items selection unsuccessful'});
      } else {
        res.send({message: 'Successfully selected items from Cart'});
      }
    }
  }); // End of SELECt
}); */ // End of GET CART

// Delete CART Details
app.post('/cancel', (req, res) => {
  userid = req.cookies.userId;
  console.log("Delete portion");
  console.log(req.body);
  db.run(
    'DELETE FROM cart WHERE user_id = $userid and prd_id = $prodid', {$userid: userid, $prodid: req.body.product},
    (err) => {
      if (err) {
        res.send({message: 'error in Cart Cancel'});
      } else {
        res.send({message: 'Successfully cancelled Item from Cart'});
      }
    } // End of Error
  ); // End of database Delete
}); // End of Post

app.listen(3000);
console.log('Application started at http://localhost:3000');
