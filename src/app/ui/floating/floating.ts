import { Component } from '@angular/core';
import { FloatingService, FloatingMessage } from '@services/floating.service';
import { ShortNumberPipe } from '@pipes/short-number.pipe';

@Component({
  selector: 'app-floating',
  standalone: true,
  imports: [ShortNumberPipe],
  templateUrl: './floating.html',
  styleUrls: ['./floating.css'],
})
export class Floating {
  private pos = new Map<number, { left: string; top: string }>();

  constructor(public floating: FloatingService) {}

  getLeft(m: FloatingMessage) {
    if (!this.pos.has(m.uid)) {
      let left: string;
      let top: string;

      if (m.x !== undefined && m.y !== undefined) {
        left = `${m.x}px`;
        top = `${m.y}px`;
      } else {
        const offsetX = m.rx * 4;
        const offsetY = m.ry * 9;
        left = `calc(50% + ${offsetX}px)`;
        top = `calc(50% + ${offsetY}px)`;
      }

      this.pos.set(m.uid, { left, top });
    }
    return this.pos.get(m.uid)!.left;
  }

  getTop(m: FloatingMessage) {
    if (!this.pos.has(m.uid)) {
      let left: string;
      let top: string;

      if (m.x !== undefined && m.y !== undefined) {
        left = `${m.x}px`;
        top = `${m.y}px`;
      } else {
        const offsetX = m.rx * 4;
        const offsetY = m.ry * 9;
        left = `calc(50% + ${offsetX}px)`;
        top = `calc(50% + ${offsetY}px)`;
      }

      this.pos.set(m.uid, { left, top });
    }
    return this.pos.get(m.uid)!.top;
  }
}
