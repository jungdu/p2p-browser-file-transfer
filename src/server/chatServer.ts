import socketIo, { Socket } from "socket.io"
import express from "express";
import path from "path"
import http from "http"

import uploadFileManager from "./uploadFileManager";
import { UploadFile } from "../shared/types";

interface CreateServerConfig {
  port: number;
}

const publicFolderPath = path.resolve(__dirname, '../../public');

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
    socket.join('publicRoom')
    socket.on('registerUploadFile', (fileName: string) => {
      console.log("registerUploadFile fileName : ", fileName);
      uploadFileManager.registerFile({fileName, owner: socket.id});
      emitUploadFileList();
    });

    socket.on('getUploadFileList', () => {
      console.log("getUploadFileList");
      emitUploadFileList();
    });

    socket.on('downloadFile', (uploadFile:UploadFile) => {
      console.log("downloadFile", uploadFile);
      socket.to(uploadFile.owner).emit('uploadFile', {
        fileName: uploadFile.fileName,
        requester: socket.id,
      });
    });

    function emitUploadFileList(){
      socketServer.to('publicRoom').emit('getUploadFileList', uploadFileManager.getFiles());
    }
  })
}