const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// CORS middleware - IMPORTANT for cross-origin requests from PHP
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CSS mapping for different pages
const pageCssMap = {
    'index': ['/assets/css/styles.css', '/assets/css/gallery.css', '/assets/css/services.css'],
    'about': ['/assets/css/about.css', '/assets/css/styles.css', '/assets/css/services.css'],
    'services': ['/assets/css/services.css', '/assets/css/styles.css'],
    'blog': ['/assets/css/blog.css', '/assets/css/styles.css'],
    'booking': ['/assets/css/booking.css'],
    'contact': ['/assets/css/contact.css', '/assets/css/styles.css', '/assets/css/services.css'],
    'gallery': ['/assets/css/gallery.css', '/assets/css/styles.css', '/assets/css/services.css'],
    'packages': ['/assets/css/package.css'],
    'trailers': ['/assets/css/trailers.css', '/assets/css/services.css', '/assets/css/styles.css'],
    'students': ['/assets/css/trailers.css', '/assets/css/services.css', '/assets/css/styles.css'],
    'video-productions': ['/assets/css/trailers.css', '/assets/css/services.css', '/assets/css/styles.css'],
    'film-productions': ['/assets/css/trailers.css', '/assets/css/services.css', '/assets/css/styles.css'],
    'faq': ['/assets/css/faq.css', '/assets/css/styles.css'],
    'awards': ['/assets/css/styles.css', '/assets/css/about.css', '/assets/css/services.css']
};

// Helper function to sanitize filename
function isValidFilename(filename) {
    return /^[a-zA-Z0-9_\-\s]+\.html$/i.test(filename);
}

// Helper function to extract slug from filename
function getSlugFromFilename(filename) {
    return path.basename(filename, '.html');
}

// Helper function to generate CSS link tags
function generateCssLinks(cssFiles) {
    if (!cssFiles || cssFiles.length === 0) {
        return '';
    }
    
    return cssFiles.map(cssFile => 
        `    <link rel="stylesheet" href="${cssFile}">`
    ).join('\n');
}

// Add cPanel file manager integration
const cpanelConfig = {
    username: 'bolobxws',
    password: '&!z$wQ2vK45%',
    baseUrl: 'https://bolobathaba.dedicated.co.za:2083'
};

// Enhanced cpanelRequest with comprehensive debugging
async function cpanelRequest(endpoint, params = {}, method = 'GET') {
    let url = `${cpanelConfig.baseUrl}/execute/${endpoint}`;
    
    try {
        console.log(`\n🌐🌐🌐 cPanel API Request 🌐🌐🌐`);
        console.log(`📡 Endpoint: ${endpoint}`);
        console.log(`🔧 Method: ${method}`);
        console.log(`📍 URL: ${url}`);
        console.log(`📋 Parameters:`, JSON.stringify(params, null, 2));
        
        const authHeader = 'Basic ' + Buffer.from(`${cpanelConfig.username}:${cpanelConfig.password}`).toString('base64');
        
        const requestOptions = {
            method: method,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            timeout: 15000 // 15 second timeout
        };

        // Handle request body based on method
        if (method === 'POST') {
            requestOptions.body = new URLSearchParams(params).toString();
            console.log(`📦 Request body: ${requestOptions.body}`);
        } else {
            // For GET requests, add params to URL
            const queryParams = new URLSearchParams(params).toString();
            if (queryParams) {
                url += '?' + queryParams;
                console.log(`🔗 Full URL with params: ${url}`);
            }
        }

        console.log(`📨 Request headers:`, {
            'Authorization': 'Basic [REDACTED]',
            'Content-Type': requestOptions.headers['Content-Type'],
            'Accept': requestOptions.headers['Accept']
        });

        console.log(`⏰ Sending request (timeout: 15s)...`);
        const startTime = Date.now();
        
        const response = await fetch(url, requestOptions);
        const responseTime = Date.now() - startTime;
        
        console.log(`⏱️ Response received in ${responseTime}ms`);
        console.log(`📩 Response status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`📄 Response body (first 1000 chars):`);
        console.log(responseText.substring(0, 1000));
        if (responseText.length > 1000) {
            console.log(`... (truncated, total ${responseText.length} chars)`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
            console.log(`✅ JSON parsed successfully`);
        } catch (parseError) {
            console.error(`❌ Failed to parse JSON response:`, parseError);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${result.message || 'Unknown error'}`);
        }
        
        console.log(`✅ cPanel request successful`);
        console.log(`🌐🌐🌐 Request Complete 🌐🌐🌐\n`);
        
        return result;
        
    } catch (error) {
        console.error(`\n💥💥💥 cPanel Request Failed 💥💥💥`);
        console.error(`❌ Error: ${error.message}`);
        console.error(`📍 URL: ${url}`);
        console.error(`🔧 Method: ${method}`);
        console.error(`📋 Endpoint: ${endpoint}`);
        console.error(`💥💥💥 End Error 💥💥💥\n`);
        throw error;
    }
}

