import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../ludo/socket.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css'],
})
export class LobbyComponent {
  roomCode = '';

  constructor(private socketService: SocketService) {}

  createRoom() {
    this.socketService.emit('create-room', {
      roomCode: this.roomCode,
      playerId: this.socketService.id,
    });
  }

  joinRoom() {
    this.socketService.emit('join-room', {
      roomCode: this.roomCode,
      playerId: this.socketService.id,
    });
  }
}
