import {createServer} from "./chatServer";

createServer({
  port: process.env.PORT
}).then(({port}) => {
  console.log("listening on port ", port)
})