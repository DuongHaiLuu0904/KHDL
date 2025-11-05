# 📊 Cryptocurrency Analysis Dashboard

A comprehensive web-based cryptocurrency analysis dashboard that provides advanced data analytics and interactive visualizations for cryptocurrency market data.

## 🚀 Features

- **Real-time Data**: Fetches live cryptocurrency data from CoinGecko API
- **Advanced Analytics**: Uses Danfo.js for data processing and feature engineering
- **Interactive Visualizations**: Multiple Plotly.js charts including:
  - Time series with 7-day moving average
  - Daily returns histogram
  - Volume vs Price scatter plot
  - Correlation heatmap
- **Top 10 Cryptocurrencies**: Select from the top coins by market cap
- **90-Day Historical Data**: Comprehensive historical analysis
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

- **Backend**: Node.js, Express
- **Templating Engine**: Pug
- **Data Source**: CoinGecko Public API
- **HTTP Client**: Axios
- **Data Processing**: Native JavaScript (Pandas-like operations)
- **Data Visualization**: Plotly.js
- **Styling**: Custom CSS

## 📁 Project Structure

```
/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── routes/
│   └── index.js          # Application routes
├── utils/
│   ├── cryptoApi.js      # CoinGecko API service
│   └── dataProcessor.js  # Data analysis with Danfo.js
├── views/
│   ├── layout.pug        # Base template
│   ├── index.pug         # Homepage
│   ├── dashboard.pug     # Dashboard page
│   └── error.pug         # Error page
├── public/
│   ├── js/
│   │   └── dashboard.js  # Client-side Plotly rendering
│   └── css/
│       └── style.css     # Styling
└── README.md
```

## 🔧 Installation

1. **Clone or download this project**

2. **Navigate to the project directory**
   ```bash
   cd crypto-analysis-dashboard
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your CoinGecko API key
   COINGECKO_API_KEY=your_api_key_here
   ```

## 🚀 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at: **http://localhost:3000**

## 📖 Usage

1. **Homepage**: Visit the homepage to see the top 10 cryptocurrencies
2. **Select a Coin**: Choose a cryptocurrency from the dropdown menu
3. **View Dashboard**: Click "Analyze" to view comprehensive analysis
4. **Explore Charts**: Interact with the visualizations:
   - Hover over data points for details
   - Zoom and pan on charts
   - Download charts as PNG images

## 📊 Data Processing Features

The dashboard uses **native JavaScript** to perform advanced data analysis:

- **Data Standardization**: Converts Unix timestamps to readable dates
- **Missing Data Handling**: Checks for and handles missing values
- **7-Day Moving Average**: Smooths price trends
- **Daily Returns**: Calculates percentage changes
- **Correlation Analysis**: Shows relationships between price, volume, and market cap
- **Statistical Summary**: Min, max, mean, and volatility metrics

## 🎨 Visualizations

1. **Time Series Chart**: Price trends with 7-day moving average
2. **Histogram**: Distribution of daily returns
3. **Scatter Plot**: Volume vs Price relationship
4. **Heatmap**: Correlation matrix for key metrics

## 🌐 API Information

This project uses the **CoinGecko API**:
- **Base URL**: `https://api.coingecko.com/api/v3`
- **API Key**: Required (get free key at [CoinGecko](https://www.coingecko.com/en/api))
- **Rate Limit**: 10-30 calls per minute (free tier)
- **Documentation**: [CoinGecko API Docs](https://www.coingecko.com/en/api)

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/crypto-dashboard)

### Quick Deploy Steps:

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/crypto-dashboard.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables:
     - `COINGECKO_API_KEY`
     - `COINGECKO_BASE_URL`
     - `MIN_REQUEST_INTERVAL`
   - Click Deploy

3. **Done!** Your app will be live at `https://your-project.vercel.app`

📖 **Detailed instructions**: See [DEPLOY.md](./DEPLOY.md)

## ⚠️ Important Notes

- The free CoinGecko API has rate limits. Avoid refreshing too frequently.
- Data is fetched in real-time, so performance depends on API response times.
- The app uses 90 days of historical data for analysis.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📝 License

MIT License

## 👨‍💻 Author

Expert Full-Stack NodeJS Developer

---

**Enjoy analyzing cryptocurrencies!** 🚀📈
