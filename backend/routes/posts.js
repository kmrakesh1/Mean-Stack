const express = require("express");

const postController = require("../controllers/post")

const checkAuth = require("../middleware/check-auth");

const extractFile = require("../middleware/file");

const router = express.Router();

//Creating a New Post
router.post("", checkAuth, extractFile, postController.createPost);

//Updating a Post
router.put("/:id",checkAuth, extractFile, postController.updatePost);

// Get the posts
router.get("", postController.getPost);

//Get a Single Post
router.get("/:id", postController.getSinglePost);

//Delete a Post
router.delete("/:id", checkAuth, postController.deletePost);



module.exports = router;
