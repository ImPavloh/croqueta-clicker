import { Component } from '@angular/core';
import { Producer } from '../../ui/producer/producer';
import { Upgrade } from '../../ui/upgrade/upgrade';
import { PageContainer } from '../../ui/page-container/page-container';

@Component({
  selector: 'app-upgrades',
  imports: [Producer, Upgrade, PageContainer],
  templateUrl: './upgrades.html',
  styleUrl: './upgrades.css',
})
export class Upgrades {}