// Enhanced file operations with detailed logging
async function readFileFromCpanel(filename) {
    try {
        console.log(`\n📖📖📖 Reading File from cPanel 📖📖📖`);
        console.log(`📄 File: ${filename}`);
        
        const result = await cpanelRequest('Fileman/get_file_content', {
            dir: 'public_html',
            file: filename
        }, 'GET');
        
        console.log(`📊 Response status: ${result.status}`);
        console.log(`📊 Response data:`, result.data ? 'Exists' : 'Missing');
        
        // Handle different response formats
        if (result.status === 1) {
            if (result.data && result.data.content !== undefined) {
                console.log(`✅ Successfully read file: ${filename}`);
                console.log(`📏 Content length: ${result.data.content.length} characters`);
                console.log(`📖📖📖 File Read Complete 📖📖📖\n`);
                return result.data.content;
            } else if (result.data && result.data.file && result.data.file.content !== undefined) {
                // Alternative response format
                console.log(`✅ Successfully read file (alternative format): ${filename}`);
                console.log(`📏 Content length: ${result.data.file.content.length} characters`);
                console.log(`📖📖📖 File Read Complete 📖📖📖\n`);
                return result.data.file.content;
            }
        }
        
        // If we get here, the file read failed
        const errorMsg = result.errors ? result.errors[0] : 
                        result.message || 'Failed to read file from cPanel';
        console.error(`❌ File read failed: ${errorMsg}`);
        console.log(`📖📖📖 File Read Failed 📖📖📖\n`);
        throw new Error(errorMsg);
        
    } catch (error) {
        console.error(`💥 Error reading file from cPanel: ${filename}`, error.message);
        return null;
    }
}

