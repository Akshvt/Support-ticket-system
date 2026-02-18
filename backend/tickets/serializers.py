from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """Serializer for creating and listing tickets."""

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'category', 'priority', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class TicketUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tickets (PATCH) — all fields optional."""

    class Meta:
        model = Ticket
        fields = ['title', 'description', 'category', 'priority', 'status']
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False},
            'category': {'required': False},
            'priority': {'required': False},
            'status': {'required': False},
        }


class ClassifyRequestSerializer(serializers.Serializer):
    """Serializer for the classify endpoint request."""
    description = serializers.CharField(required=True)
