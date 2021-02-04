import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Server, NewServer, Invite, Update, ServerRequest } from '../models/server';
import { Channel } from '../models/channel';
import { NewMessage } from '../models/message';

const formOptions = {
  headers: new HttpHeaders({
    'accept': 'application/json',
  }), credentials: 'same-origin',
  withCredentials: true
};

const jsonOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'accept': 'application/json',
  }), credentials: 'same-origin',
  withCredentials: true
};

const SERVER_URL = environment.BaseApiUrl + "/server";
const JOIN_SERVER_URL = environment.BaseApiUrl + "/join-server";
const POSTS_URL = environment.BaseApiUrl + "/posts";
const CHANNEL_URL = environment.BaseApiUrl + "/channel";

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  socket!: WebSocket;

  private updateSource = new Subject<Update>();
  update$ = this.updateSource.asObservable();

  constructor(private http: HttpClient) { }

  // return new Observable((observer: Observer<ConnectResponse>) => {

  connect(serverID: number) {
    this.socket = new WebSocket('ws://localhost:8080/ws');
    // this.socket.addEventListener('open', () => { });

    this.socket.addEventListener('message', (event) => {
      let update = JSON.parse(event.data);
      this.updateSource.next(update);
    });

  }

  disconnect() {
    this.socket.close();
  }

  getServers(): Observable<Server[]> {
    return this.http.get<Server[]>(SERVER_URL, formOptions);
  }

  createServer(file: File, server: NewServer): Observable<Server> {
    const formData = new FormData();
    if (file) {
      formData.append("image", file, file.name);
    }
    formData.append("server", JSON.stringify(server));

    return this.http.post<Server>(SERVER_URL, formData, formOptions);
  }

  addChannel(serverRequest: ServerRequest): Observable<Channel> {
    return this.http.post<Channel>(CHANNEL_URL, serverRequest, formOptions);
  }

  deleteServer(serverID: number): Observable<Server> {
    return this.http.delete<Server>(SERVER_URL + "?serverID=" + serverID, jsonOptions);
  }

  joinServer(invite: Invite): Observable<Server> {
    return this.http.post<Server>(JOIN_SERVER_URL, invite);
  }

  post(message: NewMessage) {
    this.http.post(POSTS_URL, message, jsonOptions).subscribe();
  }
}
