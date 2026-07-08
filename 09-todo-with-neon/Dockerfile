FROM node:22-alpine AS builder

LABEL name="mustafatawab"
LABEL version="1.0"
LABEL description="this is just testing todo app with docker "

WORKDIR /app

# RUN  apt-get update &&  apt-get install -y &&  apt-get upgrade build-essential libpq-dev && rm -rf /var/lib/apt/lists/*
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*


COPY package*.json ./

COPY prisma ./prisma

RUN npm install

COPY . .

# RUN npx prisma generate

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder ./app/node_modules ./node_modules
COPY --from=builder ./app/prisma ./prisma
COPY --from=builder ./app/package*.json ./
COPY --from=builder ./app ./

EXPOSE 4000

CMD ["npm" , "start"]


