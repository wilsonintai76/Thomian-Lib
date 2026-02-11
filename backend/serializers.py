
from rest_framework import serializers
from .models import Book, Patron, Loan, CirculationRule, LibraryEvent, SystemAlert, SystemConfiguration

class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfiguration
        fields = ['logo', 'map_data', 'last_updated']

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class PatronSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patron
        fields = '__all__'

class CirculationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CirculationRule
        fields = '__all__'

class LibraryEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryEvent
        fields = '__all__'

class SystemAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemAlert
        fields = '__all__'
