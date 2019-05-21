const Article=require("../Models/article")
const User=require("../Models/user")
const Comment=require("../Models/comment")

//发表评论
exports.addComment=async (ctx)=>{
    let message={
        status:0,
        msg:"登录才能评论"
    }

    //验证用户是否登录
    if(ctx.session.isNew)return ctx.body=message

    //用户登录了
    const data=ctx.request.body
    data.from=ctx.session.uid;
    const _comment=new Comment(data);
    await _comment
        .save()
        .then(data=>{
            message={
                status:1,
                msg:"评论成功"
            }
            //更新当前文章的评论数量
            Article
                .update({_id:data.article},{$inc:{commentNum:1}},err=>{
                    if(err)return console.log(err)
                    return console.log("评论计数器成功")
                })
            //更新评论计数器
            User.update({_id:data.from},{$inc:{commentNum:1}},err=>{
                if(err)return console.log(err)
            })
                
        })
        .catch(err=>{
            message={
                status:0,
                msg:err
            }
        })
    ctx.body=message;
}

//查询用户所有评论
exports.getCommentList=async (ctx)=>{
    const uid=ctx.session.uid;

    const data=await Comment
        .find({from:uid})
        .populate("article","title")

        ctx.body={
            code:0,
            count:data.length,
            data
        }
}

//1.删除对应id的评论
/* exports.delComment=async (ctx)=>{
    const commentId=ctx.params.id;
   /*  const articleId=ctx.request.body.data.articleId
    const uid=ctx.session.uid

    let isOk=true;
    //让文章计数器-1
    await Article.update({_id:articleId},{$inc:{commentNum:-1}})
    await User.update({_id:uid},{$inc:{commentNum:-1}})
    //删除评论
    await Comment.deleteOne({_id:commentId},err=>{
        if(err)isOk=false;
    }) */
    /*let isOk=true;
    let articleId,uid;

    //删除评论
    await Comment.findById(commentId,(err,data)=>{
        if(err){
            console.log(err);
            isOk=false;
        }else{
            articleId=data.article;
            uid=data.from;
        }
    })
    await Article.update({_id:articleId},{$inc:{commentNum:-1}})
    await User.update({_id:uid},{$inc:{commentNum:-1}})
    await Comment.deleteOne({_id:commentId})
    if(isOk){
        ctx.body={
            state:1,
            message:"删除成功"
        }
    }
} */

//2.删除对应id的评论 
exports.delComment=async ctx=>{
    const commentId=ctx.params.id

    let res={
        state:1,
        message:'删除成功'
    }

    await Comment.findById(commentId)
        .then(data=>data.remove())
        .catch(err=>{
            res={
                state:0,
                message:err
            }
        })

        ctx.body=res;
}