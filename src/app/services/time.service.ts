import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, firstValueFrom } from 'rxjs';

interface TimeResponse {
  datetime: string;
}

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  isCroquetaDay = signal<boolean>(false);
  private readonly API_URL = 'https://worldtimeapi.org/api/timezone/Europe/Madrid';

  constructor(private http: HttpClient) {
    this.checkCroquetaDay();
  }

  async checkCroquetaDay() {
    try {
      if (typeof window === 'undefined') return;

      const response = await firstValueFrom(
        this.http.get<TimeResponse>(this.API_URL).pipe(
          catchError(() => of(null))
        )
      );

      if (response && response.datetime) {
        const date = new Date(response.datetime);
        const month = date.getMonth(); // 0-indexed (0 = January)
        const day = date.getDate();

        // Check if it's January (0) 16th
        if (month === 0 && day === 16) {
          console.log('¡Es el día de la croqueta!');
          this.isCroquetaDay.set(true);
        }
      }
    } catch (error) {
      console.error('Error checking date:', error);
      // Fail silently, default is false
    }
  }
}
