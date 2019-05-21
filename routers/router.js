const Router=require('koa-router')
//拿到操作user表的逻辑对象
const user=require("../control/user")

const article=require('../control/article')

const comment=require("../control/comment")

const admin=require("../control/admin")

const upload=require("../until/upload")

const router=new Router

//主页 /
router.get('/',user.keepLog,article.getList)

//主要用来处理返回 用户注册 用户登录页面
router.get(/^\/user\/(?=reg|login)/,async (ctx)=>{
    //show 为true则显示注册 false显示登录
    const show=/reg$/.test(ctx.path)
    await ctx.render("register",{show})
})


//处理用户注册的post
router.post("/user/reg",user.reg)

//处理用户登录
router.post("/user/login",user.login)

//用户退出
router.get("/user/logout",user.logout)

//文章发表
router.get("/article",user.keepLog,article.addPage)

//文章的添加
router.post("/article",user.keepLog,article.add)

//文章列表分页 路由
router.get("/page/:id",article.getList)

//文章的详情页
router.get("/article/:id",user.keepLog,article.getDetails)

//发表评论
router.post("/comment",user.keepLog,comment.addComment)

//文章  评论  头像上传
router.get("/admin/:id",user.keepLog,admin.index)

//头像上传功能
router.post("/upload",user.keepLog,upload.single("file"),user.upload)

//获取用户的所有评论
router.get("/user/comments",user.keepLog,comment.getCommentList)

//删除用户评论
router.delete("/comment/:id",user.keepLog,comment.delComment)

//获取用户所有文章
router.get("/user/articles",user.keepLog,article.getAticleList)

//删除对应的文章
router.delete("/article/:id",user.keepLog,article.delAticle)

//获取所有用户
router.get("/user/users",user.keepLog,user.getUsers)

//删除用户
router.delete("/user/:id",user.keepLog,user.delUser)

//
router.get("*",async (ctx)=>{
    await ctx.render("404",{
        title:"404"
    })
})



module.exports=router