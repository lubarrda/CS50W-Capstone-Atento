from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser


# User types
class UserType(models.TextChoices):
    DOCTOR = 'DOCTOR', _('Doctor')
    PATIENT = 'PATIENT', _('Patient')

# Custom User model extending from AbstractUser to add user type
class CustomUser(AbstractUser):
    user_type = models.CharField(max_length=50, choices=UserType.choices, default=UserType.PATIENT)

# Doctor model with a one-to-one relation with a User
class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    years_of_experience = models.IntegerField()
    specialty = models.CharField(max_length=100)

# Patient model with a one-to-one relation with a User
class Patient(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    birth_year = models.IntegerField()



# DoctorAvailability. This model stores the availability of a doctor.
# Each entry represents a time slot in which a doctor is available.
class DoctorAvailability(models.Model):
    DAYS_OF_WEEK = [
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
        (6, 'Saturday'),
        (7, 'Sunday'),
    ]

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)  # link to the Doctor model
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)  # 1 for Monday, 7 for Sunday
    start_time = models.TimeField()  # The starting time of the slot
    end_time = models.TimeField()  # The ending time of the slot

    class Meta:
        unique_together = ('doctor', 'day_of_week',)


class ScheduledAppointment(models.Model):
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='REQUESTED')
    doctor_notes = models.TextField(null=True, blank=True)  # Campo nuevo de Appointment
    patient_notes = models.TextField(null=True, blank=True)  # Campo nuevo de Appointment

