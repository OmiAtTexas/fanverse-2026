FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY apps/api/package.json ./
RUN pnpm install
COPY apps/api/ ./
RUN pnpm build
EXPOSE 3001
CMD ["node", "dist/main.js"]
