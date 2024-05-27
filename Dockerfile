FROM node:18-alpine As node

FROM node As env

WORKDIR /app

COPY package*.json /app/

RUN npm ci --only=production

FROM node As build

ENV NODE_ENV build

WORKDIR /app

COPY . .
COPY --from=env /app/node_modules /app/node_modules

RUN npm run build && npm prune --production

FROM node As production

ENV NODE_ENV prod

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/.env.example ./.env.example
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
