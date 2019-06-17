const {Schema}=require('./connection')

const UserSchema=new Schema({
    username:String,
    password:String,
    role:{
        type:String,
        default:1
    },
    avatar:{
        type:String,
        default:"/avatar/default.jpg"
    },
    articleNum:Number,
    commentNum:Number
},{
    versionKey:false
})

UserSchema.post("remove",(doc)=>{
    const Comment=require("../Models/comment")
    const Article=require("../Models/article")
    console.log(doc)
    const {_id}=doc;
    console.log(_id);

   
    Article.find({author:_id})
        .then(data=>{
            console.log(data)
            data.forEach(v=>v.remove())
        })
    Comment.find({from:_id})
        .then(data=>{
            console.log(data)
            data.forEach(v=>v.remove())
    })
   
})
module.exports=UserSchema;