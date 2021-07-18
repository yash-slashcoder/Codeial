const Post = require('../models/post');
const User = require('../models/user');
const ResetPassword = require('../models/resetPassword');

module.exports.home = async function (req, res) {
  // Post.find({}, function (err, post) {
  //   if (err) {
  //     console.log('Error on finding the posts');
  //     return;
  //   }

  //   return res.render('home', {
  //     title: 'Home',
  //     posts: post,
  //   });
  // });
  try {
    let post = await Post.find({})
      .sort('-createdAt')
      .populate('user')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
        },
        populate: {
          path:'likes'
        }
      }).populate('likes');

    let user = await User.find({});

    return res.render('home', {
      title: 'Home',
      posts: post,
      all_users: user,
    });
  } catch (err) {
    console.log('Error', err);
    return;
  }
};

module.exports.resetPassword = function (req, res) {
  return res.render('reset_password', {
    title: 'Reset Password',
    token: req.query.token
  });
}

module.exports.updatePassword = async function (req, res) {
  let reset = await ResetPassword.findOne({
    resetToken: req.params.token
  });
  if (reset) {
    if (req.body.newPassword != req.body.confirmPassword) {
      req.flash('Error', 'Password is not match!');
      return res.redirect('back');
    }
    
    if (reset.isValid) {
      let user = await User.findById(reset.user);
      if (user) {
        // update user
        user.password = req.body.newPassword;
        user.save();

        // update Token 
        reset.isValid = false;
        reset.save();
        return res.redirect('/users/sign-in');
      } else {
        req.flash('Error', err);
        console.log('Error in finding user in resetting password');
        return;
      }
    } else {
      req.flash('Error', 'Token is not valid');
      return res.redirect('back');
    }

  } else {
    req.flash('Error', err);
    console.log('Error in finding token in resetting password');
    return;
  }
}