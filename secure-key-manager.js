/**
 * Secure API Key Manager
 * Provides AES-256-GCM encryption for HuggingFace API keys
 * Uses Web Crypto API for browser-based encryption
 */

class SecureKeyManager {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12; // 96 bits for GCM
    }

    /**
     * Derive encryption key from user password using PBKDF2
     * @param {string} password - User's encryption password
     * @param {Uint8Array} salt - Salt for key derivation
     * @returns {Promise<CryptoKey>} - Derived encryption key
     */
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000, // OWASP recommended minimum
                hash: 'SHA-256'
            },
            passwordKey,
            {
                name: this.algorithm,
                length: this.keyLength
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt API key with password
     * @param {string} apiKey - Plain text API key
     * @param {string} password - Encryption password
     * @returns {Promise<string>} - Encrypted key (base64 encoded)
     */
    async encryptKey(apiKey, password) {
        if (!apiKey || !password) {
            throw new Error('API key and password are required');
        }

        // Generate random salt and IV
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

        // Derive encryption key from password
        const key = await this.deriveKey(password, salt);

        // Encrypt the API key
        const encoder = new TextEncoder();
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: this.algorithm,
                iv: iv
            },
            key,
            encoder.encode(apiKey)
        );

        // Combine salt + iv + encrypted data
        const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

        // Convert to base64 for storage
        return this.arrayBufferToBase64(combined);
    }

    /**
     * Decrypt API key with password
     * @param {string} encryptedKey - Encrypted key (base64 encoded)
     * @param {string} password - Decryption password
     * @returns {Promise<string>} - Plain text API key
     */
    async decryptKey(encryptedKey, password) {
        if (!encryptedKey || !password) {
            throw new Error('Encrypted key and password are required');
        }

        try {
            // Decode from base64
            const combined = this.base64ToArrayBuffer(encryptedKey);

            // Extract salt, IV, and encrypted data
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 16 + this.ivLength);
            const encryptedData = combined.slice(16 + this.ivLength);

            // Derive decryption key from password
            const key = await this.deriveKey(password, salt);

            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                encryptedData
            );

            // Convert back to string
            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);
        } catch (error) {
            throw new Error('Decryption failed. Invalid password or corrupted data.');
        }
    }

    /**
     * Validate HuggingFace API key format
     * @param {string} apiKey - API key to validate
     * @returns {boolean} - True if valid format
     */
    validateApiKey(apiKey) {
        // HuggingFace API keys typically start with 'hf_' and are alphanumeric
        const hfKeyPattern = /^hf_[A-Za-z0-9]{30,}$/;
        return hfKeyPattern.test(apiKey);
    }

    /**
     * Store encrypted key in localStorage
     * @param {string} encryptedKey - Encrypted API key
     */
    storeEncryptedKey(encryptedKey) {
        try {
            localStorage.setItem('hf_encrypted_key', encryptedKey);
            return true;
        } catch (error) {
            console.error('Failed to store encrypted key:', error);
            return false;
        }
    }

    /**
     * Retrieve encrypted key from localStorage
     * @returns {string|null} - Encrypted key or null
     */
    getStoredEncryptedKey() {
        try {
            return localStorage.getItem('hf_encrypted_key');
        } catch (error) {
            console.error('Failed to retrieve encrypted key:', error);
            return null;
        }
    }

    /**
     * Clear stored encrypted key
     */
    clearStoredKey() {
        try {
            localStorage.removeItem('hf_encrypted_key');
            return true;
        } catch (error) {
            console.error('Failed to clear encrypted key:', error);
            return false;
        }
    }

    /**
     * Generate a strong random password for encryption
     * @param {number} length - Password length (default 32)
     * @returns {string} - Random password
     */
    generateSecurePassword(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        const randomValues = crypto.getRandomValues(new Uint8Array(length));
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[randomValues[i] % charset.length];
        }
        return password;
    }

    /**
     * Convert ArrayBuffer to Base64
     * @private
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert Base64 to ArrayBuffer
     * @private
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Test encryption/decryption functionality
     * @returns {Promise<boolean>} - True if test passes
     */
    async testEncryption() {
        const testKey = 'hf_testkey123456789012345678901234567890';
        const testPassword = 'test_password_123';

        try {
            const encrypted = await this.encryptKey(testKey, testPassword);
            const decrypted = await this.decryptKey(encrypted, testPassword);
            return decrypted === testKey;
        } catch (error) {
            console.error('Encryption test failed:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureKeyManager;
}
