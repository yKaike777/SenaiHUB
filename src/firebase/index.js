export { db, auth, storage } from './firebase'

export {
  register,
  login,
  logout,
  onAuthChange,
} from './authService'

export {
  createUser,
  getUser,
  updateUserProfile,
  followUser,
  unfollowUser,
  incrementPostCount,
  getSuggestedUsers,
  getUsersByIds,
} from './userService'

export {
  createPost,
  getPost,
  getRecentPosts,
  getFeedForUser,
  subscribeToRecentPosts,
  toggleLike,
  updatePost,
  deletePost,
  addComment,
  getComments,
  subscribeToComments,
  deleteComment,
} from './postService'

export {
  createCourse,
  getCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  isEnrolled,
  getCourseStudents,
} from './courseService'

export { uploadProfilePicture } from './storageService'

export {
  sendMessage,
  subscribeToMessages,
  getConvId,
} from './messageService'