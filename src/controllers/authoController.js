import createHttpError from "http-errors";
import { User } from "../models/user.js";
import bcrypt from 'bcrypt';

export const registerUser = async (req, res, next) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(createHttpError(400, 'Email in use'));
    }
    //Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        email,
        password: hashedPassword,
    });

    res.status(201).json(newUser);
};

export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(createHttpError(401, 'Invalid credentials'));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return next(createHttpError(401, 'Invalid credentials'));
    }

    res.status(200).json(user);
};