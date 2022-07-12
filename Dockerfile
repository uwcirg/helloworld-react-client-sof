# TODO update to newer version: Active LTS or Current
FROM node:14

# TODO FIX
WORKDIR /opt

# cache hack; very fragile
# only copy files `npm` needs to run
# avoid build cache invalidation by changes in app code
COPY package.json package-lock.json ./
RUN npm install

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app

COPY . .

CMD ["npm", "start"]
