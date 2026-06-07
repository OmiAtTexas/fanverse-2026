FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --filter @fanverse/api
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN pnpm build
EXPOSE 3001
CMD ["node", "dist/main.js"]
