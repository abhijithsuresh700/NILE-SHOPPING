var db=require('../configuration/connection')
var collection=require('../configuration/collection')
const { ObjectId, Collection } = require('mongodb');
const bcrypt=require('bcrypt');

/* -------------------------------- RazorPay -------------------------------- */

const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_Wj5kpFajNXnCpi',
    key_secret: 'lnw1b7hJRarMsSzZAV7RxANf',
  });

  /* --------------------------------- Paypal --------------------------------- */

// const express = require('express');
const paypal = require('paypal-rest-sdk');
const { response } = require('express');
const { request } = require('http');
const { resolve } = require('path');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AdcIJG8-pIp9CoA2o_PH3zVlTjK-B6rP5hOVAU8FqbaxCZ9n6-aRFx8gCHdK1bn9XJtd1hp-NAzAYb6a',
  'client_secret': 'EDOKDBYsiuHFNVxV5UEzXhmergMEHj1At74pYa7j1ZnmxMf9cwXg_AasD7C5eIu-XiMxEwKgxlxZnFVL'
});


module.exports={

    /* -------------------------------- doSignUp -------------------------------- */


    doSignup:(userData)=>{
        //userData-> data from signup form
        return new Promise(async(resolve,reject)=>{
            let useremail = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.email})
            
            if(!useremail){            
                userData.Password=await bcrypt.hash(userData.Password,10)
                userData.ConfirmPassword = await bcrypt.hash(userData.ConfirmPassword, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    //data->whole which is storing in database
                    resolve(data)
                })
            }else{
                console.log("Wrong Email")
            
            }
            
           
            
        })
    },

    /* --------------------------------- doOtpLogin -------------------------------- */


    doOtpLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({MobileNumber:userData.MobileNumber})
            if(user){
                response.validUser=true
                resolve(response)
            }else{
                response.invalidNumber=true
                resolve(response)
                console.log("Entered Mobile Number is not Registered");
            }
        })

    },


    /* --------------------------------- doLogin -------------------------------- */


    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            //making loginStatus as false and response as null
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.email})
            //Email->from database,,userData.email->from login
            if(user){
                //if (useremail)->if useremail is there in database
                if(!user.status)
                bcrypt.compare(userData.password,user.Password).then((status)=>{
                    //userData.password->from login,, user.Password->from database,,if both email&password are true->status
                    if(!user.status){

                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
                else{
                    resolve({status:false})

                }
            }else{
                console.log("login failed");
                resolve({status:false})
            }
        })
    },

    /* --------------------------------- getUser -------------------------------- */


    getUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let users= await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            resolve(users)
        })

    },
