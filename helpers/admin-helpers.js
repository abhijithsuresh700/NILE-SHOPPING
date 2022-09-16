const db = require('../configuration/connection');
const collection = require('../configuration/collection');
const { ObjectId } = require('mongodb');
const { PRODUCT_COLLECTION } = require('../configuration/collection');
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
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryData).then((data)=>{
                    resolve();
                    
                });
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
            let allOrders= await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
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
            console.log( paymentmethodCount);
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
                    totalAmount:1,
                    year:{$year:"$timeStamp"}
                }
            },
            {
                $group:{
                    // _id:{$dateToString:{format:"%Y",date:'$timeStamp'}},
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
                    totalAmount:1,
                    month:{$month:"$timeStamp"}
                }
            },
            {
                $group:{
                    // _id:{$dateToString:{format:"%Y",date:'$timeStamp'}},
                    _id:"$month",
                    totalAmount:{$sum:'$totalAmount'},
                    count:{$sum:1}

                }
            },
            {
                $sort:{_id:1}
            }
           

            ]).toArray()
            console.log(monthlyChart,"monthhhhhhhhhhhhh");
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
                        totalAmount:1,
                        month:{$month:"$timeStamp"}
                    }
                },
                {
                    $group:{
                        // _id:{$dateToString:{format:"%Y",date:'$timeStamp'}},
                        _id:"$month",
                        totalAmount:{$sum:'$totalAmount'},
                        count:{$sum:1}
    
                    }
                },
                {
                    $sort:{_id:1}
                }
               
    
                ]).toArray()
                console.log(dailyChart,"deyyyyyyyyyyyyyy");
                resolve(dailyChart)
            })
        },

        
}
