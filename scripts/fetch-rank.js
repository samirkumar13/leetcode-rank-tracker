import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURATION
// TODO: Replace with the user's actual username
const LEETCODE_USERNAME = 'TKr0i3Zqog';

const GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

const QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        userAvatar
        realName
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '../public/data.json');

async function fetchRank() {
  console.log(`Fetching data for user: ${LEETCODE_USERNAME}...`);

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: LEETCODE_USERNAME },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      process.exit(1);
    }

    if (!data.data.matchedUser) {
      console.error(`User '${LEETCODE_USERNAME}' not found.`);
      process.exit(1);
    }

    // Read existing data
    let history = [];
    try {
      const fileContent = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const existingData = JSON.parse(fileContent);
      if (Array.isArray(existingData)) {
        history = existingData;
      } else if (existingData && typeof existingData === 'object') {
        // Migrate single object to array
        history = [existingData];
      }
    } catch (error) {
      // File might not exist yet, strictly ignore ENOENT
      if (error.code !== 'ENOENT') {
        console.warn('Warning: Could not read existing data.json, starting fresh.', error.message);
      }
    }

    const userData = data.data.matchedUser;

    const newEntry = {
      timestamp: new Date().toISOString(),
      username: userData.username,
      ranking: userData.profile.ranking,
      realName: userData.profile.realName,
      avatar: userData.profile.userAvatar,
      stats: userData.submitStats.acSubmissionNum
    };

    // Deduplication: Check if we already have an entry for today (UTC)
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = history.findIndex(entry => entry.timestamp && entry.timestamp.startsWith(today));

    if (existingIndex !== -1) {
      console.log(`Updating existing entry for ${today}`);
      history[existingIndex] = newEntry;
    } else {
      console.log(`Adding new entry for ${today}`);
      history.push(newEntry);
    }

    // Ensure public directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(history, null, 2));
    console.log(`Successfully saved data to ${OUTPUT_FILE}. Total records: ${history.length}`);

  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

fetchRank();
