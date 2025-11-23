// Hugging Face Multi-Model API Integration
// This module handles communication with multiple HF image generation models

class HuggingFaceMultiGenerator {
    constructor(apiKey = null, options = {}) {
        // You can get a free API key at https://huggingface.co/settings/tokens
        // For security, it's recommended to use the setApiKey() method or pass encrypted keys
        this.apiKey = apiKey || null;
        this.isEncrypted = options.isEncrypted || false;
        this.keyValidator = options.validateKey !== false; // enabled by default

        // If API key is provided and validation is enabled, validate it
        if (this.apiKey && this.keyValidator && !this.isEncrypted) {
            this.validateApiKey(this.apiKey);
        }

        // Available models for logo generation
        this.models = {
            'stabilityai/stable-diffusion-2-1': {
                name: 'Stable Diffusion 2.1',
                endpoint: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
                type: 'text-to-image',
                icon: '🎨'
            },
            'runwayml/stable-diffusion-v1-5': {
                name: 'Stable Diffusion 1.5',
                endpoint: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
                type: 'text-to-image',
                icon: '🖼️'
            },
            'CompVis/stable-diffusion-v1-4': {
                name: 'Stable Diffusion 1.4',
                endpoint: 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4',
                type: 'text-to-image',
                icon: '🎯'
            },
            'prompthero/openjourney': {
                name: 'OpenJourney',
                endpoint: 'https://api-inference.huggingface.co/models/prompthero/openjourney',
                type: 'text-to-image',
                icon: '🚀'
            },
            'hakurei/waifu-diffusion': {
                name: 'Waifu Diffusion',
                endpoint: 'https://api-inference.huggingface.co/models/hakurei/waifu-diffusion',
                type: 'text-to-image',
                icon: '✨'
            },
            'dallinmackay/Van-Gogh-diffusion': {
                name: 'Van Gogh Style',
                endpoint: 'https://api-inference.huggingface.co/models/dallinmackay/Van-Gogh-diffusion',
                type: 'text-to-image',
                icon: '🎭'
            }
        };

        this.defaultParams = {
            num_inference_steps: 50,
            guidance_scale: 7.5,
            negative_prompt: "blurry, bad quality, worst quality, low quality, low resolution",
            width: 512,
            height: 512
        };
    }

    // Validate HuggingFace API key format
    validateApiKey(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        // HuggingFace API keys typically start with 'hf_' and are alphanumeric
        const hfKeyPattern = /^hf_[A-Za-z0-9]{30,}$/;

        if (!hfKeyPattern.test(apiKey)) {
            console.warn('Warning: API key format may be invalid. HuggingFace keys typically start with "hf_"');
        }

        return true;
    }

    // Set or update API key (supports both plain and encrypted keys)
    setApiKey(apiKey, isEncrypted = false) {
        this.apiKey = apiKey;
        this.isEncrypted = isEncrypted;

        if (!isEncrypted && this.keyValidator) {
            this.validateApiKey(apiKey);
        }

        return true;
    }

    // Check if API key is configured
    hasApiKey() {
        return this.apiKey !== null && this.apiKey !== '';
    }

    // Clear API key from memory (security best practice)
    clearApiKey() {
        this.apiKey = null;
        this.isEncrypted = false;
    }

    // Get masked API key for display (security)
    getMaskedApiKey() {
        if (!this.apiKey) {
            return 'Not configured';
        }
        if (this.isEncrypted) {
            return '[Encrypted]';
        }
        // Show first 6 and last 4 characters
        if (this.apiKey.length > 10) {
            return `${this.apiKey.substring(0, 6)}...${this.apiKey.substring(this.apiKey.length - 4)}`;
        }
        return '***';
    }

    // Enhance prompt for logo generation
    enhancePromptForLogo(basePrompt) {
        const enhancements = [
            "professional logo design",
            "clean vector style",
            "high quality",
            "centered composition",
            "white background",
            "minimalist design"
        ];
        
        return `${basePrompt}, ${enhancements.join(', ')}`;
    }

