const CommentModel = require("../models/Comments");
const BlogPostModel = require("../models/Blogs");
const asyncWrapper = require("../middleware/async")


const createComment = asyncWrapper(async (req, res) => {    
        const postId = req.params.postId;
        const post = await BlogPostModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                status: "Failed",
                message: "Post not found"
            });
        } else {
            const commentData = {
                content: req.body.content,
                comment: req.body.comment,
                post: post._id,
                author: req.user.id
            }
            
            const newComment = await CommentModel.create(commentData);
            res.status(201).json({
                status: "Success",
                message: "Comment created Successfully",
                data: newComment
            });
        }    
   
});

const editComment = asyncWrapper(async (req, res) => {
    
        const id = req.params.id;
        const comment = await CommentModel.findById(id);
        if (!comment) {
            return res.status(404).json({
                status: "Failed",
                message: "Comment not found"
            });
        }
        const author = req.user;
        if (comment.author === true) {
            return res.status(403).json({
                status: "Failed",
                message: "You are not authorized to edit this comment"
            });
        } else {
            const commentData = {
                comment: req.body.comment
            }
            const editedComment = await CommentModel.findByIdAndUpdate(id, commentData, { new: true });
            res.status(200).json({
                status: "Success",
                message: "Comment updated Successfully",
                data: editedComment
            });
            await comment.save();
        }   
});

const commentPool = asyncWrapper(async (req, res) => {
    
        const postId = req.params.postId;
        const post = await BlogPostModel.findById(postId);
        if (!post) {
            res.status(404).json({
                status: "Failed",
                message: "Post not found"
            }); 
        } else {     
            const commentPool = await CommentModel.find({ post: postId}).limit(5);
            res.status(200).json({
                status: "Success",
                numberOfComment: commentPool.length,
                data: commentPool
            });
        }   
});

const retrieveComment = asyncWrapper(async (req, res) => {
        const commentId = req.params.commentId;
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                status: "Failed",
                message: "Comments not Found"
            });
        } else {
            res.status(200).json({
                status: "Success",
                message: "Comment retrieved Successfully",
                data: comment
            });
        }
});

const terminateComment = asyncWrapper(async (req, res) => {
        const id = req.params.id;
        const comment = await CommentModel.findById(id);
        if (!comment) {
            return res.status(404).json({
                status: "Failed",
                message: "Comment not Found"
            });
        }
        const user = req.user;
        if (comment.user === true) {
            return res.status(403).json({
                status: "Failed",
                message: "You are not authorized to delete this comment"
            });
        } else {
            await CommentModel.deleteOne({ id: req.params.id });
            res.status(200).json({
                status: "Success",
                message: "Comment deleted Successfully"
            });
        }
});

module.exports = { createComment, editComment, commentPool, retrieveComment, terminateComment }