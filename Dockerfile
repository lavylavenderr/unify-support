FROM node:20-alpine
WORKDIR /usr/app/prod

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --no-frozen-lockfile
COPY . .

RUN pnpm run build
ENTRYPOINT ["pnpm", "run", "start"]