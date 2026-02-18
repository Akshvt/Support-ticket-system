from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Ticket
from .serializers import TicketSerializer, TicketUpdateSerializer, ClassifyRequestSerializer
from .llm_service import classify_ticket


@api_view(['GET', 'POST'])
def ticket_list(request):
    """
    GET  /api/tickets/ — List all tickets (newest first) with optional filters.
    POST /api/tickets/ — Create a new ticket. Returns 201.
    """
    if request.method == 'GET':
        queryset = Ticket.objects.all()

        # Apply filters
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        priority = request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Search by title and description
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        serializer = TicketSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
def ticket_detail(request, pk):
    """
    GET   /api/tickets/<id>/ — Retrieve a single ticket.
    PATCH /api/tickets/<id>/ — Update a ticket (e.g. change status, override category/priority).
    """
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = TicketSerializer(ticket)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = TicketUpdateSerializer(ticket, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(TicketSerializer(ticket).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def ticket_stats(request):
    """
    GET /api/tickets/stats/ — Aggregated statistics using DB-level aggregation.

    Returns total_tickets, open_tickets, avg_tickets_per_day,
    priority_breakdown, and category_breakdown.
    """
    total_tickets = Ticket.objects.count()
    open_tickets = Ticket.objects.filter(status='open').count()

    # Average tickets per day using DB-level aggregation
    daily_counts = (
        Ticket.objects
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
    )
    if daily_counts.exists():
        total_days = daily_counts.count()
        avg_per_day = round(total_tickets / total_days, 1) if total_days > 0 else 0
    else:
        avg_per_day = 0

    # Priority breakdown using DB-level aggregation
    priority_qs = (
        Ticket.objects
        .values('priority')
        .annotate(count=Count('id'))
    )
    priority_breakdown = {item['priority']: item['count'] for item in priority_qs}

    # Category breakdown using DB-level aggregation
    category_qs = (
        Ticket.objects
        .values('category')
        .annotate(count=Count('id'))
    )
    category_breakdown = {item['category']: item['count'] for item in category_qs}

    return Response({
        'total_tickets': total_tickets,
        'open_tickets': open_tickets,
        'avg_tickets_per_day': avg_per_day,
        'priority_breakdown': priority_breakdown,
        'category_breakdown': category_breakdown,
    })


@api_view(['POST'])
def ticket_classify(request):
    """
    POST /api/tickets/classify/ — Send a description, get back LLM-suggested
    category and priority.
    """
    serializer = ClassifyRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    description = serializer.validated_data['description']
    result = classify_ticket(description)

    if result is None:
        return Response(
            {
                'suggested_category': None,
                'suggested_priority': None,
                'error': 'LLM classification unavailable. Please select manually.',
            },
            status=status.HTTP_200_OK,
        )

    return Response(result, status=status.HTTP_200_OK)
