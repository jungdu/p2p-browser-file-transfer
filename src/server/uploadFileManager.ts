import {UploadFile} from "../shared/types"

class UploadFileManager {
  fileList:UploadFile[] = []

  deleteFiles(owner: string){
    this.fileList = this.fileList.filter((file) => {
      file.owner !== owner
    });
  }

  getFiles(){
    return this.fileList;
  }

  registerFile(fileName: UploadFile){
    this.fileList.push(fileName)
  }
}

export default new UploadFileManager();