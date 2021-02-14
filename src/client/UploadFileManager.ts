const chunkSize = 16384;

class UploadFileManager{
  files:Map<string, File> = new Map();

  setFile(file: File){
    this.files.set(file.name, file);
  }

  getFile = (fileName: string) => {
    const file = this.files.get(fileName)
    if(file){
      return file;
    }else{
      throw new Error("No file to return");
    }
  }

  readFile = (fileName: string, callback: {
    onData: (data: ArrayBuffer) => void;
    onFinish: () => void;
  }) => {
    const file = this.getFile(fileName);
    const fileReader = new FileReader();
    let offset = 0;
    
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
    fileReader.addEventListener('load', event => {
      if(event && event.target && event.target.result instanceof ArrayBuffer){
        callback.onData(event.target.result);
        offset += event.target.result.byteLength;
        if (offset < file.size) {
          readSlicedBlob(offset)
        }else{
          callback.onFinish();
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
}

export const uploadFileManager = new UploadFileManager();