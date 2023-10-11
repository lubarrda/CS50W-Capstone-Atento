from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView
from .forms import (
    CustomUserCreationForm, DoctorForm, PatientForm, 
    DoctorUpdateForm, PatientUpdateForm, DoctorAvailabilityForm
)
from .models import CustomUser, Doctor, Patient, DoctorAvailability, ScheduledAppointment
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.utils import timezone
from datetime import datetime, timedelta



def register_request(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            print(type(user))
            messages.success(request, "Registration successful. Welcome to Atento.")
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
                messages.success(request, "Login successful.")
                return redirect("home")
    else:
        form = AuthenticationForm()
    return render(request=request, template_name="atento_care/login.html", context={"login_form":form})

def logout_request(request):
    logout(request)
    messages.info(request, "You have successfully logged out. See you soon!") 
    return redirect("home")

# Views for  Doctor and Patient forms.
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
            doctor = get_object_or_404(Doctor, user=request.user)
            return render(request, 'atento_care/doctor_profile.html', {'doctor': doctor})
        elif request.user.user_type == "PATIENT":
            patient = get_object_or_404(Patient, user=request.user)
        return render(request, 'atento_care/patient_profile.html', {'patient': patient})
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
    appointments = ScheduledAppointment.objects.filter(doctor=request.user.doctor)
    
    events = []
    for slot in availability:
        is_booked = appointments.filter(
            start_time__gte=timezone.make_aware(datetime.combine(timezone.localtime().date(), slot.start_time)),
            end_time__lte=timezone.make_aware(datetime.combine(timezone.localtime().date(), slot.end_time))
        ).exists()

        events.append({
            'title': 'Available',
            'start': slot.start_time,
            'end': slot.end_time,
        })

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

    return render(request, "atento_care/view_availability.html", {"availability_forms": forms, "events": events})


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

