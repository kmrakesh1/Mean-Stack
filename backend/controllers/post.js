const Post = require("../models/post");


//Create a Post
exports.createPost =  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId
    });
    post.save().then((createdPost) => {
      res.status(201).json({
        Message: "Post Added Successfully",
        post: {
          //    ...createdPost,
          id: createdPost._id,
          title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath,
        },
      });
    }).catch(error => {
      res.status(500).json({
        Message: "Creating a Post Failed"
      });
    });
  }

//Update a Post
  exports.updatePost = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    });
    Post.updateOne({ _id: req.params.id , creator: req.userData.userId }, post).then((result) => {
      if(result.modifiedCount > 0){
        res.status(200).json({
          message: "Update successful",
        });
      } else {
        res.status(401).json({
          message: "Not Authorized",
        });
      }   
    }).catch(error => {
      res.status(500).json({
        Message: "Couldn't update post!"
      });
    });
  }

//Get all the Posts
  exports.getPost = (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let totalPost = 0;
  
    Post.find().then((items)=>{ 
      Post.count = +items.length;
     });
    
    let fetchedPost;
    if (pageSize && currentPage) {
      postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    
    postQuery
      .then((documents) => {
        fetchedPost = documents;
       return Post.count;
      })
      .then((count) => {
        res.status(200).json({
          message: "Post fetched successfully",
          posts: fetchedPost,
          maxPosts: count,
        });
      }).catch(error => {
        res.status(500).json({
          Message: "Fetching Post Failed"
        });
      });
  }

  // Get a Single Post by ID
  exports.getSinglePost = (req, res, next) => {
    Post.findById(req.params.id).then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    }).catch(error => {
      res.status(500).json({
        Message: "Fetching  a Post Failed"
      });
    });
  }

  //Delete a Post
  
  exports.deletePost = (req, res, next) => {
    Post.deleteOne({ _id: req.params.id , creator: req.userData.userId }).then((result) => {
      if(result.deletedCount > 0){
        res.status(200).json({
          message: "Post Deleted",
        });
      } else {
        res.status(401).json({
          message: "Not Authorized",
        });
      }
    }).catch(error => {
      res.status(500).json({
        Message: "Deleting Post Failed"
      });
    });
  }