from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Post, Like, Comment, CustomUser, FriendRequest, Friend, ReportedPost


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({'username': self.user.username})
        return data


User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    security_question = serializers.CharField(max_length=255)
    security_answer = serializers.CharField(max_length=255)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'security_question', 'security_answer']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def save(self):
        user = User(
            email=self.validated_data['email'],
            username=self.validated_data['username'],
            security_question = self.validated_data['security_question'],
            security_answer = self.validated_data['security_answer']
        )
        password = self.validated_data['password']
        password2 = self.validated_data['password2']

        if password != password2:
            raise serializers.ValidationError({'password': 'Passwords must match'})
        
        user.set_password(password)
        
        user.save()
        return user
    
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('user', None)
        post = Post.objects.create(user=user,**validated_data)
        return post

    class Meta:
        model = Post
        fields = '__all__'

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'bio', 'date_joined', 'groups', 'user_permissions','profile_picture')



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','username','email','bio','profile_picture','birthdate','date_joined','groups','user_permissions')

class AllUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','username','email')

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']
        read_only_fields = ['status']  # Ensure status is read-only

class FriendSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Custom field to represent user details
    friend = serializers.StringRelatedField()  # Custom field to represent friend details

    class Meta:
        model = Friend
        fields = ['id', 'user', 'friend', 'created_at']


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportedPost
        fields = ['postId','username', 'content', 'reason','postUser']

class ForgotPasswordSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    security_question = serializers.CharField(max_length=255)
    security_answer = serializers.CharField(max_length=255)
    new_password = serializers.CharField(max_length=128, write_only=True)
    confirm_password = serializers.CharField(max_length=128, write_only=True)