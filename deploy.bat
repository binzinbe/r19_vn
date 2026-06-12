# Reverse:1999 Wiki - Git Setup Script
# Chạy script này trong terminal PowerShell

# Di chuyển vào thư mục project
cd "f:\R1999\WIKI_WEB"

# 1. Khởi tạo git repository
git init

# 2. Thêm remote (THAY USERNAME BẰNG TÀI KHOẢN GITHUB CỦA BẠN)
git remote add origin https://github.com/USERNAME/r19_vn.git

# 3. Tạo .gitignore để không đẩy file không cần thiết
@"
# Python
__pycache__/
*.pyc
*.rar
.env

# OS
.DS_Store
Thumbs.db
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# 4. Thêm files
git add .

# 5. Commit
git commit -m "Initial commit - Reverse:1999 Wiki"

# 6. Đổi tên branch thành main
git branch -M main

# 7. Push lên GitHub
# LƯU Ý: Lần đầu push sẽ hỏi login GitHub
git push -u origin main
