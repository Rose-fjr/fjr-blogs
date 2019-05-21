const Article=require("../Models/article")
const User=require("../Models/user")
const Comment=require("../Models/comment")

const fs=require("fs")
const {join}=require("path")

exports.index=async ctx=>{
    if(ctx.session.isNew){
        ctx.status=404;
        return await ctx.render("404",{title:"404"})
    }
    const id=ctx.params.id;
    //返回数组 admin下所有文件的文件名
    const arr=fs.readdirSync(join(__dirname,"../views/admin"))

    let flag=false;

    arr.forEach(v=>{
        const fileName=v.replace(/^(admin\-)|(\.pug)$/g,"");
        if(fileName===id){
            flag=true;
        }
    })
    if(flag){
        await ctx.render("./admin/admin-"+id,{
            role:ctx.session.role
        })
    }else{
        ctx.status=404;
        await ctx.render("404",{
            title:"404"
        })
    }
}