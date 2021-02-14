export interface UploadFile {
  owner: string;
  fileName: string;
}

export interface UploadFileRequest{
  requester: string;
  fileName: string;
}

export interface DownloadCandidateReq{
  candidate: RTCIceCandidate;
  fileName: string;
  owner: string;
}

export interface RequesterCandidateRes{
  candidate: RTCIceCandidate;
  fileName: string;
  requester: string;
}

export interface OwnerCandidateReq{
  candidate: RTCIceCandidate;
  fileName: string;
  requester: string;
}

export interface OwnerCandidateRes{
  candidate: RTCIceCandidate;
  fileName: string;
  owner: string;
}
export interface DownloadOfferReq{
  fileName: string;
  owner: string;
  offer: RTCSessionDescriptionInit;
}

export interface DownloadOfferRes{
  fileName: string;
  requester: string;
  offer: RTCSessionDescriptionInit;
}

export interface DownloadAnswerReq{
  fileName: string;
  requester: string;
  answer: RTCSessionDescriptionInit;
}

export interface DownloadAnswerRes{
  fileName: string;
  owner: string;
  answer: RTCSessionDescriptionInit; 
}