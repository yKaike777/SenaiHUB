import CreatePost from "../components/CreatePost"
import Post from "../components/Post"
import SuggestedUsers from "../components/SuggestedUsers"

function Feed() {
  return (
    <div className="feed-layout">

      <div className="feed-main">
        <CreatePost />
        <Post />
        <Post />
      </div>

      <SuggestedUsers />

    </div>
  )
}

export default Feed