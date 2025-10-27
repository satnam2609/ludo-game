import {
  BASE_POSITIONS,
  GameState,
  HOME_ENTRANCE,
  HOME_POSITIONS,
  Player,
  PLAYERS,
  SAFE_POSITIONS,
  START_POSITIONS,
  TURNING_POINTS,
  //   type PlayerPositions,
  type Room,
} from '../../../common/constants';

export class LudoService {
  private rooms: Map<string, Room> = new Map();

  getRoom(id: string) {
    return this.rooms.get(id);
  }

  createRoom(player: string, roomId: string) {
    const room = this.rooms.set(roomId, {
      id: roomId,
      socketClients: {
        [player]: 'P1',
      },
      players: ['P1'],
      currentPositions: {
        P1: [...BASE_POSITIONS.P1],
        P2: [...BASE_POSITIONS.P2],
        P3: [...BASE_POSITIONS.P3],
        P4: [...BASE_POSITIONS.P4],
      },
      diceValue: 0,
      turn: 0,
      state: GameState.DICE_NOT_ROLLED,
      eligiblePieces: [],
      hasWon: undefined,
    });

    return room;
  }

  joinRoom(player: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (room && room.players.length < 4) {
      room.players.push(PLAYERS[room.turn]);
      room.socketClients[player] = PLAYERS[room.turn];

      return room;
    }
  }

  rollDice(id: string) {
    const room = this.rooms.get(id);
    if (room) {
      const value = Math.floor(Math.random() * 6) + 1;
      room.diceValue = value;
      room.state = GameState.DICE_ROLLED;
    }
  }

  checkForEligiblePieces(id: string) {
    const room = this.rooms.get(id);
    if (room) {
      const player = PLAYERS[room.turn];
      const eligiblePieces = this.getEligiblePieces(room, player);
      room.eligiblePieces = eligiblePieces;

      if (room.eligiblePieces.length === 0) {
        this.incrementTurn(room);
      }
    }
  }

  getEligiblePieces(room: Room, player: Player) {
    return [0, 1, 2, 3].filter((piece) => {
      const currentPosition = room.currentPositions[player][piece];
      if (HOME_POSITIONS[player] === currentPosition) {
        return false;
      }
      if (
        BASE_POSITIONS[player].includes(currentPosition) &&
        room.diceValue !== 6
      ) {
        return false;
      }

      if (
        HOME_ENTRANCE[player].includes(currentPosition) &&
        room.diceValue > HOME_POSITIONS[player] - currentPosition
      ) {
        return false;
      }

      return true;
    });
  }

  incrementTurn(room: Room) {
    const nextTurn = (room.turn + 1) % 4;
    room.turn = nextTurn;
    room.state = GameState.DICE_NOT_ROLLED;
    room.eligiblePieces = [];
  }

  handlePieceClick(room: Room, player: Player, piece: number) {
    const currentPosition = room.currentPositions[player][piece];

    if (BASE_POSITIONS[player].includes(currentPosition)) {
      this.setPiecePosition(room, player, piece, START_POSITIONS[player]);
      room.state = GameState.DICE_NOT_ROLLED;
      room.eligiblePieces = [];
      return;
    }
  }

  setPiecePosition(
    room: Room,
    player: Player,
    piece: number,
    newPosition: number,
  ) {
    const positions = { ...room.currentPositions };
    positions[player] = [...positions[player]];
    positions[player][piece] = newPosition;
    room.currentPositions = positions;
  }

  movePiece(room: Room, player: Player, piece: number, moveBy: number) {
    const interval = setInterval(() => {
      this.incrementPiecePosition(room, player, piece);
      moveBy--;

      if (moveBy === 0) {
        clearInterval(interval);

        if (this.hasPlayerWon(room, player)) {
          console.log('Game has been won by the player', player);
          this.resetGame(room);
          return;
        }

        const isKill = this.checkForKill(room, player, piece);

        if (isKill || room.diceValue === 6) {
          room.state = GameState.DICE_NOT_ROLLED;
          return;
        }
      }
    }, 200);
  }

  checkForKill(room: Room, player: Player, piece: number) {
    const currentPosition = room.currentPositions[player][piece];
    const opponents = PLAYERS.filter((p) => p !== player);
    let isKill = false;
    opponents.forEach((opponent) => {
      [0, 1, 2, 3].forEach((opponentPiece) => {
        const opponentPosition = room.currentPositions[opponent][opponentPiece];

        if (
          currentPosition === opponentPosition &&
          !SAFE_POSITIONS.includes(currentPosition)
        ) {
          this.setPiecePosition(
            room,
            opponent,
            opponentPiece,
            BASE_POSITIONS[opponent][opponentPiece],
          );
          isKill = true;
        }
      });
    });

    return isKill;
  }

  incrementPiecePosition(room: Room, player: Player, piece: number): void {
    this.setPiecePosition(
      room,
      player,
      piece,
      this.getIncrementedPosition(room, player, piece),
    );
  }

  getIncrementedPosition(room: Room, player: Player, piece: number): number {
    const currentPosition = room.currentPositions[player][piece];

    if (currentPosition === TURNING_POINTS[player]) {
      return HOME_ENTRANCE[player][0];
    } else if (currentPosition === 51) {
      return 0;
    }
    return currentPosition + 1;
  }

  hasPlayerWon(room: Room, player: Player): boolean {
    return [0, 1, 2, 3].every(
      (piece) =>
        room.currentPositions[player][piece] === HOME_POSITIONS[player],
    );
  }

  resetGame(room: Room): void {
    console.log('Reset game');
    room.currentPositions = {
      P1: [...BASE_POSITIONS.P1],
      P2: [...BASE_POSITIONS.P2],
      P3: [...BASE_POSITIONS.P3],
      P4: [...BASE_POSITIONS.P4],
    };
    room.diceValue = 0;
    room.turn = 0;
    room.state = GameState.DICE_NOT_ROLLED;
    room.eligiblePieces = [];
  }
}
