import React from 'react';

function Post(props) {
    let postStyle = {
        color:'grey'
    }

  return (
    <li className="PostItem" style={postStyle}>
        {props.post.content}
        {props.post.user.name}
    </li>
  );
}

export default Post;
