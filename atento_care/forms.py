from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import CustomUser, Doctor, Patient, DoctorAvailability, ScheduledAppointment

# Aquí se ha modificado el formulario de registro para incluir el tipo de usuario.
class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = UserCreationForm.Meta.fields + ('user_type',) # Añade 'user_type' a los campos del formulario.

# Aquí se han creado formularios de perfil para Doctor y Paciente.
class DoctorForm(forms.ModelForm):
    class Meta:
        model = Doctor
        fields = ('years_of_experience', 'specialty')

class DoctorUpdateForm(forms.ModelForm):
    class Meta:
        model = Doctor
        fields = ['years_of_experience', 'specialty']

class PatientForm(forms.ModelForm):
    class Meta:
        model = Patient
        fields = ('birth_year',)

class PatientUpdateForm(forms.ModelForm):
    class Meta:
        model = Patient
        fields = ['birth_year']

class DoctorAvailabilityForm(forms.ModelForm):
    DAYS_OF_WEEK = [
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
        (6, 'Saturday'),
        (7, 'Sunday'),
    ]

    day_of_week = forms.ChoiceField(choices=DAYS_OF_WEEK, label="Day of the week", help_text="Select the day of the week you are available.")
    start_time = forms.TimeField(widget=forms.TimeInput(format='%H:%M'), label="Start Time", help_text="Enter the start time of your availability in 24-hour format (HH:MM).")
    end_time = forms.TimeField(widget=forms.TimeInput(format='%H:%M'), label="End Time", help_text="Enter the end time of your availability in 24-hour format (HH:MM).")

    def __init__(self, *args, **kwargs):
        self.doctor = kwargs.pop('doctor', None)
        super().__init__(*args, **kwargs)

    class Meta:
        model = DoctorAvailability
        fields = ["day_of_week", "start_time", "end_time"]

    def clean(self):
        cleaned_data = super().clean()
        day_of_week = cleaned_data.get('day_of_week')

        # Check if the doctor has already set their availability for this day of the week.
        if DoctorAvailability.objects.filter(doctor=self.doctor, day_of_week=day_of_week).exists():
            raise ValidationError('You have already set your availability for this day of the week.')


class AppointmentForm(forms.ModelForm):
    class Meta:
        model = ScheduledAppointment
        fields = ["start_time", "end_time"]

class ChangeAppointmentStatusForm(forms.ModelForm):
    class Meta:
        model = ScheduledAppointment
        fields = ['status']