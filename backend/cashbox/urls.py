from django.urls import path
from .api import (
    CurrentSessionView,
    SessionListCreateView,
    SessionCloseView,
    TransactionListCreateView,
    TransactionDetailView
)

urlpatterns = [
    path('sessions/current/', CurrentSessionView.as_view(), name='current-session'),
    path('sessions/', SessionListCreateView.as_view(), name='session-list'),
    path('sessions/<int:pk>/close/', SessionCloseView.as_view(), name='session-close'),
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
]
