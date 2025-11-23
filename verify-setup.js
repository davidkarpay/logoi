#!/usr/bin/env node

/**
 * Setup Verification Script
 * Verifies files are in place and properly structured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying API Integration Setup\n');

let allChecks = true;

function check(name, condition, successMsg, failMsg) {
    if (condition) {
        console.log(`✅ ${name}: ${successMsg}`);
    } else {
        console.error(`❌ ${name}: ${failMsg}`);
        allChecks = false;
    }
}

// Check files exist
const requiredFiles = [
    'secure-key-manager.js',
    'hf-api-integration.js',
    'logo-generator.html',
    'index.html',
    'encrypt-key-helper.html',
    'test-storage.html',
    'test-api-integration.html',
    'SECURITY.md',
    'DEPLOYMENT.md',
    'README.md',
    '.env.example',
    '.gitignore'
];

console.log('📁 Checking Required Files:\n');

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    check(
        `File: ${file}`,
        exists,
        'Found',
        'Missing'
    );
});

console.log('\n📝 Checking File Contents:\n');

// Check secure-key-manager.js
const secureKeyCode = fs.readFileSync('./secure-key-manager.js', 'utf8');
check(
    'SecureKeyManager class',
    secureKeyCode.includes('class SecureKeyManager'),
    'Class defined',
    'Class not found'
);
check(
    'AES-256-GCM encryption',
    secureKeyCode.includes('AES-GCM') && secureKeyCode.includes('256'),
    'Encryption configured',
    'Encryption config missing'
);
check(
    'PBKDF2 key derivation',
    secureKeyCode.includes('PBKDF2') && secureKeyCode.includes('100000'),
    'Key derivation configured',
    'Key derivation missing'
);

// Check hf-api-integration.js
const hfApiCode = fs.readFileSync('./hf-api-integration.js', 'utf8');
check(
    'HuggingFaceMultiGenerator class',
    hfApiCode.includes('class HuggingFaceMultiGenerator'),
    'Class defined',
    'Class not found'
);
check(
    'API key validation',
    hfApiCode.includes('validateApiKey'),
    'Validation method present',
    'Validation missing'
);
check(
    'Model configuration',
    hfApiCode.includes('stabilityai/stable-diffusion'),
    'Models configured',
    'Models not configured'
);
check(
    'Encryption support',
    hfApiCode.includes('isEncrypted') && hfApiCode.includes('setApiKey'),
    'Encryption integration present',
    'Encryption integration missing'
);

// Check logo-generator.html
const logoGenHtml = fs.readFileSync('./logo-generator.html', 'utf8');
check(
    'Script imports',
    logoGenHtml.includes('secure-key-manager.js') && logoGenHtml.includes('hf-api-integration.js'),
    'Scripts imported',
    'Scripts not imported'
);
check(
    'Encryption UI',
    logoGenHtml.includes('ApiKeySetup') && logoGenHtml.includes('encryptionPassword'),
    'Encryption UI present',
    'Encryption UI missing'
);
check(
    'localStorage integration',
    logoGenHtml.includes('keyManager.getStoredEncryptedKey') || logoGenHtml.includes('storeEncryptedKey'),
    'localStorage configured',
    'localStorage not configured'
);

// Check README
const readme = fs.readFileSync('./README.md', 'utf8');
check(
    'Security documentation link',
    readme.includes('SECURITY.md'),
    'Security docs linked',
    'Security docs not linked'
);
check(
    'GitHub Pages URL',
    readme.includes('davidkarpay.github.io'),
    'Live demo URL present',
    'Live demo URL missing'
);
check(
    'No legal references',
    !readme.toLowerCase().includes('law firm') && !readme.toLowerCase().includes('legal professional') && !readme.includes('public defender'),
    'Rebranded successfully',
    'Still contains legal references'
);

console.log('\n🔐 Checking Security Configuration:\n');

// Check .env.example
const envExample = fs.readFileSync('./.env.example', 'utf8');
check(
    'Environment template',
    envExample.includes('HF_API_KEY') && envExample.includes('ENCRYPTION'),
    'Configuration template present',
    'Configuration incomplete'
);

// Check .gitignore
const gitignore = fs.readFileSync('./.gitignore', 'utf8');
check(
    'Sensitive files ignored',
    gitignore.includes('.env') && gitignore.includes('*.key'),
    'Git ignores configured',
    'Git ignores missing'
);

console.log('\n' + '='.repeat(60));

if (allChecks) {
    console.log('✅ All Checks Passed!');
    console.log('\n📖 Next Steps:');
    console.log('   1. Open test-api-integration.html in a browser');
    console.log('   2. Click "Run All Tests" to verify functionality');
    console.log('   3. Enable GitHub Pages in repository settings');
    console.log('   4. Access your live app!');
    console.log('\n🌐 Test URLs (after enabling GitHub Pages):');
    console.log('   Landing: https://davidkarpay.github.io/logoi/');
    console.log('   App: https://davidkarpay.github.io/logoi/logo-generator.html');
    console.log('   Tests: https://davidkarpay.github.io/logoi/test-api-integration.html');
    process.exit(0);
} else {
    console.log('❌ Some Checks Failed');
    console.log('\n   Please review the errors above and fix any issues.');
    process.exit(1);
}
