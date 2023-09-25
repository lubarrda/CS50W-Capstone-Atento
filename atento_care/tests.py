from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from .models import Doctor
from .api import api_availability

class ApiAvailabilityTest(TestCase):
    
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='testpass')
        self.doctor = Doctor.objects.create(user=self.user)

    def test_api_availability(self):
        request = self.factory.get(f'/api/create_appointment/{self.doctor.id}/')
        request.user = self.user
        response = api_availability(request, self.doctor.id)
        self.assertEqual(response.status_code, 200)

