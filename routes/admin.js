let express = require('express');
let router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const multer = require('multer');
let edit=false;
let userhelpers= require("../helpers/user-helpers")


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


/* GET users listing. */


router.get('/', function(req, res, next){
    res.render('admin/admin-login')
 
});


let adminUserName='admin@gmail.com'
let adminPass='12345'

router.post('/admin-login',(req,res)=>{
  const{adminEmail,adminPassword}=req.body
  if(adminUserName == adminEmail && adminPass == adminPassword){
  req.session.adminloggedin = true
  res.redirect('/admin/admin-dashboard');
  }else{
    req.session.loginError=true
    res.redirect('/admin/')
  }
  })


router.get('/admin-dashboard',async function(req, res) {
  let paymentMethodChart= await adminHelpers.paymentMethodChart()
  let yearlyChart=await adminHelpers.yearlyChart()
  let monthlyChart=await adminHelpers.monthlyChart()
  let dailyChart=await adminHelpers.dailyChart()
  let allOrders=await adminHelpers.allOrders()
  let deliveredOrders=await adminHelpers.deliveredOrders()
  res.render('admin/admin-dashboard',{admin:true,paymentMethodChart,yearlyChart,monthlyChart,dailyChart,allOrders,deliveredOrders})
});

/* ------------------------------- users list ------------------------------- */


router.get('/admin-users', function(req, res, next) {
  adminHelpers.getAllUsers().then((userData)=>{
    res.render('admin/admin-users',{admin:true,userData});
  }) 
});


/* ------------------------------ product list ------------------------------ */


router.get('/admin-products', function(req, res, next) {
  adminHelpers.getProducts().then((product)=>{
    res.render('admin/admin-products',{admin:true,product});
  })
    });



/* ------------------------------- block users ------------------------------ */


router.get('/block-user/:id', async(req,res)=>{
  let user = await adminHelpers.blockUser(req.params.id);
  if(req.session.loggedIn){
    req.session.destroy();
    res.redirect('/admin-users');
  }else res.redirect('/admin/admin-users');
});


/* ------------------------------ unblock user ------------------------------ */


router.get('/unblock-user/:id', async(req,res)=>{
  let user = await adminHelpers.unblockUser(req.params.id);
    res.redirect('/admin/admin-users');
});



/* ------------------------------ add products ------------------------------ */


router.get('/admin-add-products', function(req, res, next) {
  adminHelpers.getCategory().then((categoryList)=>{
    res.render('admin/admin-add-products',{admin:true,categoryList});

  })
 
});



router.post("/add-products", upload.array("images", 4), (req, res) => {
  if (!req.files) {
      res.redirect("/admin/admin-add-products");
  }
  let filenames = req.files.map(function (file) {
      return file.filename;
  });
  req.body.images = filenames;
  adminHelpers.addProducts(req.body).then((response) => {
 
    res.redirect("/admin/admin-products");
});
});


/* ------------------------------ edit products ----------------------------- */



router.get('/edit-products/:id',async(req,res)=>{

   let productDetails = await adminHelpers.getProductDetails(req.params.id)
  req.session.edit=true
    res.render('admin/admin-edit-products',{admin:true,productDetails});
});




  router.post("/edited-products/:id", upload.array("images", 4), (req, res) => {
    
    if (!req.files) {
        res.redirect("/admin/admin-edit-products");
    }
    let filenames = req.files.map(function (file) {
        return file.filename;
    });
    
    req.body.images = filenames;
    adminHelpers.updateProductDetails(req.params.id,req.body).then((response) => {
      res.redirect("/admin/admin-products");
  });
  });




/* ----------------------------- delete products ---------------------------- */


  router.post('/deleteProduct',(req,res,next)=>{
    adminHelpers.deleteProduct(req.body.productId).then((response)=>{
      res.json(response)
    })
  });

  /* ------------------------------  categoryList ------------------------------ */


  router.get('/admin-categoryList', function(req, res, next) {
    adminHelpers.getCategory().then((category)=>{
      res.render('admin/admin-categoryList',{admin:true,category});

    })
   
  });


  /* ------------------------------ add category ------------------------------ */


  router.get('/admin-category', function(req, res, next) {
    let category=req.session.category
    res.render('admin/admin-category',{admin:true,category});
    req.session.category=false;
  });


  router.post('/addcategory',(req,res)=>{
    adminHelpers.addCategory(req.body).then((response)=>{
      req.session.category=response
      res.redirect('/admin/admin-category');
    })
  });

 /* ------------------------------ edit category ------------------------------ */


 router.get('/admin-editCategory/:id', (async(req, res, next)=>{
  let categoryDetails = await adminHelpers.getCategoryDetails(req.params.id)
  res.render('admin/admin-editCategory',{admin:true,categoryDetails});

 }));

 router.post('/editedCategory/:id',(req,res)=>{
  adminHelpers.updateCategoryDetails(req.params.id,req.body).then((response)=>{
    res.redirect('/admin/admin-categoryList')
  })
 })



   

/* ----------------------------- delete category ---------------------------- */


  router.post('/deleteCategory',(req,res,next)=>{
    adminHelpers.deleteCategory(req.body.categoryId).then((response)=>{
      res.json(response)
    })
  });


/* ------------------------------- BannerList ------------------------------- */

