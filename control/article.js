const Article=require("../Models/article")
const User=require("../Models/user")
const Comment=require("../Models/comment")

//返回文章发表页
exports.addPage=async (ctx)=>{
    await ctx.render("add-article",{
        title:"fjr-页面发表",
        session:ctx.session
    })
}

//文章的发表（保存到数据库）

exports.add=async (ctx)=>{
    if(ctx.session.isNew){
        //true 没有登录 就不需要查询数据库
        return ctx.body={
           msg:"用户未登录",
           status:0
        }
    }
    //用户登录
    //post发送过来的数据
    const data=ctx.request.body;
    //添加文章作者
    data.author=ctx.session.uid;
    //初始化当前文章的评论数
    data.commentNum=0;
    await new Promise((resolve,reject)=>{
       new Article(data).save((err,data)=>{
          if(err)return reject(err)
          //更新用户文章计数
          User.update({_id:data.author},{$inc:{articleNum:1}},err=>{
              if(err)return console.log(err)
          })
          resolve(data)
     })
   })
   .then(data=>{
       ctx.body={
           msg:"发表成功",
           status:1
       }
   })
   .catch(err=>{
       ctx.body={
           msg:"发表失败",
           status:0
       }
   })

}

//获取文章列表
exports.getList=async (ctx)=>{
    //查询每篇文章对应作者的头像
    let page=ctx.params.id||1;
    page--;
    
    //获取总数，用于分页
    const maxNum=await Article.estimatedDocumentCount((err,data)=>err?console.log(err):data)

    const artList=await Article
        .find()//查询表里面的所有数据
        .sort("-created")//排序（降序）
        .skip(3*page)//跳过
        .limit(3)//筛选
        .populate({
            path:"author",
            select:'username _id avatar'
        })//mongoose用于联表查询
        .then(data=>data)
        .catch(err=>console.log(err))

    

    await ctx.render("index",{
     title:"fjr-blogs",
     session:ctx.session,
     artList,
     maxNum
    })
}

//文章详情
exports.getDetails=async (ctx)=>{
    const _id=ctx.params.id;
   const article= await Article
    .findById(_id)
    .populate("author","username")
    .then(data=>data)

    //查找跟当前文章相关联的所有评论
    const comment=await Comment
        .find({article:_id})
        .sort("-created")
        .populate("from","username avatar")
        .then(data=>data)
        .catch(err=>{
            console.log(err)
        })
    await ctx.render("article",{
        title:article.title,
        article,
        session:ctx.session,
        comment
    })
}

//获取某个用户的文章
exports.getAticleList=async (ctx)=>{
    const uid=ctx.session.uid;
    const data=await Article.find({author:uid})
    ctx.body={
        code:0,
        count:data.length,
        data
    }
}

//1.删除对应的文章
/* exports.delAticle=async (ctx)=>{
    const articleId=ctx.params.id
    const uid=ctx.session.uid
    let usid;
    let res={};
    //删除文章
    await Article.deleteOne({_id:articleId}).exec(async (err)=>{
        if(err){
            res={
                state:0,
                message:"删除失败"
            }
        }else{
            await Article.find({_id:articleId}).then((err,data)=>{
                if(err)return console.log(err)
                usid=data.author;
            })
        }
    })
    await User.update({_id:uid},{$inc:{articleNum:-1}})
    //删除某篇所有评论
    await Comment.find({article:articleId}).then(async data=>{
        let len=data.length;
        let i=0;

        async function deleteUser(){
            if(i>=len)return
            const cid=data[i]._id;

            await Comment.deleteOne({_id:cid}).then(data=>{
                User.update({_id:data[i].from},{$inc:{comment:-1}},err=>{
                    if(err)return console.log(err)
                    i++
                })
            })
        }
        await deleteUser()
    })


} */

//2.删除对应的文章
exports.delAticle=async ctx=>{
    const articleId=ctx.params.id;
    let res={
        state:1,
        message:"删除成功"
    }
    await Article.findById(articleId)
        .then(data=>data.remove())
        .catch(err=>{
            res={
                state:0,
                message:err
            }
        })

   
    ctx.body=res;
}