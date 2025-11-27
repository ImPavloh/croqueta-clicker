import { Component } from '@angular/core';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.html',
  styleUrls: ['./event.css'],
  standalone: true,
  imports: [],
})
export class EventComponent {
  events;
  state = { animation: 'in' };

  constructor(private readonly eventService: EventService) {
    this.events = this.eventService.getEvents();
  }

  onClick(eventId: number, mouseEvent: MouseEvent) {
    this.eventService.clicked(eventId, mouseEvent);
  }
}
