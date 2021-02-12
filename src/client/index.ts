const nameIpt = document.getElementById("nameIpt") as HTMLInputElement;
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const uploadBtn = document.getElementById("uploadBtn") as HTMLButtonElement;

uploadBtn.addEventListener("click", () => {
  const fileToUpload = fileInput.files && fileInput.files[0];
  if(fileToUpload){
    readFile(fileToUpload, (blob) => {
      console.log("readed blob :", blob)
    })
  }else{
    console.error("No file input to upload");
  }
})


function readFile(file:File, onGetChunk: (blob: ArrayBuffer) => void){
  const chunkSize = 16384;
  const fileReader = new FileReader();
  let offset = 0;
  fileReader.addEventListener('load', event => {
    if(event && event.target && event.target.result instanceof ArrayBuffer){
      onGetChunk(event.target.result);
      offset += event.target.result.byteLength;
      if (offset < file.size) {
        readSlicedBlob(offset)
      }
    }
  });
  readSlicedBlob(0);

  function readSlicedBlob(offset:number){
    const slicedBlob = getSliceBlob(offset);
    fileReader.readAsArrayBuffer(slicedBlob);
  }

  function getSliceBlob(offset:number){
    return file.slice(offset, offset + chunkSize);
  }
}