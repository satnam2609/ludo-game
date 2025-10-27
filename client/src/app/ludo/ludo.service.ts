import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  BASE_POSITIONS,
  PlayerPositions,
  GameState,
} from './constants';
import { SocketService } from './socket.service';

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

  private diceValueSubject = new BehaviorSubject<number | null>(null);
  diceValue$ = this.diceValueSubject.asObservable();

  private turnSubject = new BehaviorSubject<number>(0);
  turn$ = this.turnSubject.asObservable();

  private stateSubject = new BehaviorSubject<GameState>(GameState.DICE_NOT_ROLLED);
  state$ = this.stateSubject.asObservable();

  private eligiblePiecesSubject = new BehaviorSubject<number[]>([]);
  eligiblePieces$ = this.eligiblePiecesSubject.asObservable();

  constructor(private socketService: SocketService) {
    console.log('Ludo Service initialized');
  }

  get currentPositions(): PlayerPositions {
    return this.currentPositionsSubject.value;
  }

  get diceValue(): number | null {
    return this.diceValueSubject.value;
  }

  get turn(): number {
    return this.turnSubject.value;
  }

  get state(): GameState {
    return this.stateSubject.value;
  }

  rollDice(): void {
    this.socketService.emit('roll-dice', {
      roomId: 'CUSTOM_ROOM_ID',
    });
  }

  handlePieceClick(piece: number): void {
    this.socketService.emit('piece-click', {
      roomId: 'CUSTOM_ROOM_ID',
      piece,
    });
  }
}
