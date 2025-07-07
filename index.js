const axios = require('axios');

/**
 * Waifu Haven API Client
 * @version 2.0.0
 * Production-ready client with fixed configuration
 */
class ImageApiClient {
    constructor(apiKey, options = {}) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        
        this.apiKey = apiKey;
        
        // Fixed configuration - users cannot override these
        this.baseUrl = 'http://waifu-haven.ddns.net:50006';
        this.timeout = 30000;
        this.userAgent = 'WaifuAPIClient/2.0.0';
        
        // Categories cache for better performance
        this._categoriesCache = null;
        this._cacheExpiry = null;
        
        // Internal stats tracking (private)
        this._stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            startTime: Date.now()
        };
        
        // Optional bot configuration
        this.botConfig = {
            platform: options.botPlatform || 'discord',
            guild: options.botGuild || null,
            user: options.botUser || null,
            version: options.botVersion || '2.0.0'
        };
        
        console.log('🚀 [CLIENT] Waifu Haven API Client v2.0.0 initialized');
    }

    /**
     * Get available categories from the API
     * @returns {Promise<Object>} Categories object with sfw and nsfw arrays
     */
    async getCategories() {
        try {
            this._stats.totalRequests++;
            
            // Check cache (5 minutes)
            if (this._categoriesCache && this._cacheExpiry && Date.now() < this._cacheExpiry) {
                console.log('📂 [CACHE] Using cached categories');
                return this._categoriesCache;
            }

            console.log('📂 [API] Fetching categories from API...');
            const response = await axios.get(`${this.baseUrl}/categories`, {
                headers: this._getHeaders(),
                timeout: this.timeout
            });

            if (response.status === 200 && response.data.success) {
                this._categoriesCache = response.data.data;
                this._cacheExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes cache
                
                this._stats.successfulRequests++;
                console.log('✅ [API] Categories fetched successfully');
                console.log(`📊 [CATEGORIES] SFW: ${response.data.data.sfw.length}, NSFW: ${response.data.data.nsfw.length}`);
                
                return response.data.data;
            } else {
                throw new Error('Failed to fetch categories');
            }
        } catch (error) {
            this._stats.failedRequests++;
            console.warn('⚠️ [API] Categories fetch failed, using defaults:', error.message);
            // Return default categories if API fails
            return this._getDefaultCategories();
        }
    }

    /**
     * Get image from API with enhanced validation and error handling
     * @param {string} category - Image category
     * @param {string} type - 'sfw' or 'nsfw'
     * @returns {Promise<Object>} Image data object
     */
    async getImage(category, type = 'sfw') {
        try {
            this._stats.totalRequests++;
            console.log(`🎨 [API] Requesting ${type.toUpperCase()}/${category}...`);

            // Validate inputs
            if (!category || typeof category !== 'string') {
                throw new Error('Category is required and must be a string');
            }

            if (!['sfw', 'nsfw'].includes(type)) {
                throw new Error('Type must be either "sfw" or "nsfw"');
            }

            // Get valid categories
            const categories = await this.getCategories();
            const validCategories = categories[type] || [];

            if (!validCategories.includes(category)) {
                throw new Error(`Invalid ${type.toUpperCase()} category. Valid categories: ${validCategories.join(', ')}`);
            }

            // Make API request
            const url = `${this.baseUrl}/${type}/${category}`;
            const response = await axios.get(url, {
                headers: this._getHeaders(),
                timeout: this.timeout
            });

            if (response.status === 200 && response.data.success) {
                this._stats.successfulRequests++;
                const imageData = response.data.data;
                
                console.log(`✅ [API] Image fetched: ${imageData.filename} (${(imageData.size/1024).toFixed(1)}KB)`);
                
                return {
                    success: true,
                    url: imageData.url,
                    mimeType: imageData.mimeType,
                    size: imageData.size,
                    category: imageData.category,
                    filename: imageData.filename,
                    meta: response.data.meta || {},
                    // Additional metadata
                    requestInfo: {
                        timestamp: new Date().toISOString(),
                        type: type,
                        requestedCategory: category
                    }
                };
            } else {
                throw new Error('Failed to fetch image');
            }
        } catch (error) {
            this._stats.failedRequests++;
            console.error(`❌ [API] Image fetch failed:`, error.message);
            
            // Enhanced error handling with specific messages
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data || {};
                
                switch (status) {
                    case 400:
                        throw new Error(`Invalid category: ${errorData.message || 'Bad request'}`);
                    case 401:
                        throw new Error('Invalid API key. Please check your credentials.');
                    case 403:
                        throw new Error('Access denied. Check your API key permissions.');
                    case 404:
                        throw new Error(`No images found in category "${category}".`);
                    case 429:
                        const retryAfter = error.response.headers['retry-after'] || 60;
                        throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
                    case 500:
                        throw new Error('Server error. Please try again later.');
                    default:
                        throw new Error(`API error (${status}): ${errorData.message || 'Unknown error'}`);
                }
            }
            
            throw error;
        }
    }

    /**
     * Get SFW image (convenience method)
     * @param {string} category - SFW category
     * @returns {Promise<Object>} Image data object
     */
    async getSFW(category) {
        return this.getImage(category, 'sfw');
    }

    /**
     * Get NSFW image (convenience method)
     * @param {string} category - NSFW category
     * @returns {Promise<Object>} Image data object
     */
    async getNSFW(category) {
        return this.getImage(category, 'nsfw');
    }

    /**
     * Get random image from any category with enhanced selection
     * @param {string} type - 'sfw', 'nsfw', or 'any'
     * @returns {Promise<Object>} Image data object
     */
    async getRandomImage(type = 'sfw') {
        try {
            console.log(`🎲 [API] Getting random ${type.toUpperCase()} image...`);
            
            const categories = await this.getCategories();
            let availableCategories;
            let selectedType = type;

            switch (type) {
                case 'sfw':
                    availableCategories = categories.sfw;
                    break;
                case 'nsfw':
                    availableCategories = categories.nsfw;
                    break;
                case 'any':
                    availableCategories = [...categories.sfw, ...categories.nsfw];
                    selectedType = Math.random() < 0.5 ? 'sfw' : 'nsfw';
                    break;
                default:
                    throw new Error('Type must be "sfw", "nsfw", or "any"');
            }

            if (!availableCategories || availableCategories.length === 0) {
                throw new Error(`No categories available for type: ${type}`);
            }

            const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
            
            // If type was 'any', determine the actual type for the selected category
            if (type === 'any') {
                selectedType = categories.sfw.includes(randomCategory) ? 'sfw' : 'nsfw';
            }

            console.log(`🎯 [API] Selected random category: ${selectedType}/${randomCategory}`);
            const result = await this.getImage(randomCategory, selectedType);
            
            // Add random selection info to meta
            result.meta.randomSelection = {
                requestedType: type,
                selectedType: selectedType,
                selectedCategory: randomCategory,
                availableCount: availableCategories.length
            };
            
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check API health status
     * @returns {Promise<Object>} Complete health status from API
     */
    async getHealth() {
        try {
            console.log('🏥 [API] Checking health...');
            const response = await axios.get(`${this.baseUrl}/health`, {
                timeout: this.timeout
            });
            
            console.log('✅ [API] Health check successful');
            return response.data;
        } catch (error) {
            console.error('❌ [API] Health check failed:', error.message);
            return {
                success: false,
                error: error.message,
                status: 'unhealthy'
            };
        }
    }

    /**
     * Get API status information
     * @returns {Promise<Object>} Complete status from API
     */
    async getStatus() {
        try {
            console.log('📊 [API] Getting status...');
            const response = await axios.get(`${this.baseUrl}/status`, {
                timeout: this.timeout
            });
            
            console.log('✅ [API] Status retrieved successfully');
            return response.data;
        } catch (error) {
            console.error('❌ [API] Status check failed:', error.message);
            return {
                success: false,
                error: error.message,
                status: 'error'
            };
        }
    }

    /**
     * Test API connectivity and functionality
     * @returns {Promise<Object>} Comprehensive test results
     */
    async testConnection() {
        console.log('🧪 [TEST] Starting comprehensive API test...');
        
        const tests = {
            health: false,
            status: false,
            categories: false,
            auth: false,
            imageRetrieval: false,
            totalTime: 0
        };
        
        const startTime = Date.now();
        
        try {
            // Test 1: Health endpoint
            console.log('🧪 [TEST] Testing health endpoint...');
            const health = await this.getHealth();
            tests.health = health.status === 'healthy';
            
            // Test 2: Status endpoint  
            console.log('🧪 [TEST] Testing status endpoint...');
            const status = await this.getStatus();
            tests.status = status.status === 'online';
            
            // Test 3: Categories endpoint (requires auth)
            console.log('🧪 [TEST] Testing categories endpoint...');
            const categories = await this.getCategories();
            tests.categories = !!(categories.sfw && categories.nsfw);
            tests.auth = tests.categories; // If categories work, auth is working
            
            // Test 4: Image retrieval
            console.log('🧪 [TEST] Testing image retrieval...');
            if (tests.categories && categories.sfw.length > 0) {
                const testImage = await this.getSFW(categories.sfw[0]);
                tests.imageRetrieval = testImage.success && testImage.url;
            }
            
            tests.totalTime = Date.now() - startTime;
            
            const allPassed = tests.health && tests.status && tests.categories && tests.auth && tests.imageRetrieval;
            
            console.log(`🧪 [TEST] Connection test ${allPassed ? 'PASSED' : 'FAILED'} in ${tests.totalTime}ms`);
            
            return {
                success: allPassed,
                tests,
                message: allPassed ? 'All connectivity tests passed' : 'Some tests failed',
                details: {
                    healthCheck: tests.health ? 'PASS' : 'FAIL',
                    statusCheck: tests.status ? 'PASS' : 'FAIL',
                    authentication: tests.auth ? 'PASS' : 'FAIL',
                    categoriesAccess: tests.categories ? 'PASS' : 'FAIL',
                    imageRetrieval: tests.imageRetrieval ? 'PASS' : 'FAIL'
                }
            };
            
        } catch (error) {
            tests.totalTime = Date.now() - startTime;
            console.error('🧪 [TEST] Connection test FAILED:', error.message);
            
            return {
                success: false,
                tests,
                error: error.message,
                message: 'Connection test failed'
            };
        }
    }

    /**
     * Configure bot settings (optional)
     * @param {Object} config - Bot configuration options
     */
    configureBotSettings(config = {}) {
        this.botConfig = {
            ...this.botConfig,
            ...config
        };
        
        console.log('🤖 [BOT] Configuration updated:', this.botConfig);
    }

    /**
     * Get library information
     * @returns {Object} Library details and capabilities
     */
    getInfo() {
        return {
            name: 'Waifu Haven API Client',
            version: '2.0.0',
            description: 'Production-ready client for Waifu Haven API',
            author: 'Waifu Haven Team',
            apiEndpoint: this.baseUrl,
            features: [
                'Image retrieval (SFW/NSFW)',
                'Category management with caching',
                'Random image selection',
                'Health and status monitoring',
                'Connection testing',
                'Bot-friendly configuration',
                'Enhanced error handling',
                'Request statistics tracking'
            ],
            supportedCategories: {
                sfw: this._getDefaultCategories().sfw,
                nsfw: this._getDefaultCategories().nsfw
            },
            configuration: {
                baseUrl: this.baseUrl,
                timeout: this.timeout,
                userAgent: this.userAgent,
                botSupport: true
            }
        };
    }

    /**
     * Reset internal statistics
     */
    resetStats() {
        console.log('🔄 [STATS] Resetting internal statistics...');
        this._stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            startTime: Date.now()
        };
    }

    /**
     * Clear categories cache
     */
    clearCache() {
        console.log('🗑️ [CACHE] Clearing categories cache...');
        this._categoriesCache = null;
        this._cacheExpiry = null;
    }

    // =====================================================
    // PRIVATE METHODS
    // =====================================================

    /**
     * Get request headers with bot support
     * @private
     */
    _getHeaders() {
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': this.userAgent,
            'Accept': 'application/json',
            'X-Bot-Platform': this.botConfig.platform
        };
        
        // Add optional bot headers
        if (this.botConfig.guild) {
            headers['X-Bot-Guild'] = this.botConfig.guild;
        }
        
        if (this.botConfig.user) {
            headers['X-Bot-User'] = this.botConfig.user;
        }
        
        if (this.botConfig.version) {
            headers['X-Bot-Version'] = this.botConfig.version;
        }
        
        return headers;
    }

    /**
     * Get default categories (fallback)
     * @private
     */
    _getDefaultCategories() {
        return {
            sfw: ['kurumi', 'rushia', 'waifu', 'maid', 'marin-kitagawa', 'mori-calliope', 'raiden-shogun', 'oppai', 'uniform', 'kamisato-ayaka'],
            nsfw: ['ass', 'hentai', 'redo-of-healer', 'blowjob', 'waifu', 'milf']
        };
    }
}

