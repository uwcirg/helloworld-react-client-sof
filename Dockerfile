# TODO update to newer version: Active LTS or Current
FROM node:14

# install node dependencies to parent directory of code
WORKDIR /opt

# cache hack; very fragile
# only copy files `npm` needs to run
# avoid build cache invalidation by changes in app code
COPY package.json package-lock.json ./
RUN npm install
# add node modules binary folder to system PATH
ENV PATH=/opt/node_modules/.bin/:$PATH

# switch back to code directory
WORKDIR /opt/app

COPY . .

# create-react-app does not support relative imports (see issues/2)
CMD ln -fs /opt/node_modules && npm start
