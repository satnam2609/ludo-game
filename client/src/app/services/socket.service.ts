import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private serverUrl = 'http://localhost:3000'; 

  constructor() {
    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
    });
  }

  // Connection events
  onConnect(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('connect', () => {
        console.log('Connected to server');
        observer.next();
      });
    });
  }

  onDisconnect(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        observer.next();
      });
    });
  }

  // Room events
  createRoom(): void {
    this.socket.emit('createRoom');
  }

  joinRoom(roomId: string): void {
    this.socket.emit('joinRoom', { roomId });
  }

  onRoomCreated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('roomCreated', (data) => {
        observer.next(data);
      });
    });
  }

  onRoomJoined(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('roomJoined', (data) => {
        observer.next(data);
      });
    });
  }

  onPlayerJoined(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('playerJoined', (data) => {
        observer.next(data);
      });
    });
  }

  onPlayerLeft(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('playerLeft', (data) => {
        observer.next(data);
      });
    });
  }

  // Game events
  rollDice(roomId: string): void {
    this.socket.emit('rollDice', { roomId });
  }

  onDiceRolled(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('diceRolled', (data) => {
        observer.next(data);
      });
    });
  }

  movePiece(roomId: string, piece: number): void {
    this.socket.emit('movePiece', { roomId, piece });
  }

  onPieceMoved(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('pieceMoved', (data) => {
        observer.next(data);
      });
    });
  }

  sendPieceMoving(roomId: string, player: string, piece: number, position: number): void {
    this.socket.emit('pieceMoving', { roomId, player, piece, position });
  }

  onPieceMoving(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('pieceMoving', (data) => {
        observer.next(data);
      });
    });
  }

  resetGame(roomId: string): void {
    this.socket.emit('resetGame', { roomId });
  }

  onGameReset(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('gameReset', (data) => {
        observer.next(data);
      });
    });
  }

  onGameOver(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('gameOver', (data) => {
        observer.next(data);
      });
    });
  }

  sendGameOver(roomId: string, winner: string): void {
    this.socket.emit('gameOver', { roomId, winner });
  }

  getRoomState(roomId: string): void {
    this.socket.emit('getRoomState', { roomId });
  }

  onRoomState(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('roomState', (data) => {
        observer.next(data);
      });
    });
  }

  onError(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('error', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}