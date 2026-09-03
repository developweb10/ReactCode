FROM node:14

WORKDIR /usr/local/apps/hrs-frontend

ADD . /usr/local/apps/hrs-frontend/

RUN yarn
RUN yarn build
