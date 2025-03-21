FROM node:20-alpine
WORKDIR /usr/app/prod

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --no-frozen-lockfile
COPY . .

RUN pnpm run build
ENV NODE_ENV=production

CMD sh -c "pnpm run drizzle:migrate && pnpm run start"