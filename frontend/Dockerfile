FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# Some production servers set NODE_ENV/NPM_CONFIG_PRODUCTION globally.
# The build stage still needs Vite and the other dev dependencies.
RUN npm ci --include=dev --no-audit --no-fund && test -x node_modules/.bin/vite
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
