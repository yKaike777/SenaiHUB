import { useEffect, useState } from 'react'
import CreatePost from '../components/CreatePost'
import Post from '../components/Post'
import SuggestedUsers from '../components/SuggestedUsers'
import { subscribeToRecentPosts } from '../firebase'

function Feed() {
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToRecentPosts((fetchedPosts) => {
      setPosts(fetchedPosts)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  function handleDeleted(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="feed-layout">
      <div className="feed-main">
        <CreatePost />

        {loading && (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            Carregando posts...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            Nenhum post ainda. Seja o primeiro a publicar!
          </p>
        )}

        {posts.map(post => (
          <Post key={post.id} post={post} onDeleted={handleDeleted} />
        ))}
      </div>

      <SuggestedUsers />
    </div>
  )
}

export default Feed