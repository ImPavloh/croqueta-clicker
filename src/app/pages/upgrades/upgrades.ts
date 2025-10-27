import { Component } from '@angular/core';
import { Producer } from '../../ui/producer/producer';
import { Upgrade } from '../../ui/upgrade/upgrade';

@Component({
  selector: 'app-upgrades',
  imports: [Producer, Upgrade],
  templateUrl: './upgrades.html',
  styleUrl: './upgrades.css'
})
export class Upgrades {

}
