import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000000, // Max requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

export default limiter;