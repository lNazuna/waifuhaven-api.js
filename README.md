# 🌸 Waifu Haven API 

[waifu-haven.ddns.net](http://waifu-haven.ddns.net) API for JavaScript.

[![NPM](https://nodei.co/npm/waifuhaven-api.js.png)](https://nodei.co/npm/waifuhaven-api.js/)

**Ultra simple Node.js - Just your API key and you're ready!**

## ✨ Features

- 🚀 **Zero Configuration** - Works instantly with just your API key
- 🤖 **Discord Bot Ready** - Automatically configured for Discord bots
- ⚡ **Smart Caching** - Categories cached for better performance
- 📊 **Built-in Stats** - Track your usage automatically
- 🛡️ **Error Handling** - Clear, helpful error messages

## 📦 Installation

```bash
# From GitHub
npm install git+https://github.com/lNazuna/waifuhaven-api.js.git

# From NPM (coming soon)
npm install waifuhaven-api
```
## APIKEY

Discord: [https://discord.gg/GhJHfDm4wb](https://discord.gg/GhJHfDm4wb)

Join discord server and get your apikey with **/apikey create** slash command for free!

## 🚀 Super Simple Usage

**Just need your API key - that's it!**

```# 🌸 Waifu Haven API

**Super simple Node.jst for Waifu API - Zero configuration needed!**

## ✨ Features

- 🚀 **Zero Configuration** - Works instantly with just your API key
- 🤖 **Discord Bot Ready** - Automatically configured for Discord bots
- ⚡ **Built-in Rate Limiting** - Respects API limits automatically
- 📊 **Auto Statistics** - Track your usage automatically
- 🛡️ **Smart Error Handling** - Clear error messages
- 🔄 **Auto Retry** - Handles temporary failures

## 📦 Installation

```bash
# From GitHub
npm install git+https://github.com/lNazuna/waifuhaven-api.js.git

# From NPM (coming soon)
npm install waifuhaven-api
```

## 🚀 Super Simple Usage

**Just need your API key - that's it!**

```javascript
const WaifuAPIClient = require('waifuhaven-api');

const client = new WaifuAPIClient('your-api-key');

// Get random waifu
const image = await client.getSFW('waifu');
console.log(image.data.url); // Base64 image data
```

## 🤖 Discord Bot - Even Simpler!

```javascript
const WaifuAPIClient = require('waifuhaven-api');

// ✨ Auto-configured for Discord bots
const client = WaifuAPIClient.createBot('your-api-key');

// In your Discord command
async function waifuCommand(interaction) {
    const image = await client.getSFW('waifu');
    
    // Convert base64 to buffer for Discord
    const buffer = Buffer.from(image.data.url.split(',')[1], 'base64');
    
    await interaction.reply({
        files: [{ attachment: buffer, name: 'waifu.jpg' }]
    });
}
```

## 📚 Available Methods

### Get Images
```javascript
// SFW images
await client.getSFW('waifu');
await client.getSFW('maid');
await client.getSFW('uniform');

// NSFW images
await client.getNSFW('hentai');
await client.getNSFW('waifu');

// Random from any category
await client.getRandomImage('sfw');
await client.getRandomImage('nsfw');
await client.getRandomImage('any'); // SFW or NSFW
```

### Get Information
```javascript
// All available categories
const categories = await client.getCategories();
console.log(categories.sfw); // ['waifu', 'maid', ...]
console.log(categories.nsfw); // ['hentai', 'waifu', ...]

// API health
const health = await client.getHealth();
console.log(health.data.status); // "healthy"

// Your usage stats
const stats = client.getStats();
console.log(stats.successRate); // "95%"
console.log(stats.totalRequests); // 42
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

## 🔧 Advanced Usage (Optional)

### Error Handling
```javascript
try {
    const image = await client.getSFW('waifu');
    console.log('Success!', image.data.filename);
} catch (error) {
    if (error.status === 401) {
        console.log('Invalid API key!');
    } else if (error.status === 429) {
        console.log('Rate limited - slow down!');
    } else {
        console.log('Error:', error.message);
    }
}
```

### Statistics Monitoring
```javascript
// Check your usage
const stats = client.getStats();
console.log(`Success rate: ${stats.successRate}`);
console.log(`Average response: ${stats.averageResponseTime}ms`);
console.log(`Total requests: ${stats.totalRequests}`);

// Reset stats
client.resetStats();
```

## 🧪 Quick Test

```javascript
const WaifuAPIClient = require('waifuhaven-api');

async function test() {
    const client = new WaifuAPIClient('your-api-key');
    
    try {
        // Test API connection
        const health = await client.getHealth();
        console.log('✅ API is', health.data.status);
        
        // Get a random waifu
        const image = await client.getSFW('waifu');
        console.log('✅ Got image:', image.data.filename);
        console.log('📊 File size:', (image.data.size / 1024).toFixed(1), 'KB');
        
        // Show stats
        const stats = client.getStats();
        console.log('📈 Success rate:', stats.successRate);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

test();
```

## 🆘 Common Issues

### "API key is required"
Make sure you're passing your API key:
```javascript
const client = new WaifuAPIClient('your-actual-api-key-here');
```

### "Cannot connect to API server"
The API might be down. Check status:
```javascript
const health = await client.getHealth();
```

### "Rate limit exceeded"
You're making too many requests. The client automatically handles this, but you might need to slow down.

## 📄 License

MIT License - use it however you want!

## 🤝 Support

- 🐛 [Report Issues](https://github.com/lNazuna/waifuhaven-api.js/issues)
- 💬 [Get Help](https://github.com/lNazuna/waifuhaven-api.js/discussions)

## 🌟 Show Your Support

Give a ⭐️ if this made your life easier!

---

**That's it! No complex configuration, no endless options - just your API key and you're ready to go! 🚀**