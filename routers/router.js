const Router=require('koa-router')
const router=new Router

//主页 /
router.get('/',async ctx=>{
    await ctx.render("index",{
     title:"fjr-blogs"
    })
})

//主要用来处理 用户注册 用户登录
router.get(/^\/user\/(reg|login)/,async (ctx)=>{
    //show 为true则显示注册 false显示登录
    const show=/reg$/.test(ctx.path)
    await ctx.render("register",{show})
})









module.exports=router