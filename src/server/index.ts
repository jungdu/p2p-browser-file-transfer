import {createServer} from "./chatServer";

createServer().then(({port}) => {
  console.log("listening on port ", port)
})