console.log("Script starting...");

import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import { URL } from 'url';

console.log("Imports successful.");

const app = express();
app.use(express.json());

// --- CORS Whitelist Configuration ---

// 1. Define your whitelist of allowed domains
const allowedOrigins = [
  'https://xprofilecards.com', // Your frontend app
  'https://twitter-card-2b4xsa4gi-psychosidxs-projects.vercel.app/',
  'http://localhost:3000', // For local development (e.g., React)
  // Add any other domains you need to allow
];

// 2. Configure CORS options
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (e.g., Postman, server-to-server)
    // or origins in the whitelist
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Block requests from other origins
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// 3. Use the configured CORS options
app.use(cors(corsOptions));

// --- End of CORS Configuration ---

const PORT = process.env.PORT || 4000;

app.post('/api/scrape-twitter', async (req, res) => {
  let { twitterUrl } = req.body;

  if (!twitterUrl || (!twitterUrl.includes('twitter.com') && !twitterUrl.includes('x.com'))) {
    return res.status(400).json({ error: 'Invalid Twitter/X.com URL' });
  }

  let screenName = '';
  try {
    const urlObj = new URL(twitterUrl);
    twitterUrl = `${urlObj.origin}${urlObj.pathname}`;
    screenName = urlObj.pathname.split('/')[1];
    if (!screenName) {
      throw new Error('Could not parse screen name from URL');
    }
  } catch (e: any) {
    console.error("Invalid URL format:", e.message);
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  console.log(`Scraping started for screenName: ${screenName} at URL: ${twitterUrl}`);
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    );
    
    await page.goto(twitterUrl, { waitUntil: 'networkidle2' });

    // --- NEW LOGIC: Wait for the JSON-LD schema tag ---
    const schemaSelector = `script[data-testid="UserProfileSchema-test"]`;
    console.log(`Waiting for JSON-LD schema tag: ${schemaSelector}`);
    await page.waitForSelector(schemaSelector, { timeout: 15000 });
    console.log("JSON-LD schema found. Parsing data...");

    // --- NEW LOGIC: Extract and parse the JSON-LD schema ---
    const data = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element || !element.textContent) {
        return null;
      }
      
      const json = JSON.parse(element.textContent);
      const mainEntity = json.mainEntity;
      
      if (!mainEntity) {
        return null;
      }
      
      // Find the follower and following counts
      // X.com confusingly calls "Followers" -> "Follows" and "Following" -> "Friends"
      const stats = mainEntity.interactionStatistic || [];
      const followersStat = stats.find((s: any) => s.name === "Follows");
      const followingStat = stats.find((s: any) => s.name === "Friends");

      return {
        name: mainEntity.name,
        // Get handle from the URL in the schema
        handle: `@${mainEntity.url.split('/').pop()}`,
        bio: mainEntity.description,
        avatarUrl: mainEntity.image?.contentUrl,
        followingCount: followingStat?.userInteractionCount.toString() || null,
        followersCount: followersStat?.userInteractionCount.toString() || null,
        location: mainEntity.homeLocation?.name || null,
        website: null, // This schema doesn't seem to provide the website URL
      };
    }, schemaSelector); // Pass selector into the browser's context
    // --- END NEW LOGIC ---

    await browser.close();

    if (!data || !data.name) {
      throw new Error('Could not parse profile data from JSON-LD schema.');
    }

    console.log("Scraping successful:", data);
    return res.status(200).json(data);
    
  } catch (error: any) {
    if (browser) await browser.close();
    console.error("Scraping failed:", error.message);
    return res.status(500).json({ error: 'Failed to scrape profile.', details: error.message });
  }
});

console.log("Starting server on port", PORT);

app.listen(PORT, () => {
  console.log(`Scraping server running on http://localhost:${PORT}`);
})
.on('error', (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});