# Daily LeetCode Rank Tracker

A minimal, automated dashboard that tracks your LeetCode global ranking daily.

![LeetCode Rank Tracker](https://img.shields.io/badge/LeetCode-Rank%20Tracker-orange?style=for-the-badge&logo=leetcode)

## 🚀 Features

- **Daily Automation**: GitHub Actions fetches your rank every 24 hours (00:00 UTC).
- **Persistent History**: Tracks your rank over time to visualize progress.
- **Interactive Dashboard**: Displays a line chart of your ranking history using Chart.js.
- **Localized Formatting**: Ranks are formatted in the Indian numbering system (e.g., `31,66,974`).
- **Responsive Design**: Modern, dark-mode/light-mode (Brand Identity) UI.

## 🛠️ How It Works

1. **Fetch Script**: `scripts/fetch-rank.js` queries the LeetCode GraphQL API.
2. **Data Storage**: Data is appended to `public/data.json`, creating a historical record.
3. **Frontend**: `public/index.html` fetches this JSON and renders the current rank and history graph.
4. **Deployment**: The site is deployed to Netlify (or GitHub Pages).

## ⚙️ Setup

To track your own rank:

1. **Clone the repo**:

    ```bash
    git clone https://github.com/samirkumar13/leetcode-rank-tracker.git
    ```

2. **Update Username**:
    Edit `scripts/fetch-rank.js`:

    ```javascript
    const LEETCODE_USERNAME = 'YOUR_USERNAME_HERE';
    ```

3. **Install Dependencies**:

    ```bash
    npm install
    ```

4. **Run Locally**:

    ```bash
    npm run fetch
    npx serve public
    ```

## 🤖 Automation

The workflow is defined in `.github/workflows/daily-fetch.yml`. It runs automatically, commits the new data, and pushes it back to the repository, triggering a site update.

## 🎨 Tech Stack

- **Frontend**: HTML5, CSS3 (Variables & Animations), JavaScript (ES6+), Chart.js
- **Backend**: Node.js (Fetch API)
- **CI/CD**: GitHub Actions

## 🔧 Troubleshooting

### Netlify Deployment Issues

If you encounter persistent login requests or authentication errors when deploying via CLI:

1. **Link Site Manually**:
    Instead of relying on auto-detection, explicitly link your project to a Netlify site ID:

    ```bash
    npx netlify link --id YOUR_SITE_ID
    ```

    Or create a `.netlify/state.json` file in your project root:

    ```json
    {
      "siteId": "YOUR_SITE_ID"
    }
    ```

2. **MCP Tool Usage**:
    If using an AI agent with MCP, ensure the site ID is explicitly provided in the deployment parameters or that the `state.json` exists in the deployment directory.
