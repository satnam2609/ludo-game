import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LudoService } from './ludo.service';
import {
  COORDINATES_MAP,
  GameState,
  Player,
  PLAYERS,
  PlayerPositions,
  STEP_LENGTH,
} from './constants';
import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-ludo',
  imports: [NgStyle, AsyncPipe, NgFor, NgIf],
  templateUrl: './ludo.html',
  styleUrls: ['./ludo.css'],
})
export class LudoComponent implements OnInit, OnDestroy {
  currentPositions$: Observable<PlayerPositions>;
  diceValue$: Observable<number | null>;
  turn$: Observable<number>;
  state$: Observable<GameState>;
  eligiblePieces$: Observable<number[]>;

  players = PLAYERS;
  pieces = [0, 1, 2, 3];
  GameState = GameState;

  private eligiblePiecesValue: number[] = [];
  private subscription = new Subscription();

  constructor(private ludoService: LudoService) {
    this.currentPositions$ = this.ludoService.currentPositions$;
    this.diceValue$ = this.ludoService.diceValue$;
    this.turn$ = this.ludoService.turn$;
    this.state$ = this.ludoService.state$;
    this.eligiblePieces$ = this.ludoService.eligiblePieces$;
  }

  ngOnInit(): void {
    console.log('Ludo component initialized');
    // Subscribe to eligible pieces to keep current value
    this.subscription.add(
      this.eligiblePieces$.subscribe((pieces) => {
        this.eligiblePiecesValue = pieces;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  rollDice(): void {
    this.ludoService.rollDice();
  }

  resetGame(): void {
    this.ludoService.resetGame();
  }

  onPieceClick(player: Player, piece: number): void {
    // Check if piece is eligible
    if (!this.eligiblePiecesValue.includes(piece)) {
      return;
    }
    this.ludoService.handlePieceClick(player, piece);
  }

  getPiecePosition(position: number | undefined): { top: string; left: string } {
    if (position === undefined) {
      return { top: '0%', left: '0%' };
    }
    const [x, y] = COORDINATES_MAP[position];
    return {
      top: `${y * STEP_LENGTH}%`,
      left: `${x * STEP_LENGTH}%`,
    };
  }

  isEligible(player: Player, piece: number, turn: number, eligiblePieces: number[]): boolean {
    return PLAYERS[turn] === player && eligiblePieces.includes(piece);
  }

  getActivePlayer(turn: number): Player {
    return PLAYERS[turn];
  }

  getPlayerPosition(positions: PlayerPositions | null, player: Player, piece: number): number {
    if (!positions) return 0;
    return positions[player][piece];
  }
}
