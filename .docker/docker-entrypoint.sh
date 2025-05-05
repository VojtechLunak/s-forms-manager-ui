#!/usr/bin/env sh
set -eu

envsubst '${REACT_APP_BACKEND_API_URL} ${REACT_APP_PORT} ${REACT_APP_BASENAME}' < /etc/nginx/config.js.template > /var/www/config.js

exec "$@"