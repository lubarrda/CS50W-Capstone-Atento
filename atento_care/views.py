from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import ListView, DetailView
from .forms import CustomUserCreationForm, DoctorForm, PatientForm, DoctorUpdateForm, PatientUpdateForm, DoctorAvailabilityForm # Importa los nuevos formularios.
from .models import CustomUser, Doctor, Patient, DoctorAvailability, ScheduledAppointment
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm  # Login
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import JsonResponse




def register_request(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            print(type(user))
            messages.success(request, "Registration successful. Welcome to Atento.")
            # Aquí se ha añadido una verificación del tipo de usuario para redirigirlo al formulario correspondiente.
            if user.user_type == 'DOCTOR':
                return redirect('doctor_form')
            else:
                return redirect('patient_form')
    else:
        form = CustomUserCreationForm()
    return render(request=request, template_name="atento_care/register.html", context={"register_form":form})

def login_request(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, "Login successful. Welcome back.")
                return redirect("home")
    else:
        form = AuthenticationForm()
    return render(request=request, template_name="atento_care/login.html", context={"login_form":form})

def logout_request(request):
    logout(request)
    messages.info(request, "You have successfully logged out. See you soon!") 
    return redirect("home")

# Aquí se han creado vistas para los formularios Doctor y Patient.
def doctor_form(request):
    if request.method == 'POST':
        form = DoctorForm(request.POST)
        if form.is_valid():
            doctor = form.save(commit=False)
            print(type(request.user))
            doctor.user = request.user
            doctor.save()
            return redirect("home")
    else:
        form = DoctorForm()
    return render(request=request, template_name="atento_care/doctor_form.html", context={"doctor_form":form})

@login_required
def update_doctor_profile(request):
    if request.method == "POST":
        form = DoctorUpdateForm(request.POST, instance=request.user.doctor)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully.")
            return redirect('my_account')
    else:
        form = DoctorUpdateForm(instance=request.user.doctor)
    return render(request=request, template_name="atento_care/update_doctor_profile.html", context={"form":form})

def patient_form(request):
    if request.method == "POST":
        form = PatientForm(request.POST)
        if form.is_valid():
            patient = form.save(commit=False)
            print(type(request.user))
            patient.user = request.user
            patient.save()
            return redirect("home")
    else:
        form = PatientForm()
    return render(request=request, template_name="atento_care/patient_form.html", context={"patient_form":form})

@login_required
def update_patient_profile(request):
    if request.method == "POST":
        form = PatientUpdateForm(request.POST, instance=request.user.patient)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully.")
            return redirect('my_account')
    else:
        form = PatientUpdateForm(instance=request.user.patient)
    return render(request=request, template_name="atento_care/update_patient_profile.html", context={"form":form})

def home_view(request):
    return render(request, 'atento_care/home.html')

def my_account(request, doctor_id=None, patient_id=None):
    if request.user.is_authenticated:  
        if request.user.user_type == 'DOCTOR':
            return render(request, 'atento_care/doctor_profile.html', {'doctor_id': doctor_id})
        elif request.user.user_type == "PATIENT":
            return render(request, 'atento_care/patient_profile.html', {'patient_id': patient_id})
    else:
        return redirect('home')


@login_required
def view_doctor_profile(request, doctor_id):
    doctor = get_object_or_404(Doctor, id=doctor_id)
    return render(request, "atento_care/view_doctor_profile.html", {"doctor": doctor})
    
@login_required
def view_patient_profile(request, patient_id):
    patient = get_object_or_404(Patient, id=patient_id)
    return render(request, "atento_care/view_patient_profile.html", {"patient": patient})

@login_required
def add_availability(request):
    if request.method == "POST":
        form = DoctorAvailabilityForm(request.POST)
        if form.is_valid():
            availability = form.save(commit=False)
            availability.doctor = request.user.doctor
            availability.save()
            messages.success(request, 'Availability added successfully')
            return redirect('view_availability')
    else:
        form = DoctorAvailabilityForm()
    return render(request, "atento_care/add_availability.html", {"form": form})


@login_required
def view_availability(request):
    availability = DoctorAvailability.objects.filter(doctor=request.user.doctor)

    forms = []
    for slot in availability:
        form = DoctorAvailabilityForm(instance=slot)
        forms.append(form)

    if request.method == "POST":
        if 'delete' in request.POST:
            slot = get_object_or_404(DoctorAvailability, id=request.POST.get('delete'))
            slot.delete()
            messages.success(request, 'Availability deleted successfully')
        else:
            slot = get_object_or_404(DoctorAvailability, id=request.POST.get('update_id'))
            form = DoctorAvailabilityForm(request.POST, instance=slot)
            if form.is_valid():
                form.save()
                messages.success(request, 'Availability updated successfully')
        return redirect('view_availability')

    return render(request, "atento_care/view_availability.html", {"availability_forms": forms})



class PatientRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    login_url = '/login/'
    redirect_field_name = 'redirect_to'

    def test_func(self):
        return self.request.user.user_type == 'PATIENT'

class DoctorListView(PatientRequiredMixin, ListView):
    model = Doctor
    template_name = 'atento_care/doctor_list.html'

class DoctorCalendarView(PatientRequiredMixin, DetailView):
    model = Doctor
    template_name = 'atento_care/doctor_calendar.html'


@login_required
def appointment_create_view(request, pk, start, end):
    doctor = get_object_or_404(Doctor, id=pk)
    start_datetime = timezone.make_aware(datetime.strptime(start, '%Y%m%dT%H%M%S'))
    end_datetime = timezone.make_aware(datetime.strptime(end, '%Y%m%dT%H%M%S'))

    # Ensure that this time slot is available
    availabilities = DoctorAvailability.objects.filter(doctor=doctor, day_of_week=start_datetime.weekday() + 1, start_time__lte=start_datetime.time(), end_time__gte=end_datetime.time())
    if not availabilities.exists():
        return HttpResponseBadRequest("This time slot is not available")

    appointment = ScheduledAppointment.objects.create(
        patient=request.user.patient,
        doctor=doctor,
        start_time=start_datetime,
        end_time=end_datetime,
        status='REQUESTED',
    )

    return redirect('view_appointments')

#########################

def calendar_view(request, doctor_id):
    doctor = Doctor.objects.get(pk=doctor_id)
    availabilities = DoctorAvailability.objects.filter(doctor=doctor)
    appointments = ScheduledAppointment.objects.filter(doctor=doctor)

    events = []

    for availability in availabilities:
        for i in range(30):  # Loop through a month
            day = timezone.now() + timedelta(days=i)
            if day.weekday() == availability.day_of_week - 1:  # Python's weekday() function starts with 0=Monday
                start_datetime = timezone.make_aware(datetime.combine(day, availability.start_time))
                end_datetime = timezone.make_aware(datetime.combine(day, availability.end_time))

                events.append({
                    'type': 'availability',
                    'start_time': start_datetime,
                    'end_time': end_datetime,
                })

    for appointment in appointments:
        start_datetime = timezone.make_aware(datetime.combine(appointment.date, appointment.start_time))
        end_datetime = timezone.make_aware(datetime.combine(appointment.date, appointment.end_time))

        events.append({
            'type': 'appointment',
            'start_time': start_datetime,
            'end_time': end_datetime,
            'patient': appointment.patient,
        })

    return render(request, 'atento_care/doctor_calendar.html', {
        'doctor': doctor,
        'events': events,

    })

def create_appointment(request):
    start_str = request.GET.get('start', None)
    end_str = request.GET.get('end', None)


    if start_str:
        start_str = start_str.rsplit(" ", 1)[0]
    if end_str:
        end_str = end_str.rsplit(" ", 1)[0]


    start_time = datetime.fromisoformat(start_str) if start_str else None
    end_time = datetime.fromisoformat(end_str) if end_str else None

    context = {
        'start_time': start_time,
        'end_time': end_time,
        'doctor_id': request.GET.get('doctor_id', None),
    }
    
    if request.method == "POST":
        doctor = Doctor.objects.get(id=request.POST.get('doctor_id'))
        patient = Patient.objects.get(user=request.user)
        start_time = request.POST.get('start_time')
        end_time = request.POST.get('end_time')
        date = request.POST.get('date')
        patient_notes = request.POST.get('patient_notes', '')

        new_appointment = ScheduledAppointment(doctor=doctor, patient=patient, start_time=start_time, end_time=end_time, date=date, status='REQUESTED', patient_notes=patient_notes)
        new_appointment.save()

        return redirect('home')  # redirige a donde quieras después de crear la cita

    return render(request, 'atento_care/create_appointment.html', context)