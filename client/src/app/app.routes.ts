import { Routes } from '@angular/router';
import { LobbyComponent } from './lobby/lobby';
import { LudoComponent } from './ludo/ludo';

// import { RoomComponent } from './room/room';

export const routes: Routes = [
  {
    path: '',
    component: LobbyComponent,
  },
  {
    path: 'ludo',
    component: LudoComponent,
  },
];
