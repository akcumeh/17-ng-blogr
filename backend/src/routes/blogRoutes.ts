import express from 'express';
const router = express.Router();
import {
    getPublishedBlogs,
    getBlogById,
    createPost,
    getUserBlogs,
    publishBlog,
    updateBlog,
    deleteBlog,
} from '../controllers/blogController';
import auth from '../middleware/auth';

router.get('/blogs', getPublishedBlogs);
router.get('/blogs/:id', getBlogById);

router.post('/blogs', auth, createPost);
router.get('/user/blogs', auth, getUserBlogs);
router.patch('/blogs/:id/publish', auth, publishBlog);
router.put('/blogs/:id', auth, updateBlog);
router.delete('/blogs/:id', auth, deleteBlog);

export default router;