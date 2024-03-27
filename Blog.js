const BlogPostModel = require("../models/Blogs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

// create a post
const createPost = async (req, res) => {
    try {
        const { title, content, author } = req.body; // Destructure request body

        const postExist = await BlogPostModel.findOne({ title });
        if (postExist) {
            return res.status(403).json({
                message: "Post already exists"
            });
        }

        const newPost = await BlogPostModel.create({ title, content, author });
        
        res.status(201).json({
            message: "Post created successfully",
            data: newPost
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
};

// edit post
const editPost = async (req, res) => {
    try {
        const id = req.params.id;
        const post = await BlogPostModel.findById(id);
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
        }
        const author = req.author;
        if (post.author === true) {
            return res.status(403).json({
                message: "Only who created the post can edit it"
            })
        } else {
            const postData = {
                title: req.body.title,
                content: req.body.content
            }
            const editedPost = await BlogPostModel.findByIdAndUpdate(id, postData, { new: true });
            res.status(200).json({
                message: "Post edited Successful",
                data: editedPost
            });
            await post.save();

            res.status(201).json(post)
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
          });
         
    }
};

// get all post
const postPool = async (req, res) => {
    try {
        const postPool = await BlogPostModel.find();

        res.status(200).json({
            status: 'Success',
            numbersOfPost: postPool.length,
            data: postPool
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
};

// get a post
const retrievePost = async (req, res) => {
    try {
        const id = req.params.id
        const post = await BlogPostModel.findById(id);
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
        } else {
            res.status(200).json({
                status: "Success",
                data: post
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
}

// delete post
const terminatePost = async (req, res) => {
    try {
        const id = req.params.id;
        const post = await BlogPostModel.findById(id);
        if (!post) {
            res.status(404).json({
                status: "Failed",
                message: "Post not found"
            });
        }
        const author = req.author;
        if (post.author === true) {
            return res.status(403).json({
                message: "You are not authorised to delete this post"
            });
        } else {
            await BlogPostModel.deleteOne({id: req.params.id});
            res.status(200).json({
                status: "Success",
                message: "Post deleted successfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
};

module.exports = { createPost, editPost, postPool, retrievePost, terminatePost }