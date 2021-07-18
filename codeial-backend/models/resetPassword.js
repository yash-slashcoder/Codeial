const mongoose = require('mongoose');

const resetPWSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      resetToken: {
          type: String,
          required: true
      },
      isValid: {
          type: Boolean,
          require: true
      }
    },
    {
      timestamps: true,
    }
  );
  
  const ResetPassword = mongoose.model('ResetPassword', resetPWSchema);
  
  module.exports = ResetPassword;