import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../ludo/socket.service';
import { Subscription } from 'rxjs';

interface RoomResponse {
  data: {
    id: string;
    players: string[];
    socketClients: Record<string, string>;
  };
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.css'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  roomCode = '';
  isConnecting = false;
  private subscription = new Subscription();
  private isCreating = false;

  constructor(
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if socket is connected
    if (!this.socketService.id) {
      console.log('Waiting for socket connection...');
      // Wait a bit for socket to connect
      setTimeout(() => {
        if (!this.socketService.id) {
          alert('Unable to connect to server. Please refresh the page.');
        }
      }, 3000);
    }

    // Listen for room created event (only for room creator)
    this.subscription.add(
      this.socketService.on<RoomResponse>('room-created').subscribe((response) => {
        console.log('Room created response:', response);
        if (this.isCreating && response.data.id) {
          this.socketService.currentRoomId = response.data.id;
          this.isConnecting = false;
          this.isCreating = false;
          this.router.navigate(['/ludo']);
        }
      })
    );

    // Listen for update event (for both creator and joiners)
    this.subscription.add(
      this.socketService.on<RoomResponse>('update').subscribe((response) => {
        console.log('Room update response:', response);
        // Only navigate if we're actively trying to join
        if (this.isConnecting && !this.isCreating && response.data.id) {
          // Verify this socket is in the room
          const socketId = this.socketService.id;
          if (socketId && response.data.socketClients[socketId]) {
            this.socketService.currentRoomId = response.data.id;
            this.isConnecting = false;
            this.router.navigate(['/ludo']);
          }
        }
      })
    );

    // Listen for errors
    this.subscription.add(
      this.socketService.on<{ message: string }>('error').subscribe((error) => {
        console.error('Error:', error);
        alert(error.message || 'An error occurred');
        this.isConnecting = false;
        this.isCreating = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createRoom(): void {
    if (!this.roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }

    if (!this.socketService.id) {
      alert('Socket not connected. Please wait and try again.');
      return;
    }

    if (this.isConnecting) {
      return; // Prevent multiple clicks
    }

    this.isConnecting = true;
    this.isCreating = true;
    console.log('Creating room with code:', this.roomCode);
    
    this.socketService.emit('create-room', {
      roomId: this.roomCode.trim(),
    });
  }

  joinRoom(): void {
    if (!this.roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }

    if (!this.socketService.id) {
      alert('Socket not connected. Please wait and try again.');
      return;
    }

    if (this.isConnecting) {
      return; // Prevent multiple clicks
    }

    this.isConnecting = true;
    this.isCreating = false;
    console.log('Joining room with code:', this.roomCode);
    
    this.socketService.emit('join-room', {
      roomId: this.roomCode.trim(),
    });
  }
}