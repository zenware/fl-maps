# Build a Docker Image which already has NodeJS and is based on Alpine Linux
FROM node:8.14.0

# Upgrade meteor release to 1.8 as soon as possible
ENV BUILD_DEPS="apt-utils bsdtar gnupg gosu wget curl bzip2 build-essential python git ca-certificates" \
    METEOR_RELEASE=1.6.0.1 \
    NODE_ENV=development \
    SRC_PATH=./

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global \
    PATH=$PATH:/home/node/.npm-global/bin:/home/node/.meteor

COPY ${SRC_PATH} /home/node/app
#USER node
#WORKDIR /home/node/app
#ADD ./build/fl-maps.tar.gz $HOME/app
# Install Version Pinned MeteorJS and use meteor to install NodeJS Dependencies.
# 1.8.0.1
RUN \
    set -o xtrace && \
    # OS Dependencies
    apt-get update -y && apt-get install -y --no-install-recommends ${BUILD_DEPS} && \
    \
    # Meteor installer doesn't work with the default tar binary, so using bsdtar while installing.
    # https://github.com/coreos/bugs/issues/1095#issuecomment-350574389
    cp $(which tar) $(which tar)~ && \
    ln -sf $(which bsdtar) $(which tar) && \
    \
    # Install Meteor
    cd /home/node && \
    chown node:node /home/node && \
    curl "https://install.meteor.com/?release=${METEOR_RELEASE}" -o /home/node/install_meteor.sh && \
    \
    #  Install Meteor forcing its progress
    sed -i 's/VERBOSITY="--silent"/VERBOSITY="--progress-bar"/' ./install_meteor.sh && \
    echo "Starting meteor ${METEOR_RELEASE} installation...   \n" && \
    chown node:node /home/node/install_meteor.sh && \
    gosu node:node sh /home/node/install_meteor.sh; \
    chown node:node --recursive /home/node && \
    cd /home/node/.meteor && \
    gosu node:node /home/node/.meteor/meteor -- help; \
    \
    # Build App
    cd /home/node/app && \
    gosu node:node /home/node/.meteor/meteor npm install && \
    gosu node:node /home/node/.meteor/meteor build --directory /home/node/app_build && \
    cd /home/node/app_build/bundle/programs/server/ && \
    gosu node:node npm install && \
    mv /home/node/app_build/bundle /build && \
    \
    # Put back the original tar
    mv $(which tar)~ $(which tar) && \
    \
    # Cleanup
    apt-get remove --purge -y ${BUILD_DEPS} && \
    apt-get autoremove -y && \
    rm -R /var/lib/apt/lists/* && \
    rm -R /home/node/.meteor && \
    rm -R /home/node/app && \
    rm -R /home/node/app_build && \
    rm /home/node/install_meteor.sh



#RUN export PATH="$HOME/.meteor:$PATH"
ENV PORT=3000
EXPOSE $PORT

# Start the project /w npm
# CMD [ "npm", "start" ]

# Skip using the package.json commands so the exit codes don't get eaten by npm
# What are the commands to run a nodejs app built from meteor.
USER node
CMD [ "node", "/build/main.js" ]
