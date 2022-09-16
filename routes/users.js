const { response } = require('express');
var express = require('express');
// const { response } = require('../app');
const adminHelpers = require('../helpers/admin-helpers');
// const { changeProductQuantity } = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();
const multer = require('multer');
var userhelpers= require("../helpers/user-helpers")


const accountSID = 'AC54bc4ec92ecb60b0299be34e3fda1ce0'
const authToken = '66b33a8ce263669818bdb268bcc94ca7'
const serviceSID = 'VA210d85aa15e38960baaac9c31c757e3f'
const client = require('twilio')(accountSID,authToken);

let  loggedInUser 
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/signup')
  }
}

/* --------------------------------- multer --------------------------------- */


const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "--" + file.originalname);
  }
});
const upload = multer({storage: fileStorageEngine});

 /* ------------------------------ GET home page ----------------------------- */

router.get('/',async function(req, res,next) {
   loggedInUser = req.session.user
  let cartCount=null
  let banner=await adminHelpers.getBanners(req.body)
 userhelpers.getAllProducts().then(async(userProducts)=>{
  if(req.session.user){
   cartCount= await userHelpers.getCartCount(req.session.user._id)
  res.render('index',{userProducts,loggedInUser,user:true,cartCount,banner});

  }else{
    res.render('index',{userProducts,user:true,banner});
  }
 })
});

router.post('/login', function(req, res) {
  if( req.session.loggedIn){
    res.redirect('/')
  }else{
  userhelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      //if user true->session assigns & variable loggedIn set as true
        req.session.user=response.user
        //saving userData coming from response in session
      res.redirect('/');
      
      }else{
        req.session.loginError=true
        res.redirect('/signup')
      }

  })
}
  
});

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/signup')
})

router.get('/signup', function(req, res) {
  if(req.session.user){
    res.redirect('/')
  }else{
    if(req.session.loginError){
      res.render('user/signup',{loginError:true});
      req.session.loginError=false
    }else{
      res.render('user/signup');
    }

  }
 
});



router.post('/signup1', function(req, res) {
  userhelpers.doSignup(req.body)
  //(req.body)->entered data enetered
  res.redirect('/signup');
});

router.post('/popup', function(req, res) {
  res.redirect('/signup');
});



/* ---------------------------------- cart ---------------------------------- */


router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userhelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/cart')
  })
});


router.get('/cart',verifyLogin,async(req,res)=>{
  let cartProducts=await userHelpers.getCartProducts(req.session.user._id)
    let loggedInUser = req.session.user
    let totalAmount= await userhelpers.getTotalAmount(req.session.user._id)
    console.log(loggedInUser,"userrrrrrrrrrrrr");
  res.render('user/cart',{totalAmount,loggedInUser,user:true,cartProducts});
});


/* --------------------------------- profile -------------------------------- */

router.get('/userProfile',verifyLogin,async(req,res)=>{
  res.render('user/userProfile',{loggedInUser,user:true});
});

  router.post("/addUserProfile",upload.array("images",4),(req,res)=>{
  if (!req.files){
      res.redirect("/editUserProfile");
  }
  var filenames = req.files.map(function (file) {
      return file.filename;
  });
  req.body.images = filenames;
  userhelpers.userProfile(req.body).then((response) => {
  
    res.redirect("/userProfile");
});
})

router.get('/editUserProfile', function(req, res) {
  res.render('user/editUserProfile',{loggedInUser,user:true});
});



/* ----------------------------- forgotPassword ----------------------------- */

router.get('/forgotpassword', function(req, res) {
  res.render('user/forgotpassword',{loggedInUser,user:true});
});

/* ----------------------------- changePassword ----------------------------- */

// router.post('/otp', function(req, res) {
//   res.render('user/changepassword');
// });


/* ------------------------------ LoginWithOTP ------------------------------ */

router.get('/LoginWithOTPPage', function(req, res) {
  res.render('user/otpLogin');
});

router.post('/LoginWithOTP',function(req,res){
  userhelpers.doOtpLogin(req.body).then((response)=>{
if(response.validUser){
  client.verify.services(serviceSID ).verifications.create({
    to:`+91${req.body.MobileNumber}`,
    channel:"sms"

  }).then((response)=>{
    if(response.invalidNumber){
      res.render('user/verifyotp',{number:req.body.MobileNumber,inavlidNumber:true})
    }
    res.render('user/verifyotp',{number:req.body.MobileNumber})
  })
  
} 
})
});

router.post('/otp',(req,res)=>{
  const { otp }= req.body
  client.verify.services(serviceSID).verificationChecks.create({
    to:`+91${req.body.MobileNumber}`,
    code: otp,

  }).then((response )=>{
    if(response.valid){
      console.log('success');
      res.redirect('/')
    }else{
       console.log("wrong otp");
       res.redirect('/signup')
    }

  })

 
})

/* ------------------------------ singleProduct ----------------------------- */


router.get('/productDetails/:id',verifyLogin,(req, res)=>{
  userhelpers.getProductDetails(req.params.id).then((productDetails)=>{
  res.render('user/productspage',{user:true,loggedInUser,productDetails});
})
});


/* ---------------------------------- shop ---------------------------------- */


router.get('/shop', function(req, res) {
  userhelpers.getAllProducts().then(async(userProducts)=>{
  res.render('user/shop',{userProducts,loggedInUser,user:true});
  })
});

