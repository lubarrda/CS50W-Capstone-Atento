from django.http import JsonResponse
from .models import DoctorAvailability, ScheduledAppointment, Doctor
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404

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
                    start_datetime = timezone.make_aware(
                        datetime.combine(day.date(), a.start_time))  # Corregido aquí
                    end_datetime = timezone.make_aware(
                        datetime.combine(day.date(), a.end_time))  # Corregido aquí

                    events.append({
                        'title': 'Available',
                        'start': start_datetime.isoformat(),
                        'end': end_datetime.isoformat(),
                        'color': 'green'
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
                'title': 'Appointment',
                'start': start_datetime.isoformat(),
                'end': end_datetime.isoformat(),
                'color': color
            })

        return JsonResponse(events, safe=False)

