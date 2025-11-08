import { PRODUCERS } from '@data/producer.data';
import { Component } from '@angular/core';
import { Producer } from '@ui/producer/producer';
import { Upgrade } from '@ui/upgrade/upgrade';
import { UPGRADES } from '@data/upgrade.data';

@Component({
  selector: 'app-upgrades',
  imports: [Producer, Upgrade],
  templateUrl: './upgrades.html',
  styleUrl: './upgrades.css',
})
export class Upgrades {

  upgrades = UPGRADES;
  producers = PRODUCERS;

}
