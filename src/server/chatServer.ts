import socketIo, { Socket } from "socket.io"
import express from "express";
import http from "http"

import uploadFileList from "./uploadFileList";
import { DownloadCandidateReq, RequesterCandidateRes, DownloadOfferReq, DownloadOfferRes, OwnerCandidateReq, OwnerCandidateRes, DownloadAnswerReq, DownloadAnswerRes } from "../shared/types";

interface CreateServerConfig {
  port: number;
}

const publicFolderPath = 'public'

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

    socket.on('disconnect', () => {
      uploadFileList.deleteFiles(socket.id);
      emitUploadFileList();
    })

    socket.on('registerUploadFile', (fileName: string) => {
      console.log("registerUploadFile fileName : ", fileName);
      uploadFileList.registerFile({fileName, owner: socket.id});
      emitUploadFileList();
    });

    socket.on('getUploadFileList', () => {
      console.log("getUploadFileList");
      emitUploadFileList();
    });

    socket.on('requesterCandidate', ({
      candidate,
      fileName,
      owner,
    }:DownloadCandidateReq) =>{
      console.log("requesterCandidate");
      const data: RequesterCandidateRes = {
        candidate,
        fileName,
        requester: socket.id
      }
      socket.to(owner).emit("requesterCandidate", data)
    })

    socket.on('downloadOffer', ({
      fileName,
      owner,
      offer
    }: DownloadOfferReq) =>{
      console.log("downloadOffer")
      const downloadOfferRes: DownloadOfferRes = {
        fileName,
        offer,
        requester: socket.id,
      }
      socket.to(owner).emit('downloadOffer', downloadOfferRes)
    });

    socket.on('downloadAnswer', ({answer, fileName, requester}: DownloadAnswerReq) => {
      const downloadAnswerRes:DownloadAnswerRes = {
        answer,
        owner: socket.id,
        fileName
      }
      socket.to(requester).emit('downloadAnswer', downloadAnswerRes)
    });

    socket.on('ownerCandidate', ({
      candidate,
      fileName,
      requester
    }: OwnerCandidateReq) => {
      console.log("ownerCandidate");
      const ownerCandidateRes:OwnerCandidateRes = {
        candidate,
        fileName,
        owner: socket.id
      }
      socket.to(requester).emit('ownerCandidate', ownerCandidateRes);
    })

    function emitUploadFileList(){
      socketServer.to('publicRoom').emit('getUploadFileList', uploadFileList.getFiles());
    }
  })
}