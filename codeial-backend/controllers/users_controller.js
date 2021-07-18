const User = require('../models/user');
const ResetPassword = require('../models/resetPassword');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const queue = require('../config/kue');

module.exports.profile = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    return res.render('users', {
      title: 'Profile',
      profile_user: user,
    });
  });
};

module.exports.update = async function (req, res) {
  // if (req.user.id == req.params.id) {
  //   User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
  //     req.flash('success', 'User is updated successfully');
  //     return res.redirect('/');
  //   });
  // } else {
  //   req.flash('error', 'Unauthorized');
  //   res.status(401).send('Unauthorized');
  // }

  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);

      User.uploadAvatar(req, res, function (err) {
        if (err) {
          console.log('Multer Error: ', err);
        }

        user.name = req.body.name;
        user.email = req.body.email;

        if (req.file) {
          if (user.avatar) {
            if (fs.existsSync(path.join(__dirname, '..', user.avatar))) {
              fs.unlinkSync(path.join(__dirname, '..', user.avatar));
            }
          }
          user.avatar = User.avatarPath + '/' + req.file.filename;
        }
        user.save();
        req.flash('success', 'User is updated successfully');
        return res.redirect('/');
      });
    } catch (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
  } else {
    req.flash('error', 'Unauthorized!');
    res.status(401).send('Unauthorized');
  }
};

module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/profile');
  }
  return res.render('user_sign_in', {
    title: 'Codial | Sign In',
  });
};

module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/profile');
  }
  return res.render('user_sign_up', {
    title: 'Codial | Sign Up',
  });
};

module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash('Error', 'Password is not match');
    return res.redirect('back');
  }
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      req.flash('Error', err);
      console.log('Error in finding user in signing up');
      return;
    }
    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          console.log('Error in creating user while signing up');
          return;
        }
        req.flash('success', 'User is registered successfully');
        return res.redirect('/users/sign-in');
      });
    } else {
      res.redirect('back');
    }
  });
};

module.exports.createSession = function (req, res) {
  req.flash('success', 'Logged in successfully');
  return res.redirect('/');
};

module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash('success', 'You have logged out!');
  return res.redirect('/');
};

module.exports.GetForgotPassword = function(req, res){
  return res.render('forgot_password', {
    title : 'Forgot Password'
  });
}

module.exports.forgotPassword = function(req, res){
  // find email
  User.findOne({email: req.body.email}, function(err, user){
    if(err){
      req.flash('Error', err);
      console.log('Error in finding user in forgot password');
      return;
    }

    if(user){
      const token = crypto.randomBytes(32).toString("hex");
      ResetPassword.create({
        user: user._id,
        resetToken: token,
        isValid: true
      }, function(err, resetPW){
        if(err){
          console.log('Error in creating reset password token while forgot password');
          return;
        }
        const link = `http://localhost:8000/resetPassword?token=${token}`;
        let data = {
          email: user.email,
          name: user.name,
          resetLink: link
        };
        let job = queue.create('resetEmails', data).save(function(err){
          if(err){
            console.log('error in creating a queue');
            return;
          }
  
          console.log('job enqueued', job.id);
        });

        req.flash('success', 'Reset password link is sent to your email');
        return res.redirect('/');
      })
    }else{
      req.flash('Error', 'User is not found!');
      return;
    }
  })
}