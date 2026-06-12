# Reverse: 1999 WIKI Web

## Deploy lên GitHub Pages

### Cách 1: Upload trực tiếp lên GitHub

1. **Tạo repository mới trên GitHub** (ví dụ: `wiki-web`)

2. **Push code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/wiki-web.git
   git push -u origin main
   ```

3. **Bật GitHub Pages:**
   - Vào **Settings** > **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **/ (root)**
   - Nhấn **Save**

4. **Chờ deploy** (khoảng 1-2 phút)
   - Website sẽ có địa chỉ: `https://USERNAME.github.io/wiki-web/`

### Cách 2: Sử dụng GitHub Desktop

1. Tải và cài đặt [GitHub Desktop](https://desktop.github.com/)
2. Tạo repository mới > Publish lên GitHub
3. Bật GitHub Pages trong Settings

### Lưu ý

- Website sử dụng **static hosting** - không có backend
- Dữ liệu nhân vật được load từ file `data/characters.json`
- Link nhân vật trỏ đến thư mục `data/html/`

## Cấu trúc thư mục

```
wiki-web/
├── index.html          # Trang chính
├── data/
│   ├── characters.json # Danh sách nhân vật
│   ├── filters.json    # Bộ lọc
│   └── html/           # Chi tiết từng nhân vật
├── image/
│   ├── afflatus/       # Icon afflatus
│   ├── char/           # Hình nhân vật
│   └── rarities/       # Icon rarity
└── static/
    └── js/
        └── main.js     # JavaScript
```
