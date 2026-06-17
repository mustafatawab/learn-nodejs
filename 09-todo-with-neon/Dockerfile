FROM node:22-alpine

LABEL name="mustafatawab"

WORKDIR /code

COPY . .

RUN npm install --legacy-peer-deps

EXPOSE 9000

CMD ["npm", "run" , "dev"]