const BlogPostModel = require("../models/Blogs");
const asyncWrapper = require("../middleware/async");

const createPost = asyncWrapper(async (req, res) => {
    
        const author = req.user;
        const { title, content } = req.body;

        const id = req.params.id;
        const postExist = await BlogPostModel.findOne({ id });
        if (postExist) {
            return res.status(403).json({
                message: "Post already exists"
            });
        }

        const newPost = await BlogPostModel.create({ title, content, author: author.id });
        
        res.status(201).json({
            message: "Post created successfully",
            data: newPost
        });
   
});

const editPost = asyncWrapper(async (req, res) => {
    
        const id = req.params.id;
        const post = await BlogPostModel.findById(id);
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
        }
        const user = req.user;
        if (post.user === true) {
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
                status: "Success",
                message: "Post edited Successful",
                data: editedPost
            });
            await post.save();
        
            res.status(201).json(post)
        }   
});

const postPool = asyncWrapper(async (req, res) => {

        const postPool = await BlogPostModel.find();

        res.status(200).json({
            status: 'Success',
            numbersOfPost: postPool.length,
            data: postPool
        });    
});

const retrievePost = asyncWrapper(async (req, res) => {

        const id = req.params.id
        const post = await BlogPostModel.findById(id);
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
        } else {
            res.status(200).json({
                status: "Success",
                message: "Post Retrieved Successfully",
                data: post
            });
        }
    
});

const terminatePost = asyncWrapper(async (req, res) => {
        const id = req.params.id;
        const post = await BlogPostModel.findById(id);
        if (!post) {
            res.status(404).json({
                status: "Failed",
                message: "Post not found"
            });
        }
        const user = req.user;
        if (post.user === true) {
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
   
});

module.exports = { createPost, editPost, postPool, retrievePost, terminatePost }