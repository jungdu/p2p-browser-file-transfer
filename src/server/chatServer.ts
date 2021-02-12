import socketIo, { Socket } from "socket.io"
import express from "express";
import path from "path"
import http from "http"

interface CreateServerConfig {
  port: number;
}

const publicFolderPath = path.resolve(__dirname, '../public');

export type HttpServer = http.Server;
export type SocketServer = socketIo.Server;

export function createServer({
  port
}:CreateServerConfig = {
  port: 4000,
}){
  return new Promise<{
    httpServer: http.Server,
    socketServer: socketIo.Server,
    port: number,
  }>(resolve => {
      const app = express();
      const server = app.listen(port, handleListen);
      app.use(express.static(publicFolderPath));
      const ioServer = createSocketServer(server);
      function handleListen(){
        resolve({
          socketServer: ioServer,
          httpServer: server,
          port
        })
      }
    }
  )
}

function createSocketServer(server: http.Server){
  const ioServer = new socketIo.Server(server);
  addSocketListener(ioServer);
  return ioServer;
}

function addSocketListener(socketServer: socketIo.Server){
  socketServer.on('connection', (socket:Socket) => {
    console.log("A socket connected");
  })
}