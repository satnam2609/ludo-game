import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BASE_POSITIONS, PlayerPositions, GameState, Player } from './constants';
import { SocketService } from './socket.service';

interface RoomUpdate {
  data: {
    id: string;
    socketClients: Record<string, Player>;
    players: Player[];
    diceValue: number;
    turn: number;
    state: GameState;
    eligiblePieces: number[];
    currentPositions: PlayerPositions;
    hasWon?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LudoService {
  private currentPositionsSubject = new BehaviorSubject<PlayerPositions>({
    P1: [...BASE_POSITIONS.P1],
    P2: [...BASE_POSITIONS.P2],
    P3: [...BASE_POSITIONS.P3],
    P4: [...BASE_POSITIONS.P4],
  });
  currentPositions$ = this.currentPositionsSubject.asObservable();

  private diceValueSubject = new BehaviorSubject<number>(0);
  diceValue$ = this.diceValueSubject.asObservable();

  private turnSubject = new BehaviorSubject<number>(0);
  turn$ = this.turnSubject.asObservable();

  private stateSubject = new BehaviorSubject<GameState>(GameState.DICE_NOT_ROLLED);
  state$ = this.stateSubject.asObservable();

  private eligiblePiecesSubject = new BehaviorSubject<number[]>([]);
  eligiblePieces$ = this.eligiblePiecesSubject.asObservable();

  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  private currentPlayerSubject = new BehaviorSubject<Player | null>(null);
  currentPlayer$ = this.currentPlayerSubject.asObservable();

  private hasWonSubject = new BehaviorSubject<string | undefined>(undefined);
  hasWon$ = this.hasWonSubject.asObservable();

  constructor(private socketService: SocketService) {
    console.log('Ludo Service initialized');
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socketService.on<RoomUpdate>('update').subscribe((response) => {
      console.log('Received update:', response);
      this.updateGameState(response.data);
    });

    this.socketService.on<RoomUpdate>('room-created').subscribe((response) => {
      console.log('Room created:', response);
      this.updateGameState(response.data);
    });

    this.socketService.on<RoomUpdate>('room-joined').subscribe((response) => {
      console.log('Room joined:', response);
      this.updateGameState(response.data);
    });

    this.socketService.on<{ message: string }>('error').subscribe((error) => {
      console.error('Socket error:', error);
      alert(error.message);
    });
  }

  private updateGameState(room: RoomUpdate['data']): void {
    this.currentPositionsSubject.next(room.currentPositions);
    this.diceValueSubject.next(room.diceValue);
    this.turnSubject.next(room.turn);
    this.stateSubject.next(room.state);
    this.eligiblePiecesSubject.next(room.eligiblePieces);
    this.playersSubject.next(room.players);
    this.hasWonSubject.next(room.hasWon);

    const socketId = this.socketService.id;
    if (socketId && room.socketClients[socketId]) {
      this.currentPlayerSubject.next(room.socketClients[socketId]);
    }
  }

  get currentPositions(): PlayerPositions {
    return this.currentPositionsSubject.value;
  }

  get diceValue(): number {
    return this.diceValueSubject.value;
  }

  get turn(): number {
    return this.turnSubject.value;
  }

  get state(): GameState {
    return this.stateSubject.value;
  }

  get currentPlayer(): Player | null {
    return this.currentPlayerSubject.value;
  }

  rollDice(): void {
    const roomId = this.socketService.currentRoomId;
    if (!roomId) {
      console.error('No room ID set');
      return;
    }

    this.socketService.emit('roll-dice', { roomId });
  }

  handlePieceClick(piece: number): void {
    const roomId = this.socketService.currentRoomId;
    if (!roomId) {
      console.error('No room ID set');
      return;
    }

    this.socketService.emit('piece-click', {
      roomId,
      piece,
    });
  }

  resetState(): void {
    this.currentPositionsSubject.next({
      P1: [...BASE_POSITIONS.P1],
      P2: [...BASE_POSITIONS.P2],
      P3: [...BASE_POSITIONS.P3],
      P4: [...BASE_POSITIONS.P4],
    });
    this.diceValueSubject.next(0);
    this.turnSubject.next(0);
    this.stateSubject.next(GameState.DICE_NOT_ROLLED);
    this.eligiblePiecesSubject.next([]);
    this.playersSubject.next([]);
    this.currentPlayerSubject.next(null);
    this.hasWonSubject.next(undefined);
  }
}
