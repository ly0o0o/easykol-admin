# 构建阶段
FROM node:18-alpine as builder
WORKDIR /app

# 设置 npm 镜像源和缓存目录
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set cache /app/.npm-cache --global

# 首先只复制 package.json 文件以利用缓存
COPY package*.json ./

# 使用 npm ci 而不是 npm install，并清理缓存
RUN npm ci --legacy-peer-deps \
    && npm cache clean --force

# 复制其他源代码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 