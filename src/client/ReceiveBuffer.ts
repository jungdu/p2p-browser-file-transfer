export default class ReceiveBuffer{
  buffer:any[] = [];

  constructor(){}

  push(data: any){
    this.buffer.push(data);
  }

  download(fileName: string){
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(new Blob(this.buffer));
    a.style.display = 'none';
    a.href = url
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}