import { Component } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-lobby',
  imports:[FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  playerName = '';
  roomId = '';
  router= new Router();
  myPlayerId = Math.random().toString(36).slice(2, 8); // simple random id

  constructor(private socketService: SocketService) {
    // this.socketService.connect();
  }

  createRoom() {
    // const player = { id: this.myPlayerId, name: this.playerName };
    // this.socketService.emit('createRoom', player);
    // this.socketService.on(`roomCreated${player.id}`).subscribe((room:any) => {
    //   console.log('Room created', room);
    //   // navigate to room / board component
    //   this.router.navigate(['/room',room.id]);
    // });
  }

  joinRoom() {
    // const player = { id: this.myPlayerId, name: this.playerName };
    // this.socketService.emit('joinRoom', { roomId: this.roomId, player });
    // this.socketService.on(`roomJoined${player.id}`).subscribe((room:any) => {
    //   console.log('Joined room', room);
    //   this.router.navigate(['/room',room.id]);
    // });
  }
}
