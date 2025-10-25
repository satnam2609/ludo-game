import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  BASE_POSITIONS,
  HOME_ENTRANCE,
  HOME_POSITIONS,
  Player,
  PLAYERS,
  PlayerPositions,
  SAFE_POSITIONS,
  START_POSITIONS,
  GameState,
  TURNING_POINTS,
} from './constants';

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

  constructor() {
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
    setTimeout(() => {
      const value = 1 + Math.floor(Math.random() * 6);
      this.diceValueSubject.next(value);
    }, 1000);
    this.stateSubject.next(GameState.DICE_ROLLED);
    this.checkForEligiblePieces();
  }

  checkForEligiblePieces(): void {
    const player = PLAYERS[this.turn];
    const eligiblePieces = this.getEligiblePieces(player);
    this.eligiblePiecesSubject.next(eligiblePieces);

    if (eligiblePieces.length === 0) {
      this.incrementTurn();
    }
  }

  getEligiblePieces(player: Player): number[] {
    return [0, 1, 2, 3].filter((piece) => {
      const currentPosition = this.currentPositions[player][piece];

      if (currentPosition === HOME_POSITIONS[player]) {
        return false;
      }

      if (BASE_POSITIONS[player].includes(currentPosition) && this.diceValue !== 6) {
        return false;
      }

      if (
        HOME_ENTRANCE[player].includes(currentPosition) &&
        this.diceValue! > HOME_POSITIONS[player] - currentPosition
      ) {
        return false;
      }

      return true;
    });
  }

  incrementTurn(): void {
    const nextTurn = (this.turn + 1) % 4;
    this.turnSubject.next(nextTurn);
    this.stateSubject.next(GameState.DICE_NOT_ROLLED);
    this.eligiblePiecesSubject.next([]);
  }

  handlePieceClick(player: Player, piece: number): void {
    const currentPosition = this.currentPositions[player][piece];

    if (BASE_POSITIONS[player].includes(currentPosition)) {
      this.setPiecePosition(player, piece, START_POSITIONS[player]);
      this.stateSubject.next(GameState.DICE_NOT_ROLLED);
      this.eligiblePiecesSubject.next([]);
      return;
    }

    this.eligiblePiecesSubject.next([]);
    this.movePiece(player, piece, this.diceValue!);
  }

  setPiecePosition(player: Player, piece: number, newPosition: number): void {
    const positions = { ...this.currentPositions };
    positions[player] = [...positions[player]];
    positions[player][piece] = newPosition;
    this.currentPositionsSubject.next(positions);
  }

  movePiece(player: Player, piece: number, moveBy: number): void {
    const interval = setInterval(() => {
      this.incrementPiecePosition(player, piece);
      moveBy--;

      if (moveBy === 0) {
        clearInterval(interval);

        if (this.hasPlayerWon(player)) {
          setTimeout(() => {
            alert(`Player: ${player} has won!`);
            this.resetGame();
          }, 100);
          return;
        }

        const isKill = this.checkForKill(player, piece);

        if (isKill || this.diceValue === 6) {
          this.stateSubject.next(GameState.DICE_NOT_ROLLED);
          return;
        }

        this.incrementTurn();
      }
    }, 200);
  }

  checkForKill(player: Player, piece: number): boolean {
    const currentPosition = this.currentPositions[player][piece];
    const opponents: Player[] = PLAYERS.filter((p) => p !== player);
    let kill = false;

    opponents.forEach((opponent) => {
      [0, 1, 2, 3].forEach((opponentPiece) => {
        const opponentPosition = this.currentPositions[opponent][opponentPiece];

        if (currentPosition === opponentPosition && !SAFE_POSITIONS.includes(currentPosition)) {
          this.setPiecePosition(opponent, opponentPiece, BASE_POSITIONS[opponent][opponentPiece]);
          kill = true;
        }
      });
    });

    return kill;
  }

  hasPlayerWon(player: Player): boolean {
    return [0, 1, 2, 3].every(
      (piece) => this.currentPositions[player][piece] === HOME_POSITIONS[player]
    );
  }

  incrementPiecePosition(player: Player, piece: number): void {
    this.setPiecePosition(player, piece, this.getIncrementedPosition(player, piece));
  }

  getIncrementedPosition(player: Player, piece: number): number {
    const currentPosition = this.currentPositions[player][piece];

    if (currentPosition === TURNING_POINTS[player]) {
      return HOME_ENTRANCE[player][0];
    } else if (currentPosition === 51) {
      return 0;
    }
    return currentPosition + 1;
  }

  resetGame(): void {
    console.log('Reset game');
    this.currentPositionsSubject.next({
      P1: [...BASE_POSITIONS.P1],
      P2: [...BASE_POSITIONS.P2],
      P3: [...BASE_POSITIONS.P3],
      P4: [...BASE_POSITIONS.P4],
    });
    this.diceValueSubject.next(null);
    this.turnSubject.next(0);
    this.stateSubject.next(GameState.DICE_NOT_ROLLED);
    this.eligiblePiecesSubject.next([]);
  }
}
