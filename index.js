const axios = require('axios');

/**
 * Waifu Haven
 * @version 2.1.0
 */
class ImageApiClient {
    constructor(apiKey, options = {}) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        
        this.apiKey = apiKey;
        this.baseUrl = options.baseUrl || 'http://waifu-haven.ddns.net:50006';
        this.timeout = options.timeout || 30000;
        this.userAgent = options.userAgent || 'WaifuAPIClient/2.1.0';
        
        // Categories cache for better performance
        this._categoriesCache = null;
        this._cacheExpiry = null;
        
        // Simple stats tracking
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0
        };
    }

    /**
     * Get available categories from the API
     * @returns {Promise<Object>} Categories object with sfw and nsfw arrays
     */
    async getCategories() {
        try {
            // Check cache (5 minutes)
            if (this._categoriesCache && this._cacheExpiry && Date.now() < this._cacheExpiry) {
                return this._categoriesCache;
            }

            const response = await axios.get(`${this.baseUrl}/categories`, {
                headers: this._getHeaders(),
                timeout: this.timeout
            });

            if (response.status === 200 && response.data.success) {
                this._categoriesCache = response.data.data;
                this._cacheExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes cache
                return response.data.data;
            } else {
                throw new Error('Failed to fetch categories');
            }
        } catch (error) {
            // Return default categories if API fails
            return this._getDefaultCategories();
        }
    }

    /**
     * Get image from API
     * @param {string} category - Image category
     * @param {string} type - 'sfw' or 'nsfw'
     * @returns {Promise<Object>} Image data object
     */
    async getImage(category, type = 'sfw') {
        try {
            this.stats.totalRequests++;

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
                this.stats.successfulRequests++;
                const imageData = response.data.data;
                
                return {
                    success: true,
                    url: imageData.url,
                    mimeType: imageData.mimeType,
                    size: imageData.size,
                    category: imageData.category,
                    filename: imageData.filename,
                    meta: response.data.meta
                };
            } else {
                throw new Error('Failed to fetch image');
            }
        } catch (error) {
            this.stats.failedRequests++;
            console.error('Error fetching image:', error.message);
            
            // Enhanced error handling
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
                        throw new Error('Rate limit exceeded. Please slow down your requests.');
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
     * Get random image from any category
     * @param {string} type - 'sfw', 'nsfw', or 'any'
     * @returns {Promise<Object>} Image data object
     */
    async getRandomImage(type = 'sfw') {
        try {
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

            return this.getImage(randomCategory, selectedType);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check API health
     * @returns {Promise<Object>} Health status
     */
    async getHealth() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, {
                timeout: this.timeout
            });
            
            return {
                success: true,
                status: response.data.status,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get API status
     * @returns {Promise<Object>} API status
     */
    async getStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/status`, {
                timeout: this.timeout
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get usage statistics
     * @returns {Object} Client statistics
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.totalRequests > 0 
                ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(1) + '%'
                : '0%'
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0
        };
    }

    // =====================================================
    // PRIVATE METHODS
    // =====================================================

    /**
     * Get request headers
     * @private
     */
    _getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': this.userAgent,
            'Accept': 'application/json',
            'X-Bot-Platform': 'discord'
        };
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
 * Create client for Discord bots
 * @param {string} apiKey - API key
 * @returns {ImageApiClient} Configured client
 */
ImageApiClient.createBot = function(apiKey) {
    return new ImageApiClient(apiKey, {
        userAgent: 'DiscordBot (Auto-Config, 2.1.0)'
    });
};

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Whether the key is valid format
 */
ImageApiClient.validateApiKey = function(apiKey) {
    return !!(apiKey && typeof apiKey === 'string' && apiKey.length >= 10);
};

module.exports = ImageApiClient;