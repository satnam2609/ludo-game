import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  FaIconComponent,
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import {
  faDiceOne,
  faDiceTwo,
  faDiceThree,
  faDiceFour,
  faDiceFive,
  faDiceSix,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dice',
  imports: [FontAwesomeModule],
  templateUrl: './dice.html',
  styleUrl: './dice.css',
})
export class DiceComponent implements OnChanges {
  @Input({ required: true }) diceValue!: number | null;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Dice component changed');
    this.rollDice();
  }

  rollDice() {
    const dice = [...document.querySelectorAll('.die-list')];
    dice.forEach((die: Element) => {
      this.toggleClasses(die);
      die.setAttribute('data-roll', this.getRandomNumber(1, 6).toString());
    });
    dice[dice.length - 1].setAttribute(
      'data-roll',
      this.diceValue ? this.diceValue.toString() : '1'
    );
  }

  toggleClasses(die: any) {
    die.classList.toggle('odd-roll');
    die.classList.toggle('even-roll');
  }

  getRandomNumber(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
