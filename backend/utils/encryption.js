import crypto from 'crypto';

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'.slice(0, 32));

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {object} - Encrypted data with iv and authTag
 */
export const encrypt = (text) => {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    } catch (error) {
        throw new Error('Encryption failed: ' + error.message);
    }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {object} encryptedData - Object containing encrypted, iv, and authTag
 * @returns {string} - Decrypted text
 */
export const decrypt = (encryptedData) => {
    try {
        const { encrypted, iv, authTag } = encryptedData;

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            KEY,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
};

/**
 * Generate a secure random API key
 * @param {number} length - Length of the key
 * @returns {string} - Generated API key
 */
export const generateApiKey = (length = 32) => {
    const prefix = process.env.API_KEY_PREFIX || 'sk_';
    const randomBytes = crypto.randomBytes(length);
    const key = randomBytes.toString('hex');
    return `${prefix}${key}`;
};

/**
 * Hash API key for storage
 * @param {string} apiKey - API key to hash
 * @returns {string} - Hashed API key
 */
export const hashApiKey = (apiKey) => {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
};

/**
 * Generate a secure random token
 * @param {number} length - Length of the token
 * @returns {string} - Generated token
 */
export const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Compare plain text API key with hashed version
 * @param {string} plainKey - Plain text API key
 * @param {string} hashedKey - Hashed API key
 * @returns {boolean} - True if keys match
 */
export const compareApiKey = (plainKey, hashedKey) => {
    const hashedPlainKey = hashApiKey(plainKey);
    return hashedPlainKey === hashedKey;
};

export default {
    encrypt,
    decrypt,
    generateApiKey,
    hashApiKey,
    generateToken,
    compareApiKey
};
