#!/usr/bin/env node

/**
 * Command-line API Integration Test
 * Tests the HuggingFaceMultiGenerator class functionality
 */

// Load the modules (simulating browser environment)
const fs = require('fs');
const vm = require('vm');

console.log('🧪 API Integration Test Suite\n');
console.log('Loading modules...\n');

// Read and execute the files
const secureKeyManagerCode = fs.readFileSync('./secure-key-manager.js', 'utf8');
const hfApiCode = fs.readFileSync('./hf-api-integration.js', 'utf8');

// Create a context with necessary globals
const context = {
    console,
    crypto: require('crypto').webcrypto, // Node.js crypto for Web Crypto API
    localStorage: {
        storage: {},
        setItem(key, value) { this.storage[key] = value; },
        getItem(key) { return this.storage[key] || null; },
        removeItem(key) { delete this.storage[key]; }
    },
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
    atob: (str) => Buffer.from(str, 'base64').toString('binary'),
    btoa: (str) => Buffer.from(str, 'binary').toString('base64')
};

vm.createContext(context);

try {
    // Execute the code in context
    vm.runInContext(secureKeyManagerCode, context);
    vm.runInContext(hfApiCode, context);

    console.log('✅ Modules loaded successfully\n');
} catch (error) {
    console.error('❌ Failed to load modules:', error.message);
    process.exit(1);
}

// Test functions
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

async function asyncTest(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

// Run tests
(async () => {
    console.log('Running tests...\n');

    // Test 1: Class instantiation
    test('Test 1: HuggingFaceMultiGenerator instantiates', () => {
        const generator = new context.HuggingFaceMultiGenerator();
        if (!generator) throw new Error('Failed to instantiate');
        if (!generator.models) throw new Error('Models not configured');
    });

    // Test 2: Model configuration
    test('Test 2: Models are properly configured', () => {
        const generator = new context.HuggingFaceMultiGenerator();
        const modelCount = Object.keys(generator.models).length;
        if (modelCount < 3) throw new Error(`Only ${modelCount} models configured`);

        // Check each model has required properties
        Object.values(generator.models).forEach(model => {
            if (!model.name) throw new Error('Model missing name');
            if (!model.endpoint) throw new Error('Model missing endpoint');
            if (!model.type) throw new Error('Model missing type');
        });
    });

    // Test 3: API key validation
    test('Test 3: API key validation works', () => {
        const generator = new context.HuggingFaceMultiGenerator();
        const validKey = 'hf_' + 'a'.repeat(35);
        const result = generator.validateApiKey(validKey);
        if (!result) throw new Error('Validation failed for valid key');
    });

    // Test 4: Key management
    test('Test 4: Key management methods work', () => {
        const generator = new context.HuggingFaceMultiGenerator();
        const testKey = 'hf_' + 'test'.repeat(10);

        generator.setApiKey(testKey);
        if (!generator.hasApiKey()) throw new Error('hasApiKey returned false');

        const masked = generator.getMaskedApiKey();
        if (!masked.includes('...')) throw new Error('Masked key format incorrect');

        generator.clearApiKey();
        if (generator.hasApiKey()) throw new Error('Key not cleared');
    });

    // Test 5: Prompt enhancement
    test('Test 5: Prompt enhancement works', () => {
        const generator = new context.HuggingFaceMultiGenerator();
        const base = 'Test logo';
        const enhanced = generator.enhancePromptForLogo(base);

        if (!enhanced.includes(base)) throw new Error('Original prompt lost');
        if (!enhanced.includes('professional')) throw new Error('Enhancements not added');
    });

    // Test 6: Default parameters
    test('Test 6: Default parameters configured', () => {
        const generator = new context.HuggingFaceMultiGenerator();
        const params = generator.defaultParams;

        if (!params.num_inference_steps) throw new Error('Missing num_inference_steps');
        if (!params.guidance_scale) throw new Error('Missing guidance_scale');
        if (!params.width) throw new Error('Missing width');
        if (!params.height) throw new Error('Missing height');
    });

    // Test 7: SecureKeyManager instantiation
    test('Test 7: SecureKeyManager instantiates', () => {
        const keyManager = new context.SecureKeyManager();
        if (!keyManager) throw new Error('Failed to instantiate');
        if (typeof keyManager.encryptKey !== 'function') throw new Error('Missing encryptKey method');
    });

    // Test 8: Encryption/Decryption
    await asyncTest('Test 8: Encryption/decryption works', async () => {
        const keyManager = new context.SecureKeyManager();
        const testKey = 'hf_' + 'test'.repeat(10);
        const password = 'test_password_123';

        const encrypted = await keyManager.encryptKey(testKey, password);
        if (!encrypted || encrypted === testKey) throw new Error('Encryption failed');

        const decrypted = await keyManager.decryptKey(encrypted, password);
        if (decrypted !== testKey) throw new Error('Decryption failed');
    });

    // Test 9: localStorage integration
    test('Test 9: localStorage integration works', () => {
        const keyManager = new context.SecureKeyManager();
        const testData = 'encrypted_test_data';

        keyManager.storeEncryptedKey(testData);
        const retrieved = keyManager.getStoredEncryptedKey();

        if (retrieved !== testData) throw new Error('localStorage store/retrieve failed');

        keyManager.clearStoredKey();
        const cleared = keyManager.getStoredEncryptedKey();
        if (cleared !== null) throw new Error('localStorage clear failed');
    });

    // Test 10: Error handling
    await asyncTest('Test 10: Error handling works', async () => {
        const generator = new context.HuggingFaceMultiGenerator();

        // Should error without API key
        let errorThrown = false;
        try {
            await generator.generateWithModel('stabilityai/stable-diffusion-2-1', 'test');
        } catch (error) {
            if (error.message.includes('API key not configured')) {
                errorThrown = true;
            }
        }
        if (!errorThrown) throw new Error('Missing API key error not thrown');

        // Should error with invalid model
        generator.setApiKey('hf_' + 'test'.repeat(10));
        errorThrown = false;
        try {
            await generator.generateWithModel('invalid-model', 'test');
        } catch (error) {
            if (error.message.includes('not found')) {
                errorThrown = true;
            }
        }
        if (!errorThrown) throw new Error('Invalid model error not thrown');
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Test Summary:');
    console.log(`  Total: ${testsPassed + testsFailed}`);
    console.log(`  ✅ Passed: ${testsPassed}`);
    console.log(`  ❌ Failed: ${testsFailed}`);
    console.log(`  Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    console.log('='.repeat(50));

    if (testsFailed > 0) {
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
})();
