function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);

    const calendarEl = document.getElementById('calendar');

    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    const doctorId = calendarEl.getAttribute("data-doctor-id");
    let calendar;

    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
        return new Date(date).toLocaleString(undefined, options);
    }

    function showAppointmentModal(startStr, endStr) {
        console.log("Start Date String:", startStr);
        console.log("End Date String:", endStr);
    
        const startTimeSelect = $('#startTime');
        const endTimeSelect = $('#endTime');
        
        const startDateTime = new Date(startStr);
        const endDateTime = new Date(endStr);
        
        // Establecer el campo de fecha
        $('#appointmentDate').val(formatDate(startStr));
        
        // Limpiar y llenar los campos de hora de inicio y fin
        startTimeSelect.empty();
        endTimeSelect.empty();
        
        let currentTime = new Date(startDateTime);
        while (currentTime < endDateTime) {
            let nextTime = new Date(currentTime.getTime());
            nextTime.setMinutes(nextTime.getMinutes() + 30);
            
            if (nextTime <= endDateTime) {
                let optionValue = `${currentTime.toISOString().split('T')[1].slice(0, -1)} - ${nextTime.toISOString().split('T')[1].slice(0, -1)}`;
                let optionElement = new Option(optionValue, optionValue);
                
                startTimeSelect.append(optionElement);
                endTimeSelect.append(optionElement.cloneNode(true));
            }
            
            currentTime = nextTime;
        }
        
        startTimeSelect.prop('disabled', false);
        endTimeSelect.prop('disabled', false);
        
        // Ajusta los valores predeterminados y las restricciones
        startTimeSelect.change(function() {
            let selectedStartOptionIndex = this.selectedIndex;
            if (selectedStartOptionIndex >= 0) {
                endTimeSelect.prop('disabled', false);
                endTimeSelect.children('option').each(function(index, option) {
                    option.disabled = index <= selectedStartOptionIndex;
                });
            }
        });
        
        // Guarda las fechas originales como atributos data- en los elementos de fecha y hora
        $('#appointmentDate').data('start', startStr);
        $('#appointmentDate').data('end', endStr);
        
        $('#appointmentModal').modal('show');
    }
    
    
    
    function sendAppointmentRequest() {
        const notes = $('#patientNotes').val();
        const selectedTimeRange = $('#startTime').val();
    
        if (!notes || !selectedTimeRange) {
            alert("Please provide notes and select a time range");
            return;
        }
    
        const startStr = $('#appointmentDate').data('start');
        const endStr = $('#appointmentDate').data('end');
    
        const [startTimeStr, endTimeStr] = selectedTimeRange.split(' - ');
        const startDate = new Date(startStr.split('T')[0] + 'T' + startTimeStr + 'Z');
        const endDate = new Date(endStr.split('T')[0] + 'T' + endTimeStr + 'Z');
    
        if (isNaN(startDate) || isNaN(endDate)) {
            alert("Invalid date format. Please select a valid time range.");
            return;
        }

        const data = {
            doctor_id: doctorId,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            notes: notes
        };


        // Obtén el token CSRF del meta tag
        const csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        console.log(data);

        fetch('/api/create_appointment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token  
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => Promise.reject(data));
            }
            return response.json();
        })
        .then(data => {
            console.log("Response data:", data);
            alert('Appointment scheduled successfully');
        
            const existingEvent = calendar.getEvents().find(event => 
                event.start.toISOString() === data.start && 
                event.end.toISOString() === data.end &&
                event.title === "Available"
            );
            if (existingEvent) {
                existingEvent.remove();
            }
        
            calendar.addEvent({
                title: 'Appointment',
                start: data.start,
                end: data.end,
                color: 'amber'
            });
        
            $('#appointmentModal').modal('hide');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error scheduling appointment: ' + (error.error || 'The time slot may not be available or already booked.'));
         });
    }

    function handleEventClick(info) {
        console.log("Event clicked:", info);
        
        if (userRole === 'patient' && info.event.title === "Available") {
            const startStr = info.event.start.toISOString();
            const endStr = info.event.end.toISOString();
            showAppointmentModal(startStr, endStr);
        } else {
            alert("You can only select Available slots to book an appointment.");
        }
    }

    function handleEventMouseEnter(info) {
        if (info.event.title === "Available") {
            info.el.style.cursor = 'pointer';
        }
    }

    function handleEventMouseLeave(info) {
        info.el.style.cursor = '';
    }



    function fetchEvents(fetchInfo, successCallback, failureCallback) {
        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            successCallback(data);
        })
        .catch(error => {
            failureCallback(error);
            console.error('Error fetching events:', error);
        });
    }

    try {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            timeZone: 'UTC',
            events: fetchEvents,
            eventColor: '#378006',
            eventClick: handleEventClick,
            eventMouseEnter: handleEventMouseEnter,
            eventMouseLeave: handleEventMouseLeave,
            selectable: true,
        });
        calendar.render();
    } catch (error) {
        console.error('Error initializing calendar:', error);
    }

    $('#confirmAppointment').click(sendAppointmentRequest);
}
