const ImageApiClient = require('waifuhaven-api.js');
const client = new ImageApiClient('waifu_live_abc123...');

const health = await client.getHealth();        // GET /health
const status = await client.getStatus();        // GET /status  
const categories = await client.getCategories(); // GET /categories + Bearer token
const sfwImage = await client.getSFW('waifu');   // GET /sfw/waifu + Bearer token
const nsfwImage = await client.getNSFW('hentai'); // GET /nsfw/hentai + Bearer token