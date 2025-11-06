// console.log("Script starting...");

// import express from 'express';
// import puppeteer from 'puppeteer';
// import cors from 'cors';
// import { URL } from 'url';

// console.log("Imports successful.");

// const app = express();
// app.use(express.json());

// // --- CORS Whitelist Configuration ---

// // 1. Get allowed domains from an environment variable
// const allowedOrigins = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(',') // Split by comma
//   : []; // Default to empty array if not set

// // 2. Add localhost for local testing
// if (process.env.NODE_ENV !== 'production') {
//   allowedOrigins.push('http://localhost:3000');
// }

// console.log("Allowed Origins:", allowedOrigins); // Good for debugging

// // 3. Configure CORS options
// const corsOptions = {
//   origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
//     // Allow requests with no origin (e.g., Postman, server-to-server)
//     // or origins in the whitelist
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       // Block requests from other origins
//       console.warn(`CORS blocked for origin: ${origin}`); // Log blocked requests
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

// // 4. Use the configured CORS options
// app.use(cors(corsOptions));

// // --- End of CORS Configuration ---

// const PORT = process.env.PORT || 4000;

// app.post('/api/scrape-twitter', async (req, res) => {
//   let { twitterUrl } = req.body;

//   if (!twitterUrl || (!twitterUrl.includes('twitter.com') && !twitterUrl.includes('x.com'))) {
//     return res.status(400).json({ error: 'Invalid Twitter/X.com URL' });
//   }

//   let screenName = '';
//   try {
//     const urlObj = new URL(twitterUrl);
//     twitterUrl = `${urlObj.origin}${urlObj.pathname}`;
//     screenName = urlObj.pathname.split('/')[1];
//     if (!screenName) {
//       throw new Error('Could not parse screen name from URL');
//     }
//   } catch (e: any) {
//     console.error("Invalid URL format:", e.message);
//     return res.status(400).json({ error: 'Invalid URL format' });
//   }

//   console.log(`Scraping started for screenName: ${screenName} at URL: ${twitterUrl}`);
//   let browser;
//   try {
//     // --- FINAL KVM SERVER CONFIGURATION ---
//     browser = await puppeteer.launch({
//       headless: true,
//       // This tells Puppeteer to use the system-wide Chrome
//       executablePath: '/usr/bin/google-chrome-stable', 
      
//       // These args are for running in a server environment
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--disable-accelerated-2d-canvas',
//         '--no-first-run',
//         '--no-zygote',
//         '--single-process', 
//         '--disable-gpu'
//       ],
//     });
//     // --- END CONFIGURATION ---

//     const page = await browser.newPage();
//     await page.setUserAgent(
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
//     );
    
//     await page.goto(twitterUrl, { waitUntil: 'networkidle2' });

//     // --- Wait for the JSON-LD schema tag ---
//     const schemaSelector = `script[data-testid="UserProfileSchema-test"]`;
//     console.log(`Waiting for JSON-LD schema tag: ${schemaSelector}`);
//     await page.waitForSelector(schemaSelector, { timeout: 15000 });
//     console.log("JSON-LD schema found. Parsing data...");

//     // --- Extract and parse the JSON-LD schema ---
//     const data = await page.evaluate((selector) => {
//       const element = document.querySelector(selector);
//       if (!element || !element.textContent) {
//         return null;
//       }
      
//       const json = JSON.parse(element.textContent);
//       const mainEntity = json.mainEntity;
      
//       if (!mainEntity) {
//         return null;
//       }
      
//       const stats = mainEntity.interactionStatistic || [];
//       const followersStat = stats.find((s: any) => s.name === "Follows");
//       const followingStat = stats.find((s: any) => s.name === "Friends");

//       return {
//         name: mainEntity.name,
//         handle: `@${mainEntity.url.split('/').pop()}`,
//         bio: mainEntity.description,
//         avatarUrl: mainEntity.image?.contentUrl,
//         followingCount: followingStat?.userInteractionCount.toString() || null,
//         followersCount: followersStat?.userInteractionCount.toString() || null,
//         location: mainEntity.homeLocation?.name || null,
//         website: null,
//       };
//     }, schemaSelector); 
//     // --- END LOGIC ---

//     await browser.close();

//     if (!data || !data.name) {
//       throw new Error('Could not parse profile data from JSON-LD schema.');
//     }

//     console.log("Scraping successful:", data);
//     return res.status(200).json(data);
    
//   } catch (error: any) {
//     if (browser) await browser.close();
//     console.error("Scraping failed:", error.message);
//     return res.status(500).json({ error: 'Failed to scrape profile.', details: error.message });
//   }
// });

// console.log("Starting server on port", PORT);

// app.listen(PORT, () => {
//   console.log(`Scraping server running on http://localhost:${PORT}`);
// })
// .on('error', (err) => {
//   console.error("Server failed to start:", err);
//   process.exit(1);
// });

