import { io, Socket } from "socket.io-client"
import { UploadFile } from "../shared/types"
import RTCConnectionManager from "./RTCConnectionManager";

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const registerFileBtn = document.getElementById("registerFileBtn") as HTMLButtonElement;
const uploadFileListTbody = document.getElementById("uploadFileListTbody") as HTMLElement;
const registeredFiles:File[] = [];

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
    registeredFiles.push(fileToUpload);
    getCurrentSocket().emit('registerUploadFile', fileToUpload.name);
  }
});

function connectSocket(){
  socket = io("http://localhost:4000");
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
      downloadTd.appendChild(downloadBtn);
      tr.appendChild(ownerTd);
      tr.appendChild(fileNameTd);
      tr.appendChild(downloadBtn);
      uploadFileListTbody.appendChild(tr);

      function handleClickDownloadBtn(){
        getCurrentSocket().emit('downloadFile', {
          owner: file.owner,
          fileName: file.fileName
        });
        getConnectionManager().downloadFile(file.owner, file.fileName);
      }
    })
  }
}

// uploadBtn.addEventListener("click", () => {
//   const fileToUpload = fileInput.files && fileInput.files[0];
//   if(fileToUpload){
//     readFile(fileToUpload, (blob) => {
//       console.log("readed blob :", blob)
//     })
//   }else{
//     console.error("No file input to upload");
//   }
// })

// function readFile(file:File, onGetChunk: (blob: ArrayBuffer) => void){
//   const chunkSize = 16384;
//   const fileReader = new FileReader();
//   let offset = 0;
//   fileReader.addEventListener('load', event => {
//     if(event && event.target && event.target.result instanceof ArrayBuffer){
//       onGetChunk(event.target.result);
//       offset += event.target.result.byteLength;
//       if (offset < file.size) {
//         readSlicedBlob(offset)
//       }
//     }
//   });
//   readSlicedBlob(0);

//   function readSlicedBlob(offset:number){
//     const slicedBlob = getSliceBlob(offset);
//     fileReader.readAsArrayBuffer(slicedBlob);
//   }

//   function getSliceBlob(offset:number){
//     return file.slice(offset, offset + chunkSize);
//   }
// }