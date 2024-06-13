FROM --platform=linux/amd64 node:18-alpine as create-build
ARG BUILD_ID
ARG IMAGE_NAME
ARG IMAGE_TAG

LABEL stage=create-build
LABEL image=$IMAGE_NAME-$IMAGE_TAG
LABEL build_id=$BUILD_ID

COPY . /build
WORKDIR /build
RUN npm ci --verbose && npm run build
RUN ls -la

FROM --platform=linux/amd64 node:18-alpine as production
ARG BUILD_ID
ARG IMAGE_NAME
ARG IMAGE_TAG

LABEL stage=build
LABEL image="$IMAGE_NAME-$IMAGE_TAG"
LABEL build_id=$BUILD_ID

COPY --chown=node:node --from=create-build /build/package.json /build/package-lock.json /build/dist /app/
COPY --chown=node:node --from=create-build /build/dist /app/dist
COPY --chown=node:node --from=create-build /build/.env.prod /app/.env
WORKDIR /app
RUN ls -la
RUN npm ci --production

USER node

EXPOSE 8080
CMD ["npm", "run", "start:prod"]