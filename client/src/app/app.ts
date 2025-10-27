import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LudoComponent } from './ludo/ludo';
import { LudoService } from './ludo/ludo.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SocketService } from './ludo/socket.service';
import { LobbyComponent } from './lobby/lobby';
@Component({
  selector: 'app-root',
  imports: [FormsModule, FontAwesomeModule, LobbyComponent],
  providers: [SocketService, LudoService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('client');
}
