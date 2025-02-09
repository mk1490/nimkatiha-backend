FROM node:20.10.0
WORKDIR /backend
COPY package*.json ./
#RUN yarn config set registry https://npm.iranrepo.ir/
RUN yarn --verbose
COPY . .
RUN npx prisma generate skipcache
RUN ["yarn", "build"]
EXPOSE 3000
CMD [ "node", "dist/main.js" ]
