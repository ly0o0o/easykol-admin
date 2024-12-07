# 构建阶段
FROM node:18-alpine as builder
WORKDIR /app

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 