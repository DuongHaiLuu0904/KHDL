/**
 * Data Processing Module
 * Core analysis engine using native JavaScript for data manipulation and feature engineering
 * This approach avoids native dependencies while providing the same functionality as danfo-js
 */

/**
 * Process historical cryptocurrency data using native JavaScript
 * Performs data cleaning, feature engineering, and prepares data for visualization
 * @param {Object} history - Raw historical data from CoinGecko API
 * @returns {Object} Processed data ready for Plotly.js charts
 */
async function processHistoricalData(history) {
    try {
        console.log('🔄 Starting data processing...');

        // Extract arrays from the history object
        const prices = history.prices;
        const volumes = history.volumes;
        const marketCaps = history.market_caps;

        // Create structured data object (DataFrame-like structure)
        const timestamps = prices.map(item => item[0]);
        const priceValues = prices.map(item => item[1]);
        const volumeValues = volumes.map(item => item[1]);
        const marketCapValues = marketCaps.map(item => item[1]);

        // Convert Unix timestamps to Date objects
        const dates = timestamps.map(ts => new Date(ts));

        // Create a data structure similar to DataFrame
        const dataFrame = {
            timestamp: timestamps,
            date: dates,
            price: priceValues,
            volume: volumeValues,
            market_cap: marketCapValues
        };

        console.log('✅ Data structure created with', priceValues.length, 'rows');

        // Check for missing data (demonstration)
        const missingPrices = priceValues.filter(v => v === null || v === undefined).length;
        const missingVolumes = volumeValues.filter(v => v === null || v === undefined).length;
        console.log('📊 Missing data check - Prices:', missingPrices, 'Volumes:', missingVolumes);

        // Feature Engineering: 7-Day Moving Average
        const movingAvg7 = calculateMovingAverage(priceValues, 7);
        dataFrame.ma_7 = movingAvg7;

        // Feature Engineering: Daily Return (percentage change)
        const dailyReturns = calculateDailyReturns(priceValues);
        dataFrame.daily_return = dailyReturns;

        // Feature Engineering: Price change from previous day
        const priceChanges = calculatePriceChanges(priceValues);
        dataFrame.price_change = priceChanges;

        console.log('✅ Feature engineering completed');

        // Prepare data for different chart types
        const chartData = {
            timeSeriesData: prepareTimeSeriesData(dataFrame),
            histogramData: prepareHistogramData(dataFrame),
            boxPlotData: prepareBoxPlotData(dataFrame),
            violinData: prepareViolinData(dataFrame),
            scatterData: prepareScatterData(dataFrame),
            scatterRegressionData: prepareScatterWithRegression(dataFrame),
            correlationData: prepareCorrelationHeatmap(dataFrame),
            treemapData: prepareTreemapData(dataFrame),
            wordCloudData: prepareWordCloudData(dataFrame),
            statistics: calculateStatistics(dataFrame)
        };

        console.log('✅ Data processing complete');

        return chartData;
    } catch (error) {
        console.error('❌ Error processing data:', error.message);
        throw new Error('Failed to process historical data');
    }
}

/**
 * Calculate moving average for a given window size
 * @param {Array} data - Array of numeric values
 * @param {number} window - Window size for moving average
 * @returns {Array} Moving average values
 */
function calculateMovingAverage(data, window) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < window - 1) {
            result.push(null); // Not enough data points for moving average
        } else {
            const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / window);
        }
    }
    return result;
}

/**
 * Calculate daily returns (percentage change from previous day)
 * @param {Array} prices - Array of price values
 * @returns {Array} Daily return percentages
 */
function calculateDailyReturns(prices) {
    const returns = [null]; // First day has no previous day
    for (let i = 1; i < prices.length; i++) {
        const returnPct = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100;
        returns.push(returnPct);
    }
    return returns;
}

/**
 * Calculate absolute price changes from previous day
 * @param {Array} prices - Array of price values
 * @returns {Array} Price changes
 */
function calculatePriceChanges(prices) {
    const changes = [0]; // First day has no change
    for (let i = 1; i < prices.length; i++) {
        changes.push(prices[i] - prices[i - 1]);
    }
    return changes;
}

