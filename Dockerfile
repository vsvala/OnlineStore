# specify base image
FROM node:10

# set working directory 
WORKDIR /app

# copy files and install dependencies
COPY package.json package-lock.json /app/
RUN npm install
COPY . /app/

# build
RUN npm run build

# install serve to run the app   build
#RUN npm install -g serve

# RUN npm install

# start server
#CMD serve -s build -p 3000 
# start server
CMD  npm run start

# specify which port to expose
EXPOSE 3000