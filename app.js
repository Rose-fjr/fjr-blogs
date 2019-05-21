const Koa=require("koa")
const static=require('koa-static')
const views=require('koa-views')
const router=require('./routers/router')
const logger=require('koa-logger')
const body=require('koa-body')
const {join}=require('path')
const session=require('koa-session')
const compress=require('koa-compress')

//生成koa实例
const app=new Koa
//签名
app.keys=["fangjinrong blogs"];
//session的配置对象
const CONFIG={
    key:"Sid",
    maxAge:36e5,
    overwrite:true,
    httpOnly:true,
    signed:true,
    rolling:true
}
//注册日志模块
app.use(logger())

//注册资源压缩模块
app.use(compress({
    threshold:2048,
    flush:require('zlib').Z_SYNC_FLUSH
}))

//注册session
app.use(session(CONFIG,app))
//配置 koa-body 处理post请求数据
app.use(body())
//配置静态资源目录
app.use(static(join(__dirname,"public")))
//配置视图模板
app.use(views(join(__dirname,"views"),{
    extension:"pug"
}))



//注册路由信息
app
    .use(router.routes())
    .use(router.allowedMethods())

app.listen(3000,()=>{
    console.log("项目启动成功，监听在3000端口")
})

//创建管理员用户 如果管理员用户已经存在则返回  用户名密码：admin
{
    const {db}=require("./Schema/connection")
    const encrypt=require("./until/encrypt")
    const UserSchema=require("./Schema/user")
    //通过 db 对象创建操作user数据库的模型对象
    const User=db.model("users",UserSchema)
    User.find({username:"admin"})
    .then(data=>{
        if(data.length==0){
            new User({
                username:"admin",
                password:encrypt("admin"),
                role:999,
                articleNum:0,
                commentNum:0
            })
            .save()
            .then(data=>{
                console.log("管理员用户创建成功")
            })
            .catch(err=>{
                console.log("管理员用户创建失败")
            })
        }else{
            console.log("管理员用户已存在")
        }
    })
}