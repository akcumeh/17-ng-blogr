import Bull from 'bull';
import Post from '../models/Post';

let postQueue: any;

if (process.env.NODE_ENV === 'test') {
    class MockQueue {
        private jobCount = 0;

        async add(data: any, options: any) {
            this.jobCount++;
            return { id: `mock-job-${this.jobCount}` };
        }

        async getJob(jobId: string) {
            return jobId ? { id: jobId, remove: async () => { } } : null;
        }

        process(handler: Function) { }
    }

    postQueue = new MockQueue();
} else {
    postQueue = new Bull('postQueue', {
        redis: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PWD
        }
    });

    postQueue.process(async (job: any) => {
        const { postId } = job.data;
        await Post.findByIdAndUpdate(postId, { state: 'published' });
    });
}

export default postQueue;