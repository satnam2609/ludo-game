import { Component, Input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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
  imports: [FaIconComponent],
  templateUrl: './dice.html',
  styleUrl: './dice.css',
})
export class DiceComponent {
  currentDiceValue: number = 1;
  tempDiceValue:number = this.currentDiceValue;
  isRolling: boolean = false;
  currentDiceFaceIcon: IconDefinition = faDiceOne;

  private diceIcons: { [key: number]: IconDefinition } = {
    1: faDiceOne,
    2: faDiceTwo,
    3: faDiceThree,
    4: faDiceFour,
    5: faDiceFive,
    6: faDiceSix,
  };

  rollDice(): void {
    this.isRolling = true;
    setTimeout(() => {
      this.tempDiceValue = Math.floor(Math.random() * 6) + 1;
      this.currentDiceFaceIcon = this.diceIcons[this.tempDiceValue];
      this.isRolling = false;
    }, 1000);
    this.currentDiceFaceIcon = this.diceIcons[this.currentDiceValue];
    this.isRolling = false;
  }
}