/* ------------------------------- userAddress ------------------------------ */

    userAddress:(address)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USERADDRESS_COLLECTION).insertOne({UserId:ObjectId(address.userId),Address:address}).then((response)=>{
                resolve(response)
            })
        })
    },

    /* ----------------------------- getAllProducts ----------------------------- */

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let userProducts= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(userProducts)
        })

    },

    /* ----------------------------- getMensProducts ---------------------------- */

    getMensProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let mensItems= await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                
              {
                $match:{user:ObjectId(userId)}
              },
              
              {
                $project:{
                    item:1,
                    quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                }
              }
              
            ]).toArray()
            
            resolve(mensItems)
        })
    },

    /* -------------------------------- addToCart ------------------------------- */

    addToCart:(proId,userId,size)=>{
        let productObject={
            item:ObjectId(proId),
            quantity:1,
            size:size
        }
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                let productExists=userCart.products.findIndex(product=>product.item==proId)
                if(productExists!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
                {
                
                        $push:{products:productObject}
                    
                }
                
                ).then((resonse)=>{
                    resolve()

                }) 

                }
                

            }else{
                let cartObject={
                    user:ObjectId(userId),
                    products:[productObject]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObject).then((response)=>{
                    resolve()
                })
            }
        })
    },

    addToWishlist:(proId,userId)=>{
        let productObject={
            item:ObjectId(proId),
            quantity:1,
        }
        return new Promise(async(resolve,reject)=>{
            let userWishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
            if(userWishList){
                let productExists=userWishList.products.findIndex(product=>product.item==proId)
                if(productExists!=-1){
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId)},
                {
                
                        $push:{products:productObject}
                    
                }
                
                ).then((resonse)=>{
                    resolve()

                }) 

                }
                

            }else{
                let wishlistObject={
                    user:ObjectId(userId),
                    products:[productObject]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObject).then((response)=>{
                    resolve()
                })
            }
        })
    },

    /* ----------------------------- getWishListProducts ---------------------------- */


    getWishListProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let wishlistItems= await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                
              {
                $match:{user:ObjectId(userId)}
              },
              {
                $unwind:'$products'
              },
              {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
              },
              {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }

              },
              {
                $project:{
                    item:1,
                    quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                }
              }
              
            ]).toArray()
            
            resolve(wishlistItems)
        })
    },

    /* ----------------------------- getCartProducts ---------------------------- */

    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                
              {
                $match:{user:ObjectId(userId)}
              },
              {
                $unwind:'$products'
              },
              {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
              },
              {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }

              },
              {
                $project:{
                    item:1,
                    quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                }
              }
              
            ]).toArray()
            
            resolve(cartItems)
        })
    },


    getCartProductsById:(cartId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                
              {
                $match:{_id:ObjectId(cartId)}
              },
              {
                $unwind:'$products'
              },
              {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
              },
              {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }

              },
              {
                $project:{
                    item:1,
                    quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                }
              }
              
            ]).toArray()
            
            resolve(cartItems)
        })
    },


    /* ------------------------------ getCartCount ------------------------------ */

    getCartCount:(userId)=>{
        let count=0
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)

        })
    },

     /* ------------------------------ getWishlistCount ------------------------------ */

     getWishlistCount:(userId)=>{
        let count=0
        return new Promise(async(resolve,reject)=>{
            let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
            if(wishlist){
                count=wishlist.products.length
            }
            resolve(count)

        })
    },

    /* ----------------------------- productDetails ----------------------------- */

    getProductDetails:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let productDetails= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)})
            resolve(productDetails)
        })

    },

    /* -------------------------- changeProductQuantity ------------------------- */

    changeProductQuantity:(details)=>{
        count=parseInt(details.count)
        quantity=parseInt(details.quantity)
        return new Promise ((resolve,reject)=>{
            if(count==-1 && quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},
                {
                    $pull:{products:{item:ObjectId(details.product)}}
                }).then((response)=>{
                    response.removeProduct=true
                    resolve(response)
                })
            }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart),
                'products.item':ObjectId(details.product)},
                //products-> same name that showing in cart database
                {
                    $inc:{'products.$.quantity':count}
                }).then((response)=>{
                    response.status=true
                    resolve(response)
                })
            }
        })
    },

    /* ----------------------------- getTotalAmount ----------------------------- */


    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
          let total = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { user: ObjectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: {
                    $arrayElemAt: ["$product", 0],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $multiply: ["$quantity", { $toInt: "$product.price" }],
                    },
                  },
                },
              },
            ])
            .toArray();
           
          if (total.length != 0) {
            resolve(total[0].total);
          } else {
            resolve(0);
          }
        });
      },


      getTotalAmountById: (cartId) => {
        return new Promise(async (resolve, reject) => {
          let total = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: {_id: ObjectId(cartId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: {
                    $arrayElemAt: ["$product", 0],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $multiply: ["$quantity", { $toInt: "$product.price" }],
                    },
                  },
                },
              },
            ])
            .toArray();
           
          if (total.length != 0) {
            resolve(total[0].total);
          } else {
            resolve(0);
          }
        });
      },


      /* ---------------------------- deleteCartProduct --------------------------- */


    deleteCartProduct:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(data.cart)},
            {
                $pull:{products:{item:ObjectId(data.product)}}
            }).then((response)=>{
                resolve(response)
            })
        })
    },




    /* ------------------------------- placeOrder ------------------------------- */


    placeOrder:(order,products,total,userId,address)=>{
        return new Promise((resolve,reject)=>{
            let status=order['PaymentMethod']==='COD'?'Placed':'Pending'
            let orderObj={
                userId:userId,
                paymentMethod:order['PaymentMethod'],
                addressID:order['userAddress'],
                products:products,
                totalAmount:total,
                Date:new Date().toDateString(),
                timeStamp:new Date(),
                status:status,
                address:address,
            
                
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(userId)})
                // response.status=true;
                resolve(response)

            })

        })
    },

    /* ----------------------------- getOrderDetails ---------------------------- */


    getOrderDetails:(loggeduserId)=>{
        return new Promise(async(resolve,reject)=>{
        let orderDetails =await db.get().collection(collection.ORDER_COLLECTION).find({userId:loggeduserId}).sort({_id:-1}).toArray()
            resolve(orderDetails)
           
        })
    },


    /* -------------------------- getSingleOrderDetails ------------------------- */


    getSingleOrderDetails:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
        let singleOrderDetails =await db.get().collection(collection.ORDER_COLLECTION).find({_id:ObjectId(orderId)}).toArray()
            resolve(singleOrderDetails)
           
        })
    },

   


    /* ---------------------------- getOrderProducts ---------------------------- */


    getOrderedProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderedItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
              {
                $match:{_id:ObjectId(orderId)}
              },
              {
                $unwind:'$products'
              },
              {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
              },
              {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }

              },
              {
                $project:{
                    item:1,
                    quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                }
              }
              
            ]).toArray()
            
            resolve(orderedItems)
        })

    },


    /* ------------------------------ removeAddress ----------------------------- */


    removeAddress: (addressId) => {
        return new Promise(async(resolve, reject) => {
           await db.get().collection(collection.USERADDRESS_COLLECTION).deleteOne({ _id:ObjectId(addressId)}).then((response) => {
                resolve(response)
            })
        })
    },


    /* ---------------------------- findSingleAddress --------------------------- */


    findSingleAddress:(addressId)=>{
        return new Promise(async(resolve, reject) => {
           await db.get().collection(collection.USERADDRESS_COLLECTION).aggregate([{$match:{UserId:ObjectId(addressId)}},
        {
            $project:{
                Address:1
            }
        }
    ]).toArray().then((response) => {
                resolve(response)
            })
        })
    },

      /* ---------------------------- findOrderAddress --------------------------- */


      findOrderAddress:(addressId)=>{
        return new Promise(async(resolve, reject) => {
           await db.get().collection(collection.USERADDRESS_COLLECTION).aggregate([{$match:{_id:ObjectId(addressId)}},
        {
            $project:{
                Address:1
            }
        }
    ]).toArray().then((response) => {
                resolve(response)
            })
        })
    },

    /* -------------------------- updateAddressDetails -------------------------- */

      /* -------------------------- updateAddressDetails -------------------------- */


      updateAddressDetails:(addressId,addresses)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USERADDRESS_COLLECTION).updateOne({_id:ObjectId(addressId)},{
                $set:{
                    userName:addresses.userName,
                    userAddress1:addresses.userAddress1,
                    userAddress2:addresses.userAddress2,
                    userArea:addresses.userArea,
                    userState:addresses.userState,
                    userPinCode:addresses.userPinCode,
                    userCountry:addresses.userCountry,
                    userMobileNumber:addresses.userMobileNumber,


                }
            }).then((response)=>{
                resolve(response)
            })
          })
    },

    /* ------------------------------- profilePic ------------------------------- */

    profilePic:(pic,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne(
                {
                    _id:ObjectId(userId)
                },
                {
                    $set:{ProfilePic:pic}
                },
                
                ).then((response)=>{
                resolve(response)
            })

        })
    },

    /* ------------------------------ getProfilePic ----------------------------- */

    getProfilePic:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let proPic=await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $match:{_id:ObjectId(userId)}
            },
            {
                $unwind:'$ProfilePic'
                
            },
        ]).toArray().then((proPic)=>{
            resolve(proPic)
            })
        })
    },





    /* ---------------------------- generateRazorPay ---------------------------- */


    generateRazorpay:(orderId,totalAmount)=>{  
        return new Promise(async(resolve,reject)=>{
            const options={
                amount:totalAmount*100,
                currency:"INR",
                receipt:""+orderId
            }
            instance.orders.create(options,function(err,order){
                if(err){
                    console.log(err);
                }else{
                    resolve(order)
                }
            })
        })
    },


    /* ------------------------------ verifyPayment ----------------------------- */


    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto');
            let hmac=crypto.createHmac('sha256','lnw1b7hJRarMsSzZAV7RxANf')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })

    },

    
    /* --------------------------- changePaymentStatus -------------------------- */


    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    status:'Placed'
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    /* --------------------------------- paypal --------------------------------- */

    generatePaypal:(orderId,totalAmount)=>{
        return new Promise((resolve,reject)=>{
                const create_payment_json = {
                  "intent": "sale",
                  "payer": {
                      "payment_method": "Paypal"
                  },
                  "redirect_urls": {
                      "return_url": "http://localhost:3000/orderConfirmation",
                      "cancel_url": "http://localhost:3000/cancel"
                  },
                  "transactions": [{
                      "item_list": {
                          "items": [{
                              "name": "Red Sox Hat",
                              "sku": "001",
                              "price": totalAmount,
                              "currency": "USD",
                              "quantity": 1
                          }]
                      },
                      "amount": {
                          "currency": "USD",
                          "total": totalAmount
                      },
                      "description": "Hat for the best team ever"
                  }]
              };
              
              paypal.payment.create(create_payment_json,async function (error, payment) {
                if (error) {
                    console.log("paypal error");
                    // throw error;
                } else {
                  await  db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    status:'Placed'
                }
            }).then(()=>{
                resolve(payment)
            })
                }
              });

        })
    },

    /* ------------------------------- cancelOrder ------------------------------ */
    

    cancelOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
          await  db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{$set:{status:"Canceled"}}).then((response)=>{
           response.cancel=true;
            resolve(response);
         });
        });
    },

