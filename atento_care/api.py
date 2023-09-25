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

                    title = 'Available' if not is_booked else 'Booked'
                    color = 'green' if not is_booked else 'red'

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
                'status': sa.status  # Agrega un campo de estado
            })

        return JsonResponse(events, safe=False)

    elif request.method == 'POST':
        event_id = request.POST.get('event_id')
        notes = request.POST.get('notes', '')  

        try:
            availability = DoctorAvailability.objects.get(id=event_id)
            patient = Patient.objects.get(user=request.user) 

            day = timezone.now() + timedelta(days=(availability.day_of_week - timezone.now().weekday() - 1) % 7)
            start_time = timezone.make_aware(datetime.combine(day.date(), availability.start_time))
            end_time = timezone.make_aware(datetime.combine(day.date(), availability.end_time))

            new_appointment = ScheduledAppointment(
                doctor=availability.doctor,
                patient=patient,
                start_time=start_time,
                end_time=end_time,
                date=start_time.date(),
                status='REQUESTED',
                patient_notes=notes,
            )
            new_appointment.save()

        # Incluyendo detalles de la nueva cita en la respuesta JSON
            return JsonResponse({
                'status': 'success',
                'appointmentDetails': {
                    'id': new_appointment.id,
                    'start': start_time.isoformat(),
                    'end': end_time.isoformat(),
                    'status': 'REQUESTED',
                    'patient_notes': notes,
                }
            }, status=200)

        except DoctorAvailability.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Availability not found'}, status=404)



@csrf_exempt
def api_create_appointment(request):
    print ("hola")