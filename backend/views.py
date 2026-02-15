
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Book, Patron, Loan, CirculationRule, LibraryEvent, Hold, SystemAlert, SystemConfiguration
from .serializers import BookSerializer, PatronSerializer, CirculationRuleSerializer, LibraryEventSerializer, SystemAlertSerializer, SystemConfigSerializer
from .services import CatalogingService

class IsLibrarianOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class IsAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser

class SystemConfigViewSet(viewsets.ViewSet):
    """
    Manages library-wide configuration (logo, map).
    """
    permission_classes = [permissions.AllowAny] # Public GET, Auth POST

    def list(self, request):
        config, _ = SystemConfiguration.objects.get_or_create(pk=1)
        serializer = SystemConfigSerializer(config)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsLibrarianOrAdmin])
    def update_config(self, request):
        config, _ = SystemConfiguration.objects.get_or_create(pk=1)
        config.logo = request.data.get('logo', config.logo)
        config.map_data = request.data.get('map_data', config.map_data)
        config.save()
        return Response({'success': True})

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            role = 'ADMINISTRATOR' if user.is_superuser else 'LIBRARIAN'
            return Response({
                'success': True,
                'token': token.key,
                'user': {'id': str(user.id), 'username': user.username, 'full_name': f"{user.first_name} {user.last_name}".strip() or user.username, 'role': role}
            })
        return Response({'success': False, 'message': 'Invalid credentials'}, status=401)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        role = 'ADMINISTRATOR' if user.is_superuser else 'LIBRARIAN'
        return Response({
            'success': True,
            'user': {'id': str(user.id), 'username': user.username, 'full_name': f"{user.first_name} {user.last_name}".strip() or user.username, 'role': role}
        })

    @action(detail=False, methods=['post'])
    def logout(self, request):
        if request.user.is_authenticated: request.user.auth_token.delete()
        return Response({'success': True})

class CatalogViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    lookup_field = 'isbn'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'isbn', 'barcode_id']
    ordering_fields = ['created_at', 'loan_count', 'title']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'waterfall_search']: return [permissions.AllowAny()]
        return [IsLibrarianOrAdmin()]

    @action(detail=False, methods=['get'])
    def waterfall_search(self, request):
        isbn = request.query_params.get('isbn')
        if not isbn: return Response({'error': 'ISBN required'}, status=400)
        if Book.objects.filter(isbn=isbn).exists():
            book = Book.objects.get(isbn=isbn)
            return Response({'source': 'LOCAL', 'status': 'FOUND', 'data': BookSerializer(book).data})
        external_data = CatalogingService.fetch_book_metadata(isbn)
        if external_data: return Response({'source': 'EXTERNAL', 'status': 'FOUND', 'data': external_data})
        return Response({'source': 'ALL', 'status': 'NOT_FOUND'}, status=404)

class PatronViewSet(viewsets.ModelViewSet):
    queryset = Patron.objects.all()
    serializer_class = PatronSerializer
    permission_classes = [IsLibrarianOrAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name', 'student_id']

class CirculationViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action == 'place_hold': return [permissions.AllowAny()]
        return [IsLibrarianOrAdmin()]

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        patron_id = request.data.get('patron_id')
        book_barcodes = request.data.get('books', [])
        try:
            patron = Patron.objects.get(student_id=patron_id)
        except Patron.DoesNotExist:
            return Response({'success': False, 'message': 'Patron not found'}, status=404)
        if patron.is_blocked: return Response({'success': False, 'message': 'Patron is blocked'}, status=403)
        success_count = 0
        errors = []
        for barcode in book_barcodes:
            try:
                book = Book.objects.get(barcode_id=barcode)
                rule = CirculationRule.objects.filter(patron_group=patron.patron_group, material_type=book.material_type).first()
                loan_days = rule.loan_days if rule else 14
                due_date = timezone.now() + timedelta(days=loan_days)
                if book.status != 'AVAILABLE':
                    active_hold = Hold.objects.filter(book=book, is_active=True).first()
                    if book.status == 'HELD' and active_hold and active_hold.patron == patron: active_hold.delete()
                    else:
                        errors.append(f"{book.title}: Status {book.status}")
                        continue
                Loan.objects.create(book=book, patron=patron, due_date=due_date)
                book.status = 'LOANED'
                book.loan_count += 1
                book.save()
                success_count += 1
            except Book.DoesNotExist: errors.append(f"Barcode {barcode}: Not found")
        return Response({'success': True, 'processed': success_count, 'errors': errors, 'message': f"Checked out {success_count} items."})

    @action(detail=False, methods=['post'])
    def return_book(self, request):
        barcode = request.data.get('barcode')
        book = Book.objects.filter(barcode_id=barcode).first()
        if not book: return Response({'success': False, 'message': 'Book not found'}, status=404)
        loan = Loan.objects.filter(book=book, returned_at__isnull=True).first()
        fine = Decimal('0.00')
        days_overdue = 0
        if loan:
            loan.returned_at = timezone.now()
            loan.save()
            if loan.due_date < timezone.now():
                delta = timezone.now() - loan.due_date
                days_overdue = delta.days
                if days_overdue > 0:
                    rule = CirculationRule.objects.filter(patron_group=loan.patron.patron_group, material_type=book.material_type).first()
                    fine_rate = rule.fine_per_day if rule else Decimal('0.50')
                    # Ensure fine is calculated as Decimal
                    fine = Decimal(days_overdue) * fine_rate
                    loan.patron.fines += fine
                    loan.patron.is_blocked = True
                    loan.patron.save()
        next_hold = Hold.objects.filter(book=book, is_active=False).order_by('created_at').first()
        next_patron_data = None
        if next_hold:
            next_hold.is_active = True
            next_hold.expires_at = timezone.now() + timedelta(hours=24)
            next_hold.save()
            book.status = 'HELD'
            book.hold_expires_at = next_hold.expires_at
            book.queue_length = Hold.objects.filter(book=book, is_active=False).count()
            book.save()
            next_patron_data = PatronSerializer(next_hold.patron).data
        else:
            book.status = 'AVAILABLE'
            book.hold_expires_at = None
            book.queue_length = 0
            book.save()
        return Response({'success': True, 'fine_amount': float(fine), 'days_overdue': days_overdue, 'book': BookSerializer(book).data, 'next_patron': next_patron_data})