/**
 * Prepare data for time series line/area chart
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for Plotly.js time series chart
 */
function prepareTimeSeriesData(df) {
    const dates = df.date;
    const prices = df.price;
    const ma7 = df.ma_7;

    return {
        dates: dates.map(d => d.toISOString().split('T')[0]),
        prices: prices,
        movingAverage: ma7
    };
}

/**
 * Prepare data for histogram of daily returns
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for Plotly.js histogram
 */
function prepareHistogramData(df) {
    // Filter out null values from daily returns
    const returns = df.daily_return.filter(val => val !== null && !isNaN(val));

    return {
        returns: returns,
        mean: returns.reduce((a, b) => a + b, 0) / returns.length,
        median: calculateMedian(returns)
    };
}

/**
 * Prepare data for scatter plot (Volume vs Price)
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for Plotly.js scatter plot
 */
function prepareScatterData(df) {
    return {
        prices: df.price,
        volumes: df.volume,
        dates: df.date.map(d => d.toISOString().split('T')[0])
    };
}

/**
 * Prepare correlation heatmap data
 * @param {Object} df - Processed data object
 * @returns {Object} Correlation matrix for heatmap
 */
function prepareCorrelationHeatmap(df) {
    // Extract numeric columns for correlation
    const priceCol = df.price;
    const volumeCol = df.volume;
    const marketCapCol = df.market_cap;

    // Calculate correlation matrix
    const correlationMatrix = [
        [1, calculateCorrelation(priceCol, volumeCol), calculateCorrelation(priceCol, marketCapCol)],
        [calculateCorrelation(volumeCol, priceCol), 1, calculateCorrelation(volumeCol, marketCapCol)],
        [calculateCorrelation(marketCapCol, priceCol), calculateCorrelation(marketCapCol, volumeCol), 1]
    ];

    return {
        matrix: correlationMatrix,
        labels: ['Price', 'Volume', 'Market Cap']
    };
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param {Array} x - First array
 * @param {Array} y - Second array
 * @returns {number} Correlation coefficient (-1 to 1)
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
 * Calculate median of an array
 * @param {Array} arr - Array of numbers
 * @returns {number} Median value
 */
function calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Calculate various statistics for the dataset
 * @param {Object} df - Processed data object
 * @returns {Object} Statistical summary
 */
function calculateStatistics(df) {
    const prices = df.price;
    const volumes = df.volume;
    const returns = df.daily_return.filter(val => val !== null && !isNaN(val));

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
            min: Math.min(...returns),
            max: Math.max(...returns),
            mean: returns.reduce((a, b) => a + b, 0) / returns.length,
            volatility: calculateStandardDeviation(returns)
        }
    };
}

/**
 * Calculate standard deviation
 * @param {Array} arr - Array of numbers
 * @returns {number} Standard deviation
 */
function calculateStandardDeviation(arr) {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(variance);
}

/**
 * Prepare data for Box Plot
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for Plotly.js box plot
 */
function prepareBoxPlotData(df) {
    const returns = df.daily_return.filter(val => val !== null && !isNaN(val));
    const priceChanges = df.price_change.filter(val => val !== null && !isNaN(val));

    return {
        returns: returns,
        priceChanges: priceChanges,
        prices: df.price
    };
}

/**
 * Prepare data for Violin Plot
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for Plotly.js violin plot
 */
function prepareViolinData(df) {
    const returns = df.daily_return.filter(val => val !== null && !isNaN(val));

    // Categorize returns into positive and negative
    const positiveReturns = returns.filter(r => r > 0);
    const negativeReturns = returns.filter(r => r < 0);

    return {
        allReturns: returns,
        positiveReturns: positiveReturns,
        negativeReturns: negativeReturns
    };
}

/**
 * Calculate linear regression
 * @param {Array} x - Independent variable
 * @param {Array} y - Dependent variable
 * @returns {Object} Regression coefficients and predictions
 */
function calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    // Calculate slope (m) and intercept (b) for y = mx + b
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate predictions
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
 * Prepare data for Scatter Plot with Regression Line
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for Plotly.js scatter with regression
 */
function prepareScatterWithRegression(df) {
    const volumes = df.volume;
    const prices = df.price;
    const dates = df.date.map(d => d.toISOString().split('T')[0]);

    // Calculate regression
    const regression = calculateLinearRegression(volumes, prices);

    return {
        x: volumes,
        y: prices,
        dates: dates,
        regressionLine: regression.predictions,
        rSquared: regression.rSquared,
        equation: `y = ${regression.slope.toExponential(2)}x + ${regression.intercept.toFixed(2)}`
    };
}

/**
 * Prepare data for Treemap (Market Cap Distribution over time)
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for Plotly.js treemap
 */
function prepareTreemapData(df) {
    // Group data into time periods
    const prices = df.price;
    const volumes = df.volume;
    const marketCaps = df.market_cap;
    const dates = df.date;

    // Split into 4 quarters (90 days / 4 ≈ 22-23 days each)
    const quarterSize = Math.floor(prices.length / 4);

    const quarters = [{
            label: 'Q1 (Days 1-23)',
            start: 0,
            end: quarterSize
        },
        {
            label: 'Q2 (Days 24-46)',
            start: quarterSize,
            end: quarterSize * 2
        },
        {
            label: 'Q3 (Days 47-69)',
            start: quarterSize * 2,
            end: quarterSize * 3
        },
        {
            label: 'Q4 (Days 70-90)',
            start: quarterSize * 3,
            end: prices.length
        }
    ];

    const treemapData = quarters.map(q => {
        const avgPrice = prices.slice(q.start, q.end).reduce((a, b) => a + b, 0) / (q.end - q.start);
        const avgVolume = volumes.slice(q.start, q.end).reduce((a, b) => a + b, 0) / (q.end - q.start);
        const avgMarketCap = marketCaps.slice(q.start, q.end).reduce((a, b) => a + b, 0) / (q.end - q.start);

        return {
            label: q.label,
            avgPrice,
            avgVolume,
            avgMarketCap,
            parent: 'Total'
        };
    });

    return {
        quarters: treemapData,
        labels: ['Total', ...treemapData.map(q => q.label)],
        parents: ['', ...treemapData.map(q => q.parent)],
        values: [
            treemapData.reduce((sum, q) => sum + q.avgVolume, 0),
            ...treemapData.map(q => q.avgVolume)
        ],
        text: [
            'Total Period',
            ...treemapData.map(q => `Avg Price: $${q.avgPrice.toLocaleString()}<br>Volume: $${(q.avgVolume / 1e9).toFixed(2)}B`)
        ]
    };
}

/**
 * Prepare data for Word Cloud (Price movements frequency)
 * @param {Object} df - Processed data object
 * @returns {Object} Data formatted for word cloud
 */
function prepareWordCloudData(df) {
    const returns = df.daily_return.filter(val => val !== null && !isNaN(val));

    // Categorize price movements
    const categories = {
        'HUGE_GAIN': 0, // > 10%
        'BIG_GAIN': 0, // 5-10%
        'GAIN': 0, // 1-5%
        'SMALL_GAIN': 0, // 0-1%
        'SMALL_LOSS': 0, // 0 to -1%
        'LOSS': 0, // -1 to -5%
        'BIG_LOSS': 0, // -5 to -10%
        'HUGE_LOSS': 0 // < -10%
    };

    returns.forEach(r => {
        if (r > 10) categories.HUGE_GAIN++;
        else if (r > 5) categories.BIG_GAIN++;
        else if (r > 1) categories.GAIN++;
        else if (r > 0) categories.SMALL_GAIN++;
        else if (r > -1) categories.SMALL_LOSS++;
        else if (r > -5) categories.LOSS++;
        else if (r > -10) categories.BIG_LOSS++;
        else categories.HUGE_LOSS++;
    });

    return {
        words: Object.keys(categories),
        frequencies: Object.values(categories),
        categories: categories
    };
}

module.exports = {
    processHistoricalData
};