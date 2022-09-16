// function changeQ(cartId,proId,cartCount,userId){
//     console.log("qqqqqqqqqqqqqqqqqqq")
//     let quantity=parseInt(document.getElementById(proId).innerHTML)
//     count=parseInt(count)
//     console.log(cartId)
//     $.ajax({
//       url:'/change-product-quantity',
//       data:{
//         user:userId,
//         cart:cartId,
//         product:proId,
//         count:cartCount,
//         quantity:quantity
//       },
      
//         method:'post',
//         success:(response)=>{
//           if(response.removeProduct){
//             alert:("Product removed from the cart")
//             location.reload()
//           }else{
//             document.getElementById(proId).innerHTML=quantity+count
//             document.getElementById("total").innerHTML=response.total
//           }
          
        
//       }
//     })
//   }