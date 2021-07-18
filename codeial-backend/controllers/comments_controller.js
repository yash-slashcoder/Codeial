const Comment = require('../models/comment');
const Post = require('../models/post');
const commentMailer = require('../mailers/comments_mailer');
const queue = require('../config/kue');
const commentEmailWorker = require('../workers/comment_email_worker');
const Like = require('../models/like');

module.exports.create = async function (req, res) {
  const postId = req.body.post.trim();
  try {
    let post = await Post.findById(postId);

    if (post) {
      let comment = await Comment.create({
        content: req.body.comment,
        post: postId,
        user: req.user._id,
      });

      post.comments.push(comment);
      post.save();
      comment = await comment.populate('user', 'name email').execPopulate();
      // commentMailer.newComment(comment);
      let job = queue.create('emails', comment).save(function (err) {
        if (err) {
          console.log('error in creating a queue');
          return;
        }

        console.log('job enqueued', job.id);
      });

      if (req.xhr) {
        return res.status(200).json({
          data: {
            comment: comment,
          },
          message: 'Comment is posted',
        });
      }
      req.flash('success', 'Comment is posted');
      return res.redirect('/');
    }
  } catch (err) {
    console.log('Error', err);
    return;
  }
};

module.exports.destroy = async function (req, res) {
  try {
    let comment = await Comment.findById(req.params.id);
    if (comment.user == req.user.id) {
      let postId = comment.post;
      comment.remove();

      await Post.findByIdAndUpdate(postId, {
        $pull: {
          comments: req.params.id
        },
      });

      // CHANGE :: destroy the associated likes for this comment
      await Like.deleteMany({
        likeable: comment._id,
        onModel: 'Comment'
      });

      req.flash('success', 'Comment is deleted successfully');

      if (req.xhr) {
        return res.status(200).json({
          data: {
            comment_id: req.params.id,
          },
          message: 'Comment is deleted',
        });
      }

      return res.redirect('back');
    } else {
      req.flash('error', 'User is not allowed to delete');
      return res.redirect('back');
    }
  } catch (err) {
    console.log('Error', err);
    return;
  }
};