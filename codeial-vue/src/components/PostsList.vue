<template>
  <div class="posts-list">
    <h1>Codeial Posts</h1>
    <ul>
        <li v-for="post in posts" :key='post._id' class="post-item">
            {{post.content}} --> {{post.user.name}}
        </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "PostsList",
  data(){
      return{
          posts:[]
      }
  },
  mounted(){
      axios.get('http://localhost:8001/api/v1/posts').then((data) => {this.posts = data.data.posts})
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->