import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from './chat.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  friend: string = ''; 
  curr_user: any = { 
    id: parseInt(localStorage.getItem('currentUserId') || '0'), 
    username: localStorage.getItem('username') }; 

  messages: any[] = []; 
  newMessage: string = ''; 
  private messageSubscription!: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;


  constructor(private chatService: ChatService, private route: ActivatedRoute) {
    this.messageSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.friend = params['friend'];

      this.startReceivingMessages();
    });
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  startReceivingMessages(): void {
    this.messageSubscription = interval(1000) 
      .pipe(
        switchMap(() => this.chatService.getMessages(this.curr_user.username, this.friend))
      )
      .subscribe(
        (data: any) => {
          // console.log('Received messages:', data);
          if (data && Array.isArray(data.messages)) {
            this.messages = data.messages;
          } else {
            console.error('Invalid data format received:', data);
          }
        },
        error => {
          console.error('Error receiving messages:', error);
        }
      );
  }
  
  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.chatService.sendMessage(this.curr_user.username, this.friend, this.newMessage)
        .subscribe(
          () => {
            this.newMessage = ''; 
            this.scrollToBottom();

          },
          error => {
            console.error('Error sending message:', error);
          }
        );
    }
  }


  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {
      console.error("Error while scrolling:", err);
    }
  }
}
