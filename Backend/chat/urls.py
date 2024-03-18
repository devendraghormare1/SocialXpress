
from django.urls import path
from .views import MessageListView

urlpatterns = [
    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/<str:sender_username>/<str:receiver_username>/', MessageListView.as_view(), name='private-message-list'),
    # Add other URLs if needed
]
