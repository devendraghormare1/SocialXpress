from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Messages
from .serializers import MessageSerializer
from django.contrib.auth import get_user_model

class MessageListView(APIView):
    def get(self, request, sender_username=None, receiver_username=None):
        try:
            User = get_user_model()
            if sender_username is not None and receiver_username is not None:
                sender = get_object_or_404(User, username=sender_username)
                receiver = get_object_or_404(User, username=receiver_username)

                # Fetch all messages between sender and receiver
                sender_messages = Messages.objects.filter(sender_name=sender, receiver_name=receiver).order_by('timestamp')
                receiver_messages = Messages.objects.filter(sender_name=receiver, receiver_name=sender).order_by('timestamp')
                all_messages = sender_messages | receiver_messages
                all_messages = all_messages.order_by('timestamp')

                serializer = MessageSerializer(all_messages, many=True)

                data = {
                    'messages': serializer.data
                }
                return JsonResponse(data)

            else:
                messages = Messages.objects.filter(seen=False)
                serializer = MessageSerializer(messages, many=True)
                for message in messages:
                    message.seen = True
                    message.save()
                return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            sender_username = request.data.get('sender_username')
            receiver_username = request.data.get('receiver_username')
            
            User = get_user_model()
            sender = get_object_or_404(User, username=sender_username)
            receiver = get_object_or_404(User, username=receiver_username)

            request.data['sender_name'] = sender.id
            request.data['receiver_name'] = receiver.id
            
            serializer = MessageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
