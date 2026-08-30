FROM node:22-slim
WORKDIR /app
COPY package.json server.mjs ./
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.mjs"]
