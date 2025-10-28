import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private _currentRoomId: string | null = null;

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  get id() {   
    return this.socket.id;
  }

  get currentRoomId() {
    return this._currentRoomId;
  }

  set currentRoomId(roomId: string | null) {
    this._currentRoomId = roomId;
  }

  emit(event: string, data: any): void {
    console.log('Emitting event:', event, data);
    this.socket.emit(event, data);
  }

  on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      this.socket.on(event, (data: T) => {
        console.log('Received event:', event, data);
        observer.next(data);
      });

      return () => {
        this.socket.off(event);
      };
    });
  }

  off(event: string): void {
    this.socket.off(event);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}