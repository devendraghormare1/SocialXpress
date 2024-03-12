from django.forms import ValidationError
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework.views import APIView
from django.db.models import Q
from .models import Post, Like, Comment, FriendRequest, Friend, CustomUser
from .serializers import (UserRegistrationSerializer,PostSerializer,CommentSerializer,
CustomTokenObtainPairSerializer,UserSerializer,UserProfileSerializer,AllUsersSerializer,FriendRequestSerializer,FriendSerializer,ReportSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = FriendSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'

    @action(detail=True, methods=['GET', 'POST', 'PUT'], url_path='profile', url_name='user_profile')
    def user_profile(self, request, pk=None, *args, **kwargs):
        user = self.get_object()
        if request.method == 'PUT':  # PUT method
            serializer = UserProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:  # GET method
            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], url_path='me', url_name='current_user')
    def current_user(self, request, *args, **kwargs):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'], url_path='posts', url_name='user_posts')
    def user_posts(self, request, *args, **kwargs):
        user = self.get_object()
        posts = Post.objects.filter(user=user)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'], url_path='feed', url_name='user_feed')
    def user_feed(self, request, *args, **kwargs):
        user = self.get_object()
        friend_ids = Friend.objects.filter(user=user).values_list('friend', flat=True)
        friend_ids = list(friend_ids) + [user.id]
        posts = Post.objects.filter(Q(user__id__in=friend_ids) | Q(user=user))
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'], url_path='liked', url_name='user_liked_posts')
    def user_liked_posts(self, request, *args, **kwargs):
        user = self.get_object()
        posts = Post.objects.filter(like__user=user)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserRegistrationAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        reponse = super().create(request, *args, **kwargs)
        user = User.objects.get(email=request.data['email'])
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        reponse.data['access_token'] = access_token
        return reponse


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, media=self.request.data.get('media'))

    @action(detail=True, methods=['PUT'], url_path='edit', url_name='edit_post')
    def edit_post(self, request, pk=None):
        try:
            post = self.get_object()
            serializer = PostSerializer(post, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({'message': 'Post does not exists!'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['DELETE'], url_path='delete', url_name='delete_post')
    def delete_post(self, request, pk=None):
        try:
            post = self.get_object()
            post.delete()
            return Response({'message': 'Post deleted!'}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'message': 'Post does not exist!'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['POST'], url_path='like', url_name='like_post')
    def like_post(self, request, pk=None):
        try:
            post = self.get_object()
            like, created = Like.objects.get_or_create(user=request.user, post=post)
            if created:
                post.likes_count += 1
                post.save()
                return Response({'message': 'Post liked!'}, status=status.HTTP_201_CREATED)
            else:
                post.likes_count = max(0, post.likes_count - 1)
                post.save()
                like.delete()
                return Response({'message': 'Post unliked!'}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'message': 'Post does not exist!'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['GET'], url_path='comments', url_name='post_comments')
    def post_comments(self, request, pk=None):
        post = self.get_object()
        comments = Comment.objects.filter(post=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'], url_path='comment', url_name='comment_post')
    def comment_post(self, request, pk=None):
        post = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllUsersView(viewsets.ReadOnlyModelViewSet):
    serializer_class = AllUsersSerializer

    def get_queryset(self):
        logged_in_user = self.request.user
        friend_usernames = logged_in_user.friends.values_list('friend__username', flat=True)
        accepted_friend_usernames = Friend.objects.filter(user=logged_in_user).values_list('friend__username', flat=True)
        friend_request_usernames = FriendRequest.objects.filter(to_user=logged_in_user, status='pending').values_list('from_user__username', flat=True)
        queryset = CustomUser.objects.exclude(username=logged_in_user.username) \
                                      .exclude(is_superuser=True) \
                                      .exclude(username__in=friend_usernames) \
                                      .exclude(username__in=accepted_friend_usernames)
        return queryset


class FriendRequestListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FriendRequestSerializer

    def get_queryset(self):
        current_user = self.request.user
        return FriendRequest.objects.filter(to_user=current_user, status='pending')

    def create(self, request, *args, **kwargs):
        from_user_id = request.data.get('from_user_id')
        to_user_id = request.user.id
        existing_request = FriendRequest.objects.filter(from_user_id=from_user_id, to_user_id=to_user_id).exists()
        if existing_request:
            return Response({'error': 'Friend request already sent'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class FriendRequestRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FriendRequest.objects.all()
    serializer_class = FriendRequestSerializer


class FriendListCreateAPIView(generics.ListCreateAPIView):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer


class FriendRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer


class PendingFriendRequestListAPIView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        current_user = self.request.user
        return FriendRequest.objects.filter(to_user=current_user, status='pending')


class FriendListAPIView(generics.ListAPIView):
    serializer_class = FriendSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(user=user)


class AcceptFriendRequest(APIView):
    def post(self, request):
        from_user_id = request.data.get('from_user_id')
        current_user = request.user
        friend_requests = FriendRequest.objects.filter(from_user_id=from_user_id, to_user=current_user, status='pending')
        if not friend_requests.exists():
            return Response({'error': 'Friend request does not exist or has already been accepted'}, status=status.HTTP_404_NOT_FOUND)
        if friend_requests.count() > 1:
            return Response({'error': 'Multiple pending friend requests found'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        friend_request = friend_requests.first()
        if Friend.objects.filter(user=current_user, friend=friend_request.from_user).exists():
            return Response({'error': 'Users are already friends'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                friend_instance = Friend.objects.create(user=current_user, friend=friend_request.from_user)
                reverse_friend_instance = Friend.objects.create(user=friend_request.from_user, friend=current_user)
                friend_request.status = 'accepted'
                friend_request.save()
        except IntegrityError:
            return Response({'error': 'Failed to create friend relationship'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        serializer = FriendSerializer(friend_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RejectFriendRequest(APIView):
    def post(self, request):
        from_user_id = request.data.get('from_user_id')
        current_user = request.user
        friend_requests = FriendRequest.objects.filter(from_user_id=from_user_id, to_user=current_user, status='pending')
        if not friend_requests.exists():
            return Response({'error': 'Friend request does not exist or has already been rejected'}, status=status.HTTP_404_NOT_FOUND)
        if friend_requests.count() > 1:
            return Response({'error': 'Multiple pending friend requests found'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        friend_request = friend_requests.first()
        friend_request.status = 'rejected'
        friend_request.save()
        return Response({'message': 'Friend request rejected successfully'}, status=status.HTTP_200_OK)


class UnfriendAPIView(APIView):
    def post(self, request):
        friend_username = request.data.get('friend_username')
        current_user = request.user
        try:
            friend_user = User.objects.get(username=friend_username)
        except User.DoesNotExist:
            raise ValidationError("Friend with the provided username does not exist")
        try:
            friend_relationship = Friend.objects.get(user=current_user, friend=friend_user)
        except Friend.DoesNotExist:
            raise ValidationError("You are not friends with the specified user")
        try:
            inverse_friend_relationship = Friend.objects.get(user=friend_user, friend=current_user)
        except Friend.DoesNotExist:
            friend_relationship.delete()
            return Response({'message': 'Friend unfriended successfully'}, status=status.HTTP_200_OK)
        friend_relationship.delete()
        inverse_friend_relationship.delete()
        FriendRequest.objects.filter(
            Q(from_user=current_user, to_user=friend_user) | Q(from_user=friend_user, to_user=current_user)
        ).delete()
        return Response({'message': 'Friend unfriended successfully'}, status=status.HTTP_200_OK)


class ReportPostView(APIView):
    def post(self, request, *args, **kwargs):
        postId = request.data.get('postId')
        username = request.data.get('username')
        content = request.data.get('content')
        reason = request.data.get('reason')
        postUser = request.data.get('postUser')
        if not all([postId,username, content, reason, postUser]):
            return Response({'error': 'Incomplete data provided'}, status=status.HTTP_400_BAD_REQUEST)
        report_data = {'postId':postId,'username': username, 'content': content, 'reason': reason, 'postUser': postUser}
        serializer = ReportSerializer(data=report_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
