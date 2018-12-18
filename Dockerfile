# Build a Docker Image which already has NodeJS and is based on Alpine Linux
FROM node:8.14.0

# Note: Also not 100% on the Workdir and copy stuff...
WORKDIR /app
COPY . /app

# Install git and remove the package cache
#RUN apt-get update && apt-get install -y --no-install-recommends \
#    git \
#  && rm -rf /var/lib/apt/lists/*

# Install Version Pinned MeteorJS and use meteor to install NodeJS Dependencies.
RUN curl https://install.meteor.com/?release=1.6.1.1 | /bin/sh \
    && /usr/local/bin/meteor npm install

#RUN export PATH="$HOME/.meteor:$PATH"
EXPOSE 3000

#ENV env_var value

# Start the project /w npm
# CMD [ "npm", "start" ]
USER node

# Skip using the package.json commands so the exit codes don't get eaten by npm
CMD [ "meteor", "run", "--settings", "settings.json" ]