// =====================================================
// STATIC METHODS
// =====================================================

/**
 * Create client optimized for Discord bots
 * @param {string} apiKey - API key
 * @param {Object} botOptions - Bot-specific options
 * @returns {ImageApiClient} Configured client for Discord bots
 */
ImageApiClient.createBot = function(apiKey, botOptions = {}) {
    const client = new ImageApiClient(apiKey);
    
    // Configure for Discord bot usage
    client.configureBotSettings({
        platform: 'discord',
        guild: botOptions.guildId,
        user: botOptions.userId,
        version: botOptions.botVersion || '1.0.0'
    });
    
    console.log('🤖 [DISCORD] Discord bot client created');
    return client;
};

/**
 * Create client for web applications
 * @param {string} apiKey - API key
 * @returns {ImageApiClient} Configured client for web apps
 */
ImageApiClient.createWeb = function(apiKey) {
    const client = new ImageApiClient(apiKey);
    
    client.configureBotSettings({
        platform: 'web',
        version: '1.0.0'
    });
    
    console.log('🌐 [WEB] Web application client created');
    return client;
};

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Whether the key appears to be valid format
 */
ImageApiClient.validateApiKey = function(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') return false;
    if (apiKey.length < 10) return false;
    
    // Check for common API key patterns
    const validPatterns = [
        /^[a-zA-Z0-9_-]+$/, // Alphanumeric with dashes/underscores
        /^[a-fA-F0-9]+$/, // Hexadecimal
    ];
    
    return validPatterns.some(pattern => pattern.test(apiKey));
};

/**
 * Create test client with enhanced debugging
 * @param {string} apiKey - API key
 * @returns {ImageApiClient} Test client with verbose logging
 */
ImageApiClient.createTest = function(apiKey) {
    const client = new ImageApiClient(apiKey);
    
    console.log('🧪 [TEST] Test client created with enhanced logging');
    console.log('🧪 [TEST] Use client.testConnection() to verify full API functionality');
    console.log('🧪 [TEST] Use client.getInfo() to see client configuration');
    
    return client;
};

/**
 * Get library version and information
 * @returns {Object} Library information
 */
ImageApiClient.getLibraryInfo = function() {
    return {
        name: 'ImageApiClient',
        version: '2.0.0',
        description: 'Production-ready Waifu Haven API Client',
        features: [
            'Fixed configuration (no user overrides)',
            'Enhanced error handling',
            'Bot-friendly headers',
            'Comprehensive testing',
            'Category caching',
            'Connection validation'
        ],
        supportedPlatforms: ['discord', 'web', 'node'],
        maintainer: 'Waifu Haven Team'
    };
};

module.exports = ImageApiClient;