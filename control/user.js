const Article=require("../Models/article")
const User=require("../Models/user")
const Comment=require("../Models/comment")
const encrypt=require("../until/encrypt")

//用户注册
exports.reg=async (ctx)=>{
    //用户注册时post发过来的数据
    const user=ctx.request.body;
    const username=user.username;
    const password=user.password;
    //去数据库  user先查询当前发过来的 username信息是否存在
    await new Promise((resolve,reject)=>{
        User.find({username},(err,data)=>{
            if(err) return reject(err);
            //查询没出错 也可能没有数据
            if(data.length!==0){
                //查询到数据-->用户名已经存在
                return resolve("");
            }
            //用户名不存在 需要存到数据库
           const _user=new User({
                username:username,
                password:encrypt(password),
                articleNum:0,
                commentNum:0
            })
            _user.save((err,data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data)
                }
            })

        })
    })
    .then(async data=>{
        if(data){
            //注册成功
            await ctx.render("isOk",{
                status:"注册成功"
            })
        }else{
            //用户名已存在
            await ctx.render("isOk",{
                status:"用户名已存在,请重试"
            })
        }
    })
    .catch(async err=>{
        await ctx.render("isOk",{
            status:"注册失败,请重试"
        })
    })
}

//用户登录
exports.login=async (ctx)=>{
    //用户登录时post发过来的数据
    const user=ctx.request.body;
    const username=user.username;
    const password=user.password;

    await new Promise((resolve,reject)=>{
        User.find({username},(err,data)=>{
            if(err)return reject(err)
            if(data.length===0)return reject("用户名不存在");
            //把用户传过来的密码 加密后更数据库的比较
            if(data[0].password===encrypt(password)){
                return resolve(data)
            }
            resolve("");
        })
    })
    .then(async data=>{
        if(!data){
            return ctx.render("isOk",{
                status:"密码不正确，登录失败"
            });
        }
        //让用户在 cookie里设置 username password（加密后的密码权限）
        ctx.cookies.set("username",username,{
            domain:"localhost",
            path:"/",
            maxAge:36e5,
            httpOnly:true,//true 不让客户端能访问这个cookie
            overwrite:false,
            signed:true 
        })
        //用户的id值
        ctx.cookies.set("uid",data[0]._id,{
            domain:"localhost",
            path:"/",
            maxAge:36e5,
            httpOnly:true,//true 不让客户端能访问这个cookie
            overwrite:false,
            signed:true 
        })

        ctx.session={
            username,
            uid:data[0]._id,
            avatar:data[0].avatar,
            role:data[0].role
        }

        await ctx.render("isOk",{
            status:"登录成功"
        })

    })
    .catch(async err=>{
        console.log(err)
        await ctx.render("isOk",{
            status:"登录失败"
        })
    })
}

//保持用户状态 确定用户状态
exports.keepLog=async (ctx,next)=>{
    //true session没有数据
    if(ctx.session.isNew){
      if(ctx.cookies.get("username")){
          let uid=ctx.cookies.get('uid');
          const avatar=await User
                .findById(uid)
                .then(data=>data.avatar)

          ctx.session={
              username:ctx.cookies.get("username"),
              uid,
              avatar
          }
      }
    }
    await next()
} 

//用户退出
 exports.logout=async (ctx)=>{
    ctx.session=null;
    ctx.cookies.set("username",null,{
        maxAge:0
    });
     ctx.cookies.set("uid",null,{
        maxAge:0
    });
    //在后台做重定向
    ctx.redirect('/');
} 

//用户头像上传
exports.upload=async (ctx)=>{
    const filename=ctx.req.file.filename;

    let data={};

    await User.update({_id:ctx.session.uid},{$set:{avatar:"/avatar/"+filename}},(err,res)=>{
        if(err){
            data={
                status:0,
                message:"上传失败"
            }
        }else{
            data={
                status:1,
                message:"上传成功"
            } 
        }
    })

    ctx.body=data;
}

//获取所有用户
exports.getUsers=async (ctx)=>{
    const data=await User.find({username:{$ne:'admin'}})
    ctx.body={
        code:0,
        count:data.length,
        data
    }
}

//删除用户
exports.delUser=async (ctx)=>{
    const uid=ctx.params.id;
    let res={
        state:1,
        message:"删除成功"
    }
    await User.findById({_id:uid})
        .then(data=>data.remove())
        .catch(err=>{
            res={
                state:0,
                message:err
            }
        })
        ctx.body=res;
}