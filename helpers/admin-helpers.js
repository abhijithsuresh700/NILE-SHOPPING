const db = require('../configuration/connection');
const collection = require('../configuration/collection');
const { ObjectId } = require('mongodb');
const { PRODUCT_COLLECTION } = require('../configuration/collection');
const { response } = require('express');
// const { response } = require('../app');
module.exports={
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
         let userData = await  db.get().collection(collection.USER_COLLECTION).find().toArray().then((userData)=>{
            resolve(userData)
         })


        })
    },

    blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
         let user = await  db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{status:false}}).then((data)=>{
            resolve(data);
         });
        });
    },

    unblockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
         let user = await  db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{status:true}}).then((data)=>{
            resolve(data);
         });
        });
    },

    addProducts:(product)=>{
         product.offerprice= product.price-(product.price*(product.offerpercentage/100))
        return new Promise(async(resolve,reject)=>{        
         await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve()
                })
            })
        },

        getProducts:()=>{
            return new Promise(async(resolve,reject)=>{
            let product =   await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                resolve(product)              
            })
        },

        deleteProduct: (proId) => {
            return new Promise(async(resolve, reject) => {
               await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id:ObjectId(proId) }).then((response) => {
                    resolve(response)
                })
            })
        },

        getProductDetails: (proId) => {
            return new Promise(async(resolve, reject) => {
             await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((product)=>{
                      resolve(product)  
                    }) 
            })
        },

        updateProductDetails:(proId,products)=>{
            products.offerprice= products.price-(products.price*(products.offerpercentage/100))
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(proId)},{
                    $set:{
                        productname:products.productname,
                        brandname:products.brandname,
                        price:products.brandname,
                        offerprice:products.offerprice,
                        category:products.category,
                        description:products.description,
                        images:products.images

                    }
                }).then((response)=>{
                    resolve(response)
                })
              })
        },

        addCategory:(categoryData)=>{
            let response={}
            return new Promise(async(resolve,reject)=>{

                let newCategory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({catagoryname:categoryData.catagoryname})
                if(newCategory){
                    response.valid=true;
                    resolve(response)
                }else{
                    db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryData).then((data)=>{
                        resolve();                      
                    });
                }
            });
        },

        getCategory:()=>{
            return new Promise(async(resolve,reject)=>{
            let category =await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(category)
               
            })
        },

        getCategoryDetails:(categoryId) => {
            return new Promise(async(resolve, reject) => {
             await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(categoryId)}).then((response)=>{
                      resolve(response)  
                    }) 
            })
        },

        updateCategoryDetails:(categoryId,category)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:ObjectId(categoryId)},{
                    $set:{
                        catagoryname:category.catagoryname,
                        subCatagory:category.subCatagory,
                        // description:banner.description,
                        // images:banner.images

                    }
                }).then((response)=>{
                    resolve(response)
                })
              })
        },


        deleteCategory: (categoryId) => {
            return new Promise(async(resolve, reject) => {
               await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id:ObjectId(categoryId) }).then((response) => {
                    resolve(response)
                })
            })
        },

        addBanners:(bannerData)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerData).then((data)=>{
                    resolve();
                    
                });
            });
        },

        getBanners:()=>{
            return new Promise(async(resolve,reject)=>{
            let banner =await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
                resolve(banner)
               
            })
        },

        getBannerDetails:(bannerId) => {
            return new Promise(async(resolve, reject) => {
             await db.get().collection(collection.BANNER_COLLECTION).findOne({_id:ObjectId(bannerId)}).then((banner)=>{
                      resolve(banner)  
                    }) 
            })
        },

        updateBannerDetails:(bannerId,banner)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:ObjectId(bannerId)},{
                    $set:{
                        bannerHeader:banner.bannerHeader,
                        bannerSubHeading:banner.bannerSubHeading,
                        description:banner.description,
                        images:banner.images

                    }
                }).then((response)=>{
                    resolve(response)
                })
              })
        },

        deleteBanner: (bannerId) => {
            return new Promise(async(resolve, reject) => {
               await db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id:ObjectId(bannerId) }).then((response) => {
                    resolve(response)
                })
            })
        },

         /* -------------------------- getAllOrdersDetails ------------------------- */

    getAllOrdersDetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let allOrders= await db.get().collection(collection.ORDER_COLLECTION).find().sort({_id:-1}).toArray()
            resolve(allOrders)
        })

    },

    /* --------------------------- paymentMethodChart --------------------------- */

    paymentMethodChart:()=>{
        return new Promise(async(resolve,reject)=>{
         let paymentmethodCount =  await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{_id:'$paymentMethod',count:{$sum:1}}
                }
            ]).toArray()
            resolve( paymentmethodCount)
        })
    },

    /* ------------------------------- yearlyChart ------------------------------ */


    yearlyChart:()=>{
        return new Promise(async(resolve,reject)=>{
         let yearchart = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $project:{
                    Date:1,
                    totalAmount:{$toInt:'$totalAmount'},
                    year:{$year:"$timeStamp"}
                }
            },
            {
                $group:{
                    _id:"$year",
                    totalAmount:{$sum:'$totalAmount'},
                    count:{$sum:1}

                }
            },
            {
                $sort:{_id:1}
            }
            ]).toArray()
            resolve(yearchart)
        })
    },

     /* ------------------------------- monthlyChart ------------------------------ */


     monthlyChart:()=>{
        return new Promise(async(resolve,reject)=>{
         let monthlyChart = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $project:{
                    Date:1,
                    totalAmount:{$toInt:'$totalAmount'},
                    month:{$month:"$timeStamp"}
                }
            },
            {
                $group:{
                    _id:"$month",
                    totalAmount:{$sum:'$totalAmount'},
                    count:{$sum:1}

                }
            },
            {
                $sort:{_id:1}
            }
            ]).toArray()
            resolve(monthlyChart)
        })
    },

        /* ------------------------------- dailyChart ------------------------------ */


        dailyChart:()=>{
            return new Promise(async(resolve,reject)=>{
             let dailyChart = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project:{
                        Date:1,
                        totalAmount:{$toInt:'$totalAmount'},
                        day:{$dayOfMonth:"$timeStamp"}
                    }
                },
                {
                    $group:{

                        _id:"$day",
                        totalAmount:{$sum:'$totalAmount'},
                        count:{$sum:1}
    
                    }
                },
                {
                    $sort:{_id:1}
                }
               
    
                ]).toArray()
                resolve(dailyChart)
            })
        },


        /* ------------------------------- add coupon ------------------------------- */

        addCoupon:(couponData)=>{         
            return new Promise((resolve,reject)=>{
                couponData.status='Active'
                db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then((data)=>{
                    resolve(data);
                    
                });
            });
        },

        /* ------------------------------- get coupon ------------------------------- */

        getCoupon:()=>{
            return new Promise(async(resolve, reject)=>{
            let coupon= await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                      resolve(coupon)  
                     
            })
        },

        /* ------------------------------ delete coupon ----------------------------- */

        deleteCoupon:(couponId)=>{
            return new Promise(async(resolve, reject) => {
                await db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id:ObjectId(couponId) }).then((response) => {
                    resolve(response)
                })
            })
        },

        /* --------------------------- change order status -------------------------- */

        changeOrderStatusShipped:(orderId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{
                        status:'Shipped'
                    }
                }).then(()=>{
                    resolve()
                })
            })
        },


        changeOrderStatus:(orderId,status)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{
                        status:status
                    }
                }).then(()=>{
                    resolve()
                })
            })
        },

        allOrders:()=>{
            return new Promise(async(resolve,reject)=>{
             let allOrders = await  db.get().collection(collection.ORDER_COLLECTION).count()
                resolve(allOrders)
             })     
        },

        deliveredOrders:()=>{
            return new Promise(async(resolve,reject)=>{
                let deliveredOrders= await db.get().collection(collection.ORDER_COLLECTION).find({status:'Delivered'}).toArray()
                console.log(deliveredOrders.length);
                resolve(deliveredOrders.length)
            })
        },

        /* ------------------------------ daily report ------------------------------ */


        dailySales:(dt)=>{
            return new Promise(async(resolve,reject)=>{
            let daily =  await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{
                            status:{$nin:['Canceled','Pending']}
                            }
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            timeStamp:1,
                            totalAmount:1,
                            status:1,
                            _id:1,
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project:{ 
                           date:{ $dateToString: { format:  "%Y-%m-%d", date: "$timeStamp" } },
                           totalAmount:1,
                           paymentMethod:1,
                           item:1,
                           product: { $arrayElemAt: ['$product', 0]},
                           quantity:1
                        }
                    },
                    {
                        $match:{date:dt}
                    },
                    {
                        $group:{
                            _id:'$item',
                            quantity:{$sum:'$quantity'},
                            totalAmount:{$sum:{$multiply:[{$toInt:'$quantity'},{$toInt:'$product.offerprice'}]}},
                            name:{'$first':'$product.productname'},
                            date:{"$first":'$date'},
                            price:{'$first':'$product.offerprice'},
                            
    
                        }
                    }
                ]).toArray()
                resolve(daily)
            })  
        },

        /* ----------------------------- monthly report ----------------------------- */

        monthlySales:(dt)=>{
            return new Promise(async(resolve,reject)=>{
            let monthly =  await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{
                            status:{$nin:['Canceled','Pending']}
                            }
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            timeStamp:1,
                            totalAmount:1,
                            status:1,
                            _id:1,
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project:{ 
                           date:{ $dateToString: { format:  "%Y-%m", date: "$timeStamp" } },
                           totalAmount:1,
                           paymentMethod:1,
                           item:1,
                           product: { $arrayElemAt: ['$product', 0]},
                           quantity:1
                        }
                    },
                    {
                        $match:{date:dt}
                    },
                    // {
                    //     $group:{
                    //         _id:'$item',
                    //         quantity:{$sum:'$quantity'},
                    //         totalAmount:{$sum:{$multiply:[{$toInt:'$quantity'},{$toInt:'$product.offerprice'}]}},
                    //         name:{'$first':'$product.productname'},
                    //         date:{"$first":'$date'},
                    //         price:{'$first':'$product.offerprice'},
                            
    
                    //     }
                    // }
                ]).toArray()
                resolve(monthly)
            })  
        },

        /* ------------------------------ yearly report ----------------------------- */


    yearlySales:(dt)=>{
            return new Promise(async(resolve,reject)=>{
            let yearly =  await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{
                            status:{$nin:['Canceled','Pending']}
                            }
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            timeStamp:1,
                            totalAmount:1,
                            status:1,
                            _id:1,
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project:{ 
                           date:{ $dateToString: { format:  "%Y", date: "$timeStamp" } },
                           totalAmount:1,
                           paymentMethod:1,
                           item:1,
                           product: { $arrayElemAt: ['$product', 0]},
                           quantity:1
                        }
                    },
                    {
                        $match:{date:dt}
                    },
                    {
                        $group:{
                            _id:'$item',
                            quantity:{$sum:'$quantity'},
                            totalAmount:{$sum:{$multiply:[{$toInt:'$quantity'},{$toInt:'$product.offerprice'}]}},
                            name:{'$first':'$product.productname'},
                            date:{"$first":'$date'},
                            price:{'$first':'$product.offerprice'},
                            
    
                        }
                    }
                ]).toArray()
                resolve(yearly)
            })  
        },


         /* ------------------------------- add offer ------------------------------- */

        //  addOffer:(offerData)=>{         
        //     return new Promise((resolve,reject)=>{
        //         offerData.status='Active'
        //         db.get().collection(collection.CATEGORYOFFER_COLLECTION).insertOne(offerData).then((data)=>{
        //             db.get().collection(collection.PRODUCT_COLLECTION).find({category:offerData.offerCategory}).forEach((obj)=>{
        //                 let offerP=Math.round(parseInt(obj.price)*(1-parseInt(offerData.
        //                     offerPercentage)/100))
        //                 db.get().collection(collection.PRODUCT_COLLECTION).update({category:offerData.offerCategory},
        //                     {$set:{
        //                         offerprice:offerP
        //                     }})
        //             }).then(()=>{
        //             })
                    
        //             resolve(data);
                    
        //         });
        //     });
        // },


        addOffer:(offerData)=>{         
            return new Promise((resolve,reject)=>{
                offerData.status='Active'
                db.get().collection(collection.CATEGORYOFFER_COLLECTION).insertOne(offerData).then((data)=>{
                    db.get().collection(collection.PRODUCT_COLLECTION).find({category:offerData.offerCategory}).forEach((obj)=>{
                        let offerP=Math.round(parseInt(obj.price)*(1-parseInt(offerData.
                            offerPercentage)/100))
                            let newOffer=offerData.offerPercentage
                        db.get().collection(collection.PRODUCT_COLLECTION).update({category:offerData.offerCategory},
                            {$set:{
                                offerprice:offerP,
                                categoryOfferPercentage:newOffer
                            }})
                    }).then(()=>{
                    })
                    
                    resolve(data);
                    
                });
            });
        },


        deleteOffer:(offerName)=>{         
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.CATEGORYOFFER_COLLECTION).remove(
                    {offerCategory
                    :offerName}).then((data)=>{
                    db.get().collection(collection.PRODUCT_COLLECTION).find({category:offerName}).forEach((obj)=>{
                        let offerP=Math.round(parseInt(obj.price)*(1-parseInt(obj.
                            offerpercentage)/100))
                            
                        db.get().collection(collection.PRODUCT_COLLECTION).update({category:offerName},
                            {$set:{
                                offerprice:offerP,
                                categoryOfferPercentage: null
                            }})
                    }).then(()=>{
                    })
                    resolve(data);
                    
                });
            });
        },


         /* ------------------------------- get offer ------------------------------- */

         getOffer:()=>{
            return new Promise(async(resolve, reject)=>{
            let offer= await db.get().collection(collection.CATEGORYOFFER_COLLECTION).find().toArray()
                      resolve(offer)  
                     
            })
        },


        /* ---------------------------- add wallet offer ---------------------------- */



        addwalletOffer:(offerData)=>{         
            return new Promise((resolve,reject)=>{
                offerData.status='Active'
                db.get().collection(collection.WALLET_COLLECTION).insertOne(offerData).then((data)=>{
                    resolve(data);
                    
                });
            });
        },


        /* ------------------------------- get wallet offer ------------------------------- */

        getWalletOffer:()=>{
            return new Promise(async(resolve, reject)=>{
            let offer= await db.get().collection(collection.WALLET_COLLECTION).find().toArray()
                      resolve(offer)  
                     
            })
        },



        
}