async function writeFileToCpanel(filename, content) {
    try {
        console.log(`\n💾💾💾 Writing File to cPanel 💾💾💾`);
        console.log(`📄 File: ${filename}`);
        console.log(`📏 Content length: ${content.length} characters`);
        
        const result = await cpanelRequest('Fileman/save_file_content', {
            dir: 'public_html',
            file: filename,
            content: content
        }, 'POST');
        
        console.log(`📊 Response status: ${result.status}`);
        
        if (result.status === 1) {
            console.log(`✅ Successfully wrote file: ${filename}`);
            console.log(`💾💾💾 File Write Complete 💾💾💾\n`);
            return true;
        } else {
            const errorMsg = result.errors ? result.errors[0] : 
                            result.message || 'Failed to write file to cPanel';
            console.error(`❌ File write failed: ${errorMsg}`);
            console.log(`💾💾💾 File Write Failed 💾💾💾\n`);
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error(`💥 Error writing file to cPanel: ${filename}`, error.message);
        return false;
    }
}

// Debug endpoint to test cPanel connection
app.get('/test-cpanel', async (req, res) => {
    try {
        console.log('\n🧪🧪🧪 cPanel Connection Test Started 🧪🧪🧪');
        console.log('🔐 Using credentials:', {
            username: cpanelConfig.username,
            password: '***' + cpanelConfig.password.slice(-4),
            baseUrl: cpanelConfig.baseUrl
        });

        // Test 1: Basic cPanel API version check
        console.log('\n1️⃣ Testing Version API...');
        const versionResult = await cpanelRequest('Version', {}, 'GET');
        console.log('✅ Version test completed');

        // Test 2: List files to see if we can access public_html
        console.log('\n2️⃣ Testing Fileman/list_files API...');
        const listResult = await cpanelRequest('Fileman/list_files', {
            dir: 'public_html',
            show_hidden: 0
        }, 'GET');
        console.log('✅ List files test completed');

        // Test 3: Try to read a specific file
        console.log('\n3️⃣ Testing Fileman/get_file_content API...');
        const fileContentResult = await cpanelRequest('Fileman/get_file_content', {
            dir: 'public_html',
            file: 'about.html'
        }, 'GET');
        console.log('✅ File content test completed');

        console.log('\n🎉🎉🎉 All cPanel Tests Completed Successfully! 🎉🎉🎉');

        res.json({
            success: true,
            message: 'cPanel connection test completed successfully',
            tests: {
                version: { status: versionResult.status, data: 'Version check passed' },
                list_files: { status: listResult.status, file_count: listResult.data ? listResult.data.length : 0 },
                file_content: { status: fileContentResult.status, has_content: !!fileContentResult.data }
            }
        });

    } catch (error) {
        console.error('\n❌❌❌ cPanel Connection Test FAILED ❌❌❌');
        console.error('Error:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'cPanel connection test failed',
            error: error.message,
            suggestion: 'Check cPanel credentials, URL, and API permissions'
        });
    }
});

// Main save endpoint
app.post('/save', async (req, res) => {
    console.log('🔥 SAVE ENDPOINT HIT!');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    try {
        const { file, content, test } = req.body;

        // Handle test requests
        if (test) {
            console.log('✅ Test request received - Node.js server is working');
            return res.json({
                success: true,
                message: 'Node.js server is working',
                timestamp: new Date().toISOString()
            });
        }

        // Validate input
        if (!file || content === undefined) {
            console.log('❌ Missing parameters:', { file: !!file, content: content !== undefined });
            return res.status(400).json({
                success: false,
                message: 'Missing file or content parameter'
            });
        }

        console.log(`📝 Processing save request for file: ${file}`);
        console.log(`📄 Content length: ${content.length} characters`);

        // Validate filename
        if (!isValidFilename(file)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename format'
            });
        }

        // Get slug from filename
        const slug = getSlugFromFilename(file);
        
        // Get CSS files for this page
        const cssFiles = pageCssMap[slug] || [];
        
        // Read original HTML file from cPanel
        const originalHtml = await readFileFromCpanel(file);
        
        if (!originalHtml) {
            return res.status(404).json({
                success: false,
                message: 'Original file not found or could not be read from cPanel'
            });
        }

        // Generate CSS links
        const cssLinks = generateCssLinks(cssFiles);
        
        // Create new body content
        const newBodyContent = `<body>\n${content}\n</body>`;
        
        // Replace body content in original HTML
        let mergedHtml = originalHtml.replace(/<body[^>]*>.*?<\/body>/is, newBodyContent);
        
        // If no body tag existed, try to inject it
        if (mergedHtml === originalHtml) {
            if (originalHtml.includes('</body>')) {
                mergedHtml = originalHtml.replace(
                    /<\/body>/i,
                    `${newBodyContent}\n</body>`
                );
            } else if (originalHtml.includes('</html>')) {
                mergedHtml = originalHtml.replace(
                    /<\/html>/i,
                    `${newBodyContent}\n</html>`
                );
            } else {
                // If no closing tags, append body content
                mergedHtml = originalHtml + newBodyContent;
            }
        }
        
        // Update or inject CSS links in the head section
        if (cssLinks) {
            // Try to replace existing CSS links or add them to head
            if (mergedHtml.includes('</head>')) {
                // Remove existing CSS links that match our pattern
                mergedHtml = mergedHtml.replace(
                    /<link[^>]*rel=['"]\s*stylesheet\s*['"][^>]*>/gi,
                    ''
                );
                
                // Add new CSS links before closing head tag
                mergedHtml = mergedHtml.replace(
                    /<\/head>/i,
                    `${cssLinks}\n</head>`
                );
            } else {
                // If no head section, add CSS links at the beginning
                mergedHtml = cssLinks + '\n' + mergedHtml;
            }
        }

        // Save the merged HTML to cPanel
        const saveSuccess = await writeFileToCpanel(file, mergedHtml);
        
        if (saveSuccess) {
            console.log('✅ File saved successfully to cPanel:', file);
            res.json({
                success: true,
                message: 'File saved successfully!',
                slug: slug,
                cssFiles: cssFiles,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log('❌ Failed to save file to cPanel:', file);
            res.status(500).json({
                success: false,
                message: 'Failed to save file to cPanel'
            });
        }

    } catch (error) {
        console.error('💥 Error in save endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message,
            error: error.message
        });
    }
});

