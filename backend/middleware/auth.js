import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import { hashApiKey } from '../utils/encryption.js';

/**
 * Protect routes - JWT authentication
 */
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!req.user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

/**
 * Authorize specific roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Validate API Key
 */
export const validateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API key is required'
        });
    }

    try {
        const hashedKey = hashApiKey(apiKey);
        const keyDoc = await ApiKey.findOne({ hashedKey }).populate('user');

        if (!keyDoc) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        if (!keyDoc.isValid()) {
            return res.status(401).json({
                success: false,
                message: 'API key is expired or inactive'
            });
        }

        // Check IP whitelist
        if (keyDoc.ipWhitelist && keyDoc.ipWhitelist.length > 0) {
            const clientIp = req.ip || req.connection.remoteAddress;
            if (!keyDoc.ipWhitelist.includes(clientIp)) {
                return res.status(403).json({
                    success: false,
                    message: 'IP address not whitelisted'
                });
            }
        }

        // Attach key and user to request
        req.apiKey = keyDoc;
        req.user = keyDoc.user;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error validating API key'
        });
    }
};

/**
 * Admin only middleware
 */
export const adminOnly = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

/**
 * Vendor only middleware
 */
export const vendorOnly = async (req, res, next) => {
    if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Vendor privileges required.'
        });
    }
};

export default {
    protect,
    authorize,
    validateApiKey,
    adminOnly,
    vendorOnly
};
