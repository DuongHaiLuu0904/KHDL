/**
 * Client-Side Dashboard JavaScript
 * Renders interactive Plotly.js visualizations using data from the server
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎨 Initializing Plotly.js charts...');

    // Check if chartData is available
    if (typeof chartData === 'undefined') {
        console.error('❌ Chart data not available');
        return;
    }

    // Setup tabs
    setupTabs();

    // Render all charts
    renderHistogramChart();
    renderBoxPlotChart();
    renderViolinChart();
    renderTimeSeriesChart();
    renderVolumeAreaChart();
    renderScatterRegressionChart();
    renderCorrelationHeatmap();
    renderTreemapChart();
    renderWordCloudChart();

    console.log('✅ All 9 charts rendered successfully');
});

/**
 * Setup tab navigation
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.querySelector(`[data-content="${tabName}"]`).classList.add('active');

            // Resize charts in the active tab
            setTimeout(() => {
                Plotly.Plots.resize(document.querySelector(`[data-content="${tabName}"] .chart-placeholder`));
            }, 100);
        });
    });
}

/**
 * Chart 1: Time Series Line Chart
 * Displays price and 7-day moving average over time
 */
function renderTimeSeriesChart() {
    const data = chartData.timeSeriesData;

    // Trace 1: Actual Price
    const priceTrace = {
        x: data.dates,
        y: data.prices,
        type: 'scatter',
        mode: 'lines',
        name: 'Price',
        line: {
            color: '#3b82f6',
            width: 2
        },
        hovertemplate: '<b>Date:</b> %{x}<br><b>Price:</b> $%{y:,.2f}<extra></extra>'
    };

    // Trace 2: 7-Day Moving Average
    const maTrace = {
        x: data.dates,
        y: data.movingAverage,
        type: 'scatter',
        mode: 'lines',
        name: '7-Day MA',
        line: {
            color: '#f59e0b',
            width: 2,
            dash: 'dash'
        },
        hovertemplate: '<b>Date:</b> %{x}<br><b>MA:</b> $%{y:,.2f}<extra></extra>'
    };

    const layout = {
        title: {
            text: `${coinName} Price Trend (90 Days)`,
            font: { size: 18 }
        },
        xaxis: {
            title: 'Date',
            showgrid: true,
            gridcolor: '#e5e7eb'
        },
        yaxis: {
            title: 'Price (USD)',
            showgrid: true,
            gridcolor: '#e5e7eb',
            tickformat: '$,.0f'
        },
        hovermode: 'x unified',
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        legend: {
            orientation: 'h',
            y: -0.15
        },
        margin: { t: 60, b: 60, l: 80, r: 40 }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('price-chart', [priceTrace, maTrace], layout, config);
    console.log('✅ Time series chart rendered');
}

/**
 * Chart 2: Histogram of Daily Returns
 * Shows the distribution of daily percentage changes
 */
function renderHistogramChart() {
    const data = chartData.histogramData;

    const histogramTrace = {
        x: data.returns,
        type: 'histogram',
        name: 'Daily Returns',
        marker: {
            color: '#8b5cf6',
            line: {
                color: '#6d28d9',
                width: 1
            }
        },
        opacity: 0.75,
        nbinsx: 30,
        hovertemplate: '<b>Return Range:</b> %{x:.2f}%<br><b>Count:</b> %{y}<extra></extra>'
    };

    // Add vertical lines for mean and median
    const shapes = [
        {
            type: 'line',
            x0: data.mean,
            x1: data.mean,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: {
                color: '#ef4444',
                width: 2,
                dash: 'dash'
            }
        }
    ];

    const layout = {
        title: {
            text: 'Distribution of Daily Returns',
            font: { size: 18 }
        },
        xaxis: {
            title: 'Daily Return (%)',
            showgrid: true,
            gridcolor: '#e5e7eb',
            zeroline: true,
            zerolinecolor: '#9ca3af',
            zerolinewidth: 2
        },
        yaxis: {
            title: 'Frequency',
            showgrid: true,
            gridcolor: '#e5e7eb'
        },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        shapes: shapes,
        annotations: [
            {
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
            }
        ],
        margin: { t: 60, b: 60, l: 60, r: 40 }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('histogram-chart', [histogramTrace], layout, config);
    console.log('✅ Histogram chart rendered');
}

/**
 * Chart 3: Scatter Plot (Volume vs Price)
 * Explores the relationship between trading volume and price
 */
function renderScatterChart() {
    const data = chartData.scatterData;

    const scatterTrace = {
        x: data.volumes,
        y: data.prices,
        mode: 'markers',
        type: 'scatter',
        name: 'Volume vs Price',
        marker: {
            size: 8,
            color: data.prices,
            colorscale: 'Viridis',
            showscale: true,
            colorbar: {
                title: 'Price ($)',
                titleside: 'right'
            },
            line: {
                color: '#374151',
                width: 0.5
            }
        },
        text: data.dates,
        hovertemplate: '<b>Date:</b> %{text}<br><b>Volume:</b> $%{x:,.0f}<br><b>Price:</b> $%{y:,.2f}<extra></extra>'
    };

    const layout = {
        title: {
            text: 'Trading Volume vs Price',
            font: { size: 18 }
        },
        xaxis: {
            title: 'Trading Volume (USD)',
            showgrid: true,
            gridcolor: '#e5e7eb',
            tickformat: '$,.0s'
        },
        yaxis: {
            title: 'Price (USD)',
            showgrid: true,
            gridcolor: '#e5e7eb',
            tickformat: '$,.0f'
        },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff',
        hovermode: 'closest',
        margin: { t: 60, b: 60, l: 80, r: 100 }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('scatter-chart', [scatterTrace], layout, config);
    console.log('✅ Scatter chart rendered');
}

/**
 * Chart 4: Correlation Heatmap
 * Shows correlations between Price, Volume, and Market Cap
 */
function renderCorrelationHeatmap() {
    const data = chartData.correlationData;

    // Format correlation values for display
    const textValues = data.matrix.map(row =>
        row.map(val => val.toFixed(2))
    );

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
        textfont: {
            size: 14,
            color: '#000000'
        },
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
        title: {
            text: 'Correlation Matrix',
            font: { size: 18 }
        },
        xaxis: {
            title: '',
            side: 'bottom'
        },
        yaxis: {
            title: '',
            autorange: 'reversed'
        },
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
    console.log('✅ Heatmap chart rendered');
}

/**
 * Chart 5: Box Plot
 * Shows distribution with quartiles and outliers
 */
function renderBoxPlotChart() {
    const data = chartData.boxPlotData;

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
    console.log('✅ Box plot rendered');
}

/**
 * Chart 6: Violin Plot
 * Shows distribution density
 */
function renderViolinChart() {
    const data = chartData.violinData;

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
    console.log('✅ Violin plot rendered');
}

/**
 * Chart 7: Volume Area Chart
 * Shows volume over time as area chart
 */
function renderVolumeAreaChart() {
    const data = chartData.timeSeriesData;

    const trace = {
        x: data.dates,
        y: chartData.scatterData.volumes,
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
    console.log('✅ Volume area chart rendered');
}

/**
 * Chart 8: Scatter with Regression Line
 * Shows relationship with trend line
 */
function renderScatterRegressionChart() {
    const data = chartData.scatterRegressionData;

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
    console.log('✅ Scatter with regression rendered');
}

/**
 * Chart 9: Treemap
 * Shows hierarchical data
 */
function renderTreemapChart() {
    const data = chartData.treemapData;

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
    console.log('✅ Treemap rendered');
}

/**
 * Chart 10: Word Cloud (using bar chart to represent)
 * Shows frequency of price movements
 */
function renderWordCloudChart() {
    const data = chartData.wordCloudData;

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
        xaxis: {
            title: 'Movement Category',
            tickangle: -45
        },
        yaxis: { title: 'Number of Days' },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
    };

    const config = { responsive: true, displaylogo: false };
    Plotly.newPlot('wordcloud-chart', [trace], layout, config);
    console.log('✅ Word cloud chart rendered');
}

/**
 * Handle window resize to make charts responsive
 */
window.addEventListener('resize', function () {
    const chartIds = [
        'histogram-chart', 'boxplot-chart', 'violin-chart',
        'price-chart', 'volume-area-chart',
        'scatter-regression-chart', 'heatmap-chart',
        'treemap-chart', 'wordcloud-chart'
    ];

    chartIds.forEach(id => {
        if (document.getElementById(id)) {
            Plotly.Plots.resize(id);
        }
    });
});
