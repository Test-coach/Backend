const prisma = require('../../../db/prisma');
const { JwtService } = require('../services/admin.jwt.service');
const { AuthError } = require('../../shared/utils/error');
const SuccessResponse = require('../../shared/utils/success');

class AdminAuthController {
    constructor() {
        this.jwtService = new JwtService();
    }

    async register(req, res) {
        try {
            const { email, username, password } = req.body;

            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { username }
                    ]
                }
            });

            if (existingUser) {
                const error = new AuthError('Email or username already exists', 400);
                return error.sendResponse(res);
            }

            const hashedPassword = await this.jwtService.hashPassword(password);

            const user = await prisma.user.create({
                data: {
                    email,
                    username,
                    password_hash: hashedPassword,
                    role: 'admin',
                    preferences: {
                        create: {} // Creates default preferences
                    }
                },
                select: {
                    id: true,
                    email: true,
                    username: true
                }
            });

            const token = await this.jwtService.generateToken(user.id);
            const sendDate = { email: user.email }

            return new SuccessResponse('User registered successfully', { sendDate, token }).sendResponse(res);
        } catch (error) {
            if (error instanceof AuthError) {
                return error.sendResponse(res);
            }
            next(error);
        }
    }

    async login(req, res) {
        try {
            const { email, username, password } = req.body;
            const identifier = email || username;
            if (!identifier || !password) {
                const error = new AuthError('Email/Username and password are required', 400);
                return error.sendResponse(res);
            }

            const user = await this.jwtService.findUserByCredentials(identifier);
            if (!user || user.role !== 'admin') {
                const error = new AuthError('Invalid credentials', 401);
                return error.sendResponse(res);
            }

            const isMatch = await this.jwtService.comparePassword(password, user.password_hash);
            if (!isMatch) {
                const error = new AuthError('Invalid credentials', 401);
                return error.sendResponse(res);
            }

            const token = await this.jwtService.generateToken(user.id);
            const sendData = { email: user.email, username: user.username };
            return new SuccessResponse('Login successful', { sendData, token }).sendResponse(res);
        } catch (error) {
            if (error instanceof AuthError) {
                return error.sendResponse(res);
            }
            next(error);
        }
    }
}

module.exports = new AdminAuthController();