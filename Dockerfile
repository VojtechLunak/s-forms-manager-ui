# Use the official Node.js image as the base image
FROM node:18 as base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# DEPENDENCIES STAGE
# Install production and dev dependencies
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm install

# TEST STAGE
# run linters, setup and tests
FROM dependencies AS test
COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

# BUILD STAGE
# run NPM build
FROM test as build
RUN set -ex; npm run build

# RELEASE STAGE
# Only include the static files in the final image
FROM nginx:1.17.0-alpine

# Copy the react build from Build Stage
COPY --from=build /app/build /var/www

# Copy error page
COPY .docker/error.html /usr/share/nginx/html

# Copy our custom nginx config
COPY .docker/nginx.conf /etc/nginx/nginx.conf

# Copy our custom javascript config template
COPY .docker/config.js.template /etc/nginx/config.js.template

# from the outside.
EXPOSE 80

COPY .docker/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]