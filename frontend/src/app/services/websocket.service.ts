import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { WebSocketMessage } from '../models/websocket.model';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private client: Client;
  private subscription: StompSubscription | null = null;
  private messageSubject = new Subject<WebSocketMessage>();

  message$ = this.messageSubject.asObservable();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000
    });
  }

  connect(projectId: number): void {
    this.client.onConnect = () => {
      this.subscription = this.client.subscribe(
        `/topic/project/${projectId}`,
        msg => {
          const data: WebSocketMessage = JSON.parse(msg.body);
          this.messageSubject.next(data);
        }
      );
    };
    this.client.activate();
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.client.deactivate();
  }
}