import {createServer} from "./chatServer";

createServer({port: 80}).then(({port}) => {
  console.log("listening on port ", port)
})