/* -------------------------- deleteWishListProduct ------------------------- */

    deleteWishListProduct:(data)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id:ObjectId(data.wishList)},
            {
                $pull:{products:{item:ObjectId(data.product)}}
            }).then((response)=>{
                resolve(response)
            })
        })
    },

    findSingleCoupon:(couponCode)=>{
        return new Promise(async(resolve,reject)=>{
         let coupon= await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:couponCode})
         if(coupon){
            resolve(coupon)

         }else{
            response.noCoupon=true;
            resolve(response)
         }
         
        })
    },

    checkCoupon: (userId,coupon,totalAmount)=>{
        coupon.discount = parseInt(coupon.offerPercentage);
        coupon.minBuy = parseInt(coupon.minBuy);
        coupon.maxCap = parseInt(coupon.offerCap);
        totalAmount = parseInt(totalAmount)
        return new Promise(async (resolve, reject) => {
            let response = {};
            response.couponCode = coupon.couponCode;
            let todaysDate = new Date();
            let startDate = new Date(coupon.startDate);
            let endDate = new Date(coupon.expiryDate);
    
            // usedCoupon check
            let usedCoupon = await db.get().collection(collection.USER_COLLECTION).find({_id:ObjectId(userId)}).project({usedCoupon: 1,_id:0}).toArray()
            if(usedCoupon[0].usedCoupon){
                var AppliedCoupons = usedCoupon[0].usedCoupon;
                for (var item of AppliedCoupons) {
                    if(item == coupon.couponCode){
                        response.couponUsed = true;
                        resolve(response)
                    }
                }
            }
            // usedCoup
            if (coupon.status == 'Active') {
                if (startDate.setHours(0, 0, 0, 0) <= todaysDate.setHours(0, 0, 0, 0) && endDate.setHours(0, 0, 0, 0) >= todaysDate.setHours(0, 0, 0, 0)) {
                    if (totalAmount >= coupon.minBuy) {
                        let discount = parseInt(totalAmount * (coupon.discount / 100));
                        if (discount >= coupon.maxCap) {
                            response.newAmount = totalAmount - coupon.maxCap;
                        } else {
                            response.newAmount = totalAmount - discount;
                        }
                    } else {
                        response.minBuy = coupon.minBuy
                        response.noMinBuy = true;
                    }
                } else {
                    response.inactive = true;
                }
    
            } else {
                response.inactive = true;
            }
            resolve(response);
        })
    },
    
    // addCouponToUser: (userId,couponCode) => {
    //     return new Promise(async (resolve, reject) => {
    //         let couponExist = await db.get().collection(collection.USER_COLLECTION).findOne({
    //             $and: [
    //                 { _id:ObjectId(userId) },
    //                 { usedCoupon: { $exists: true } },
    //             ]
    //         })
    //         if (couponExist) {
    //             db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
    //                 {
    //                     $push: { usedCoupon: couponCode },
    //                 })
    //         }else {
    //             db.get().collection(collection.USER_COLLECTION).updateOne(
    //                 { _id: ObjectId(userId) },
    //                 {
    //                     $set:
    //                     {
    //                         usedCoupon: [couponCode]
    //                     }
    //                 },
    //             )
    //         }
    //         resolve(response)
    //     })
    // },


    /* --------------------------------- wallet --------------------------------- */

    wallet:(data,userId)=>{
        return new Promise((resolve,reject)=>{
            let amount=data.totalAmount-data.walletAmount
            resolve(amount)
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
            {
                $set:{
                    wallet:0
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }


}