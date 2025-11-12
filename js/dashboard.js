/**
 * Dashboard JavaScript
 * Fetches cryptocurrency data, processes it, and renders interactive charts with Plotly.js
 */

// CoinGecko API Configuration
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Global variables to store data
let coinData = null;
let historicalData = null;
let processedData = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Initializing Dashboard...');
    
    // Get coin ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get('coin');
    
    if (!coinId) {
        showError('No cryptocurrency selected. Please go back and select a coin.');
        return;
    }
    
    // Load data and render dashboard
    loadDashboard(coinId);
});

/**
 * Load all data and render dashboard
 */
async function loadDashboard(coinId) {
    try {
        showLoading();
        
        // Fetch coin details and historical data in parallel
        console.log(`📊 Fetching data for ${coinId}...`);
        const [details, history] = await Promise.all([
            fetchCoinDetails(coinId),
            fetchCoinHistory(coinId)
        ]);
        
        coinData = details;
        historicalData = history;
        
        console.log('✅ Data fetched successfully');
        console.log('🔄 Processing data...');
        
        // Process the historical data
        processedData = processHistoricalData(history);
        
        console.log('✅ Data processed');
        console.log('🎨 Rendering dashboard...');
        
        // Render the dashboard
        renderCoinInfo(details);
        renderStatistics(processedData.statistics);
        renderAllCharts();
        
        // Setup tabs
        setupTabs();
        
        // Hide loading, show dashboard
        hideLoading();
        
        console.log('✅ Dashboard ready!');
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        showError(error.message || 'Failed to load cryptocurrency data');
    }
}

/**
 * Fetch coin details from CoinGecko API
 */
async function fetchCoinDetails(coinId) {
    const response = await fetch(`${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch coin details (${response.status})`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
        throw new Error('Coin not found');
    }
    
    return data[0];
}

/**
 * Fetch 90 days of historical data from CoinGecko API
 */
