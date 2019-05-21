const {Schema}=require("./connection")
const ObjectId=Schema.Types.ObjectId;

const CommentSchema=new Schema({
    content:String,
    //关联用户集合
    from:{
        type:ObjectId,
        ref:"users"
    },
    //关联 article 集合
    article:{
        type:ObjectId,
        ref:"articles"
    }
},{
    versionKey:false,
    timestamps:{
        createdAt:"created"
    }
})

/* //设置评论的删除的钩子 (前置)
CommentSchema.pre() */

//(后置)
CommentSchema.post("remove",(doc)=>{
    //当前这个回调函数 一定会在 remove事件执行触发
    const Article=require("../Models/article")
    const User=require("../Models/user")
    const {from:fromId,article:articleId}=doc;

    Article.updateOne({_id:articleId},{$inc:{commentNum:-1}}).exec();

    User.updateOne({_id:fromId},{$inc:{commentNum:-1}}).exec();

})

module.exports=CommentSchema;