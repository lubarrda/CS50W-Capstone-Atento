from django.http import JsonResponse
from .models import DoctorAvailability, ScheduledAppointment, Doctor, Patient
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.utils.timezone import utc
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
import json


@login_required
def api_availability(request, doctor_id=None):
    if request.method == 'GET':
        doctor = get_object_or_404(Doctor, pk=doctor_id) if doctor_id else request.user.doctor
        availabilities = DoctorAvailability.objects.filter(doctor=doctor)
        scheduled_appointments = ScheduledAppointment.objects.filter(doctor=doctor)
        events = []

        for a in availabilities:
            for i in range(30):  # Loop through a month
                day = timezone.now() + timedelta(days=i)
                if day.weekday() == a.day_of_week - 1:  # Python's weekday() function starts with 0=Monday
                    start_datetime = timezone.make_aware(datetime.combine(day.date(), a.start_time)) 
                    end_datetime = timezone.make_aware(datetime.combine(day.date(), a.end_time))


                    is_booked = scheduled_appointments.filter(
                        start_time__gte=start_datetime, 
                        end_time__lte=end_datetime
                    ).exists()

                    events.append({
                        'title': 'Booked' if is_booked else 'Available',
                        'start': start_datetime.isoformat(),
                        'end': end_datetime.isoformat(),
                        'color': 'red' if is_booked else 'green',
                        'is_booked': is_booked  # este campo ahora sólo sirve para indicar el estado en el frontend
                    })

        for sa in scheduled_appointments:
            color = ''
            if sa.status == 'REQUESTED':
                color = 'amber'
            elif sa.status == 'ACCEPTED':
                color = 'pink'
            else:
                color = 'grey'

            # Combina la fecha y la hora en un solo objeto datetime
            start_datetime = timezone.make_aware(datetime.combine(sa.date, sa.start_time.time()))
            end_datetime = timezone.make_aware(datetime.combine(sa.date, sa.end_time.time()))

            events.append({
                'title': sa.status,
                'start': start_datetime.isoformat(),
                'end': end_datetime.isoformat(),
                'color': color
            })

        return JsonResponse(events, safe=False)


@csrf_exempt
def api_create_appointment(request):
    print("Request method:", request.method)
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Parse start and end time and convert them from UTC to local time
            start_time = datetime.fromisoformat(data.get('start').replace("Z", "+00:00")).astimezone(timezone.get_current_timezone())
            end_time = datetime.fromisoformat(data.get('end').replace("Z", "+00:00")).astimezone(timezone.get_current_timezone())

            # Get doctor ID and patient notes
            doctor_id = data.get('doctor_id')
            patient_notes = data.get('notes')
            
            # Validate doctor ID
            if not doctor_id or doctor_id == 'null':
                return HttpResponseBadRequest("Invalid doctor ID")
            
            # Get doctor and patient objects
            doctor = Doctor.objects.get(user__id=doctor_id)
            patient = Patient.objects.get(user=request.user)
            
            with transaction.atomic():
                # Check if the slot is already booked
                if ScheduledAppointment.objects.filter(
                    doctor=doctor,
                    start_time__lt=end_time,
                    end_time__gt=start_time,
                ).exists():
                    return JsonResponse({'status': 'fail', 'error': "Slot not available or already booked"}, status=400)
                
                # Create a new appointment
                new_appointment = ScheduledAppointment(
                    doctor=doctor, 
                    patient=patient, 
                    start_time=start_time, 
                    end_time=end_time, 
                    date=start_time.date(), 
                    status='REQUESTED', 
                    patient_notes=patient_notes
                )
                new_appointment.save()

            return JsonResponse({'status': 'success'})

        except ValueError as e:
            # Handle specific error for datetime parsing
            return JsonResponse({'status': 'fail', 'error': f"Invalid data format: {str(e)}"}, status=400)
        
        except Exception as e:
            # Handle other exceptions
            return JsonResponse({'status': 'fail', 'error': str(e)}, status=500)
    
    else:
        return JsonResponse({'status': 'fail', 'error': 'Invalid request method'}, status=405)

