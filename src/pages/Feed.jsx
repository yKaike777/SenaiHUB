import CreatePost from "../components/CreatePost"
import Post from "../components/Post"

function Feed(){
    return(
        <>
        <div className="content">
            <h1 className="content-title">Feed</h1>
            <CreatePost />
            <Post />    
        </div>  
        </>
    )
}

export default Feed