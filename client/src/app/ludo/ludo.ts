import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { LudoService } from './ludo.service';
import { SocketService } from './socket.service';
import {
  COORDINATES_MAP,
  GameState,
  Player,
  PLAYERS,
  PlayerPositions,
  STEP_LENGTH,
} from './constants'
import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-ludo',
  standalone: true,
  imports: [NgStyle, AsyncPipe, NgFor, NgIf],
  templateUrl: './ludo.html',
  styleUrls: ['./ludo.css'],
})
export class LudoComponent implements OnInit, OnDestroy {
  currentPositions$: Observable<PlayerPositions>;
  diceValue$: Observable<number>;
  turn$: Observable<number>;
  state$: Observable<GameState>;
  eligiblePieces$: Observable<number[]>;
  players$: Observable<Player[]>;
  currentPlayer$: Observable<Player | null>;
  hasWon$: Observable<string | undefined>;

  players = PLAYERS;
  pieces = [0, 1, 2, 3];
  GameState = GameState;

  private eligiblePiecesValue: number[] = [];
  private currentPlayerValue: Player | null = null;
  private turnValue: number = 0;
  private stateValue: GameState = GameState.DICE_NOT_ROLLED;
  private subscription = new Subscription();

  roomId: string | null = null;

  constructor(
    private ludoService: LudoService,
    private socketService: SocketService,
    private router: Router
  ) {
    this.currentPositions$ = this.ludoService.currentPositions$;
    this.diceValue$ = this.ludoService.diceValue$;
    this.turn$ = this.ludoService.turn$;
    this.state$ = this.ludoService.state$;
    this.eligiblePieces$ = this.ludoService.eligiblePieces$;
    this.players$ = this.ludoService.players$;
    this.currentPlayer$ = this.ludoService.currentPlayer$;
    this.hasWon$ = this.ludoService.hasWon$;
  }

  ngOnInit(): void {
    console.log('Ludo component initialized');
    
    this.roomId = this.socketService.currentRoomId;
    
    if (!this.roomId) {
      console.error('No room ID found, redirecting to lobby');
      alert('No room found. Please create or join a room first.');
      this.router.navigate(['/lobby']);
      return;
    }

    console.log('Room ID:', this.roomId);

    // Subscribe to eligible pieces
    this.subscription.add(
      this.eligiblePieces$.subscribe((pieces) => {
        this.eligiblePiecesValue = pieces;
        console.log('Eligible pieces updated:', pieces);
      })
    );

    // Subscribe to current player
    this.subscription.add(
      this.currentPlayer$.subscribe((player) => {
        this.currentPlayerValue = player;
        console.log('Current player updated:', player);
      })
    );

    // Subscribe to turn
    this.subscription.add(
      this.turn$.subscribe((turn) => {
        this.turnValue = turn;
        console.log('Turn updated:', turn);
      })
    );

    // Subscribe to state
    this.subscription.add(
      this.state$.subscribe((state) => {
        this.stateValue = state;
        console.log('State updated:', state);
      })
    );

    // Subscribe to winner
    this.subscription.add(
      this.hasWon$.subscribe((winner) => {
        if (winner) {
          console.log('Game won by:', winner);
          setTimeout(() => {
            alert(`Player ${winner} has won the game! 🎉`);
          }, 500);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  rollDice(): void {
    // Check if it's the current player's turn
    const activePlayer = PLAYERS[this.turnValue];
    if (this.currentPlayerValue !== activePlayer) {
      console.log('Not your turn!');
      alert('It\'s not your turn!');
      return;
    }

    if (this.stateValue !== GameState.DICE_NOT_ROLLED) {
      console.log('Dice already rolled');
      return;
    }

    console.log('Rolling dice...');
    this.ludoService.rollDice();
  }

  onPieceClick(player: Player, piece: number): void {
    console.log('Piece clicked:', player, piece);
    
    // Check if it's the current player
    if (this.currentPlayerValue !== player) {
      console.log('Not your piece!');
      return;
    }

    // Check if it's the current player's turn
    const activePlayer = PLAYERS[this.turnValue];
    if (this.currentPlayerValue !== activePlayer) {
      console.log('Not your turn!');
      return;
    }

    // Check if piece is eligible
    if (!this.eligiblePiecesValue.includes(piece)) {
      console.log('Piece not eligible:', piece, 'Eligible:', this.eligiblePiecesValue);
      return;
    }

    console.log('Handling piece click for piece:', piece);
    this.ludoService.handlePieceClick(piece);
  }

  getPiecePosition(position: number | undefined): { top: string; left: string } {
    if (position === undefined || position === null) {
      return { top: '0%', left: '0%' };
    }
    const coordinates = COORDINATES_MAP[position];
    if (!coordinates) {
      console.warn('No coordinates found for position:', position);
      return { top: '0%', left: '0%' };
    }
    const [x, y] = coordinates;
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
    if (!positions) {
      console.warn('No positions available');
      return 0;
    }
    return positions[player][piece];
  }

  backToLobby(): void {
    const confirm = window.confirm('Are you sure you want to leave the game?');
    if (confirm) {
      this.ludoService.resetState();
      this.socketService.currentRoomId = null;
      this.router.navigate(['/lobby']);
    }
  }

  getPlayerColor(player: Player): string {
    const colors: Record<Player, string> = {
      P1: '#2eafff',
      P2: '#00b550',
      P3: '#ffeb3b',
      P4: '#f44336',
    };
    return colors[player];
  }

  isMyTurn(): boolean {
    const activePlayer = PLAYERS[this.turnValue];
    return this.currentPlayerValue === activePlayer;
  }
}