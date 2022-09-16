var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const multer = require('multer');
let edit=false;
var userhelpers= require("../helpers/user-helpers")


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


router.get('/', function(req, res, next) {

  
    res.render('admin/admin-login')
 
});


var adminUserName='admin@gmail.com'
var adminPass='12345'

router.post('/admin-login',async (req,res)=>{
  const{adminEmail,adminPassword}=req.body
  if(adminUserName == adminEmail && adminPass == adminPassword){
  req.session.adminloggedin = true

  let paymentMethodChart= await adminHelpers.paymentMethodChart()
  let yearlyChart=await adminHelpers.yearlyChart()
  let monthlyChart=await adminHelpers.monthlyChart()
  let dailyChart=await adminHelpers.dailyChart()
  console.log(yearlyChart,"8888888884444444444444444444");
  console.log(monthlyChart,"qqqqqqqqqqqqqqqqq");
  console.log(dailyChart,"pppppppppppppppppppp");
  res.render('admin/admin-dashboard',{admin:true,paymentMethodChart,yearlyChart,monthlyChart,dailyChart})
  }else{
    req.session.loginError=true
    res.redirect('/admin/')
   
  }
  })


router.post('/admin-dashboard', function(req, res) {
  res.redirect('/admin/admin-login');
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
  var filenames = req.files.map(function (file) {
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
    var filenames = req.files.map(function (file) {
        return file.filename;
    });
    
    req.body.images = filenames;
    adminHelpers.updateProductDetails(req.params.id,req.body).then((response) => {
      res.redirect("/admin/admin-products");
  });
  });




/* ----------------------------- delete products ---------------------------- */


router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  adminHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/admin-products')
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
    res.render('admin/admin-category',{admin:true});
  });


  router.post('/addcategory',(req,res)=>{
    adminHelpers.addCategory(req.body).then((response)=>{
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


router.get('/admin-deleteCategory/:id',(req,res)=>{
  let categoryId=req.params.id
  adminHelpers.deleteCategory(categoryId).then((response)=>{
    res.redirect('/admin/admin-categoryList')
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
  var filenames = req.files.map(function (file) {
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
  var filenames = req.files.map(function (file) {
      return file.filename;
  });
  
  req.body.images = filenames;
  adminHelpers.updateBannerDetails(req.params.id,req.body).then((response) => {
    res.redirect("/admin/admin-banners"); 
});
});

/* ----------------------------- delete banner ---------------------------- */


router.get('/delete-banner/:id',(req,res)=>{
  let bannerId=req.params.id
  adminHelpers.deleteBanner(bannerId).then((response)=>{
    res.redirect('/admin/admin-banners')
  })
  });

/* ------------------------------- Orders ------------------------------ */


router.get('/admin-orders',async function(req, res, next) {   
  await adminHelpers.getAllOrdersDetails().then((allOrderDetails)=>{
    res.render('admin/admin-orders',{admin:true,allOrderDetails});

  })
 

});





module.exports = router;
