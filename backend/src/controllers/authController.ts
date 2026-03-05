import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { signupSchema, signinSchema } from '../utils/validator';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = signupSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const { email, first_name, last_name, username, password } = value;

        const hashedPwd = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            first_name,
            last_name,
            username,
            password: hashedPwd
        });

        try {
            await user.save();
        } catch (e) {
            if ((e as any).code === 11000) {
                res.status(400).json({ error: "This email is already in us(e as Error)." });
                return;
            }
            throw e;
        }

        res.status(201).json({ message: "Successfully created user." });
        return;
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
        return;
    }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = signinSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const { email, password } = value;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials." });
            return;
        }

        const isPwd = await bcrypt.compare(password, user.password);
        if (!isPwd) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const opts: SignOptions = { expiresIn: process.env.JWT_EXPIRY as SignOptions['expiresIn'] };
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, opts);

        res.json({ token });
    } catch (e) {
        res.status(500).json({ error: (e as Error).message });
        return;
    }
};