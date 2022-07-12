# TODO update to newer version: Active LTS or Current
FROM node:14
USER node

# cache hack (very fragile): initially only copy list of project dependencies
COPY --chown=node:node package.json package-lock.json /opt/node/

# install node dependencies to parent directory of code
WORKDIR /opt/node
RUN npm install

# add node modules binary folder to system PATH
ENV PATH=/opt/node/node_modules/.bin/:$PATH

# copy source code, switch to code directory
COPY --chown=node:node . /opt/node/app
WORKDIR /opt/node/app

# create-react-app does not support relative imports (see issues/2)
CMD ln --symbolic --force /opt/node/node_modules && npm start