async function fetchCoinHistory(coinId) {
    const response = await fetch(`${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=90&interval=daily`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch historical data (${response.status})`);
    }
    
    const data = await response.json();
    return data;
}

/**
 * Process historical data (similar to dataProcessor.js from backend)
 */
function processHistoricalData(history) {
    // Extract data arrays
    const prices = history.prices.map(item => item[1]);
    const volumes = history.total_volumes.map(item => item[1]);
    const marketCaps = history.market_caps.map(item => item[1]);
    const timestamps = history.prices.map(item => item[0]);
    const dates = timestamps.map(ts => new Date(ts));
    
    // Calculate 7-day moving average
    const movingAvg7 = calculateMovingAverage(prices, 7);
    
    // Calculate daily returns
    const dailyReturns = calculateDailyReturns(prices);
    
    // Calculate price changes
    const priceChanges = calculatePriceChanges(prices);
    
    // Prepare chart data
    return {
        timeSeriesData: {
            dates: dates.map(d => d.toISOString().split('T')[0]),
            prices: prices,
            movingAverage: movingAvg7
        },
        histogramData: prepareHistogramData(dailyReturns),
        boxPlotData: {
            returns: dailyReturns.filter(v => v !== null),
            priceChanges: priceChanges.filter(v => v !== 0)
        },
        violinData: prepareViolinData(dailyReturns),
        scatterData: {
            prices: prices,
            volumes: volumes,
            dates: dates.map(d => d.toISOString().split('T')[0])
        },
        scatterRegressionData: prepareScatterWithRegression(volumes, prices, dates),
        correlationData: prepareCorrelationHeatmap(prices, volumes, marketCaps),
        treemapData: prepareTreemapData(volumes, dates),
        sunburstData: prepareSunburstData(dailyReturns, dates),
        networkData: prepareNetworkData(prices, volumes, marketCaps, dailyReturns),
        wordCloudData: prepareWordCloudData(dailyReturns),
        statistics: calculateStatistics(prices, volumes, dailyReturns)
    };
}

/**
 * Calculate moving average
 */
function calculateMovingAverage(data, window) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < window - 1) {
            result.push(null);
        } else {
            const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / window);
        }
    }
    return result;
}

/**
 * Calculate daily returns (percentage change)
 */
function calculateDailyReturns(prices) {
    const returns = [null];
    for (let i = 1; i < prices.length; i++) {
        const returnPct = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100;
        returns.push(returnPct);
    }
    return returns;
}

/**
 * Calculate price changes
 */
function calculatePriceChanges(prices) {
    const changes = [0];
    for (let i = 1; i < prices.length; i++) {
        changes.push(prices[i] - prices[i - 1]);
    }
    return changes;
}

/**
 * Prepare histogram data
 */
function prepareHistogramData(returns) {
    const validReturns = returns.filter(v => v !== null && !isNaN(v));
    const mean = validReturns.reduce((a, b) => a + b, 0) / validReturns.length;
    const sorted = [...validReturns].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return {
        returns: validReturns,
        mean: mean,
        median: median
    };
}

/**
 * Prepare violin plot data
 */
function prepareViolinData(returns) {
    const validReturns = returns.filter(v => v !== null && !isNaN(v));
    const positiveReturns = validReturns.filter(r => r > 0);
    const negativeReturns = validReturns.filter(r => r < 0);
    
    return {
        allReturns: validReturns,
        positiveReturns: positiveReturns,
        negativeReturns: negativeReturns
    };
}

/**
 * Calculate linear regression
 */
function calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const predictions = x.map(xi => slope * xi + intercept);
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return {
        slope,
        intercept,
        predictions,
        rSquared
    };
}

/**
 * Prepare scatter with regression data
 */
function prepareScatterWithRegression(volumes, prices, dates) {
    const regression = calculateLinearRegression(volumes, prices);
    
    return {
        x: volumes,
        y: prices,
        dates: dates.map(d => d.toISOString().split('T')[0]),
        regressionLine: regression.predictions,
        rSquared: regression.rSquared,
        equation: `y = ${regression.slope.toExponential(2)}x + ${regression.intercept.toFixed(2)}`
    };
}

/**
 * Calculate Pearson correlation
 */
function calculateCorrelation(x, y) {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }
    
    return numerator / Math.sqrt(denomX * denomY);
}

/**
 * Prepare correlation heatmap data
 */
function prepareCorrelationHeatmap(prices, volumes, marketCaps) {
    const correlationMatrix = [
        [1, calculateCorrelation(prices, volumes), calculateCorrelation(prices, marketCaps)],
        [calculateCorrelation(volumes, prices), 1, calculateCorrelation(volumes, marketCaps)],
        [calculateCorrelation(marketCaps, prices), calculateCorrelation(marketCaps, volumes), 1]
    ];
    
    return {
        matrix: correlationMatrix,
        labels: ['Price', 'Volume', 'Market Cap']
    };
}

/**
 * Prepare treemap data
 */
function prepareTreemapData(volumes, dates) {
    const quarterSize = Math.floor(volumes.length / 4);
    
    const quarters = [
        { label: 'Q1 (Days 1-23)', start: 0, end: quarterSize },
        { label: 'Q2 (Days 24-46)', start: quarterSize, end: quarterSize * 2 },
        { label: 'Q3 (Days 47-69)', start: quarterSize * 2, end: quarterSize * 3 },
        { label: 'Q4 (Days 70-90)', start: quarterSize * 3, end: volumes.length }
    ];
    
    const labels = [];
    const parents = [];
    const values = [];
    const text = [];
    
    labels.push('90 Days');
    parents.push('');
    values.push(0);
    text.push('Total Period');
    
    quarters.forEach(q => {
        const quarterVolumes = volumes.slice(q.start, q.end);
        const avgVolume = quarterVolumes.reduce((a, b) => a + b, 0) / quarterVolumes.length;
        
        labels.push(q.label);
        parents.push('90 Days');
        values.push(avgVolume);
        text.push(`Avg: $${(avgVolume / 1e9).toFixed(2)}B`);
    });
    
    return { labels, parents, values, text };
}

/**
 * Prepare sunburst data - Hierarchical price movement analysis
 */
function prepareSunburstData(returns, dates) {
    const validReturns = returns.filter((v, i) => v !== null && !isNaN(v) && dates[i]);
    const validDates = dates.filter((d, i) => returns[i] !== null && !isNaN(returns[i]));
    
    // Group by weeks
    const weekSize = Math.ceil(validReturns.length / 13); // 90 days ≈ 13 weeks
    const weeks = [];
    
    for (let i = 0; i < 13; i++) {
        const start = i * weekSize;
        const end = Math.min((i + 1) * weekSize, validReturns.length);
        if (start < validReturns.length) {
            weeks.push({
                week: `Week ${i + 1}`,
                returns: validReturns.slice(start, end)
            });
        }
    }
    
    const labels = [];
    const parents = [];
    const values = [];
    const colors = [];
    const text = [];
    
    weeks.forEach(weekData => {
        const weekReturns = weekData.returns;
        const avgReturn = weekReturns.reduce((a, b) => a + b, 0) / weekReturns.length;
        
        // Add sub-categories for each week
        const categories = {
            'Big Gain': weekReturns.filter(r => r > 2).length,
            'Small Gain': weekReturns.filter(r => r > 0 && r <= 2).length,
            'Small Loss': weekReturns.filter(r => r < 0 && r >= -2).length,
            'Big Loss': weekReturns.filter(r => r < -2).length
        };
        
        // Only add week if it has data
        const weekTotal = Object.values(categories).reduce((a, b) => a + b, 0);
        if (weekTotal > 0) {
            labels.push(weekData.week);
            parents.push('');
            values.push(weekTotal);
            colors.push(avgReturn);
            text.push(`Avg: ${avgReturn.toFixed(2)}%`);
            
            Object.entries(categories).forEach(([cat, count]) => {
                if (count > 0) {
                    labels.push(`${weekData.week} - ${cat}`);
                    parents.push(weekData.week);
                    values.push(count);
                    colors.push(cat.includes('Gain') ? Math.abs(count) : -Math.abs(count));
                    text.push(`${count} days`);
                }
            });
        }
    });
    
    return { labels, parents, values, colors, text };
}

/**
 * Prepare network graph data - Correlation network
 */
function prepareNetworkData(prices, volumes, marketCaps, returns) {
    const validReturns = returns.filter(v => v !== null && !isNaN(v));
    
    // Calculate statistics for each metric
    const metrics = {
        'Price': { value: prices[prices.length - 1], volatility: calculateStdDev(prices) },
        'Volume': { value: volumes[volumes.length - 1], volatility: calculateStdDev(volumes) },
        'Market Cap': { value: marketCaps[marketCaps.length - 1], volatility: calculateStdDev(marketCaps) },
        'Returns': { value: validReturns[validReturns.length - 1], volatility: calculateStdDev(validReturns) }
    };
    
    // Calculate correlations
    const correlations = [
        { source: 'Price', target: 'Volume', value: Math.abs(calculateCorrelation(prices, volumes)) },
        { source: 'Price', target: 'Market Cap', value: Math.abs(calculateCorrelation(prices, marketCaps)) },
        { source: 'Price', target: 'Returns', value: Math.abs(calculateCorrelation(prices, validReturns)) },
        { source: 'Volume', target: 'Market Cap', value: Math.abs(calculateCorrelation(volumes, marketCaps)) },
        { source: 'Volume', target: 'Returns', value: Math.abs(calculateCorrelation(volumes, validReturns)) },
        { source: 'Market Cap', target: 'Returns', value: Math.abs(calculateCorrelation(marketCaps, validReturns)) }
    ];
    
    return { metrics, correlations };
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
    return Math.sqrt(variance);
}

/**
 * Prepare word cloud data
 */
function prepareWordCloudData(returns) {
    const validReturns = returns.filter(v => v !== null && !isNaN(v));
    
    const categories = {
        'Huge Gain (>5%)': 0,
        'Big Gain (2-5%)': 0,
        'Small Gain (0-2%)': 0,
        'Small Loss (0-2%)': 0,
        'Big Loss (2-5%)': 0,
        'Huge Loss (>5%)': 0
    };
    
    validReturns.forEach(r => {
        if (r > 5) categories['Huge Gain (>5%)']++;
        else if (r > 2) categories['Big Gain (2-5%)']++;
        else if (r > 0) categories['Small Gain (0-2%)']++;
        else if (r > -2) categories['Small Loss (0-2%)']++;
        else if (r > -5) categories['Big Loss (2-5%)']++;
        else categories['Huge Loss (>5%)']++;
    });
    
    return {
        words: Object.keys(categories),
        frequencies: Object.values(categories)
    };
}

/**
 * Calculate statistics
 */
function calculateStatistics(prices, volumes, returns) {
    const validReturns = returns.filter(v => v !== null && !isNaN(v));
    const mean = validReturns.reduce((a, b) => a + b, 0) / validReturns.length;
    const squaredDiffs = validReturns.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / validReturns.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        price: {
            min: Math.min(...prices),
            max: Math.max(...prices),
            mean: prices.reduce((a, b) => a + b, 0) / prices.length,
            current: prices[prices.length - 1]
        },
        volume: {
            min: Math.min(...volumes),
            max: Math.max(...volumes),
            mean: volumes.reduce((a, b) => a + b, 0) / volumes.length
        },
        returns: {
            min: Math.min(...validReturns),
            max: Math.max(...validReturns),
            mean: mean,
            volatility: stdDev
        }
    };
}

/**
 * Render coin info
 */
function renderCoinInfo(coin) {
    document.getElementById('coin-image').src = coin.image;
    document.getElementById('coin-image').alt = coin.name;
    document.getElementById('coin-name').textContent = coin.name;
    document.getElementById('coin-symbol').textContent = coin.symbol.toUpperCase();
    document.getElementById('coin-rank').textContent = `Rank #${coin.market_cap_rank}`;
    document.getElementById('coin-price').textContent = `$${coin.current_price.toLocaleString()}`;
    document.getElementById('coin-market-cap').textContent = `$${(coin.market_cap / 1e9).toFixed(2)}B`;
    
    // Update page title
    document.title = `${coin.name} Analysis - Crypto Dashboard`;
}

/**
 * Render statistics
 */
function renderStatistics(stats) {
    document.getElementById('stat-price-min').textContent = `$${stats.price.min.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
    document.getElementById('stat-price-max').textContent = `$${stats.price.max.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
    document.getElementById('stat-price-mean').textContent = `$${stats.price.mean.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
    
    document.getElementById('stat-volume-min').textContent = `$${(stats.volume.min / 1e9).toFixed(2)}B`;
    document.getElementById('stat-volume-max').textContent = `$${(stats.volume.max / 1e9).toFixed(2)}B`;
    document.getElementById('stat-volume-mean').textContent = `$${(stats.volume.mean / 1e9).toFixed(2)}B`;
    
    document.getElementById('stat-return-max').textContent = `+${stats.returns.max.toFixed(2)}%`;
    document.getElementById('stat-return-min').textContent = `${stats.returns.min.toFixed(2)}%`;
    document.getElementById('stat-return-volatility').textContent = `±${stats.returns.volatility.toFixed(2)}%`;
}

/**
 * Render all charts
 */
function renderAllCharts() {
    renderHistogramChart();
    renderBoxPlotChart();
    renderViolinChart();
    renderTimeSeriesChart();
    renderVolumeAreaChart();
    renderScatterRegressionChart();
    renderCorrelationHeatmap();
    renderTreemapChart();
    renderSunburstChart();
    renderWordCloudChart();
    renderNetworkChart();
    
    console.log('✅ All 11 charts rendered successfully');
}

/**
 * Chart 1: Time Series Line Chart
 */
function renderTimeSeriesChart() {
    const data = processedData.timeSeriesData;
    
    const priceTrace = {
        x: data.dates,
        y: data.prices,
        type: 'scatter',
        mode: 'lines',
        name: 'Price',
        line: { color: '#3b82f6', width: 2 },
        hovertemplate: '<b>Date:</b> %{x}<br><b>Price:</b> $%{y:,.2f}<extra></extra>'
    };
    
    const maTrace = {
        x: data.dates,
        y: data.movingAverage,
        type: 'scatter',
        mode: 'lines',
        name: '7-Day MA',
        line: { color: '#f59e0b', width: 2, dash: 'dash' },
        hovertemplate: '<b>Date:</b> %{x}<br><b>MA:</b> $%{y:,.2f}<extra></extra>'
    };
    
    const layout = {
        title: { text: `${coinData.name} Price Trend (90 Days)`, font: { size: 18 } },
        xaxis: { title: 'Date', showgrid: true, gridcolor: '#e5e7eb' },
        yaxis: { title: 'Price (USD)', showgrid: true, gridcolor: '#e5e7eb', tickformat: '$,.0f' },
        hovermode: 'x unified',
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        legend: { orientation: 'h', y: -0.15 },
        margin: { t: 60, b: 60, l: 80, r: 40 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    Plotly.newPlot('price-chart', [priceTrace, maTrace], layout, config);
}

/**
 * Chart 2: Histogram of Daily Returns
 */
function renderHistogramChart() {
    const data = processedData.histogramData;
    
    const histogramTrace = {
        x: data.returns,
        type: 'histogram',
        name: 'Daily Returns',
        marker: {
            color: '#8b5cf6',
            line: { color: '#6d28d9', width: 1 }
        },
        opacity: 0.75,
        nbinsx: 30,
        hovertemplate: '<b>Return Range:</b> %{x:.2f}%<br><b>Count:</b> %{y}<extra></extra>'
    };
    
    const shapes = [{
        type: 'line',
        x0: data.mean,
        x1: data.mean,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#ef4444', width: 2, dash: 'dash' }
    }];
    
    const layout = {
        title: { text: 'Distribution of Daily Returns', font: { size: 18 } },
        xaxis: {
            title: 'Daily Return (%)',
            showgrid: true,
            gridcolor: '#e5e7eb',
            zeroline: true,
            zerolinecolor: '#9ca3af',
            zerolinewidth: 2
        },
        yaxis: { title: 'Frequency', showgrid: true, gridcolor: '#e5e7eb' },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        shapes: shapes,
        annotations: [{
            x: data.mean,
            y: 1,
            yref: 'paper',
            text: `Mean: ${data.mean.toFixed(2)}%`,
            showarrow: true,
            arrowhead: 2,
            ax: 40,
            ay: -40,
            bgcolor: '#fee2e2',
            bordercolor: '#ef4444'
        }],
        margin: { t: 60, b: 60, l: 60, r: 40 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    Plotly.newPlot('histogram-chart', [histogramTrace], layout, config);
}

/**
 * Chart 3: Box Plot
 */
function renderBoxPlotChart() {
    const data = processedData.boxPlotData;
    
    const trace1 = {
        y: data.returns,
        type: 'box',
        name: 'Daily Returns (%)',
        marker: { color: '#8b5cf6' },
        boxmean: 'sd'
    };
    
    const trace2 = {
        y: data.priceChanges,
        type: 'box',
        name: 'Price Changes ($)',
        marker: { color: '#3b82f6' },
        boxmean: 'sd'
    };
    
    const layout = {
        title: 'Box Plot: Returns & Price Changes Distribution',
        yaxis: { title: 'Value' },
        showlegend: true,
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('boxplot-chart', [trace1, trace2], layout, config);
}

/**
 * Chart 4: Violin Plot
 */
function renderViolinChart() {
    const data = processedData.violinData;
    
    const trace1 = {
        y: data.positiveReturns,
        type: 'violin',
        name: 'Positive Days',
        marker: { color: '#10b981' },
        box: { visible: true },
        meanline: { visible: true }
    };
    
    const trace2 = {
        y: data.negativeReturns,
        type: 'violin',
        name: 'Negative Days',
        marker: { color: '#ef4444' },
        box: { visible: true },
        meanline: { visible: true }
    };
    
    const layout = {
        title: 'Violin Plot: Positive vs Negative Return Days',
        yaxis: { title: 'Daily Return (%)' },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('violin-chart', [trace1, trace2], layout, config);
}

/**
 * Chart 5: Volume Area Chart
 */
function renderVolumeAreaChart() {
    const data = processedData.scatterData;
    
    const trace = {
        x: data.dates,
        y: data.volumes,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: 'Volume',
        line: { color: '#8b5cf6', width: 1 },
        fillcolor: 'rgba(139, 92, 246, 0.3)',
        hovertemplate: '<b>Date:</b> %{x}<br><b>Volume:</b> $%{y:,.0f}<extra></extra>'
    };
    
    const layout = {
        title: 'Volume Over Time (Area Chart)',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Volume (USD)', tickformat: '$,.0s' },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('volume-area-chart', [trace], layout, config);
}

/**
 * Chart 6: Scatter with Regression
 */
function renderScatterRegressionChart() {
    const data = processedData.scatterRegressionData;
    
    const scatterTrace = {
        x: data.x,
        y: data.y,
        mode: 'markers',
        type: 'scatter',
        name: 'Actual Data',
        marker: {
            size: 8,
            color: data.y,
            colorscale: 'Viridis',
            showscale: true
        },
        text: data.dates,
        hovertemplate: '<b>Date:</b> %{text}<br><b>Volume:</b> $%{x:,.0f}<br><b>Price:</b> $%{y:,.2f}<extra></extra>'
    };
    
    const regressionTrace = {
        x: data.x,
        y: data.regressionLine,
        mode: 'lines',
        type: 'scatter',
        name: 'Regression Line',
        line: { color: '#ef4444', width: 3, dash: 'dash' },
        hovertemplate: '<b>Predicted Price:</b> $%{y:,.2f}<extra></extra>'
    };
    
    const layout = {
        title: `Scatter with Regression (R² = ${data.rSquared.toFixed(4)})`,
        xaxis: { title: 'Volume (USD)', tickformat: '$,.0s' },
        yaxis: { title: 'Price (USD)', tickformat: '$,.0f' },
        annotations: [{
            x: 0.05,
            y: 0.95,
            xref: 'paper',
            yref: 'paper',
            text: data.equation,
            showarrow: false,
            bgcolor: '#fee2e2',
            bordercolor: '#ef4444'
        }],
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('scatter-regression-chart', [scatterTrace, regressionTrace], layout, config);
}

/**
 * Chart 7: Correlation Heatmap
 */
function renderCorrelationHeatmap() {
    const data = processedData.correlationData;
    
    const textValues = data.matrix.map(row => row.map(val => val.toFixed(2)));
    
    const heatmapTrace = {
        z: data.matrix,
        x: data.labels,
        y: data.labels,
        type: 'heatmap',
        colorscale: [
            [0, '#3b82f6'],
            [0.5, '#ffffff'],
            [1, '#ef4444']
        ],
        zmid: 0,
        text: textValues,
        texttemplate: '%{text}',
        textfont: { size: 14, color: '#000000' },
        hovertemplate: '<b>%{y}</b> vs <b>%{x}</b><br>Correlation: %{z:.3f}<extra></extra>',
        colorbar: {
            title: 'Correlation',
            titleside: 'right',
            tickmode: 'linear',
            tick0: -1,
            dtick: 0.5
        }
    };
    
    const layout = {
        title: { text: 'Correlation Matrix', font: { size: 18 } },
        xaxis: { title: '', side: 'bottom' },
        yaxis: { title: '', autorange: 'reversed' },
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        margin: { t: 60, b: 60, l: 100, r: 120 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    Plotly.newPlot('heatmap-chart', [heatmapTrace], layout, config);
}

/**
 * Chart 8: Treemap
 */
function renderTreemapChart() {
    const data = processedData.treemapData;
    
    const trace = {
        type: 'treemap',
        labels: data.labels,
        parents: data.parents,
        values: data.values,
        text: data.text,
        textposition: 'middle center',
        marker: {
            colorscale: 'Blues',
            line: { width: 2 }
        },
        hovertemplate: '<b>%{label}</b><br>%{text}<br>Volume: $%{value:,.0f}<extra></extra>'
    };
    
    const layout = {
        title: 'Treemap: Average Volume by Quarter',
        paper_bgcolor: '#ffffff'
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('treemap-chart', [trace], layout, config);
}

/**
 * Chart 9: Sunburst Chart
 */
function renderSunburstChart() {
    const data = processedData.sunburstData;
    
    const trace = {
        type: 'sunburst',
        labels: data.labels,
        parents: data.parents,
        values: data.values,
        text: data.text,
        marker: {
            colors: data.colors,
            colorscale: [
                [0, '#ef4444'],
                [0.5, '#fbbf24'],
                [1, '#10b981']
            ],
            cmid: 0,
            line: { width: 2, color: '#ffffff' }
        },
        branchvalues: 'total',
        hovertemplate: '<b>%{label}</b><br>%{text}<br>Count: %{value}<extra></extra>'
    };
    
    const layout = {
        title: 'Sunburst: Hierarchical Price Movement Analysis',
        paper_bgcolor: '#ffffff',
        margin: { t: 60, b: 20, l: 20, r: 20 },
        height: 600
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('sunburst-chart', [trace], layout, config);
}

/**
 * Chart 10: Word Cloud (Bar Chart)
 */
function renderWordCloudChart() {
    const data = processedData.wordCloudData;
    
    const trace = {
        x: data.words,
        y: data.frequencies,
        type: 'bar',
        marker: {
            color: data.frequencies,
            colorscale: [
                [0, '#ef4444'],
                [0.5, '#fbbf24'],
                [1, '#10b981']
            ],
            line: { color: '#374151', width: 1 }
        },
        text: data.frequencies.map(f => `${f} days`),
        textposition: 'outside',
        hovertemplate: '<b>%{x}</b><br>Frequency: %{y} days<extra></extra>'
    };
    
    const layout = {
        title: 'Price Movement Frequency (Word Cloud Style)',
        xaxis: { title: 'Movement Category', tickangle: -45 },
        yaxis: { title: 'Number of Days' },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('wordcloud-chart', [trace], layout, config);
}

/**
 * Chart 11: Network Graph
 */
function renderNetworkChart() {
    const data = processedData.networkData;
    
    // Create nodes
    const nodeNames = Object.keys(data.metrics);
    const nodeX = [0.1, 0.9, 0.5, 0.5]; // Positions for 4 nodes
    const nodeY = [0.5, 0.5, 0.1, 0.9];
    const nodeSize = nodeNames.map(name => 30 + data.metrics[name].volatility / 1000);
    const nodeColors = nodeNames.map((name, i) => {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
        return colors[i];
    });
    
    // Create edges
    const edgeX = [];
    const edgeY = [];
    const edgeText = [];
    
    data.correlations.forEach(corr => {
        const sourceIdx = nodeNames.indexOf(corr.source);
        const targetIdx = nodeNames.indexOf(corr.target);
        
        edgeX.push(nodeX[sourceIdx], nodeX[targetIdx], null);
        edgeY.push(nodeY[sourceIdx], nodeY[targetIdx], null);
        edgeText.push(`${corr.source} ↔ ${corr.target}: ${corr.value.toFixed(3)}`);
    });
    
    // Edge trace
    const edgeTrace = {
        x: edgeX,
        y: edgeY,
        mode: 'lines',
        line: {
            width: data.correlations.map(c => c.value * 5).flatMap(w => [w, w, null]),
            color: data.correlations.map(c => {
                if (c.value > 0.7) return '#10b981';
                if (c.value > 0.4) return '#fbbf24';
                return '#ef4444';
            }).flatMap(c => [c, c, null])
        },
        hoverinfo: 'text',
        text: edgeText.flatMap(t => [t, t, null]),
        showlegend: false
    };
    
    // Node trace
    const nodeTrace = {
        x: nodeX,
        y: nodeY,
        mode: 'markers+text',
        marker: {
            size: nodeSize,
            color: nodeColors,
            line: { width: 2, color: '#ffffff' }
        },
        text: nodeNames,
        textposition: 'middle center',
        textfont: { size: 10, color: '#ffffff', family: 'Arial Black' },
        hovertemplate: '<b>%{text}</b><br>Volatility: %{marker.size:.0f}<extra></extra>',
        showlegend: false
    };
    
    const layout = {
        title: 'Network Graph: Correlation Between Metrics',
        xaxis: { visible: false, range: [-0.1, 1.1] },
        yaxis: { visible: false, range: [-0.1, 1.1] },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        hovermode: 'closest',
        margin: { t: 60, b: 20, l: 20, r: 20 },
        annotations: [
            {
                text: 'Line thickness = correlation strength<br>Green: Strong | Yellow: Moderate | Red: Weak',
                showarrow: false,
                xref: 'paper',
                yref: 'paper',
                x: 0.5,
                y: -0.05,
                xanchor: 'center',
                font: { size: 10, color: '#6b7280' }
            }
        ]
    };
    
    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('network-chart', [edgeTrace, nodeTrace], layout, config);
}

/**
 * Setup tab navigation
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class
            button.classList.add('active');
            document.querySelector(`[data-content="${tabName}"]`).classList.add('active');
            
            // Resize charts
            setTimeout(() => {
                const activeTab = document.querySelector(`[data-content="${tabName}"]`);
                activeTab.querySelectorAll('.chart-placeholder').forEach(chart => {
                    Plotly.Plots.resize(chart.id);
                });
            }, 100);
        });
    });
}

/**
 * Show loading indicator
 */
function showLoading() {
    document.getElementById('loading-dashboard').style.display = 'block';
    document.getElementById('error-dashboard').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'none';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    document.getElementById('loading-dashboard').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('loading-dashboard').style.display = 'none';
    document.getElementById('error-dashboard').style.display = 'block';
    document.getElementById('error-text').textContent = message;
}

/**
 * Handle window resize
 */
window.addEventListener('resize', function() {
    const chartIds = [
        'histogram-chart', 'boxplot-chart', 'violin-chart',
        'price-chart', 'volume-area-chart',
        'scatter-regression-chart', 'heatmap-chart',
        'treemap-chart', 'sunburst-chart', 'wordcloud-chart', 'network-chart'
    ];
    
    chartIds.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.data) {
            Plotly.Plots.resize(id);
        }
    });
});

