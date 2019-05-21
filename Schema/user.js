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
    const Comment=require("../Models/article")
    const Article=require("../Models/comment")
    console.log(doc)
    const {_id:uid}=doc;
    Article.find({author:uid})
        .then(data=>{
            console.log(data)
            data.forEach(v=>v.remove())
        })

    Comment.find({from:uid})
        .then(data=>{
            console.log(data)
            data.forEach(v=>v.remove())
        })
})
module.exports=UserSchema;