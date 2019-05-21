const {db}=require("../Schema/connection")
const ArticleSchema=require("../Schema/article")
//通过 dn对象创建操作article数据库的模型对象
const Article=db.model("articles",ArticleSchema)

module.exports=Article;