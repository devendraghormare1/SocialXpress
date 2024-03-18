from django.db import models
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

class Messages(models.Model):
    description = models.TextField()
    sender_name = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sender_messages')
    receiver_name = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='receiver_messages')
    time = models.TimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To: {self.receiver_name} From: {self.sender_name}"

    class Meta:
        ordering = ('timestamp',)
