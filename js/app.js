(function() {
    const STORAGE_KEY = 'weatherai_dashboard_config';
    const DEFAULT_CONFIG = {
        apiKey: '',
        location: 'London',
    };

    let config = loadConfig();

    function loadConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_CONFIG, ...parsed };
            }
        } catch (e) {}
        return { ...DEFAULT_CONFIG };
    }

    function saveConfig() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch (e) {}
    }

    const $ = (sel) => document.querySelector(sel);
    const dom = {
        btnSettings: $('#btnSettings'),
        settingsPanel: $('#settingsPanel'),
        apiBaseUrl: $('#apiBaseUrl'),
        apiKey: $('#apiKey'),
        locationInput: $('#locationInput'),
        btnLocate: $('#btnLocate'),
        btnSaveSettings: $('#btnSaveSettings'),
        btnClearSettings: $('#btnClearSettings'),
        statusBadge: $('#statusBadge'),
        weatherCard: $('#weatherCard'),
        weatherLoading: $('#weatherLoading'),
        weatherContent: $('#weatherContent'),
        weatherError: $('#weatherError'),
        weatherErrorMsg: $('#weatherErrorMsg'),
        btnRetryWeather: $('#btnRetryWeather'),
        wLocation: $('#wLocation'),
        wCountry: $('#wCountry'),
        wIcon: $('#wIcon'),
        wTemp: $('#wTemp'),
        wCondition: $('#wCondition'),
        wHumidity: $('#wHumidity'),
        wWind: $('#wWind'),
        wWindDir: $('#wWindDir'),
        wPressure: $('#wPressure'),
        aiSummaryText: $('#aiSummaryText'),
        forecastContainer: $('#forecastContainer'),
        toastContainer: $('#toastContainer'),
    };

    function showToast(msg, type = 'success') {
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = msg;
        dom.toastContainer.appendChild(t);
        setTimeout(() => t.remove(), 4200);
    }

    function setStatus(state, msg) {
        const b = dom.statusBadge;
        b.className = 'status-badge ' + state;
        b.innerHTML = `<span class="status-dot${state === 'loading' ? ' pulse' : ''}"></span> ${msg}`;
    }

    function showWeatherLoading() {
        dom.weatherLoading.style.display = 'block';
        dom.weatherContent.style.display = 'none';
        dom.weatherError.style.display = 'none';
        dom.weatherCard.classList.add('loading-state');
    }

    function showWeatherContent() {
        dom.weatherLoading.style.display = 'none';
        dom.weatherContent.style.display = 'block';
        dom.weatherError.style.display = 'none';
        dom.weatherCard.classList.remove('loading-state');
    }

    function showWeatherError(msg) {
        dom.weatherLoading.style.display = 'none';
        dom.weatherContent.style.display = 'none';
        dom.weatherError.style.display = 'flex';
        dom.weatherErrorMsg.textContent = msg || 'Unable to fetch weather data.';
        dom.weatherCard.classList.remove('loading-state');
    }

    function getWeatherEmoji(condition) {
        if (!condition) return '🌈';
        const c = condition.toLowerCase().trim();
        if (/clear|sunny|fair/i.test(c)) return '☀️';
        if (/partly.?cloudy|few.?clouds/i.test(c)) return '⛅';
        if (/cloudy|overcast|mostly.?cloudy/i.test(c)) return '☁️';
        if (/drizzle|light.?rain|sprinkle/i.test(c)) return '🌦️';
        if (/rain|shower|wet/i.test(c)) return '🌧️';
        if (/thunder|lightning|storm/i.test(c)) return '⛈️';
        if (/snow|flurr|blizzard|ice/i.test(c)) return '❄️';
        if (/fog|mist|haze|smog/i.test(c)) return '🌫️';
        if (/wind|breez|gust/i.test(c)) return '💨';
        if (/tornado|hurricane|cyclone/i.test(c)) return '🌪️';
        if (/hot|heat/i.test(c)) return '🔥';
        if (/cold|freez/i.test(c)) return '🥶';
        return '🌡️';
    }

    function getDayName(dateStr, index) {
        if (index === 0) return 'Today';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        } catch (e) { return `Day ${index + 1}`; }
    }

    // ---- Netlify function proxy helpers ----
    function getAuthHeaders() {
        if (config.apiKey) {
            return { 'Authorization': `Bearer ${config.apiKey}` };
        }
        return {};
    }

    function buildWeatherUrl() {
        const loc = config.location.trim();
        let query = '';
        if (loc.toLowerCase() === 'ip:auto' || loc.toLowerCase() === 'auto') {
            query = 'ip=auto';
        } else if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(loc)) {
            const [lat, lon] = loc.split(',').map(s => s.trim());
            query = `lat=${lat}&lon=${lon}`;
        } else {
            query = `location=${encodeURIComponent(loc)}`;
        }
        return `/api/weather?${query}`;
    }

    async function fetchWeather() {
        const url = buildWeatherUrl();
        console.log('[WeatherAI] Fetching weather:', url);
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) {
            const err = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status}: ${res.statusText}${err ? ' – ' + err.slice(0, 200) : ''}`);
        }
        return res.json();
    }

    // ---- Rendering ----
    function renderWeather(data) {
        showWeatherContent();

        const current = data.current || data.now || {};
        const location = data.location || {};
        const hourly = data.hourly || [];
        const daily = data.daily || data.forecast || [];

        // Location
        dom.wLocation.textContent = location.name || data.location_name || 'Unknown';
        const country = location.country || data.country || '';
        dom.wCountry.textContent = country.toUpperCase();
        dom.wCountry.style.display = country ? 'inline-block' : 'none';

        // Temperature
        const temp = current.temperature ?? current.temp ?? null;
        dom.wTemp.textContent = temp !== null ? `${Math.round(temp)}°` : '—°';

        // Condition & icon
        const cond = current.condition || '';
        dom.wIcon.textContent = getWeatherEmoji(cond || current.condition_code);
        dom.wCondition.textContent = cond || '—';

        // Humidity – fallback to first hourly if not in current
        const hum = current.humidity ?? (hourly.length > 0 ? hourly[0].humidity : null);
        dom.wHumidity.textContent = hum !== null ? `${Math.round(hum)}%` : '—%';

        // Wind
        const windSpeed = current.wind_speed ?? current.wind ?? null;
        const windDir = current.wind_direction ?? current.wind_dir ?? '';
        dom.wWind.textContent = windSpeed !== null ? `${Math.round(windSpeed)} km/h` : '—';
        dom.wWindDir.textContent = windDir;

        // Pressure (may be missing)
        const pressure = current.pressure ?? null;
        dom.wPressure.textContent = pressure !== null ? `${Math.round(pressure)}` : '—';

        // AI Summary
        const aiSummary = data.ai_summary || data.gemini_summary || data.summary || '';
        if (aiSummary && typeof aiSummary === 'string' && aiSummary.trim().length > 0) {
            dom.aiSummaryText.textContent = aiSummary;
        } else if (aiSummary && typeof aiSummary === 'object' && aiSummary.text) {
            dom.aiSummaryText.textContent = aiSummary.text;
        } else {
            dom.aiSummaryText.textContent = 'You are on the free plan. Please upgrade to use the AI feature.';
        }

        renderForecast(daily);
    }

    function renderForecast(days) {
        dom.forecastContainer.innerHTML = '';
        if (!Array.isArray(days) || days.length === 0) {
            dom.forecastContainer.innerHTML = `
            <div class="empty-state" style="min-width:100%;">
                <span class="empty-state-icon">📭</span>
                <p class="empty-state-message">No forecast data available.</p>
            </div>`;
            return;
        }

        days.slice(0, 7).forEach((day, i) => {
            const dateStr = day.date || day.dt || '';
            const dayName = getDayName(dateStr, i);
            const cond = day.condition || '';
            const icon = getWeatherEmoji(cond || day.condition_code);
            const high = day.temp_max ?? day.high ?? day.max ?? null;
            const low = day.temp_min ?? day.low ?? day.min ?? null;

            const card = document.createElement('div');
            card.className = 'forecast-day-card' + (i === 0 ? ' today' : '');
            card.innerHTML = `
            <div class="forecast-day-name">${dayName}</div>
            <div class="forecast-day-icon">${icon}</div>
            <div class="forecast-day-temps">
                <span class="forecast-day-high">${high !== null ? Math.round(high) + '°' : '—'}</span>
                <span class="forecast-day-low">${low !== null ? Math.round(low) + '°' : '—'}</span>
            </div>`;
            dom.forecastContainer.appendChild(card);
        });
    }

    // ---- Main data load (weather only) ----
    async function loadWeather() {
        setStatus('loading', 'Fetching weather...');
        showWeatherLoading();

        try {
            const data = await fetchWeather();
            renderWeather(data);
            setStatus('success', 'Live Data');
        } catch (err) {
            console.error('[WeatherAI] Weather fetch failed:', err);
            showWeatherError(err.message || 'Could not connect to the weather API.');
            setStatus('error', 'Weather API Error');
        }
    }

    // ---- Event handlers ----
    function populateSettingsForm() {
        dom.apiBaseUrl.value = '';   // not used
        dom.apiKey.value = config.apiKey;
        dom.locationInput.value = config.location;
    }

    function handleSaveSettings() {
        config.apiKey = dom.apiKey.value.trim();
        config.location = dom.locationInput.value.trim() || DEFAULT_CONFIG.location;
        saveConfig();
        dom.settingsPanel.classList.remove('open');
        dom.btnSettings.classList.remove('active');
        showToast('Settings saved! Refreshing data...', 'success');
        loadWeather();
    }

    function handleClearSettings() {
        config = { ...DEFAULT_CONFIG };
        saveConfig();
        populateSettingsForm();
        showToast('Settings reset to defaults.', 'success');
    }

    function handleLocate() {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser.', 'error');
            return;
        }
        dom.btnLocate.disabled = true;
        dom.btnLocate.textContent = '⏳ Locating...';
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude.toFixed(4);
                const lon = pos.coords.longitude.toFixed(4);
                dom.locationInput.value = `${lat}, ${lon}`;
                dom.btnLocate.disabled = false;
                dom.btnLocate.innerHTML = '<span class="locate-dot"></span> Use My Location';
                showToast(`Location set: ${lat}, ${lon}`, 'success');
            },
            err => {
                console.error(err);
                showToast('Could not get location. Please enter it manually.', 'error');
                dom.btnLocate.disabled = false;
                dom.btnLocate.innerHTML = '<span class="locate-dot"></span> Use My Location';
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    }

    function toggleSettings() {
        const isOpen = dom.settingsPanel.classList.toggle('open');
        dom.btnSettings.classList.toggle('active', isOpen);
    }

    // ---- Init ----
    function init() {
        populateSettingsForm();
        // Hide the unused API Base URL field
        dom.apiBaseUrl.parentElement.style.display = 'none';

        dom.btnSettings.addEventListener('click', toggleSettings);
        dom.btnSaveSettings.addEventListener('click', handleSaveSettings);
        dom.btnClearSettings.addEventListener('click', handleClearSettings);
        dom.btnLocate.addEventListener('click', handleLocate);
        dom.btnRetryWeather.addEventListener('click', loadWeather);

        if (config.apiKey && config.apiKey.trim().length > 0) {
            loadWeather();
        } else {
            setStatus('loading', 'Configure API Settings');
            dom.settingsPanel.classList.add('open');
            dom.btnSettings.classList.add('active');
            showWeatherError('Welcome! Enter your WeatherAI API key in the settings panel and click "Save & Refresh".');
            dom.aiSummaryText.textContent = 'Configure your API settings to receive AI-powered weather summaries.';
            dom.forecastContainer.innerHTML = `
            <div class="empty-state" style="min-width:100%;">
                <span class="empty-state-icon">🔑</span>
                <p class="empty-state-message">Enter your API key to unlock weather data.</p>
            </div>`;
        }
    }

    init();
})();