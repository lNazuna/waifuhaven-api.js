# 🌸 Waifu Haven API

**Production-ready JavaScript client for the Waifu Haven API** - Zero configuration, maximum reliability!

[![NPM](https://nodei.co/npm/waifuhaven-api.js.png)](https://nodei.co/npm/waifuhaven-api.js/)

**Ultra simple Node.js client - Just your API key and you're ready to go!**

## ✨ Features

- 🔒 **Zero Configuration** - Fixed settings for maximum reliability and security
- 🤖 **Discord Bot Ready** - Automatically optimized for Discord bots with smart rate limiting
- ⚡ **Smart Caching** - Categories cached for 5 minutes for lightning-fast responses
- 🧪 **Connection Testing** - Built-in comprehensive API testing and validation
- 🛡️ **Advanced Error Handling** - Clear, actionable error messages with specific status codes
- 🔄 **Auto Retry Logic** - Intelligent handling of temporary failures and rate limits
- 🎯 **Bot Detection** - Automatic platform detection with optimized headers
- 🔒 **Enterprise Security** - Production-grade security with validated API keys

## 📦 Installation

```bash
# From GitHub
npm install git+https://github.com/lNazuna/waifuhaven-api.js.git

# From NPM (coming soon)
npm install waifuhaven-api
```

## 🔑 Get Your API Key

**Discord:** [https://discord.gg/GhJHfDm4wb](https://discord.gg/GhJHfDm4wb)

Join our Discord server and get your API key with **/apikey create** slash command for **free**!

## 🚀 Super Simple Usage

**Just need your API key - everything else is pre-configured!**

```javascript
const WaifuAPIClient = require('waifuhaven-api');

const client = new WaifuAPIClient('your-api-key');

// Get random waifu
const image = await client.getSFW('waifu');
console.log(image.url); // Base64 image data
console.log(image.filename); // Original filename
console.log(image.size); // File size in bytes
console.log(image.requestInfo); // Request metadata
```

## 🤖 Discord Bot - Even Simpler!

```javascript
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const WaifuAPIClient = require('waifuhaven-api');

// ✨ Auto-configured for Discord bots with optimized settings
const waifuClient = WaifuAPIClient.createBot('your-api-key', {
    guildId: '123456789',    // Your guild ID
    userId: '987654321',     // Your bot user ID
    botVersion: '2.0.0'      // Your bot version
});

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Slash command example
bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    if (interaction.commandName === 'waifu') {
        try {
            // Get random waifu image
            const image = await waifuClient.getSFW('waifu');
            
            // Convert base64 to buffer for Discord
            const base64Data = image.url.replace(/^data:image\/[a-z]+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Create Discord attachment
            const attachment = new AttachmentBuilder(buffer, { name: image.filename });
            
            const embed = new EmbedBuilder()
                .setTitle('🌸 Random Waifu')
                .setDescription(`**Category:** ${image.category}`)
                .setImage(`attachment://${image.filename}`)
                .setFooter({ 
                    text: `${image.filename} • ${(image.size / 1024).toFixed(1)} KB • ${image.requestInfo.timestamp}`
                })
                .setColor('#FF69B4');
            
            await interaction.reply({ 
                embeds: [embed], 
                files: [attachment] 
            });
            
        } catch (error) {
            await interaction.reply(`❌ Error: ${error.message}`);
        }
    }
});
```

## 📚 Available Methods

### Get Images
```javascript
// SFW images
await client.getSFW('waifu');
await client.getSFW('maid');
await client.getSFW('uniform');
await client.getSFW('kurumi');

// NSFW images  
await client.getNSFW('hentai');
await client.getNSFW('waifu');
await client.getNSFW('milf');

// Random from any category
await client.getRandomImage('sfw');     // Random SFW
await client.getRandomImage('nsfw');    // Random NSFW  
await client.getRandomImage('any');     // SFW or NSFW

// Generic method
await client.getImage('waifu', 'sfw');  // Category, type
```

### Get Information
```javascript
// All available categories
const categories = await client.getCategories();
console.log(categories.sfw);  // ['waifu', 'maid', 'kurumi', ...]
console.log(categories.nsfw); // ['hentai', 'waifu', 'milf', ...]

// API health check - returns complete health data
const health = await client.getHealth();
console.log(health.status);   // "healthy"
console.log(health.uptime);   // Server uptime
console.log(health.services); // Service status

// API status - returns complete status data
const status = await client.getStatus();
console.log(status.version);  // API version
console.log(status.rateLimit); // Rate limit info
console.log(status.botSupport); // Bot support info

// Comprehensive connectivity test
const testResult = await client.testConnection();
console.log(testResult.success);  // true/false
console.log(testResult.details);  // Detailed test results

// Library information
const info = client.getInfo();
console.log(info.features);       // Available features
console.log(info.configuration); // Current configuration
```

## 🧪 Testing Your Setup

```javascript
const WaifuAPIClient = require('waifuhaven-api');

