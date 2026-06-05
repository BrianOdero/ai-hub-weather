```markdown
# WeatherAI Dashboard (Free Tier)

A modern, single-page weather dashboard that uses the free WeatherAI API endpoints (`/v1/weather` and `/v1/usage`) to display current conditions, a 7‑day forecast, and an AI‑generated weather summary. The app runs entirely in the browser and uses Netlify serverless functions to securely proxy API requests – so there are no CORS issues, and your API key stays hidden from public network logs.

![WeatherAI Dashboard Screenshot](https://via.placeholder.com/600x400?text=Dashboard+Screenshot)

---

## Features

- Current weather – temperature, humidity, wind, pressure, condition icon and text.
- 7‑day daily forecast with high/low temperatures and weather icons.
- Gemini AI summary – a short text description of the weather (when provided by the API).
- Settings panel – easily enter your API key, change location (city name, coordinates, or IP auto‑detection).
- Geolocation – one‑click button to use your device’s GPS coordinates.
- No CORS headaches – all API calls go through your own Netlify function.

---

## Folder Structure

```
weather-ai-app/
├── index.html                  # Main HTML structure
├── css/
│   └── styles.css              # All styles
├── js/
│   └── app.js                  # Frontend logic
├── netlify.toml                # Netlify build & redirect config
├── netlify/
│   └── functions/
│       ├── weather.js          # Proxies GET /v1/weather
│       └── usage.js            # Proxies GET /v1/usage (optional)
└── README.md
```

---

## Prerequisites

- A WeatherAI API key (Bearer token). You can get one from [WeatherAI](https://weather-ai.co) (free tier: 1,000 requests/month, 200 AI summaries, 5 tree analyses).
- A Netlify account (free) – for deploying the serverless functions and hosting the static site.  
  Alternatively, you can run the project locally with Netlify CLI (requires Node.js).

---

## Setup & Deployment

### 1. Get the project

Clone or download this repository:

```bash
git clone <your-repo-url>
cd weather-ai-app
```

Or simply download the ZIP and extract it.

### 2. Configure the API key

You have two options:

Option A – In‑app settings (recommended)  
After deploying, open the dashboard, click the ⚙️ Settings button, paste your WeatherAI Bearer token into the API Key field, enter your desired location, and click Save & Refresh. The key is stored in your browser’s `localStorage` and never sent to any server except the WeatherAI API (via your Netlify function).

Option B – Hardcode a default key (for local testing)  
Edit `js/app.js` and change `DEFAULT_CONFIG.apiKey` to your token. Do not commit this file if your repository is public.

### 3. Deploy to Netlify

Easy drag & drop:
1. Go to [app.netlify.com](https://app.netlify.com) and log in.
2. Drag the entire `weather-ai-app` folder onto the Sites dashboard.
3. Netlify automatically reads `netlify.toml` and deploys both the static site and the serverless functions.
4. Open the provided live URL (e.g., `https://your-app.netlify.app`).

Using Git (recommended for updates):
1. Push the project to a GitHub/GitLab repository.
2. In Netlify, click Add new site → Import an existing project, connect your repository.
3. Netlify will build and deploy automatically.

### 4. Run locally (optional)

To test the functions and the app locally without deploying:

1. Install the Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```
2. Navigate to the project folder and run:
   ```bash
   netlify dev
   ```
3. Open `http://localhost:8888` in your browser. The functions will be available under `/api/weather` and `/api/usage`.

---

## Usage

1. Open the deployed URL.
2. If no API key is saved, the settings panel opens automatically. Enter your Bearer token and a location (e.g., `London`, `-1.286,36.817`, or `ip:auto`).
3. Click Save & Refresh. The dashboard fetches live weather data.
4. Use the ⚙️ button to change location or API key at any time.
5. Click Use My Location to automatically fill coordinates from your device’s GPS.

---

## How It Works

- The frontend (`app.js`) calls `/api/weather?...` (or `/api/usage`) – these routes are defined in `netlify.toml` as redirects to the serverless functions.
- Each Netlify function (`weather.js`, `usage.js`) forwards the request to the official WeatherAI API (`https://api.weather-ai.co`) with the `Authorization` header from the client.
- The function adds `Access-Control-Allow-Origin: *` to the response, so the browser accepts it – no CORS blocking.

This means your API token never appears in the client’s network requests except as it passes through your own Netlify function, which is secure enough for a personal free‑tier dashboard.

---

## Limitations

- Free API limits: 1,000 weather requests, 200 AI summaries, and 5 tree analyses per month.
- Pressure data: The free plan may not always include pressure; the widget shows “—” when unavailable.
- AI summary: Not every location returns an AI summary; a fallback message is displayed when missing.
- Usage display: The current UI does not show the usage counters (removed for simplicity). You can re‑add them if needed – the `/api/usage` endpoint is already set up.

---

## Customisation

- Change default location: edit `DEFAULT_CONFIG.location` in `js/app.js`.
- Re‑enable usage cards: add back the HTML block from an earlier version and uncomment the `fetchUsage()` call in `loadAllData()`.
- Style: edit `css/styles.css` – colours, fonts, spacing are all defined as CSS variables.

---

## Security

- Never expose your API key in a public repository. The app stores it only in your browser’s `localStorage`.
- The Netlify functions add CORS headers, but they do not validate the origin. If you share your public URL, anyone who opens it would still need to enter their own API key (since the key is not part of the function). Your key is only sent from your browser.

---

## License

This project is open source and available under the MIT License. You are free to use, modify, and distribute it as you wish.

---

```

This README covers setup, deployment, usage, and technical details, suitable for anyone to get the app running quickly.