import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaTimes } from 'react-icons/fa'
import CreatePost from '../components/CreatePost'
import Post from '../components/Post'
import SuggestedUsers from '../components/SuggestedUsers'
import { useAuth } from '../context/AuthContext'
import { subscribeToRecentPosts, searchUsers, followUser, unfollowUser } from '../firebase'
import defaultAvatar from '../assets/default-avatar.jpg'

function Feed() {
  const { currentUser, setCurrentUser } = useAuth()
  const navigate                         = useNavigate()
  const [posts, setPosts]                = useState([])
  const [loading, setLoading]            = useState(true)
  const [query, setQuery]                = useState('')
  const [results, setResults]            = useState([])
  const [searching, setSearching]        = useState(false)
  const [showResults, setShowResults]    = useState(false)
  const [pending, setPending]            = useState({})
  const searchRef                        = useRef(null)
  const debounceRef                      = useRef(null)

  useEffect(() => {
    const unsubscribe = subscribeToRecentPosts(posts => {
      setPosts(posts)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Fecha resultados ao clicar fora
  useEffect(() => {
    function handleOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleSearch = useCallback((value) => {
    setQuery(value)
    clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setSearching(true)
    setShowResults(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const found = await searchUsers(value.trim(), currentUser?.id)
        setResults(found)
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 350)
  }, [currentUser?.id])

  async function handleFollow(user) {
    if (!currentUser || pending[user.id]) return
    setPending(p => ({ ...p, [user.id]: true }))
    const already = currentUser.following?.includes(user.id)
    try {
      if (already) {
        await unfollowUser(currentUser.id, user.id)
        setCurrentUser(prev => ({
          ...prev,
          following: (prev.following || []).filter(id => id !== user.id),
        }))
      } else {
        await followUser(currentUser.id, user.id)
        setCurrentUser(prev => ({
          ...prev,
          following: [...(prev.following || []), user.id],
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPending(p => ({ ...p, [user.id]: false }))
    }
  }

  function handleDeleted(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="feed-layout">
      <div className="feed-main">

        {/* Barra de pesquisa */}
        <div className="search-wrap" ref={searchRef}>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar usuários..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => { if (query.trim()) setShowResults(true) }}
            />
            {query && (
              <button
                className="search-clear"
                onClick={() => { setQuery(''); setResults([]); setShowResults(false) }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {showResults && (
            <div className="search-results">
              {searching && (
                <p className="search-status">Pesquisando...</p>
              )}
              {!searching && results.length === 0 && (
                <p className="search-status">Nenhum usuário encontrado.</p>
              )}
              {!searching && results.map(user => {
                const isFollowing = currentUser?.following?.includes(user.id)
                return (
                  <div key={user.id} className="search-result-item">
                    <img
                      src={user.profilePicture || defaultAvatar}
                      alt="avatar"
                      className="search-result-avatar"
                      onClick={() => { navigate(`/user/${user.id}`); setShowResults(false) }}
                    />
                    <div
                      className="search-result-info"
                      onClick={() => { navigate(`/user/${user.id}`); setShowResults(false) }}
                    >
                      <span className="search-result-name">{user.name}</span>
                      <span className="search-result-course">{user.course}</span>
                    </div>
                    <button
                      className={`suggested-btn ${isFollowing ? 'suggested-btn-following' : ''}`}
                      onClick={() => handleFollow(user)}
                      disabled={!!pending[user.id]}
                    >
                      {pending[user.id] ? '...' : isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <CreatePost />

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px' }}>
            Carregando posts...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px' }}>
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