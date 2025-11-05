import { Component } from '@angular/core';
import { SkinCard } from '../../ui/skin-card/skin-card';
import { PageContainer } from '../../ui/page-container/page-container';

@Component({
  selector: 'app-skins',
  imports: [SkinCard, PageContainer],
  templateUrl: './skins.html',
  styleUrl: './skins.css',
})
export class Skins {}