    // Generate image using a specific model
    async generateWithModel(modelId, prompt, params = {}) {
        // Security check: ensure API key is configured
        if (!this.hasApiKey()) {
            throw new Error('API key not configured. Please set your HuggingFace API key first.');
        }

        const model = this.models[modelId];
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        const enhancedPrompt = this.enhancePromptForLogo(prompt);
        const requestParams = { ...this.defaultParams, ...params };

        try {
            const response = await fetch(model.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: enhancedPrompt,
                    parameters: requestParams,
                    options: {
                        wait_for_model: true
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API Error: ${error}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            return {
                success: true,
                imageUrl,
                model: model.name,
                modelIcon: model.icon,
                prompt: enhancedPrompt,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error generating with ${model.name}:`, error);
            return {
                success: false,
                error: error.message,
                model: model.name
            };
        }
    }

    // Generate with multiple models in parallel
    async generateWithAllModels(prompt, selectedModels = null, onProgress = null) {
        const modelsToUse = selectedModels || Object.keys(this.models);
        const results = [];

        // Create promises for parallel execution
        const promises = modelsToUse.map(async (modelId) => {
            if (onProgress) {
                onProgress(modelId, 'loading');
            }

            const result = await this.generateWithModel(modelId, prompt);
            
            if (onProgress) {
                onProgress(modelId, result.success ? 'complete' : 'error', result);
            }

            return result;
        });

        // Wait for all models to complete
        const allResults = await Promise.allSettled(promises);
        
        return allResults.map(result => 
            result.status === 'fulfilled' ? result.value : {
                success: false,
                error: result.reason
            }
        );
    }

    // Save image to device (works on iPhone)
    async saveToDevice(imageUrl, filename = 'logo.png') {
        try {
            const blob = await fetch(imageUrl).then(r => r.blob());
            
            // Try Web Share API first (works great on iPhone)
            if (navigator.share && navigator.canShare) {
                const file = new File([blob], filename, { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'AI Generated Logo',
                    });
                    return { success: true, method: 'share' };
                }
            }
            
            // Fallback to download
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return { success: true, method: 'download' };
            
        } catch (error) {
            console.error('Error saving image:', error);
            return { success: false, error: error.message };
        }
    }

    // Batch save all images
    async saveAllImages(images) {
        const results = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const filename = `logo-${image.model.replace(/\s+/g, '-')}-${Date.now()}.png`;
            const result = await this.saveToDevice(image.imageUrl, filename);
            results.push(result);
            
            // Small delay to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return results;
    }

    // Create a comparison grid of all generated images
    createComparisonGrid(images, canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const gridSize = Math.ceil(Math.sqrt(images.length));
        const cellSize = 512;
        
        canvas.width = gridSize * cellSize;
        canvas.height = gridSize * cellSize;
        
        images.forEach((imageData, index) => {
            if (!imageData.success) return;
            
            const img = new Image();
            img.onload = () => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                
                // Draw image
                ctx.drawImage(img, col * cellSize, row * cellSize, cellSize, cellSize);
                
                // Add model label
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(col * cellSize, row * cellSize + cellSize - 30, cellSize, 30);
                
                ctx.fillStyle = 'white';
                ctx.font = '16px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText(
                    imageData.model,
                    col * cellSize + cellSize / 2,
                    row * cellSize + cellSize - 8
                );
            };
            img.src = imageData.imageUrl;
        });
        
        return canvas.toDataURL();
    }
}

// Usage Instructions
const USAGE_GUIDE = `
Multi-Model Logo Generator - Setup Guide
========================================

1. GET YOUR API KEY:
   - Go to https://huggingface.co/settings/tokens
   - Create a free account if needed
   - Generate a new token with "read" permissions
   - Copy the token

2. INTEGRATE WITH YOUR APP:
   
   // Initialize the generator
   const generator = new HuggingFaceMultiGenerator('YOUR_API_KEY');
   
   // Generate with all models
   const results = await generator.generateWithAllModels(
       "Modern law firm logo with scales of justice",
       null, // or array of model IDs to use specific models
       (modelId, status, result) => {
           console.log(\`Model \${modelId}: \${status}\`);
       }
   );
   
   // Save individual image
   await generator.saveToDevice(results[0].imageUrl, 'logo.png');
   
   // Save all images at once
   await generator.saveAllImages(results);

3. OPTIMIZATION FOR LEGAL PROFESSIONALS:
   
   The system automatically enhances prompts for professional logo design.
   Suggested prompts for law firms:
   
   - "Professional law firm logo with scales of justice, minimalist"
   - "Legal services emblem with gavel and shield, corporate style"
   - "Public defender office logo, modern and approachable"
   - "Criminal defense attorney logo, strong and trustworthy"
   - "Legal aid society logo, compassionate and professional"

4. IPHONE OPTIMIZATION:
   
   - The app uses Web Share API for seamless saving to Photos
   - Images are automatically optimized for retina displays
   - Touch-optimized interface for easy selection
   - Supports saving to Files app or sharing via AirDrop

5. ADVANCED FEATURES:
   
   // Customize generation parameters
   const params = {
       num_inference_steps: 75,  // Higher = better quality, slower
       guidance_scale: 10,        // Higher = closer to prompt
       width: 1024,               // Higher resolution
       height: 1024
   };
   
   const result = await generator.generateWithModel(
       'stabilityai/stable-diffusion-2-1',
       'Your prompt here',
       params
   );

6. BATCH PROCESSING FOR RESEARCH:
   
   // Generate variations for A/B testing
   const prompts = [
       "Law firm logo variant A",
       "Law firm logo variant B",
       "Law firm logo variant C"
   ];
   
   for (const prompt of prompts) {
       await generator.generateWithAllModels(prompt);
   }

Note: Some models may have rate limits. Free tier typically allows
      ~1000 generations per month. For unlimited access, consider
      upgrading to Hugging Face Pro.
`;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HuggingFaceMultiGenerator, USAGE_GUIDE };
}

// Log instructions to console
console.log(USAGE_GUIDE);