console.log("Script starting...");

import express from 'express';
import cors from 'cors';
import { URL } from 'url';
import axios from 'axios'; // For making API calls
import rateLimit from 'express-rate-limit'; // For rate limiting

console.log("Imports successful.");

const app = express();

// --- CRITICAL FIX ---
// Tell Express to trust the 'X-Forwarded-For' header sent by Caddy
// This makes the rate limiter work correctly.
app.set('trust proxy', 1); 
// --------------------

app.use(express.json());

// --- 1. Caching Layer ---
const CACHE_TTL = 3600000; // 1 hour (in milliseconds)
const cache = new Map<string, { data: any; timestamp: number }>();

// --- 2. Request Coalescing Layer ---
// Stores promises for requests that are *currently* running
const inFlightRequests = new Map<string, Promise<any>>();

// --- 3. Rate Limiting Layer (Security) ---
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Max 20 requests per IP per minute
  message: { error: 'Too many requests, please try again in a minute.' },
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable legacy headers
});

app.use('/api', apiLimiter); // Apply limiter to all /api routes

// --- CORS Whitelist Configuration ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000');
}
console.log("Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));

// --- Environment Variables ---
const PORT = process.env.PORT || 4000;
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;
const EXTERNAL_API_ENDPOINT = process.env.EXTERNAL_API_ENDPOINT;

if (!EXTERNAL_API_KEY || !EXTERNAL_API_ENDPOINT) {
  console.error("FATAL ERROR: API Key or Endpoint is not configured in .env file.");
}

/**
 * Extracts the username (screen name) from a Twitter/X URL.
 */
function getScreenNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Gets the first part of the path, e.g., "iamvibecoder"
    const pathParts = urlObj.pathname.split('/'); 
    if (pathParts.length >= 2 && pathParts[1]) {
      return pathParts[1];
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * This is the *only* function that calls the expensive external API.
 */
async function fetchProfileFromExternalAPI(screenName: string) {
  console.log(`[EXTERNAL API CALL] Making expensive request for: ${screenName}`);
  
  const options = {
    method: 'GET',
    url: EXTERNAL_API_ENDPOINT, // From .env
    params: {
      userName: screenName,
    },
    headers: {
      'X-API-Key': EXTERNAL_API_KEY // From .env
    },
    timeout: 30000 
  };

  try {
    const response = await axios.request(options);
    
    if (!response.data || !response.data.data) {
       throw new Error('Invalid API response structure');
    }
    
    const responseData = response.data.data;

    // Transform the data to match what your frontend expects
    const transformedData = {
      name: responseData.name, // Fixed the typo here
      handle: `@${responseData.userName}`,
      bio: responseData.description,
      avatarUrl: responseData.profilePicture.replace('_normal', '_400x400'),
      followingCount: responseData.following?.toString() || '0',
      followersCount: responseData.followers?.toString() || '0',
      location: responseData.location || null,
      website: responseData.profile_bio?.entities?.url?.urls[0]?.expanded_url || null,
    };

    // Save the *transformed* data to the cache
    cache.set(screenName, { data: transformedData, timestamp: Date.now() });
    console.log(`[CACHE SET] Stored data for: ${screenName}`);
    return transformedData;

  } catch (error: any) {
    console.error("External API Error:", error.response?.data || error.message);
    throw new Error('Failed to fetch from external API.');
  }
}

// --- The Smart API Endpoint ---
app.post('/api/scrape-twitter', async (req, res) => {
  const { twitterUrl } = req.body;
  const screenName = getScreenNameFromUrl(twitterUrl);

  if (!screenName) {
    return res.status(400).json({ error: 'Invalid Twitter/X.com URL' });
  }

  // --- 1. CHECK CACHE ---
  const cachedItem = cache.get(screenName);
  if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
    console.log(`[CACHE HIT] for ${screenName}`);
    return res.status(200).json(cachedItem.data);
  }

  // --- 2. CHECK FOR IN-FLIGHT REQUEST (COALESCING) ---
  let requestPromise = inFlightRequests.get(screenName);
  if (requestPromise) {
    console.log(`[COALESCE HIT] for ${screenName}, waiting...`);
    try {
      const data = await requestPromise;
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- 3. MAKE REAL REQUEST (CACHE MISS) ---
  console.log(`[CACHE MISS] for ${screenName}, starting new call...`);
  
  requestPromise = fetchProfileFromExternalAPI(screenName);
  inFlightRequests.set(screenName, requestPromise);

  try {
    const data = await requestPromise;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to scrape profile.' });
  } finally {
    // Clear the "in-flight" status for this user
    inFlightRequests.delete(screenName);
  }
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Secure API server running on http://localhost:${PORT}`);
})
.on('error', (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});