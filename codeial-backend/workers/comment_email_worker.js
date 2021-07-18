const queue = require('../config/kue');

const commentsMailer = require('../mailers/comments_mailer');
const resetPasswordsMailer = require('../mailers/resetPassword_mailer');

queue.process('emails', function(job, done){
    console.log('emails worker is processing a job', job.data);

    commentsMailer.newComment(job.data);

    done();
})

queue.process('resetEmails', function(job, done){
    console.log('emails worker is processing a job', job.data);

    resetPasswordsMailer.resetPassword(job.data);

    done();
})