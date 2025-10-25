import { Injectable } from '@angular/core';
import type { Player } from '../../../../common/player';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private players: Map<string,Player>=new Map();

  setPlayer(name: string) {
    const id = name + Date.now();
    const player = {
      id,
      name,
    };

    this.players.set(name,player);

    return player;
  }

  playerData(name: string) {
    return this.players.get(name);
  }
}
