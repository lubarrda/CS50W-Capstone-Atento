from django.contrib import admin
from .models import CustomUser, Doctor, Patient, ScheduledAppointment 


admin.site.register(CustomUser)
admin.site.register(Doctor)
admin.site.register(Patient)
admin.site.register(ScheduledAppointment)  
