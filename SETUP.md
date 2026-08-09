# Các bước sau khi paste files

## 1. Thêm biến môi trường

### packages/db/.env  (thêm 2 dòng này vào)
```
ADMIN_SEED_EMAIL=admin@autopartshachi.vn
ADMIN_SEED_PASSWORD=matkhau_cua_ban
```

### packages/api/.env  (tạo mới nếu chưa có)
```
API_PORT=3001
JWT_SECRET=<chạy lệnh dưới để sinh ra>
```

Lệnh sinh JWT_SECRET:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Chạy lần lượt

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 3. Kiểm tra

- `POST http://localhost:3001/api/admin/login` với `{ "email": "...", "password": "..." }` → trả `{ token }`
- `GET http://localhost:3001/api/admin/` không có token → `401`
- Vào `http://localhost:5173/admin` chưa login → redirect `/admin/login`
- Login thành công → vào được `/admin`, refresh vẫn giữ đăng nhập
