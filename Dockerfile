FROM node:26

RUN npm install --global pnpm@12.14.0

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/addon/package.json ./packages/addon/

# The sources are not copied yet, so skip the addon build that the install starts.
RUN pnpm install --frozen-lockfile --ignore-scripts

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY . .

RUN pnpm generate-table

RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
