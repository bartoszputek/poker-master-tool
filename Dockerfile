FROM node:26 AS build

RUN npm install --global pnpm@12.14.0

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/addon/package.json ./packages/addon/

# The sources are not copied yet, so skip the addon build that the install starts.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm generate-table && pnpm build

# Copy the backend with only its production dependencies and the built addon.
RUN pnpm --filter @poker-master-tool/backend deploy --prod /deploy/backend

FROM node:26-slim

WORKDIR /app

COPY --from=build /deploy/backend ./
COPY --from=build /usr/src/app/apps/frontend/build ./public

ENV NODE_ENV=production
ENV STATIC_DIRECTORY=/app/public

EXPOSE 3000
CMD ["node", "dist/index.js"]
