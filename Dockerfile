FROM node:8

WORKDIR /usr/src/app

ADD ./index.js ./tsconfig.json ./jsconfig.json ./package.json /usr/src/app/

# --registry=https://registry.npm.taobao.org
RUN npm install

ADD ./src /usr/src/app/src
ADD ./config /usr/src/app/config

RUN npm run tsc && \
    rm -rf node_modules && \
    npm install --production && \
    npm install cross-env tsconfig-paths --save-dev && \
    npm install pm2 --global && \
    npm cache clean -f

CMD pm2 start index.js --node-args="-r tsconfig-paths/register" -i 0 --no-daemon
# CMD [ "npm", "run", "start:prod" ]

EXPOSE 9000
