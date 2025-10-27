import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LudoService } from './ludo.service';
// import { Player } from '../../../common/constants';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class LudoGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private ludoService: LudoService) {}

  @SubscribeMessage('create-room')
  async handlePlay(
    @ConnectedSocket() client: Socket,
    data: {
      roomId: string;
    },
  ) {
    const { roomId } = data;
    const room = this.ludoService.createRoom(client.id, roomId);
    await client.join(roomId);
    client.in(roomId).emit('room-created', {
      data: room,
    });

    client.in(roomId).emit('update', {
      data: room,
    });
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
    },
  ) {
    const { roomId } = data;
    const room = this.ludoService.joinRoom(client.id, roomId);
    if (room) {
      await client.join(roomId);
      client.in(roomId).emit('update', {
        data: room,
      });

      client.in(roomId).emit('update', {
        data: room,
      });
    }
  }

  @SubscribeMessage('roll-dice')
  handleRollDice(
    @ConnectedSocket() client: Socket,
    data: {
      roomId: string;
    },
  ) {
    this.ludoService.rollDice(data.roomId);
    const room = this.ludoService.getRoom(data.roomId);
    client.in(data.roomId).emit('update', room);
  }

  @SubscribeMessage('piece-click')
  handlePieceClick(
    @ConnectedSocket() client: Socket,
    data: {
      piece: number;
      roomId: string;
    },
  ) {
    const room = this.ludoService.getRoom(data.roomId);
    if (room) {
      const player = room.socketClients[client.id];
      this.ludoService.handlePieceClick(room, player, data.piece);
      client.in(data.roomId).emit('update', room);
    }
  }
}
