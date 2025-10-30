import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FloatingService, FloatingMessage } from '../../services/floating.service';

@Component({
  selector: 'app-floating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating.html',
  styleUrls: ['./floating.css'],
})
export class Floating {
  private pos = new Map<number, { left: string; top: string }>();

  constructor(public floating: FloatingService) {}

  trackByUid(_index: number, item: FloatingMessage) {
    return item.uid;
  }

  getLeft(m: FloatingMessage) {
    if (!this.pos.has(m.uid)) {
      this.pos.set(m.uid, { left: `calc(50% + ${m.rx}px)`, top: `calc(50% + ${m.ry}px)` });
    }
    return this.pos.get(m.uid)!.left;
  }

  getTop(m: FloatingMessage) {
    if (!this.pos.has(m.uid)) {
      this.pos.set(m.uid, { left: `calc(50% + ${m.rx}px)`, top: `calc(50% + ${m.ry}px)` });
    }
    return this.pos.get(m.uid)!.top;
  }
}
