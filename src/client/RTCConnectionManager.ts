import { Socket } from "socket.io-client";
import { DownloadCandidateReq, RequesterCandidateRes, DownloadOfferReq, DownloadOfferRes, OwnerCandidateReq, OwnerCandidateRes, DownloadAnswerReq, DownloadAnswerRes } from "../shared/types";

let iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

interface RTCPeer {
  fileName: string;
  peerConnection: RTCPeerConnection;
}

interface DownloadPeer extends RTCPeer{
  owner: string;
}

interface UploadPeer extends RTCPeer{
  requester: string;
}

export default class RTCConnectionManager {
  downloadPeers:DownloadPeer[] = [];
  uploadPeers:UploadPeer[] = [];

  constructor(private socket: Socket){
    socket.on('requesterCandidate', this.handleRequesterCandidate);
    socket.on('ownerCandidate', this.handleOwnerCandidate)
    socket.on('downloadOffer', this.handleDownloadOffer)
    socket.on('downloadAnswer', this.handleDownloadAnswer);
  }

  private addOwnerPeerListeners = (rtcPeerConnection: RTCPeerConnection, fileName: string, requester: string) => {
    rtcPeerConnection.addEventListener('datachannel', (event) => {
      console.log("received event.channel :", event.channel);
      const dataChannel = event.channel;
      dataChannel.binaryType = 'arraybuffer';
      // TODO dataChannel 통해서 파일 보내기
      dataChannel.send('connected');
    })

    rtcPeerConnection.addEventListener('icecandidate', (event) => {
      console.log("icecandidtae event :", event)
      const { candidate } = event;
      if(candidate){
        const downloadCandidateReq: OwnerCandidateReq = {
          candidate,
          fileName,
          requester,
        }
        this.socket.emit('ownerCandidate', downloadCandidateReq);
      }
    });
  }

  private addRequesterPeerListeners = (rtcPeerConnection: RTCPeerConnection, fileName: string, owner: string) => {
    rtcPeerConnection.addEventListener('icecandidate', (event) => {
      console.log("icecandidtae event :", event)
      const { candidate } = event;
      if(candidate){
        const downloadCandidateReq: DownloadCandidateReq = {
          candidate: candidate,
          fileName: fileName,
          owner: owner,
        }
        this.socket.emit('requesterCandidate', downloadCandidateReq);
      }
    });
  }

  private createDataChanel = (peerConnection: RTCPeerConnection) => {
    const sendChannel = peerConnection.createDataChannel('sendDataChanel');
    sendChannel.binaryType = 'arraybuffer';
    console.log("Created send data channel");

    sendChannel.addEventListener('message', (event) => {
      // TODO 파일 메세지 모아서 파일로 저장하기
      console.log("dataChannel message ", event.data);
    })
    sendChannel.addEventListener('open', () => {
      console.log("dataChannel opened");
    })
    sendChannel.addEventListener('close', () => {
      console.log("dataChannel closed");
    })
    sendChannel.addEventListener('error', (error) => {
      console.log("dataChannel error ", error);
    })

    return sendChannel;
  }

  private getDownloadPeerConnection = (fileName: string, owner: string) => {
    const peer  = this.downloadPeers.find(downloadPeerConnection => downloadPeerConnection.fileName === fileName && downloadPeerConnection.owner === owner);
    if(peer && peer.peerConnection){
      return peer.peerConnection;
    }else{
      throw new Error("No download peerConnection")
    }
  }

  private getUploadPeerConnection = (fileName: string, requester: string) => {
    const peer  = this.uploadPeers.find(uploadPeerConnection => uploadPeerConnection.fileName === fileName && uploadPeerConnection.requester === requester);
    if(peer && peer.peerConnection){
      return peer.peerConnection;
    }else{
      throw new Error("No upload peerConnection")
    }
  }

  private handleDownloadAnswer = ({
    answer, 
    fileName, 
    owner
  }:DownloadAnswerRes) => {
    const peerConnection = this.getDownloadPeerConnection(fileName, owner);
    peerConnection.setRemoteDescription(answer);
  }

  private handleDownloadOffer = async ({
    fileName,
    requester,
    offer
  }:DownloadOfferRes) => {
    const rtcPeerConnection = new RTCPeerConnection(iceServers);
    this.uploadPeers.push({
      peerConnection: rtcPeerConnection,
      requester,
      fileName,
    });

    this.addOwnerPeerListeners(rtcPeerConnection, fileName, requester);

    rtcPeerConnection.setRemoteDescription(offer);
    const answer = await rtcPeerConnection.createAnswer();
    rtcPeerConnection.setLocalDescription(answer);

    const downloadAnswerReq: DownloadAnswerReq = {
      answer,
      fileName,
      requester,
    }
    this.socket.emit("downloadAnswer", downloadAnswerReq)
  }

  private handleOwnerCandidate = ({
    fileName,
    candidate,
    owner}: 
    OwnerCandidateRes) => {
    const peerConnection = this.getDownloadPeerConnection(fileName, owner);
    console.log("addIceCandidate");
    peerConnection.addIceCandidate(candidate);
  }

  private handleRequesterCandidate = ({
    candidate,
    fileName,
    requester 
  }: RequesterCandidateRes) => {
    const peerConnection = this.getUploadPeerConnection(fileName, requester);
    peerConnection.addIceCandidate(candidate);
  }

  async downloadFile(owner: string, fileName: string){
    const rtcPeerConnection = new RTCPeerConnection(iceServers);
    this.downloadPeers.push({
      peerConnection: rtcPeerConnection,
      owner,
      fileName,
    });

    this.addRequesterPeerListeners(rtcPeerConnection, fileName, owner);
    this.createDataChanel(rtcPeerConnection);

    const offer = await rtcPeerConnection.createOffer();
    rtcPeerConnection.setLocalDescription(offer);

    const downloadOfferRes: DownloadOfferReq = {
      fileName,
      owner,
      offer,
    }
    this.socket.emit('downloadOffer', downloadOfferRes);
  }
}