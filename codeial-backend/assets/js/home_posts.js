{
  let createPost = function () {
    let newPostForm = $('#new-post-form');

    newPostForm.submit(function (e) {
      e.preventDefault();

      $.ajax({
        type: 'post',
        url: '/posts/create-post',
        data: newPostForm.serialize(),
        success: function (data) {
          let newPost = newPostDom(data.data.post);
          $('#posts-list>ul').prepend(newPost);
          deletePost($(' .delete-post-button', newPost));

          // CHANGE :: enable the functionality of the toggle like button on the new post
          new ToggleLike($(' .toggle-like-button', newPost));

          new Noty({
            theme: 'relax',
            text: "Post published!",
            type: 'success',
            layout: 'topRight',
            timeout: 1500

          }).show();
        },
        error: function (err) {
          console.log(err.responseText);
        },
      });
    });
  };

  createPost();

  let deletePost = function (deleteLink) {
    $(deleteLink).click(function (e) {
      e.preventDefault();

      $.ajax({
        type: 'get',
        url: $(deleteLink).prop('href'),
        success: function (data) {
          $(`#post-${data.data.post_id}`).remove();
        },
        error: function (error) {
          console.log(error.responseText);
        },
      });
    });
  };

  let newPostDom = function (post) {
    return $(`<li id="post-${post._id}">
      <p>

        <small>
          <a class="delete-post-button" href="/posts/destroy/${post._id} ">X</a>
        </small>

        ${post.content}
        <br>
        <small> ${post.user.name} </small>
        <small>
          <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${post._id}&type=Post">
              0 Likes
          </a>
        </small>
      </p>
      <div class="comment-post">

        <form id="post-comment-form" action="/comments/create" method="POST">
          <input
            type="text"
            name="comment"
            placeholder="Type here to add Comment..."
          />
          <input type="hidden" name="post" value="${post._id}" />
          <input type="submit" value="Add Comment"></input>
        </form>


        <div class="post-comments-list">
          <ul id="post-comments-${post._id} ">
          </ul>
        </div>
      </div>
    </li>`);
  };

  let createComment = function () {
    let newCommentForm = $('#post-comment-form');

    newCommentForm.submit(function (e) {
      e.preventDefault();

      $.ajax({
        type: 'post',
        url: '/comments/create',
        data: newCommentForm.serialize(),
        success: function (data) {
          let newComment = newCommentDom(data.data.comment);
          $('.post-comments-list>ul').prepend(newComment);
          deleteComment($(' .delete-post-comment', newComment));

          // CHANGE :: enable the functionality of the toggle like button on the new comment
          new ToggleLike($(' .toggle-like-button', newComment));
          new Noty({
              theme: 'relax',
              text: "Comment published!",
              type: 'success',
              layout: 'topRight',
              timeout: 1500
              
          }).show();
        },
        error: function (error) {
          console.log(error.responseText);
        },
      });
    });
  };

  createComment();

  let newCommentDom = function (comment) {
    return $(`<p>
      <small>
        <a class="delete-post-comment" href="/comments/destroy/${comment._id} ">X</a>
      </small>
      ${comment.content}
      <br />
      <small> ${comment.user.name} </small>
      <small>
          <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${comment._id}&type=Comment">
              0 Likes
          </a>
      </small>
    </p>`);
  };

  let deleteComment = function (commentLink) {
    $(commentLink).click(function (e) {
      e.preventDefault();

      $.ajax({
        type: 'get',
        url: $(commentLink).prop('href'),
        success: function (data) {
          $(`#comment-${data.data.comment_id}`).remove();

          new Noty({
            theme: 'relax',
            text: "Comment Deleted",
            type: 'success',
            layout: 'topRight',
            timeout: 1500
            
        }).show();
        },
        error: function (error) {
          console.log(error.responseText);
        },
      });
    });
  };
}