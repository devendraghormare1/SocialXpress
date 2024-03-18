import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `http://localhost:8000/chat/messages/`; // Ensure the trailing slash is added

  constructor(private http: HttpClient) { }

  sendMessage(sender: string, receiver: string, message: string): Observable<any> {
    return this.http.post(this.apiUrl, { sender_username: sender, receiver_username: receiver, description: message });
  }

  getMessages(senderUsername: string, receiverUsername: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${senderUsername}/${receiverUsername}`);
  }
}
