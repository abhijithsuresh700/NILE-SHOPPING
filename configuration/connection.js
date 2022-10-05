const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    //const url='mongodb://localhost:27017'
    const url='mongodb+srv://mysundrymails700:Z3LdyfaGqpy5oJbM@cluster0.fhx2ga7.mongodb.net/?retryWrites=true&w=majority'
    const dbname='NileShopping'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
    })
    done()
}

module.exports.get=function(){
    return state.db
}