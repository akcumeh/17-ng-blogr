import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import User from '../models/User';
import Post from '../models/Post';

describe('Blogging API Tests', () => {
    let authToken: string;
    let otherToken: string; // other user
    let userId: string;
    let blogId: string;
    let blogId2: string; // blogID to be scheduled

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';

        // Wait for DB connection
        await new Promise<void>(resolve => {
            if (mongoose.connection.readyState === 1) {
                resolve();
            } else {
                mongoose.connection.once('open', resolve);
            }
        });

        // Clear test data
        await User.deleteMany({});
        await Post.deleteMany({});

        await request(app).post('/api/auth/signup').send({
            email: 'other@example.com',
            first_name: 'Other',
            last_name: 'User',
            username: 'other',
            password: 'password'
        });

        const otherSignin = await request(app).post('/api/auth/signin').send({
            email: 'other@example.com',
            password: 'password'
        });

        otherToken = otherSignin.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Authentication Endpoints', () => {
        test('POST /api/auth/signup - should create a new user', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'tester@example.com',
                    first_name: 'Test',
                    last_name: 'User',
                    username: 'tester',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message');
        });

        test('POST /api/auth/signup - should fail with duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'tester@example.com',
                    first_name: 'Test',
                    last_name: 'User',
                    username: 'tester',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('email is already in use');
        });

        test('POST /api/auth/signin - should return token with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/signin')
                .send({
                    email: 'tester@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            authToken = response.body.token;

            // Get user ID for later tests
            const user = await User.findOne({ email: 'tester@example.com' });
            userId = (user!._id as mongoose.Types.ObjectId).toString(); // user may be null. if null, the ! after ensures it is not
        });

        test('POST /api/auth/signin - should fail with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/signin')
                .send({
                    email: 'tester@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toContain('Invalid credentials');
        });
    });

    describe('Blog Creation and Management', () => {
        test('POST /api/blogs - should create a blog in draft state', async () => {
            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Blog Post',
                    description: 'This is a test blog post',
                    tags: "test,nodejs",
                    body: 'This is the body of the test blog post with enough content to calculate reading time.'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.state).toBe('draft');
            expect(response.body).toHaveProperty('reading_time');
            expect(response.body.author).toBe(userId.toString());
            blogId = response.body._id;
        });

        test('POST /api/blogs - should require authentication', async () => {
            const response = await request(app)
                .post('/api/blogs')
                .send({
                    title: 'Unauthorized Blog',
                    description: "a blog that will fail.",
                    tags: "failed,blog",
                    body: 'This should fail'
                });

            expect(response.status).toBe(401);
        });

        test('PUT /api/blogs/:id - should update blog by owner', async () => {
            const response = await request(app)
                .put(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Test Blog Post',
                    body: 'Updated body content'
                });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Updated Test Blog Post');
        });

        test('PATCH /api/blogs/:id/publish - should publish a blog', async () => {
            const response = await request(app)
                .patch(`/api/blogs/${blogId}/publish`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.state).toBe('published');
        });

        test('PATCH /api/blogs/:id/publish - should not publish already published blog', async () => {
            const response = await request(app)
                .patch(`/api/blogs/${blogId}/publish`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('already published');
        });

        test('POST /api/blogs - should reject scheduledFor in the past', async () => {
            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Past Scheduled Post',
                    body: 'Some body content here for the post.',
                    scheduledFor: '2020-01-01T00:00:00Z'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('future');
        });

        test('POST /api/blogs - should save scheduledJobId when scheduled for future', async () => {
            const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Future Scheduled Post',
                    body: 'Some body content here for the post.',
                    scheduledFor: future
                });
            
                blogId2 = response.body._id;
            expect(response.status).toBe(201);
            expect(response.body.state).toBe('draft');
            expect(response.body).toHaveProperty('scheduledJobId');
        });

        afterAll(async () => {
            await Post.findByIdAndDelete(blogId2);
        });
    });

    describe('Public Blog Endpoints', () => {
        test('GET /api/blogs - should return published blogs', async () => {
            const response = await request(app)
                .get('/api/blogs');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('posts');
            expect(Array.isArray(response.body.posts)).toBe(true);
            expect(response.body.posts.length).toBeGreaterThan(0);
        });

        test('GET /api/blogs - should support pagination', async () => {
            const response = await request(app)
                .get('/api/blogs?page=1&limit=10');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('currentPage');
            expect(response.body).toHaveProperty('totalPages');
        });

        test('GET /api/blogs - should filter by title', async () => {
            const response = await request(app)
                .get('/api/blogs?title=Updated');

            expect(response.status).toBe(200);
            expect(response.body.posts.length).toBeGreaterThan(0);
            expect(response.body.posts[0].title).toContain('Updated');
        });

        test('GET /api/blogs - should filter by author username', async () => {
            const response = await request(app)
                .get('/api/blogs?author=tester');

            expect(response.status).toBe(200);
            expect(response.body.posts.length).toBeGreaterThan(0);
        });

        test('GET /api/blogs - should return nothing if author does not exist', async () => {
            const response = await request(app)
                .get('/api/blogs?author=doesnotexist');

            expect(response.status).toBe(200);
            expect(response.body.posts.length).toBe(0);
        });

        test('GET /api/blogs/:id - should return single blog and increment read count', async () => {
            const response = await request(app)
                .get(`/api/blogs/${blogId}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(blogId);
            expect(response.body).toHaveProperty('author');
            expect(response.body.author).toHaveProperty('first_name');
            expect(response.body.read_count).toBeGreaterThan(0);
        });

        test('GET /api/blogs/:id - should 404 for draft post', async () => {
            const response = await request(app).get(`/api/blogs/${blogId2}`);

            expect(response.status).toBe(404);
        });

        test('GET /api/blogs/:id - should 404 for non-existent id', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const response = await request(app).get(`/api/blogs/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('User Blog Management', () => {
        test('GET /api/user/blogs - should return logged-in user blogs', async () => {
            const response = await request(app)
                .get('/api/user/blogs')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('posts');
            expect(Array.isArray(response.body.posts)).toBe(true);
        });

        test('GET /api/user/blogs - should filter by state', async () => {
            const response = await request(app)
                .get('/api/user/blogs?state=published')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.posts.every((post: { state: string }) => post.state === 'published')).toBe(true);
        });

        test('GET /api/user/blogs - should support pagination', async () => {
            const response = await request(app)
                .get('/api/user/blogs?page=1&limit=5')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('currentPage');
            expect(response.body).toHaveProperty('totalPages');
        });

        test('PUT /api/blogs/:id - should update without body (body is optional)', async () => {
            const response = await request(app)
                .put(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Title Only Update' });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Title Only Update');
        });

        test('PUT /api/blogs/:id - should reject empty update', async () => {
            const response = await request(app)
                .put(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBe(400);
        });

        test('PUT /api/blogs/:id - should reject scheduledFor in the past', async () => {
            const response = await request(app)
                .put(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ scheduledFor: '2020-01-01T00:00:00Z' });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('future');
        });

        test('PUT /api/blogs/:id - should save scheduledJobId when rescheduled', async () => {
            const future = new Date(Date.now() + 20 * 60 * 1000).toISOString();
            const response = await request(app)
                .put(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ scheduledFor: future });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('scheduledJobId');
            expect(response.body.scheduledFor).toBeTruthy();
        });

        test('PUT /api/blogs/:id - should not allow non-owner to update', async () => {
            const response = await request(app)
                .put(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ title: 'Hijacked Title' });

            expect(response.status).toBe(404);
        });

        test('DELETE /api/blogs/:id - should not allow non-owner to delete', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(response.status).toBe(404);
        });

        test('PATCH /api/blogs/:id/publish - should not allow non-owner to publish', async () => {
            const response = await request(app)
                .patch(`/api/blogs/${blogId}/publish`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(response.status).toBe(404);
        });

        test('PUT /api/blogs/:id - should require authentication', async () => {
            const response = await request(app)
                .put(`/api/blogs/${blogId}`)
                .send({ title: 'No auth' });

            expect(response.status).toBe(401);
        });

        test('DELETE /api/blogs/:id - should require authentication', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${blogId}`);

            expect(response.status).toBe(401);
        });

        test('PATCH /api/blogs/:id/publish - should require authentication', async () => {
            const response = await request(app)
                .patch(`/api/blogs/${blogId}/publish`);

            expect(response.status).toBe(401);
        });

        test('GET /api/user/blogs - should require authentication', async () => {
            const response = await request(app)
                .get('/api/user/blogs');

            expect(response.status).toBe(401);
        });
        
        test('DELETE /api/blogs/:id - should delete blog by owner', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });

        test('DELETE /api/blogs/:id - should not delete non-existent blog', async () => {
            const response = await request(app)
                .delete(`/api/blogs/${blogId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('Blog Search and Ordering', () => {
        beforeAll(async () => {
            // Create multiple test blogs
            const blog1 = new Post({
                title: 'JavaScript Basics',
                body: 'Learning JavaScript fundamentals',
                author: userId,
                state: 'published',
                tags: ['javascript', 'tutorial'],
                reading_time: 5,
                read_count: 10
            });

            const blog2 = new Post({
                title: 'Node.js Advanced',
                body: 'Advanced Node.js concepts and patterns',
                author: userId,
                state: 'published',
                tags: ['nodejs', 'advanced'],
                reading_time: 10,
                read_count: 5
            });

            await blog1.save();
            await blog2.save();
        });

        test('GET /api/blogs - should search by tags', async () => {
            const response = await request(app)
                .get('/api/blogs?tags=javascript');

            expect(response.status).toBe(200);
            expect(response.body.posts.some((post: { tags: string }) => post.tags.includes('javascript'))).toBe(true);
        });

        test('GET /api/blogs - should order by read_count', async () => {
            const response = await request(app)
                .get('/api/blogs?orderBy=read_count&order=desc');

            expect(response.status).toBe(200);
            const posts = response.body.posts;
            expect(posts[0].read_count).toBeGreaterThanOrEqual(posts[1].read_count);
        });

        test('GET /api/blogs - should order by reading_time', async () => {
            const response = await request(app)
                .get('/api/blogs?orderBy=reading_time&order=asc');

            expect(response.status).toBe(200);
            const posts = response.body.posts;
            if (posts.length > 1) {
                expect(posts[0].reading_time).toBeLessThanOrEqual(posts[1].reading_time);
            }
        });

        afterAll(async () => {
            await Post.deleteMany({ title: { $in: ['JavaScript Basics', 'Node.js Advanced'] } });
        });
    });
});
