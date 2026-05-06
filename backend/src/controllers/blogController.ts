import { Request, Response } from 'express';
import Post from '../models/Post';
import calcReadingTime from '../utils/readingTimeCalculator';
import { blogSchema, updateBlogSchema } from '../utils/validator';
import postQueue from '../utils/postQueue';
import User from '../models/User';

export const createBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = blogSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const { title, description, tags, body, scheduledFor } = value;

        const reading_time = calcReadingTime(body);

        const blog = new Post({
            title,
            description,
            tags: tags ? tags.split(',') : [],
            body,
            author: req.userId,
            reading_time,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
        });

        if (scheduledFor) {
            const delay = new Date(scheduledFor).getTime() - Date.now();
            if (delay <= 0) {
                res.status(400).json({ error: 'Posts must be scheduled for a future time.' });
                return;
            }
            await blog.save();
            const job = await postQueue.add({ postId: blog._id }, { delay });
            blog.scheduledJobId = String(job.id);
            await blog.save();
        } else {
            await blog.save();
        }
        res.status(201).json(blog);
        return;
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
        return
    }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = updateBlogSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const { id } = req.params;
        const updates = value;

        const post = await Post.findOne({ _id: id, author: req.userId });

        if (!post) {
            res.status(404).json({ error: 'This post could not be found.' });
            return;
        }


        if (updates.scheduledFor) {
            const delay = new Date(updates.scheduledFor).getTime() - Date.now();
            if (delay <= 0) {
                res.status(400).json({ error: 'Posts must be scheduled for a future time.' });
                return;
            }
            if (post.scheduledJobId) {
                const prevJob = await postQueue.getJob(post.scheduledJobId);
                if (prevJob) await prevJob.remove();
            }
            const job = await postQueue.add({ postId: post._id }, { delay });
            updates.scheduledJobId = String(job.id);
        }

        if (updates.body) {
            updates.reading_time = calcReadingTime(updates.body);
        }

        Object.assign(post, updates);
        await post.save();

        res.json(post);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

export const publishBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const post = await Post.findOne({ _id: id, author: req.userId });

        if (!post) {
            res.status(404).json({ error: 'This post could not be found.' });
            return;
        }

        if (post.state === 'published') {
            res.status(400).json({ error: 'This post is already published.' });
            return;
        }

        post.state = 'published';
        await post.save();

        res.json(post);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
        return;
    }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const post = await Post.findOneAndDelete({ _id: id, author: req.userId });

        if (!post) {
            res.status(404).json({ error: 'This post could not be found.' });
            return;
        }

        res.json({ message: 'You\'ve successfully deleted this blog.' });
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
        return;
    }
};

export const getUserBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { state } = req.query;
        const pageNum = Math.max(1, Number(req.query.page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const filter: Record<string, any> = { author: req.userId };

        if (state) {
            filter.state = state;
        }

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const count = await Post.countDocuments(filter);

        res.json({
            posts,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum
        });
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

export const getPublishedBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { author, title, tags, orderBy = 'timestamp', order = 'desc' } = req.query;
        const pageNum = Math.max(1, Number(req.query.page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const filter: Record<string, any> = { state: 'published' };

        if (author) {
            const authorUser = await User.findOne({
                username: new RegExp(author as string, 'i')
            });

            if (authorUser) {
                filter.author = authorUser._id
            } else {
                res.status(200).json({
                    "posts": [],
                    "totalPages": 0,
                    "currentPage": 1
                });
                return;
            };
        }

        if (title && typeof title === 'string') {
            filter.title = new RegExp(title, 'i');
        }

        if (tags) {
            filter.tags = { $in: (tags as string).split(',') };
        }

        const sortField = orderBy === 'read_count' ? 'read_count' : orderBy === 'reading_time' ? 'reading_time' : 'createdAt';
        const sortingOrder = order === 'asc' ? 1 : -1;

        const posts = await Post.find(filter)
            .populate('author', 'first_name last_name email')
            .sort({ [sortField]: sortingOrder })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const count = await Post.countDocuments(filter);

        res.json({
            posts,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum
        });
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
    }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const post = await Post.findOne({ _id: id, state: 'published' })
            .populate('author', 'first_name last_name email');

        if (!post) {
            res.status(404).json({ error: 'This post could not be found.' });
            return;
        }

        post.read_count += 1;
        await post.save();

        res.json(post);
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
        return;
    }
};