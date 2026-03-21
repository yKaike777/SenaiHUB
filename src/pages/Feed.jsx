import CreatePost from "../components/CreatePost"

function Feed(){
    return(
        <>
        <div className="content">
            <h1 className="content-title">Feed</h1>
            <CreatePost className='CreatePost'/>
        </div>  
        </>
    )
}

export default Feed