router.get('/admin-banners', function(req, res, next) {
  adminHelpers.getBanners().then((banner)=>{
  res.render('admin/admin-banners',{admin:true,banner});
})
});


  /* ------------------------------- add banners ------------------------------ */


  router.get('/admin-add-banners', function(req, res, next) {   
      res.render('admin/admin-add-banners',{admin:true});

  });



  router.post('/addbanners', upload.array("images", 4),(req,res)=>{
    if (!req.files) {
      res.redirect("/admin/admin-add-banners");
  }
  let filenames = req.files.map(function (file) {
      return file.filename;
  });
  req.body.images = filenames;
    adminHelpers.addBanners(req.body).then((response)=>{
      res.redirect('/admin/admin-add-banners');
    })
  });


   /* ------------------------------ edit banner ------------------------------ */


 router.get('/admin-editBanner/:id', (async(req, res, next)=>{
  let bannerDetails = await adminHelpers.getBannerDetails(req.params.id)
  res.render('admin/admin-editBanner',{admin:true,bannerDetails});

 }));


 
 router.post("/edited-banners/:id", upload.array("images", 4), (req, res) => {
    
  if (!req.files) {
      res.redirect("/admin/admin-editBanner");
  }
  let filenames = req.files.map(function (file) {
      return file.filename;
  });
  
  req.body.images = filenames;
  adminHelpers.updateBannerDetails(req.params.id,req.body).then((response) => {
    res.redirect("/admin/admin-banners"); 
});
});

/* ----------------------------- delete banner ---------------------------- */


  router.post('/deleteBanner',(req,res,next)=>{
    adminHelpers.deleteBanner(req.body.bannerId).then((response)=>{
      res.json(response)
    })
  });

/* ------------------------------- Orders ------------------------------ */


router.get('/admin-orders',async function(req, res, next) {   
  await adminHelpers.getAllOrdersDetails().then((allOrderDetails)=>{
    res.render('admin/admin-orders',{admin:true,allOrderDetails});

  })
});

/* ------------------------------- Coupon ------------------------------ */


router.get('/admin-coupon',async function(req, res, next) {
  await adminHelpers.getCoupon().then((coupon)=>{
    res.render('admin/admin-coupon',{admin:true,coupon});

  })
});

router.get('/admin-banners', function(req, res, next) {
  adminHelpers.getBanners().then((banner)=>{
  res.render('admin/admin-banners',{admin:true,banner});
})
});

/* -------------------------------Add Coupon ------------------------------ */


router.get('/admin-add-coupon',async function(req, res, next) {   
  // await adminHelpers.getAllOrdersDetails().then((allOrderDetails)=>{
    res.render('admin/admin-add-coupon',{admin:true});

  // })
});

router.post('/add-coupons',(req,res)=>{
  adminHelpers.addCoupon(req.body).then((response)=>{
    res.redirect('/admin/admin-add-coupon');
  })
});

/* ----------------------------- delete coupon ---------------------------- */


  router.post('/deleteCoupon',(req,res,next)=>{
    adminHelpers.deleteCoupon(req.body.userId).then((response)=>{
      res.json(response)
    })
  });


  /* ------------------------------ report ------------------------------ */


router.get('/admin-report', function(req, res, next) {
  // adminHelpers.getProducts().then((product)=>{
    res.render('admin/admin-report',{admin:true});
  // })
    });

    /* ------------------------------ change status ----------------------------- */

    router.post('/changeOrderStatus',(req,res)=>{
      adminHelpers.changeOrderStatus(req.body.id,req.body.status).then(()=>{
        res.redirect('/admin/admin-orders')
      })   
    })

/* ------------------------------ sales report ------------------------------ */


    router.post('/daily-report', function(req, res, next) {
      adminHelpers.dailySales(req.body.day).then((product)=>{
        res.render('admin/admin-dailyReport',{admin:true,product});
      })
        });


    router.post('/monthly-report', function(req, res, next) {
      adminHelpers.monthlySales(req.body.month).then((product)=>{
        res.render('admin/admin-monthlyReport',{admin:true,product});
      })
        });


        router.post('/yearly-report', function(req, res, next) {
          adminHelpers.yearlySales(req.body.year).then((product)=>{
            res.render('admin/admin-yearlyReport',{admin:true,product});
          })
            });


             /* ------------------------------ offers ------------------------------ */


  router.get('/admin-offers',async function(req, res, next) {
    await adminHelpers.getOffer().then((offer)=>{
    res.render('admin/admin-offers',{admin:true,offer});
    })
  });


  /* -------------------------------Add Offers ------------------------------ */


router.get('/admin-add-offer',async function(req, res, next) {   
  // await adminHelpers.getAllOrdersDetails().then((allOrderDetails)=>{
    res.render('admin/admin-add-offer',{admin:true});

  // })
});

router.post('/add-offer',(req,res)=>{
  adminHelpers.addOffer(req.body).then((response)=>{
    res.redirect('/admin/admin-add-offer');
  })
});


/* ----------------------------- delete offers ---------------------------- */


router.post('/deleteOffer',(req,res,next)=>{
  adminHelpers.deleteOffer(req.body.offerId).then((response)=>{
    res.json(response)
  })
});


  /* ------------------------------wallet offers ------------------------------ */


    router.get('/admin-walletOffers',async function(req, res, next) {
     await adminHelpers.getWalletOffer().then((offer)=>{
     res.render('admin/admin-walletOffers',{admin:true,offer});
      })
      });

       
      
  /* -------------------------------Add wallet Offers ------------------------------ */


router.get('/admin-add-walletOffer',async function(req, res, next) {   
  // await adminHelpers.getAllOrdersDetails().then((allOrderDetails)=>{
    res.render('admin/admin-add-walletOffer',{admin:true});

  // })
});


router.post('/add-walletOffer',(req,res)=>{
  adminHelpers.addwalletOffer(req.body).then((response)=>{
    res.redirect('/admin/admin-add-walletOffer');
  })
});

  
            




module.exports = router;
