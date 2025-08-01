import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { API_BASE_URL } from './api-config';

export interface Room {
  _id: string;
  name: string;
  users: string[];
  isPrivate?: boolean;
  roomCode?: string;
  creator?: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = API_BASE_URL + '/rooms';
  private http = inject(HttpClient);

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  createRoom(name: string, isPrivate?: boolean, roomCode?: string): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, { name, isPrivate, roomCode });
  }

  renameRoom(roomId: string, newName: string): Observable<Room> {
    return this.http.patch<Room>(`${this.apiUrl}/${roomId}`, { name: newName });
  }

  deleteRoom(roomId: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${roomId}`);
  }

  getRoomCount() {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}

// Jest test for RoomService
// Only runs if Jest is set up for frontend
// You can move this to a separate .spec.ts file if desired
/*
describe('RoomService', () => {
  let service: RoomService;
  let httpMock: unknown;

  beforeEach(() => {
    httpMock = { get: jest.fn() };
    service = new RoomService();
    (service as unknown as { http: unknown }).http = httpMock;
  });

  it('should get rooms', () => {
    httpMock.get.mockReturnValue('rooms');
    expect(service.getRooms()).toBe('rooms');
  });
});
*/ 