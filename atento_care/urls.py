from django.urls import path

from .views import (register_request, login_request, doctor_form, patient_form, 
                    home_view, logout_request, my_account, update_doctor_profile, 
                    update_patient_profile, view_doctor_profile, 
                    view_patient_profile,
                    add_availability, view_availability, DoctorListView, DoctorCalendarView )

from .api import api_availability, api_create_appointment, api_update_appointment, api_get_appointment

urlpatterns = [
    path('', home_view, name='home'),
    path('register/', register_request, name='register'),
    path('login/', login_request, name='login'),
    path('logout/', logout_request, name='logout'),
    path('doctor_form/', doctor_form, name='doctor_form'),
    path('patient_form/', patient_form, name='patient_form'),
    path('my_account/', my_account, name='my_account'),
    path('update_doctor_profile/', update_doctor_profile, name='update_doctor_profile'),
    path('update_patient_profile/', update_patient_profile, name='update_patient_profile'),
    path('view_doctor_profile/<int:doctor_id>/', view_doctor_profile, name='view_doctor_profile'),
    path('view_patient_profile/<int:patient_id>/', view_patient_profile, name='view_patient_profile'),
    path('add_availability/', add_availability, name='add_availability'),
    path('view_availability/', view_availability, name='view_availability'),
    path('api/availability/', api_availability, name='api_availability'),
    path('api/availability/<int:doctor_id>/', api_availability, name='api_availability_id'),
    path('doctors/', DoctorListView.as_view(), name='doctor_list'),
    path('doctor/<int:pk>/calendar/', DoctorCalendarView.as_view(), name='doctor_calendar'),
    path('api/create_appointment/', api_create_appointment, name='api_create_appointment'),
    path('api/update_appointment/<int:appointment_id>/', api_update_appointment, name='api_update_appointment'),
    path('api/get_appointment/<int:event_id>/', api_get_appointment, name='api_get_appointment'),


    
]