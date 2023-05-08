FROM node:18-alpine AS node_builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --silent
COPY . .

FROM node:18-alpine
WORKDIR /app
COPY --from=node_builder /app/node_modules ./node_modules
COPY --from=node_builder /app/package.json /app/yarn.lock ./
COPY --from=node_builder /app/src ./src

USER node

CMD ["--env", "production"]