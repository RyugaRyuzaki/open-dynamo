import {MediaConnection} from "peerjs";

export interface IRoomMember {
  userId: string;
  username: string;
  color: number;
  avatar?: string;
}
export interface IRoomParticipant {
  member: IRoomMember;
  stream?: MediaStream;
  call?: MediaConnection;
}

export type IControlNotify = "none" | "pending" | "accept" | "refuse";
export type IMemberStatus = "calling" | "busy";
