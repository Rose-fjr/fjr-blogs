const {db}=require("../Schema/connection")

const CommentSchema=require("../Schema/comment")
const Comment=db.model("comments",CommentSchema)

module.exports=Comment;