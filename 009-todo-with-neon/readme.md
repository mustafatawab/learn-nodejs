
*Build The Image*
`docker build -t node-todo:dev -f Dockerfile .`


*Run The Contianer with Volumn Mount*
`docker run -p 9000:9000 -v $(pwd):/code -v /code/node_modules --env-file .env node-todo:dev`