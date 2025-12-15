# Gunakan image Node.js versi 20 dengan Alpine (ringan)
FROM node:20-alpine

# Buat dan set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install semua dependencies (termasuk devDependencies untuk build)
RUN npm ci

# Salin seluruh kode aplikasi
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Port yang akan digunakan
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]
