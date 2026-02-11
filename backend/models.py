
from django.db import models
from django.db.models import JSONField
from django.utils import timezone

class SystemConfiguration(models.Model):
    """
    Global library settings including branding and spatial layout.
    Designed as a single-row configuration table.
    """
    logo = models.TextField(blank=True, null=True) # Base64 Logo String
    map_data = JSONField(default=dict) # Stores { levels: [], shelves: [] }
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"System Config (Updated: {self.last_updated})"

class Book(models.Model):
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('LOANED', 'Loaned'),
        ('LOST', 'Lost'),
        ('PROCESSING', 'Processing'),
        ('HELD', 'Held'),
    ]

    isbn = models.CharField(max_length=13, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    ddc_code = models.CharField(max_length=20, db_index=True)
    call_number = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    barcode_id = models.CharField(max_length=50, unique=True, db_index=True, null=True, blank=True)
    shelf_location = models.CharField(max_length=50, blank=True, null=True)
    
    cover_url = models.URLField(max_length=500, blank=True, null=True)
    hold_expires_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    marc_metadata = JSONField(default=dict)
    material_type = models.CharField(max_length=50, default='REGULAR')
    
    queue_length = models.IntegerField(default=0)
    last_inventoried = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    loan_count = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.shelf_location and self.ddc_code:
            try:
                raw_ddc = self.ddc_code.strip().split()[0]
                ddc_val = float(raw_ddc)
                if 0 <= ddc_val < 300: self.shelf_location = 'Shelf A'
                elif 300 <= ddc_val < 600: self.shelf_location = 'Shelf B'
                elif 600 <= ddc_val < 900: self.shelf_location = 'Shelf C'
                elif ddc_val >= 900: self.shelf_location = 'Shelf D'
                else: self.shelf_location = 'Archive'
            except (ValueError, IndexError):
                self.shelf_location = 'Unknown'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Patron(models.Model):
    GROUP_CHOICES = [
        ('STUDENT', 'Student'),
        ('TEACHER', 'Teacher'),
        ('LIBRARIAN', 'Librarian'),
        ('ADMINISTRATOR', 'Administrator'),
    ]

    student_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    patron_group = models.CharField(max_length=20, choices=GROUP_CHOICES)
    is_blocked = models.BooleanField(default=False)
    fines = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.full_name} ({self.student_id})"

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('FINE_PAYMENT', 'Fine Payment'),
        ('REPLACEMENT_PAYMENT', 'Replacement Payment'),
        ('FINE_ASSESSMENT', 'Fine Assessment'),
        ('REPLACEMENT_ASSESSMENT', 'Replacement Assessment'),
        ('DAMAGE_ASSESSMENT', 'Damage Assessment'),
        ('MANUAL_ADJUSTMENT', 'Manual Adjustment'),
        ('WAIVE', 'Waive'),
    ]
    METHOD_CHOICES = [('CASH', 'Cash'), ('SYSTEM', 'System')]

    patron = models.ForeignKey(Patron, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    librarian_id = models.CharField(max_length=50) # Username or ID
    note = models.TextField(blank=True, null=True)
    book_title = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.type} - {self.patron.student_id} - ${self.amount}"

class Hold(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='holds')
    patron = models.ForeignKey(Patron, on_delete=models.CASCADE, related_name='holds')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']

class CirculationRule(models.Model):
    patron_group = models.CharField(max_length=20)
    material_type = models.CharField(max_length=20)
    loan_days = models.IntegerField(default=14)
    max_items = models.IntegerField(default=3)
    fine_per_day = models.DecimalField(max_digits=4, decimal_places=2, default=0.50)

class Loan(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    patron = models.ForeignKey(Patron, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    returned_at = models.DateTimeField(null=True, blank=True)

class LibraryEvent(models.Model):
    TYPE_CHOICES = [('HOLIDAY', 'Holiday'), ('EXAM', 'Exam'), ('WORKSHOP', 'Workshop'), ('CLUB', 'Club'), ('GENERAL', 'General')]
    title = models.CharField(max_length=200)
    date = models.DateField()
    event_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)

class SystemAlert(models.Model):
    ALERT_TYPES = [('HELP', 'Help Request'), ('SECURITY', 'Security Alert')]
    type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.CharField(max_length=255)
    location = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']
