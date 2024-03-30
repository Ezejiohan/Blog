const CommentModel = require("../models/Comments");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlogPostModel = require("../models/Blogs");
const UserModel = require("../models/User");

const createComment = async (req, res) => {
    try {
        
        if (!req.user) {
            return res.status(401).json({
                status: "Failed",
                message: "You must be logged in to comment"
            });
        } 
        const commentData = {
            content: req.body.content,
            post: req.body.post,
            comment: req.body.comment
        }

        const newComment = await CommentModel.create({
            commentData,
            author: req.user._id
        });

        await newComment.save();
        res.status(201).json({
            status: "Success",
            message: "Comment created Successfully",
            data: newComment
        })
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: "error.message"
        });
    }
};

const editComment = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                status: "Failed",
                message: "You must be logged in to edit a comment"
            });
        }
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

    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: "error.message"
        });
    }
};

const commentPool = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "Failed",
                message: "You must be logged in to edit a comment"
            });
        }
        const postId = req.params.postId;
        const comments = await CommentModel.find({ post: postId});
        res.status(200).json({
            status: "Success",
            message: "Comments retrieved Successfully",
            data: comments
        }) ;   
        
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: "error.message"
        });
    }
};

const retrieveComment = async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await CommentModel.findById(id);
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
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: "error.message"
        });
    }
};

const terminateComment = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: "error.message"
        });
    }
};

module.exports = { createComment, editComment, commentPool, retrieveComment, terminateComment }