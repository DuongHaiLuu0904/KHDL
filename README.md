# 📊 Cryptocurrency Analysis Dashboard - Pure Frontend

Phiên bản frontend thuần (Pure HTML, CSS, JavaScript) của dashboard phân tích cryptocurrency với visualization tương tác.

## 🌟 Tính Năng

- **Real-time Data**: Lấy dữ liệu trực tiếp từ CoinGecko API
- **9 Loại Biểu Đồ Tương Tác**: 
  - Time Series với Moving Average (7 ngày)
  - Histogram phân phối returns
  - Box Plot & Violin Plot
  - Scatter Plot với Regression Line
  - Correlation Heatmap
  - Treemap & Word Cloud
- **Top 10 Cryptocurrencies**: Chọn từ top 10 coin theo market cap
- **90 Ngày Dữ Liệu**: Phân tích historical data 90 ngày
- **Responsive Design**: Hoạt động tốt trên desktop và mobile
- **Không Cần Backend**: Chạy hoàn toàn trên browser

## 🛠️ Công Nghệ Sử Dụng

- **HTML5**: Structure thuần
- **CSS3**: Styling với CSS Variables và Flexbox/Grid
- **JavaScript (ES6+)**: Logic xử lý data và render charts
- **Plotly.js**: Thư viện visualization (CDN)
- **CoinGecko API**: Nguồn dữ liệu cryptocurrency (Free tier)

## 📁 Cấu Trúc Dự Án

```
KHDL/
├── index.html              # Trang chủ - chọn cryptocurrency
├── dashboard.html          # Trang dashboard với charts
├── css/
│   └── style.css          # CSS thuần - không framework
├── js/
│   ├── main.js            # Logic cho trang chủ
│   └── dashboard.js       # Logic cho dashboard + charts
└── README.md              # File này
```

## 🚀 Cách Sử Dụng

### Phương Pháp 1: Mở Trực Tiếp File HTML

1. **Mở file `index.html`** bằng trình duyệt web (Chrome, Firefox, Edge, Safari)
   - Cách 1: Double-click vào file `index.html`
   - Cách 2: Kéo thả file vào cửa sổ browser

2. **Chọn cryptocurrency** từ dropdown menu (Top 10 coins)

3. **Click "📈 Analyze"** để xem dashboard với 9 biểu đồ phân tích

### Phương Pháp 2: Sử Dụng Local Server (Khuyến Nghị)

Để tránh vấn đề CORS và tối ưu performance, nên chạy local server:

#### Dùng Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Dùng Node.js (Live Server):
```bash
# Cài đặt live-server global
npm install -g live-server

# Chạy server
live-server
```

#### Dùng VS Code:
- Cài extension "Live Server"
- Right-click vào `index.html` → "Open with Live Server"

Sau đó truy cập: **http://localhost:8000**

## 📊 Các Biểu Đồ Phân Tích

### Tab 1: Distribution Analysis
1. **Histogram** - Phân phối daily returns
2. **Box Plot** - Returns & Price changes với outliers
3. **Violin Plot** - So sánh ngày tăng vs ngày giảm

### Tab 2: Time Series
4. **Line Chart** - Giá theo thời gian + MA 7 ngày
5. **Area Chart** - Volume giao dịch

### Tab 3: Relationships
6. **Scatter + Regression** - Volume vs Price với R²
7. **Correlation Heatmap** - Tương quan Price/Volume/Market Cap

### Tab 4: Advanced
8. **Treemap** - Phân bổ volume theo quý
9. **Word Cloud** - Tần suất thay đổi giá

## 🔧 Tùy Chỉnh

### Thay Đổi Số Lượng Coins
Trong `js/main.js`, dòng 30:
```javascript
const response = await fetch(`${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
```
Thay `per_page=10` thành số khác (vd: 20, 50)

### Thay Đổi Thời Gian Phân Tích
Trong `js/dashboard.js`, dòng 103:
```javascript
const response = await fetch(`${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=90&interval=daily`);
```
Thay `days=90` thành số ngày khác (7, 30, 180, 365)

### Thay Đổi Màu Sắc
Trong `css/style.css`, dòng 12-19:
```css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #8b5cf6;
    /* Thay đổi màu theo ý muốn */
}
```

## 🎯 So Sánh Với Phiên Bản Cũ

| Tính năng | Phiên bản cũ (Backend) | Phiên bản mới (Pure Frontend) |
|-----------|------------------------|-------------------------------|
| Backend Server | ✅ Node.js + Express | ❌ Không cần |
| Template Engine | ✅ Pug | ❌ HTML thuần |
| Dependencies | ✅ npm packages | ❌ Chỉ Plotly.js CDN |
| Deployment | Cần hosting Node.js | Chỉ cần static hosting |
| Setup | Phức tạp (npm install) | Đơn giản (mở file) |
| Performance | Server-side processing | Client-side processing |

## ⚡ Ưu Điểm

✅ **Đơn Giản**: Không cần cài đặt dependencies  
✅ **Portable**: Chạy ở bất kỳ đâu có browser  
✅ **Deploy Dễ**: Host trên GitHub Pages, Netlify, Vercel miễn phí  
✅ **Học Tập**: Code rõ ràng, dễ hiểu cho beginners  
✅ **Lightweight**: Không có node_modules nặng nề  

## 🚨 Lưu Ý

- **API Rate Limit**: CoinGecko free tier có giới hạn 10-50 requests/phút
- **CORS**: Một số browser có thể block API calls khi mở file:// trực tiếp → Dùng local server
- **Internet Required**: Cần kết nối internet để gọi CoinGecko API và load Plotly.js
- **Browser Support**: Yêu cầu browser hiện đại (Chrome 90+, Firefox 88+, Safari 14+)

## 📱 Responsive Design

Dashboard hoạt động tốt trên:
- 💻 Desktop (1920x1080 và nhỏ hơn)
- 📱 Tablet (768px - 1024px)
- 📱 Mobile (320px - 767px)

## 🆓 Deploy Miễn Phí

### GitHub Pages
```bash
git add .
git commit -m "Deploy crypto dashboard"
git push origin master
```
Settings → Pages → Source: master branch

### Netlify
- Kéo thả folder vào netlify.com/drop
- Hoặc connect GitHub repo

### Vercel
```bash
npm i -g vercel
vercel
```

## 🤝 Đóng Góp

Contributions, issues và feature requests đều welcome!

## 📝 License

MIT License - Sử dụng tự do cho mục đích học tập và thương mại

## 👨‍💻 Tác Giả

Created with ❤️ for learning and education

---

**Data provided by [CoinGecko API](https://www.coingecko.com/en/api)**

**Visualization powered by [Plotly.js](https://plotly.com/javascript/)**
