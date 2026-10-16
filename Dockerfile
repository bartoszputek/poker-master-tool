FROM node:26

RUN npm install --global pnpm@12.14.0

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# The sources are not copied yet, so skip the addon build that the install script starts.
RUN pnpm install --frozen-lockfile --ignore-scripts

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY . .

RUN pnpm addon:generate-table

RUN pnpm addon:configure

RUN pnpm addon:build

RUN pnpm build:frontend

RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