async function quickTest() {
    const client = new WaifuAPIClient('your-api-key');
    
    try {
        console.log('🧪 Running comprehensive API test...');
        
        // Run all connectivity tests
        const testResult = await client.testConnection();
        
        if (testResult.success) {
            console.log('✅ All tests passed! Your setup is perfect.');
            console.log('📊 Test Results:');
            console.log('   Health Check:', testResult.details.healthCheck);
            console.log('   Status Check:', testResult.details.statusCheck);
            console.log('   Authentication:', testResult.details.authentication);
            console.log('   Categories Access:', testResult.details.categoriesAccess);
            console.log('   Image Retrieval:', testResult.details.imageRetrieval);
        } else {
            console.log('❌ Some tests failed:');
            console.log(testResult.details);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message.includes('Invalid API key')) {
            console.log('💡 Get your API key from: https://discord.gg/GhJHfDm4wb');
        }
    }
}

quickTest();
```

## 📊 Available Categories

### 🌸 SFW Categories
```javascript
'waifu'          // General waifu images
'maid'           // Maid characters  
'uniform'        // School uniforms
'oppai'          // Oppai (SFW)
'kurumi'         // Kurumi Tokisaki
'rushia'         // Uruha Rushia
'marin-kitagawa' // Marin Kitagawa
'mori-calliope'  // Mori Calliope
'raiden-shogun'  // Raiden Shogun
'kamisato-ayaka' // Kamisato Ayaka
```

### 🔞 NSFW Categories
```javascript
'hentai'         // General hentai
'waifu'          // NSFW waifu
'ass'            // Ass focused
'blowjob'        // Blowjob scenes
'milf'           // MILF characters
'redo-of-healer' // Redo of Healer
```

## 🔧 Client Creation Methods

### Standard Client
```javascript
// Basic client with fixed configuration
const client = new WaifuAPIClient('your-api-key');
```

### Discord Bot Client
```javascript
// Optimized for Discord bots
const botClient = WaifuAPIClient.createBot('your-api-key', {
    guildId: '123456789',     // Your Discord guild ID
    userId: '987654321',      // Your bot user ID  
    botVersion: '2.0.0'       // Your bot version
});
```

### Web Application Client
```javascript
// Optimized for web applications
const webClient = WaifuAPIClient.createWeb('your-api-key');
```

### Test Client
```javascript
// Client with enhanced debugging for testing
const testClient = WaifuAPIClient.createTest('your-api-key');
```

## 🛡️ Enhanced Error Handling

```javascript
try {
    const image = await client.getSFW('waifu');
    console.log('Success!', image.filename);
} catch (error) {
    switch (true) {
        case error.message.includes('Invalid API key'):
            console.log('❌ Your API key is invalid!');
            console.log('💡 Get a new one from: https://discord.gg/GhJHfDm4wb');
            break;
            
        case error.message.includes('Rate limit exceeded'):
            const retryMatch = error.message.match(/Retry after (\d+) seconds/);
            const retryAfter = retryMatch ? retryMatch[1] : '60';
            console.log(`⏰ Rate limited! Wait ${retryAfter} seconds before trying again.`);
            break;
            
        case error.message.includes('No images found'):
            console.log('📂 Category is empty or doesn\'t exist');
            break;
            
        case error.message.includes('Invalid category'):
            console.log('❓ Invalid category name');
            const categories = await client.getCategories();
            console.log('✅ Valid SFW categories:', categories.sfw.join(', '));
            console.log('✅ Valid NSFW categories:', categories.nsfw.join(', '));
            break;
            
        case error.message.includes('Server error'):
            console.log('🔧 API server is having issues. Try again later.');
            break;
            
        default:
            console.log('💥 Unknown error:', error.message);
    }
}
```

## 🔒 Security & Validation

```javascript
// Validate API key format before using
if (WaifuAPIClient.validateApiKey('your-key')) {
    console.log('✅ API key format is valid');
    const client = new WaifuAPIClient('your-key');
} else {
    console.log('❌ Invalid API key format');
}

// Get library information
const libInfo = WaifuAPIClient.getLibraryInfo();
console.log(`📚 Library: ${libInfo.name} v${libInfo.version}`);
console.log(`🔧 Features: ${libInfo.features.join(', ')}`);
```

## 🧹 Utility Methods

```javascript
// Clear categories cache (force refresh)
client.clearCache();

// Reset internal statistics
client.resetStats();

// Configure bot settings after creation
client.configureBotSettings({
    platform: 'discord',
    guild: 'new_guild_id',
    user: 'new_user_id',
    version: '3.0.0'
});

