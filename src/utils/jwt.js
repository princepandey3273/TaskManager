import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generates a signed JWT token for a given user payload.
 * 
 * @param {Object} payload - The data to embed in the token.
 * @param {string} [expiresIn] - custom expiration time.
 * @returns {string} JWT string.
 * @throws {Error} If token generation fails.
 */
export const generateToken = (payload, expiresIn = env.jwtExpiresIn) => {
    try {
        if (!payload || typeof payload !== 'object') {
            throw new Error('A valid payload object is required to generate a token.');
        }

        // Sign the token using the secret key from the environment variables
        const token = jwt.sign(payload, env.jwtSecret, { expiresIn });
        return token;
    } catch (error) {
        throw new Error('Failed to generate authentication token.');
    }
};

/**
 * Verifies and decodes a JWT token.
 * 
 * @param {string} token - The JWT string provided by the client.
 * @returns {Object} The decoded payload if the token is valid.
 * @throws {Error} If the token is invalid, expired, or malformed.
 */
export const verifyToken = (token) => {
    try {
        if (!token) {
            throw new Error('A token string is required for verification.');
        }

        // jwt.verify checks the signature and expiration automatically
        // If it fails (e.g. expired or wrong signature), it throws an error
        const decodedPayload = jwt.verify(token, env.jwtSecret);
        return decodedPayload;
    } catch (error) {
        // We throw a generic error for security to avoid leaking exact failure reasons
        throw new Error('Invalid or expired authentication token.');
    }
};
