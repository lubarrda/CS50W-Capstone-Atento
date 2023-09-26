from django.http import JsonResponse
from .models import DoctorAvailability, ScheduledAppointment, Doctor, Patient
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from django.db import transaction
import json


@login_required  
def api_availability(request, doctor_id=None):
    if request.method == 'GET':  
        # Get doctor object based on doctor_id or logged-in user
        doctor = get_object_or_404(Doctor, pk=doctor_id) if doctor_id else request.user.doctor

        # Query all availabilities and scheduled appointments for the doctor
        availabilities = DoctorAvailability.objects.filter(doctor=doctor)
        scheduled_appointments = ScheduledAppointment.objects.filter(doctor=doctor)
        events = []  

        # Iterating over each availability to create events
        for a in availabilities:
            for i in range(30):  
                day = timezone.now() + timedelta(days=i)
                if day.weekday() == a.day_of_week - 1:
                    start_datetime = timezone.make_aware(datetime.combine(day.date(), a.start_time)) 
                    end_datetime = timezone.make_aware(datetime.combine(day.date(), a.end_time))

                    # Checking if the time slot is already booked
                    is_booked = scheduled_appointments.filter(
                        start_time__gte=start_datetime, 
                        end_time__lte=end_datetime
                    ).exists()

                    title = 'Available' if not is_booked else 'Booked'
                    color = 'green' if not is_booked else 'red'

                    # Appending the event to the events list
                    events.append({
                        'id': a.id,
                        'title': title,
                        'start': start_datetime.isoformat(),
                        'end': end_datetime.isoformat(),
                        'color': color,
                        'status': title

                    })

        for sa in scheduled_appointments:
            color = ''
            title = ''
            if sa.status == 'REQUESTED':
                color = '#FFBF00'
                title = 'REQUESTED'
            elif sa.status == 'ACCEPTED':
                color = 'pink'
                title = 'ACCEPTED'

            start_datetime = timezone.make_aware(datetime.combine(sa.date, sa.start_time.time()))
            end_datetime = timezone.make_aware(datetime.combine(sa.date, sa.end_time.time()))

            events.append({
                'id': sa.id,
                'title': title,
                'start': start_datetime.isoformat(),
                'end': end_datetime.isoformat(),
                'color': color,
                'status': sa.status,
                'patient_notes': sa.patient_notes,
            })

        return JsonResponse(events, safe=False)


@csrf_exempt
def api_create_appointment(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Parsing and converting start and end times
            start_time = datetime.fromisoformat(data.get('start').replace("Z", "+00:00")).astimezone(timezone.get_current_timezone())
            end_time = datetime.fromisoformat(data.get('end').replace("Z", "+00:00")).astimezone(timezone.get_current_timezone())

            doctor_id = data.get('doctor_id')
            patient_notes = data.get('patient_notes')
            
            if not doctor_id or doctor_id == 'null':
                return HttpResponseBadRequest("Invalid doctor ID")
            
            doctor = Doctor.objects.get(user__id=doctor_id)
            patient = Patient.objects.get(user=request.user)
            
            with transaction.atomic():
                availability_slot = DoctorAvailability.objects.filter(
                    doctor=doctor,
                    start_time__lte=start_time.time(),
                    end_time__gte=end_time.time(),
                    day_of_week=start_time.isoweekday()
                ).first()
                
                if availability_slot:
                    new_appointment = ScheduledAppointment(
                        doctor=doctor,
                        patient=patient,
                        start_time=start_time,
                        end_time=end_time,
                        date=start_time.date(),
                        status='REQUESTED',
                        patient_notes= patient_notes
                    )
                    new_appointment.save()
                    
                    return JsonResponse({'status': 'success', 'appointment': { 'title': 'REQUESTED', 'status': 'REQUESTED', 'patient_notes': 'patient_notes', 'color': '#FFBF00', 'start': start_time.isoformat(), 'end': end_time.isoformat()}})
                else:
                    return JsonResponse({'status': 'fail', 'error': "Slot not available or already booked"}, status=400)
        except ValueError as e:
            return JsonResponse({'status': 'fail', 'error': f"Invalid data format: {str(e)}"}, status=400)
        
        except Exception as e:
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)
    
    else:
        return JsonResponse({'status': 'fail', 'error': 'Invalid request method'}, status=405)