// Get client information and configuration
const info = client.getInfo();
console.log('🔧 Configuration:', info.configuration);
console.log('✨ Features:', info.features);
console.log('📂 Supported Categories:', info.supportedCategories);
```

## 🔄 API Response Format

```javascript
// Successful image response
{
    success: true,
    url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...", // Base64 image data
    mimeType: "image/jpeg",
    size: 245760,           // File size in bytes
    category: "waifu",
    filename: "waifu_001.jpg",
    meta: {
        type: "sfw",
        served_at: "2024-01-15T10:30:00.000Z",
        format: "jpeg",
        size_formatted: "240.0 KB",
        bot_request: true,   // If detected as bot
        randomSelection: {   // Only for getRandomImage()
            requestedType: "any",
            selectedType: "sfw", 
            selectedCategory: "waifu",
            availableCount: 10
        }
    },
    requestInfo: {
        timestamp: "2024-01-15T10:30:00.000Z",
        type: "sfw",
        requestedCategory: "waifu"
    }
}

// Categories response
{
    sfw: ['waifu', 'maid', 'uniform', ...],
    nsfw: ['hentai', 'waifu', 'milf', ...]
}

// Health response (complete API response)
{
    status: "healthy",
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "2.1.0",
    environment: "production",
    uptime: "24h 30m",
    memory: { /* memory usage stats */ },
    system: { /* system information */ },
    services: {
        redis: "connected",
        filesystem: "accessible"
    },
    botSupport: {
        enabled: true,
        platforms: ["discord"],
        headers: { /* bot header info */ }
    }
}

// Status response (complete API response)
{
    status: "online",
    message: "Waifu API is running normally",
    version: "2.1.0",
    environment: "production",
    timestamp: "2024-01-15T10:30:00.000Z",
    uptime: "24h 30m",
    endpoints: {
        nsfw: "/nsfw/{category}",
        sfw: "/sfw/{category}",
        categories: "/categories"
    },
    documentation: "/api/docs",
    rateLimit: {
        global: "500 requests per 15 minutes",
        images: "100 requests per minute",
        bots: "30 requests per minute (configurable per API key)"
    },
    botSupport: {
        enabled: true,
        platforms: ["discord"],
        headers: { /* bot header configuration */ }
    }
}

// Test connection response
{
    success: true,
    tests: {
        health: true,
        status: true,
        categories: true,
        auth: true,
        imageRetrieval: true,
        totalTime: 1250
    },
    message: "All connectivity tests passed",
    details: {
        healthCheck: "PASS",
        statusCheck: "PASS", 
        authentication: "PASS",
        categoriesAccess: "PASS",
        imageRetrieval: "PASS"
    }
}
```

## 🆘 Common Issues & Solutions

### "API key is required"
```javascript
// ❌ Wrong
const client = new WaifuAPIClient();

// ✅ Correct  
const client = new WaifuAPIClient('your-actual-api-key-here');
```

### "Invalid API key format"
```javascript
// Validate your API key first
if (WaifuAPIClient.validateApiKey('your-key')) {
    console.log('✅ Key format is valid');
} else {
    console.log('❌ Invalid key format - should be at least 10 characters');
}
```

### "Cannot connect to API server"
```javascript
// Test your connection comprehensively
const testResult = await client.testConnection();
if (!testResult.success) {
    console.log('❌ Connection issues detected:');
    console.log(testResult.details);
}

// Check health directly
const health = await client.getHealth();
console.log('🏥 API Health:', health.status);
```

### "Rate limit exceeded"
```javascript
// The client automatically handles rate limiting, but if you're making too many requests:
// - Regular users: 100 requests per minute
// - Discord bots: 30 requests per minute (configurable via API key)

// Use the bot client for better rate limits:
const botClient = WaifuAPIClient.createBot('your-key');
```

### Configuration Issues
```javascript
// ⚠️ Note: Configuration is FIXED for security and reliability
// You cannot change baseUrl, timeout, or userAgent
// This ensures consistency and prevents common configuration errors

// ✅ If you need different settings, contact the API maintainers
const info = client.getInfo();
console.log('🔧 Current configuration:', info.configuration);
```

## 📄 License

MIT License - use it however you want!

## 🤝 Support & Community

- 💬 **Discord Server:** [https://discord.gg/GhJHfDm4wb](https://discord.gg/GhJHfDm4wb)
- 🐛 **Report Issues:** [GitHub Issues](https://github.com/lNazuna/waifuhaven-api.js/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/lNazuna/waifuhaven-api.js/discussions)
- 📖 **API Documentation:** Check `/api/docs` endpoint on your API instance

## 🌟 Show Your Support

Give a ⭐️ if this made your Discord bot development easier!

## 🚀 What's New in v2.0.0

- 🔒 **Fixed Configuration** - No more configuration headaches, everything is pre-optimized
- 🧪 **Comprehensive Testing** - Built-in connection testing with detailed diagnostics
- 🤖 **Enhanced Bot Support** - Automatic platform detection with optimized headers
- 📊 **Rich Metadata** - Detailed request information and random selection data
- 🛡️ **Production Security** - Enterprise-grade error handling and validation
- ⚡ **Smart Caching** - Intelligent category caching with manual control
- 🔧 **Utility Methods** - Cache clearing, stats reset, and configuration tools
- 📈 **Better Monitoring** - Enhanced health checks and status reporting

---

**That's it! Zero configuration, maximum reliability - just your API key and you're ready to build amazing applications! 🚀**