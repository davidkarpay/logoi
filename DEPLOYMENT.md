# GitHub Pages Deployment Guide

This guide will help you deploy your AI Logo Generator to GitHub Pages so you can access it from any device (especially your phone) with your encrypted API key stored locally.

---

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/davidkarpay/logoi`
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)`
5. Click **Save**

### Step 2: Wait for Deployment

GitHub will build and deploy your site automatically (takes 1-2 minutes).

You'll see a message like:
```
✅ Your site is live at https://davidkarpay.github.io/logoi/
```

### Step 3: Access Your App

Open the URL on any device:
```
https://davidkarpay.github.io/logoi/
```

**That's it!** 🎉

---

## 📱 Using on Your Phone

### First-Time Setup

1. **Open on Phone**: Navigate to `https://davidkarpay.github.io/logoi/` on your phone's browser
2. **Enter API Key**: Click "Logo Generator" and enter your HuggingFace API key
3. **Enable Encryption**: Check "Encrypt and store API key"
4. **Create Password**: Choose a strong password (you'll need this each time)
5. **Save**: Click "Save & Continue"

### Making it Easy to Access

#### Option A: Add to Home Screen (iOS)

1. Open `https://davidkarpay.github.io/logoi/` in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "AI Logo Generator"
5. Tap **Add**

Now you have an app icon on your home screen! 📱

#### Option B: Bookmark It

1. Open the URL in your browser
2. Bookmark it for quick access
3. Sync bookmarks across devices

### Subsequent Uses

1. Open the app from your home screen or bookmark
2. The app will prompt: **"Enter your decryption password"**
3. Enter the password you created
4. Your API key is decrypted and ready to use!

**Your encrypted key persists in your browser's localStorage**, so you don't need to re-enter your API key each time - just your password!

---

## 🔒 How Local Storage Works

### What Gets Stored

When you encrypt and save your API key:

```javascript
// In your browser's localStorage:
{
  "hf_encrypted_key": "dGVzdGluZyBlbmNyeXB0aW9uIHN5c3RlbQ..." // Base64 encrypted data
}
```

### Security

- **Encrypted**: Key is encrypted with AES-256-GCM
- **Password Protected**: Only you can decrypt with your password
- **Browser Specific**: Each browser has its own localStorage
- **Domain Specific**: Only `davidkarpay.github.io` can access it
- **Persistent**: Survives browser restarts and phone reboots

### Important Notes

⚠️ **Different browsers = different storage**
- Safari on iPhone: Separate storage
- Chrome on phone: Separate storage
- Desktop browser: Separate storage

💡 **Tip**: Use the same browser consistently for convenience!

⚠️ **Clearing browser data will delete your encrypted key**
- You can always re-enter and re-encrypt your key
- Or use the Encryption Helper to back up your encrypted key

---

## 🌍 Multi-Device Usage

### Using on Multiple Devices

You have two options:

#### Option 1: Re-encrypt on Each Device

1. Open `https://davidkarpay.github.io/logoi/` on each device
2. Enter your API key and password
3. Each device stores its own encrypted copy

**Pros**: Fully independent, no syncing needed
**Cons**: Need to set up on each device

#### Option 2: Share Encrypted Key

1. Use the **Encryption Helper** on one device
2. Copy the encrypted key
3. Manually store it in localStorage on other devices

**Advanced users only!** See "Advanced Configuration" below.

---

## 📊 GitHub Pages Features

### What Works

✅ **Static HTML/CSS/JS**: All your files work perfectly
✅ **HTTPS by default**: Secure connection included
✅ **CDN-hosted libraries**: React, Tailwind, etc. load fine
✅ **Client-side encryption**: Web Crypto API works
✅ **localStorage**: Persists encrypted keys
✅ **PWA support**: Can be installed as app
✅ **Mobile optimized**: Works great on phones

### What Doesn't Work

❌ **Server-side code**: No backend (we don't need it!)
❌ **Environment variables**: No `.env` file support (use encrypted keys instead)
❌ **Database**: No server-side storage (localStorage is better here!)

---

## 🔧 Advanced Configuration

### Custom Domain (Optional)

Want to use your own domain like `logos.yourdomain.com`?

1. In GitHub Settings → Pages
2. Enter your custom domain
3. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Host: logos (or @ for root)
   Value: davidkarpay.github.io
   ```
4. Enable "Enforce HTTPS"

### Manually Setting localStorage

If you want to transfer your encrypted key between devices:

1. **On source device**, open browser console (F12):
   ```javascript
   localStorage.getItem('hf_encrypted_key')
   ```
   Copy the output

2. **On target device**, open console and run:
   ```javascript
   localStorage.setItem('hf_encrypted_key', 'YOUR_ENCRYPTED_KEY_HERE')
   ```

3. Refresh the page

### Using Different Branches

Deploy from a specific branch (e.g., `gh-pages`):

1. Create a `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   git push -u origin gh-pages
   ```

2. In Settings → Pages, select `gh-pages` branch

### Deployment from Specific Folder

Keep source code separate from deployment:

1. Create a `/docs` folder
2. Move HTML files there
3. In Settings → Pages, select `/docs` folder

---

## 🧪 Testing Your Deployment

### Verify Everything Works

1. **Test Main Page**:
   - Visit `https://davidkarpay.github.io/logoi/`
   - Should see landing page with options

2. **Test Logo Generator**:
   - Click "Logo Generator"
   - Should load app interface

3. **Test Encryption**:
   - Enter test API key (doesn't need to be real)
   - Enable encryption with password
   - Refresh page
   - Should prompt for password

4. **Test localStorage**:
   - Open console (F12)
   - Run: `console.log(localStorage.getItem('hf_encrypted_key'))`
   - Should see encrypted string

5. **Test on Mobile**:
   - Open URL on phone
   - Add to home screen
   - Test encryption workflow

---

## 🔄 Updating Your App

### Method 1: Push to GitHub

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# GitHub Pages auto-deploys in 1-2 minutes
```

### Method 2: Edit on GitHub

1. Navigate to file on GitHub
2. Click **Edit** (pencil icon)
3. Make changes
4. Commit directly to main branch
5. Auto-deploys in 1-2 minutes

### Check Deployment Status

1. Go to repository → **Actions** tab
2. See deployment progress
3. Green checkmark = deployed successfully

---

## 🐛 Troubleshooting

### "404 - Page Not Found"

**Problem**: GitHub Pages not enabled or wrong branch

**Solution**:
1. Check Settings → Pages
2. Verify correct branch selected
3. Wait 2-3 minutes for first deployment

### "ERR_BLOCKED_BY_RESPONSE"

**Problem**: Mixed content (HTTP on HTTPS page)

**Solution**:
- All our CDN links use HTTPS ✅
- Check any custom links use `https://`

### "localStorage is not defined"

**Problem**: Browser doesn't support localStorage

**Solution**:
- Use modern browser (Chrome 4+, Safari 4+, Firefox 3.5+)
- Enable cookies/storage in browser settings

### Encrypted Key Lost After Browser Update

**Problem**: Browser cleared data during update

**Solution**:
- Re-enter and re-encrypt your API key
- Or keep a backup of encrypted key in password manager

### API Key Not Working

**Problem**: Invalid key or expired

**Solution**:
1. Check key at https://huggingface.co/settings/tokens
2. Generate new key if needed
3. Re-encrypt with app

---

## 💾 Backup Strategies

### Strategy 1: Password Manager

Store your encrypted key in your password manager:

1. Copy encrypted key from console:
   ```javascript
   localStorage.getItem('hf_encrypted_key')
   ```
2. Save in password manager as secure note
3. Can restore on any device

### Strategy 2: Export to File

Create a backup file:

1. Open Encryption Helper
2. Encrypt your key
3. Copy encrypted output
4. Save to `.txt` file in secure location

### Strategy 3: Environment Variable (Advanced)

For deployment tools that support env vars:

1. Store encrypted key as `ENCRYPTED_HF_KEY`
2. Load it programmatically
3. Set to localStorage on app init

---

## 📈 Usage Analytics (Optional)

Want to track usage? Add Google Analytics:

```html
<!-- Add to index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Note**: Be transparent about analytics in your privacy policy!

---

## 🎯 Best Practices

### For Mobile Use

1. ✅ **Bookmark or add to home screen** for quick access
2. ✅ **Use same browser consistently** for localStorage persistence
3. ✅ **Enable iCloud sync** for Safari bookmarks across Apple devices
4. ✅ **Don't clear browser data** unless you have backup
5. ✅ **Use strong encryption password** (16+ characters)

### For Security

1. ✅ **Use HTTPS only** (GitHub Pages provides this)
2. ✅ **Rotate API keys every 90 days**
3. ✅ **Use read-only HuggingFace tokens**
4. ✅ **Don't share your encryption password**
5. ✅ **Back up encrypted key** in password manager

### For Performance

1. ✅ **Use PWA mode** (add to home screen) for better performance
2. ✅ **Enable browser caching** for faster loads
3. ✅ **Use Wi-Fi** for generating images (can be large)
4. ✅ **Clear old generated images** from gallery periodically

---

## 📱 Progressive Web App (PWA)

Your app is PWA-ready! To enhance it:

### Create manifest.json

```json
{
  "name": "AI Logo Generator",
  "short_name": "Logo Gen",
  "description": "Secure AI-powered logo generation with encrypted API keys",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add to HTML

```html
<link rel="manifest" href="./manifest.json">
```

Now it can be fully installed as a native-like app!

---

## 🆘 Support

### Getting Help

1. **Check SECURITY.md**: Detailed security documentation
2. **Check README.md**: Feature documentation
3. **GitHub Issues**: Report bugs or request features
4. **Console Logs**: Check browser console (F12) for errors

### Common Questions

**Q: Can I use this offline?**
A: Partially. The app loads offline after first visit, but needs internet to call HuggingFace API.

**Q: Is my API key safe?**
A: Yes! It's encrypted with AES-256-GCM and only you have the password.

**Q: Can GitHub see my API key?**
A: No! Your key is encrypted client-side. GitHub only hosts the static files.

**Q: What if I forget my password?**
A: You'll need to re-enter and re-encrypt your API key with a new password.

**Q: Can I use this on Android?**
A: Yes! Works on any modern browser (Chrome, Firefox, Samsung Internet, etc.)

---

## 🎉 You're All Set!

Your AI Logo Generator is now live at:

```
https://davidkarpay.github.io/logoi/
```

Enjoy secure, encrypted AI image generation from anywhere! 🚀🔒

---

**Last Updated**: 2025-11-23
**Version**: 1.0
**GitHub Pages**: Enabled ✅