/* ----------------------------- proceed-to-pay  ----------------------------- */

router.get('/proceed-to-pay',verifyLogin,async function(req, res){
  let totalAmount=await userhelpers.getTotalAmount(req.session.user._id)
   let userAddress= await userhelpers.findSingleAddress(req.session.user._id)
  console.log(userAddress,"addressersssseee");
  res.render('user/checkout',{loggedInUser,user:true,totalAmount});
});


/* ------------------------------- placeOrder ------------------------------- */


router.post('/placeOrder',async(req,res)=>{
  let products= await userhelpers.getCartProducts(req.session.user._id)
  let totalAmount=await userhelpers.getTotalAmount(req.session.user._id)
  let userAddress= await userhelpers.findSingleAddress(req.body.selectedaddress)
  userhelpers.placeOrder(req.body,products,totalAmount,loggedInUser._id,userAddress).then((response)=>{
    if(req.body['PaymentMethod']==='COD'){
    res.json({CODStatus:true});
    }else if(req.body['PaymentMethod']==='RazorPay'){
      userhelpers.generateRazorpay(response.insertedId,totalAmount).then((response)=>{
        response.razorPay=true;
        res.json(response)         
      })
    }else if(req.body['PaymentMethod']==='Paypal'){
      userHelpers.generatePaypal(response.insertedId,totalAmount).then((response)=>{
        response.paypal=true;
        res.json(response)
      })
    }
    
  })
});


/* ------------------------------ verifyPayment ----------------------------- */


router.post('/verify-payment',(req,res)=>{
  userhelpers.verifyPayment(req.body).then(()=>{
    userhelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:'Payment failed'})
  })
})


/* -------------------------- changeProductQuantity ------------------------- */


router.post('/change-product-quantity',function (req,res,next){
  userhelpers.changeProductQuantity(req.body).then(async(response)=>{
     response.total=await userhelpers.getTotalAmount(req.body.user)
      res.json(response)

     
   
  })
});

/* ----------------------------- deletefromcart ----------------------------- */

router.post('/deleteCartProduct',(req,res,next)=>{
  userhelpers.deleteCartProduct(req.body).then((response)=>{
    res.json(response)
  })
});

/* ---------------------------- orderConfirmation --------------------------- */

router.get('/orderConfirmation', function(req, res) {
  res.render('user/orderConfirmation');
});


/* ------------------------------ orderDetails ------------------------------ */


router.get('/orderDetails', function(req, res) {
  userhelpers.getOrderDetails(loggedInUser._id).then((orderDetails)=>{
    res.render('user/orderDetails',{loggedInUser,user:true,orderDetails});
  })
  
});

router.get('/orderedProducts/:id',verifyLogin, async function(req, res) {
  let orderedProducts= await userhelpers.getOrderedProducts(req.params.id)
  let singleOrderDetails=await userhelpers.getSingleOrderDetails(req.params.id)
  orderedProducts[0].product.singleOrderStatus=singleOrderDetails[0].status
  res.render('user/orderedProducts',{loggedInUser,user:true,orderedProducts,singleOrderDetails});
});

/* --------------------------------- address -------------------------------- */


router.get('/addUserAddress/:id',verifyLogin,(req, res)=>{
  userhelpers.getUser(req.params.id).then((userDetails)=>{
  res.render('user/addProfile',{user:true,loggedInUser,userDetails});
})
});

router.post("/addUserAddress",upload.array("images",4),(req,res)=>{
  if (!req.files){
      res.redirect("/addProfile");
  }
  var filenames = req.files.map(function (file) {
      return file.filename;
  });
  req.body.images = filenames;
  console.log(req.body,"useridddddddddd");
  userhelpers.userAddress(req.body,req.body.userId).then((response) => {
    res.redirect("/userProfile");
});
})

/* ------------------------------- addAddress ------------------------------- */


router.get('/addaddress', function(req, res) {
  res.render('user/addaddress',{loggedInUser,user:true});
});

/* ------------------------------ removeAddress ----------------------------- */


router.get('/removeAddress/:id',(req,res)=>{
  let addressId=req.params.id
  userhelpers.removeAddress(addressId).then((response)=>{
    res.redirect('/proceed-to-pay')
  })
  })

  /* ------------------------------- editAddress ------------------------------ */


  router.get('/editAddress/:id',async function(req, res) {
    let addressDetails= await userhelpers.findSingleAddress(req.params.id)
    req.session.edit=true
    res.render('user/editAddress',{loggedInUser,user:true,addressDetails});
  });

  router.post("/editedAddress/:id",(req,res)=>{
    userhelpers.updateAddressDetails(req.params.id,req.body).then((response) => {
      res.redirect("/proceed-to-pay");
  });
  })

  /* ------------------------------- cancel Order ------------------------------ */


router.post('/cancelOrder', async(req,res)=>{
  await userhelpers.cancelOrder(req.body.orderId).then((response)=>{
    res.json(response)

  })
  
});


/* ---------------------------------- error --------------------------------- */


router.get('/error', function(req, res) {
  res.render('user/error',{loggedInUser,user:true});
});


/* -------------------------------- wishList -------------------------------- */


router.get('/wishList',verifyLogin,function(req,res){
  res.render('user/wishList',{loggedInUser,user:true})
});


/* ---------------------------------- test ---------------------------------- */


router.get('/test', function(req, res) {
  res.render('user/test',{user:true});
});
 


module.exports = router;
