import { Component, ChangeDetectorRef, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Room, RoomService } from '../services/room.service';
import { RoomListComponent } from './room-list/room-list';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { API_BASE_URL } from '../services/api-config';

interface Message {
  _id?: string;
  sender: string;
  content: string;
  room: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RoomListComponent, FormsModule],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit {
  selectedRoom: Room | null = null;
  messages: Message[] = [];
  newMessage = '';
  currentUser = '';

  cd = inject(ChangeDetectorRef);
  http = inject(HttpClient);
  roomService = inject(RoomService);
  platformId = inject(PLATFORM_ID);

  constructor() {
    // Try to get current user from localStorage (JWT payload)
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token');
    }
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = payload.username;
      } catch {
        // Ignore token parsing errors
      }
    }
  }

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('roomId');
    if (roomId) {
      this.roomService.getRooms().subscribe((rooms) => {
        const found = rooms.find(r => r._id === roomId);
        if (found) {
          this.onRoomSelected(found);
        }
      });
    }
  }

  onRoomSelected(room: Room) {
    console.log('ChatComponent received room:', room);
    this.selectedRoom = room;
    this.messages = [];
    this.cd.detectChanges();
    if (room && room._id) {
      this.http.get<Message[]>(`${API_BASE_URL}/messages/${room._id}`).subscribe(
        msgs => {
          this.messages = msgs;
        },
        () => {
          this.messages = [];
        }
      );
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedRoom) return;
    this.http.post<Message>(`${API_BASE_URL}/messages`, {
      content: this.newMessage,
      roomId: this.selectedRoom._id
    }).subscribe(
      msg => {
        this.messages.push(msg);
        this.newMessage = '';
      },
      () => {
        alert('Failed to send message');
      }
    );
  }
}
