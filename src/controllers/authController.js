import createHttpError from "http-errors";
import { User } from "../models/user.js";
import bcrypt from 'bcrypt';
import { createSession, setSessionCookies } from "../services/auth.js";
import { Session } from "../models/session.js";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../utils/sendMail.js";
import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";

// ---------------- REGISTER ----------------

export const registerUser = async (req, res, next) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(createHttpError(400, 'Email in use'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        email,
        password: hashedPassword,
    });

    const newSession = await createSession(newUser._id);
    setSessionCookies(res, newSession);

    res.status(201).json(newUser);
};

// ---------------- LOGIN ----------------

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

    await Session.deleteOne({ userId: user._id });

    const newSession = await createSession(user._id);
    setSessionCookies(res, newSession);

    res.status(200).json(user);
};

// ---------------- REFRESH SESSION ----------------

export const refreshUserSession = async (req, res, next) => {
    const session = await Session.findOne({
        _id: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
    });

    if (!session) {
        return next(createHttpError(401, 'Session not found'));
    }

    const isExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isExpired) {
        return next(createHttpError(401, 'Session token expired'));
    }

    await Session.deleteOne({
        _id: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
    });

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: "Session refreshed" });
};

// ---------------- LOGOUT ----------------

export const logoutUser = async (req, res) => {
    const { sessionId } = req.cookies;

    if (sessionId) {
        await Session.deleteOne({ _id: sessionId });
    }

    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(204).send();
};

// ---------------- REQUEST RESET EMAIL ----------------

export const requestResetEmail = async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Безпечно: не повідомляємо, чи існує email
    if (!user) {
        return res.status(200).json({
            message: 'If this email exists, a reset link has been sent',
        });
    }

    const resetToken = jwt.sign(
        { sub: user._id, email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' },
    );

    try {
        // Завантажуємо Handlebars-шаблон
        const templatePath = path.resolve("src/templates/reset-password-email.html");
        const templateSource = await fs.readFile(templatePath, "utf-8");
        const template = handlebars.compile(templateSource);

        // Генеруємо HTML
        const html = template({
            name: user.name || "User",
            resetLink: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`
        });

        await sendEmail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Reset your password',
            html,
        });
    } catch {
        return next(createHttpError(500, 'Failed to send the email, please try again later.'));
    }

    res.status(200).json({
        message: 'If this email exists, a reset link has been sent',
    });
};

// ---------------- RESET PASSWORD ----------------

export const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return next(createHttpError(401, 'Invalid or expired token'));
    }

    const user = await User.findOne({
        _id: payload.sub,
        email: payload.email
    });

    if (!user) {
        return next(createHttpError(404, 'User not found'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
        { _id: user._id },
        { password: hashedPassword }
    );

    // ❗ Видаляємо ВСІ активні сесії після зміни пароля
    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
        message: 'Password reset successfully. All sessions have been invalidated for security.',
    });
};