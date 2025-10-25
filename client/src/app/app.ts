import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './services/socket.service';
import { FormsModule } from '@angular/forms';
import { PlayerService } from './services/player.service';
import { LudoComponent } from './ludo/ludo';
import { LudoService } from './ludo/ludo.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@Component({
  selector: 'app-root',
  imports: [FormsModule, LudoComponent,FontAwesomeModule],
  providers: [SocketService, PlayerService, LudoService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('client');
}