// Optional: Endpoint to get current page content for editing
app.get('/edit/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!isValidFilename(filename)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename format'
            });
        }

        // Read file from cPanel
        const content = await readFileFromCpanel(filename);
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'File not found in cPanel'
            });
        }

        // Extract body content
        const bodyMatch = content.match(/<body[^>]*>(.*?)<\/body>/is);
        const bodyContent = bodyMatch ? bodyMatch[1].trim() : '';
        
        const slug = getSlugFromFilename(filename);
        
        res.json({
            success: true,
            filename: filename,
            slug: slug,
            bodyContent: bodyContent,
            cssFiles: pageCssMap[slug] || []
        });

    } catch (error) {
        console.error('Error in edit endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// New endpoint to add blog articles to blog.js
app.post('/save-blog-article', async (req, res) => {
    console.log('📝 SAVE BLOG ARTICLE ENDPOINT HIT!');

    try {
        const { articleId, title, content } = req.body;

        if (!articleId || !title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: articleId, title, or content'
            });
        }

        console.log(`📝 Adding article: ${title} (ID: ${articleId})`);

        // Read current blog.js from cPanel
        const blogJsPath = 'assets/js/blog.js';
        const currentContent = await readFileFromCpanel(blogJsPath);

        if (!currentContent) {
            return res.status(404).json({
                success: false,
                message: 'blog.js not found in cPanel'
            });
        }

        // Escape the content for JavaScript
        const escapedContent = content
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$')
            .replace(/\r?\n/g, '\\n');

        const escapedTitle = title.replace(/\\/g, '\\\\').replace(/`/g, '\\`');

        // Create new case statement
        const newCase = `                case "${articleId}":
                    fullArticleContent = \`<h2>${escapedTitle}</h2>
                    <p>${escapedContent}</p>\`;
                    break;`;

        // Find the default case and insert before it
        const defaultCaseRegex = /(default:\s*fullArticleContent = `<p>Article content not found\.<\/p>`;)/;

        if (!defaultCaseRegex.test(currentContent)) {
            return res.status(500).json({
                success: false,
                message: 'Could not find default case in blog.js switch statement'
            });
        }

        // Insert new case before the default case
        const updatedContent = currentContent.replace(
            defaultCaseRegex,
            `${newCase}\n                $1`
        );

        // Save updated blog.js to cPanel
        const saveSuccess = await writeFileToCpanel(blogJsPath, updatedContent);

        if (saveSuccess) {
            console.log('✅ Article added to blog.js successfully');
            res.json({
                success: true,
                message: 'Article added to blog.js successfully',
                articleId: articleId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to save updated blog.js to cPanel'
            });
        }

    } catch (error) {
        console.error('💥 Error in save-blog-article endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Node.js server started!');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log('🔗 Available endpoints:');
    console.log(`  POST http://localhost:${PORT}/save - Save edited content`);
    console.log(`  GET http://localhost:${PORT}/edit/:filename - Get content for editing`);
    console.log(`  GET http://localhost:${3000}/test-cpanel - Test cPanel connection`);
    console.log(`  POST http://localhost:${PORT}/save-blog-article - Add article to blog.js`);
    console.log('');
    console.log('🔍 Watching for incoming requests...');
});