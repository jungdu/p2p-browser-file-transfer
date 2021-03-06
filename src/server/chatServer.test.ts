import {createServer} from "./chatServer"
import socketIO from "socket.io";
import http from "http"
import { io as clientIo } from "socket.io-client";

import type { UploadFile } from "../shared/types";

const PORT_NUMBER = 5000
describe('채팅 서버 테스트', () => {
  let httpServer:http.Server, socketServer:socketIO.Server;

  beforeEach((done) => {
    initServer(done);
  })

  afterEach((done) => {
    closeServer(done)
  })

  it('소켓 연결 잘 됨', (done) => {
    const client = connectClient();
    expect(client).toBeTruthy();
    done()
  })

  it('파일 리스트에 파일 등록하기', (done) => {
    const testFileName = "testFile"
    const client = connectClient();
    client.on('getUploadFileList', (fileList: UploadFile[]) => {
      expect(fileList).toBeTruthy();
      expect(fileList.length).toBe(1);
      expect(fileList[0].fileName).toBe(testFileName);
      expect(fileList[0].owner).toBe(client.id);
      done();
    })
    client.emit('registerUploadFile', testFileName);
  });

  function connectClient(){
    return clientIo(`http://localhost:${PORT_NUMBER}`)
  }

  function initServer(done: jest.DoneCallback){
    createServer({port: PORT_NUMBER}).then(({httpServer: newHttpServer, socketServer: newSocketServer}) =>{
      httpServer = newHttpServer;
      socketServer = newSocketServer;
      done();
    });
  }

  function closeServer(done: jest.DoneCallback){
    httpServer.close();
    socketServer.close();
    done();
  }
})