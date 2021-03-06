import { io, Socket } from "socket.io-client"
import { UploadFile } from "../shared/types"
import RTCConnectionManager from "./RTCConnectionManager";

import {uploadFileManager} from "./UploadFileManager"

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const registerFileBtn = document.getElementById("registerFileBtn") as HTMLButtonElement;
const uploadFileListTbody = document.getElementById("uploadFileListTbody") as HTMLElement;
const socketId = document.getElementById("socketId") as HTMLElement;

let socket:Socket | null = null;
let connectionManager:RTCConnectionManager| null = null;

connectSocket();

function getCurrentSocket(){
  if(socket){
    return socket;
  }else{
    throw new Error("No socket");
  }
}

function getConnectionManager(){
  if(connectionManager){
    return connectionManager;
  }else{
    throw new Error("No connection manager")
  }
}

registerFileBtn.addEventListener("click", () => {
  const fileToUpload = fileInput.files && fileInput.files[0];
  if(fileToUpload){
    if(!uploadFileManager.hasFile(fileToUpload.name)){
      uploadFileManager.setFile(fileToUpload);
      getCurrentSocket().emit('registerUploadFile', fileToUpload.name);
    }else{
      alert('이미 등록된 파일입니다.');
    }
  }
});

function connectSocket(){
  console.log("Connecting to Socket Server : ", process.env.SOCKET_URL)
  socket = io(process.env.SOCKET_URL as string);
  
  socket.on('connect', () => {
    socketId.innerText = getCurrentSocket().id;
  });

  connectionManager = new RTCConnectionManager(socket)
  socket.on('getUploadFileList', handleGetUploadFileList)
  socket.emit('getUploadFileList');
  function handleGetUploadFileList(files:UploadFile[]){
    console.log("handleGetUploadFileList");
    uploadFileListTbody.innerHTML = ""
    files.forEach((file) => {
      const tr = document.createElement('tr');
      const ownerTd = document.createElement('td');
      ownerTd.innerHTML = file.owner;
      const fileNameTd = document.createElement('td');
      fileNameTd.innerHTML = file.fileName;
      const downloadTd = document.createElement('td');
      const downloadBtn = document.createElement('button');
      downloadBtn.addEventListener('click', handleClickDownloadBtn);
      downloadBtn.innerText = "download";
      downloadBtn.disabled = file.owner === getCurrentSocket().id;
      downloadTd.appendChild(downloadBtn);
      tr.appendChild(ownerTd);
      tr.appendChild(fileNameTd);
      tr.appendChild(downloadBtn);
      uploadFileListTbody.appendChild(tr);

      function handleClickDownloadBtn(){
        downloadBtn.disabled = true;
        getCurrentSocket().emit('downloadFile', {
          owner: file.owner,
          fileName: file.fileName
        });
        getConnectionManager().downloadFile(file.owner, file.fileName);
      }
    })
  }
}