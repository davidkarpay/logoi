# Security Documentation

## API Key Encryption & Management

This application implements **AES-256-GCM encryption** to securely store your HuggingFace API keys using the Web Crypto API. This document explains the security architecture and best practices.

---

## 🔐 Security Architecture

### Encryption Details

- **Algorithm**: AES-256-GCM (Advanced Encryption Standard with Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (OWASP recommended minimum)
- **Key Length**: 256 bits
- **IV Length**: 96 bits (12 bytes) - optimal for GCM mode
- **Salt**: 128 bits (16 bytes) - randomly generated per encryption

### How It Works

1. **Key Encryption Process**:
   ```
   User Password → PBKDF2 (100k iterations) → Derived Key
   API Key + Derived Key + Random IV → AES-GCM Encryption → Encrypted Blob
   Encrypted Blob (Salt + IV + Ciphertext) → Base64 Encoding → localStorage
   ```

2. **Key Decryption Process**:
   ```
   localStorage → Base64 Decoding → Extract (Salt + IV + Ciphertext)
   User Password + Salt → PBKDF2 → Derived Key
   Ciphertext + Derived Key + IV → AES-GCM Decryption → API Key
   ```

3. **In-Memory Security**:
   - API keys are cleared from React state after encryption
   - Passwords are never stored, only used transiently
   - Keys are only held in memory during active API calls

---

## 🛡️ Security Features

### ✅ Implemented Protections

1. **Client-Side Encryption**
   - All encryption/decryption happens in your browser
   - Your plaintext API key never touches remote servers except when calling HuggingFace
   - Web Crypto API provides hardware-accelerated cryptographic operations

2. **Secure Storage**
   - Encrypted keys stored in browser localStorage
   - Keys encrypted with user-provided password
   - No plaintext secrets in code or storage

3. **Key Validation**
   - Validates HuggingFace API key format (hf_*)
   - Warns on malformed keys
   - Optional validation bypass for testing

4. **Memory Safety**
   - Sensitive data cleared after use
   - Passwords not persisted in state
   - Automatic cleanup on component unmount

5. **HTTPS Enforcement**
   - All HuggingFace API calls use HTTPS
   - Prevents man-in-the-middle attacks
   - Ensures encrypted transit

### ⚠️ Security Limitations

This is a **client-side application**, which has inherent security constraints:

1. **Browser Inspection**
   - JavaScript code is visible in browser DevTools
   - Decrypted keys exist in memory during use
   - Browser extensions can potentially access memory

2. **No Backend Protection**
   - No server-side rate limiting
   - No IP-based access controls
   - No audit logging

3. **User Responsibility**
   - Password strength depends on user choice
   - Forgotten passwords cannot be recovered
   - Browser localStorage can be cleared accidentally

4. **XSS Vulnerabilities**
   - If a malicious script runs in your browser, it could access decrypted keys
   - Always ensure you're using trusted networks and devices

---

## 🔑 Best Practices

### For Maximum Security

1. **Use Strong Passwords**
   ```
   ✅ Good: "Tr0ub4dor&3-Elephant-Quantum"
   ❌ Bad:  "password123"

   - Minimum 16 characters
   - Mix uppercase, lowercase, numbers, symbols
   - Avoid dictionary words
   - Use a password manager
   ```

2. **Enable Encryption**
   - Always check "Encrypt and store API key" option
   - Never store plaintext keys in browser

3. **Secure Your Device**
   - Use full-disk encryption
   - Lock your screen when away
   - Keep browser updated
   - Use antivirus software

4. **Use Limited Scope Keys**
   - Create HuggingFace API keys with **read-only** permissions
   - Never use keys with write/delete permissions
   - Rotate keys regularly (every 90 days)

5. **Monitor Usage**
   - Check HuggingFace dashboard for unexpected API calls
   - Revoke keys if suspicious activity detected
   - Enable email notifications for API usage

### For Development/Testing

1. **Use Separate Keys**
   - Create different keys for development vs production
   - Label keys clearly in HuggingFace dashboard

2. **Don't Commit Keys**
   - `.gitignore` already excludes `.env` files
   - Never commit keys to version control
   - Use environment variables for local development

3. **Clear Keys When Done**
   - Use "Clear Stored Key" button when switching accounts
   - Clear browser data when using shared computers

---

## 📋 Usage Guide

### Initial Setup

1. **Get Your HuggingFace API Key**
   - Visit: https://huggingface.co/settings/tokens
   - Click "New token"
   - Select "Read" permissions
   - Copy the token (starts with `hf_`)

2. **Configure in App**
   - Open logo-generator.html
   - Click the 🔐 icon in the header
   - Paste your API key
   - Check "Encrypt and store API key"
   - Enter a strong encryption password
   - Click "Save & Continue"

3. **Verification**
   - Icon should change from 🔐 to 🔓
   - Try generating a logo to test

### Subsequent Sessions

1. **Decrypting Stored Key**
   - Open the app
   - Modal will prompt for password
   - Enter your encryption password
   - Click "Decrypt & Use"

2. **Using New Key**
   - Click "Use New Key" instead
   - Follow initial setup process

### Managing Keys

- **View Status**: 🔐 (not configured) or 🔓 (configured)
- **Change Key**: Click header icon → "Use New Key"
- **Clear Key**: Click header icon → "Clear Stored Key"
- **Skip Encryption**: Uncheck the encryption checkbox (not recommended)

---

## 🧪 Security Testing

### Verify Encryption

You can test the encryption system:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   const keyManager = new SecureKeyManager();
   keyManager.testEncryption().then(result => {
       console.log('Encryption test:', result ? 'PASSED ✅' : 'FAILED ❌');
   });
   ```

### Inspect Stored Data

1. Open DevTools → Application tab
2. Navigate to Local Storage → your domain
3. Find `hf_encrypted_key`
4. Verify it looks like random base64 (e.g., `dGVzdGluZ+...`)
5. Should NOT be readable plaintext

---

## 🚨 Threat Model

### What This Protects Against

✅ **Accidental Exposure**
- Screenshots of your screen won't reveal keys
- Git commits won't contain plaintext secrets
- Browser history inspection won't leak keys

✅ **Casual Snooping**
- Someone with brief physical access can't steal keys
- localStorage inspection reveals only encrypted data
- Requires password to access keys

✅ **Network Interception** (partial)
- API keys encrypted at rest
- HTTPS protects keys in transit to HuggingFace
- No plaintext transmission except to authorized endpoint

### What This Does NOT Protect Against

❌ **Advanced Malware**
- Keyloggers can capture your password
- Memory scrapers can extract decrypted keys
- Browser exploits can bypass all client-side security

❌ **Physical Access**
- Forensic analysis of device storage
- Cold boot attacks on RAM
- Hardware keyloggers

❌ **Compromised Browser**
- Malicious extensions
- XSS attacks from compromised websites
- Browser zero-day vulnerabilities

❌ **Social Engineering**
- Phishing attacks
- Credential theft
- Impersonation

---

## 🔍 Security Audits

### Self-Assessment Checklist

- [ ] Using HTTPS for all API calls
- [ ] API keys validated before storage
- [ ] Encryption enabled by default
- [ ] Strong password used (16+ characters)
- [ ] No plaintext keys in code
- [ ] `.gitignore` excludes sensitive files
- [ ] Browser kept updated
- [ ] Device has full-disk encryption
- [ ] API keys have minimal permissions
- [ ] Regular key rotation schedule

### Recommended Security Tools

1. **Browser Extensions**
   - [Privacy Badger](https://privacybadger.org/) - Block trackers
   - [HTTPS Everywhere](https://www.eff.org/https-everywhere) - Force HTTPS
   - [uBlock Origin](https://ublockorigin.com/) - Ad/malware blocker

2. **Password Managers**
   - [Bitwarden](https://bitwarden.com/) - Open source
   - [1Password](https://1password.com/) - User-friendly
   - [KeePassXC](https://keepassxc.org/) - Offline-first

3. **Network Security**
   - VPN when on public WiFi
   - Firewall enabled
   - DNS over HTTPS (DoH)

---

## 📚 Additional Resources

### Web Crypto API
- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [W3C Specification](https://www.w3.org/TR/WebCryptoAPI/)

### Cryptography Standards
- [NIST AES-GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [RFC 8018 PBKDF2](https://tools.ietf.org/html/rfc8018)

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)

---

## 🆘 Troubleshooting

### "Decryption failed" Error

**Causes**:
- Incorrect password
- Corrupted encrypted data
- Browser localStorage cleared

**Solutions**:
1. Double-check password (case-sensitive)
2. Try "Use New Key" and re-enter API key
3. Clear stored key and start fresh

### API Key Not Working

**Causes**:
- Invalid API key format
- Expired or revoked key
- Insufficient permissions

**Solutions**:
1. Verify key starts with `hf_`
2. Check HuggingFace dashboard for key status
3. Generate new key with correct permissions

### Encryption Unavailable

**Causes**:
- Non-HTTPS connection
- Outdated browser
- Missing Web Crypto API support

**Solutions**:
1. Access via HTTPS
2. Update browser to latest version
3. Use modern browser (Chrome 60+, Firefox 57+, Safari 11+)

---

## 📄 License & Disclaimer

This security implementation is provided "as-is" without warranty. While we follow industry best practices for client-side encryption, no system is 100% secure. Use at your own risk.

**Recommendations**:
- For production/commercial use, implement backend API proxy
- For highly sensitive data, use hardware security modules (HSMs)
- For enterprise deployment, conduct professional security audit

---

## 🤝 Contributing

Found a security issue? Please report responsibly:

1. **DO NOT** open public GitHub issues for vulnerabilities
2. Email security details to the maintainer
3. Allow 90 days for patch before disclosure
4. Provide detailed reproduction steps

Security improvements are welcome via pull request!

---

**Last Updated**: 2025-11-23
**Security Version**: 1.0
