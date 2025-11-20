import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, take, skip } from 'rxjs';
import { SkinsService } from '@services/skins.service';

@Component({
  selector: 'app-backgrounds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backgrounds.html',
  styleUrls: ['./backgrounds.css'],
})
export class Backgrounds implements OnInit, OnDestroy {
  private skinsService = inject(SkinsService);
  private subs: Subscription | null = null;

  bg1: string | null = null;
  bg2: string | null = null;
  visibleLayer: 1 | 2 = 1;

  transitionMs = 300;

  ngOnInit(): void {
    this.skinsService.currentBackground$.pipe(take(1)).subscribe((url) => {
      this.bg1 = url;
      this.visibleLayer = 1;
    });

    this.subs = this.skinsService.currentBackground$.pipe(skip(1)).subscribe((url) => {
      this.fadeTo(url);
    });
  }

  private fadeTo(url: string | null) {
    if (!url) return;

    if (
      (this.visibleLayer === 1 && this.bg1 === url) ||
      (this.visibleLayer === 2 && this.bg2 === url)
    ) {
      return;
    }

    if (this.visibleLayer === 1) {
      this.bg2 = url;
      this.visibleLayer = 2;
    } else {
      this.bg1 = url;
      this.visibleLayer = 1;
    }

    setTimeout(() => {
      if (this.visibleLayer === 1) {
        this.bg2 = null;
      } else {
        this.bg1 = null;
      }
    }, this.transitionMs + 50);
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }
}
