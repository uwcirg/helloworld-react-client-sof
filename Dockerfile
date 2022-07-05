# TODO update to newer version: Active LTS or Current
FROM node:14
WORKDIR /opt/app

# cache hack; very fragile
# only copy files `npm` needs to run
# avoid build cache invalidation by changes in app code
COPY package.json package-lock.json ./
RUN npm install


COPY . .

CMD ["npm", "start"]
