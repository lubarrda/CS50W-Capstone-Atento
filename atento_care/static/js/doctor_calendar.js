function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);
    
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    const doctorId = calendarEl.getAttribute("data-doctor-id");

    function showAppointmentModal(startStr, endStr) {
        $('#selectedTimeRange').val(`${startStr} - ${endStr}`);
        $('#appointmentModal').modal('show');
    }

    function sendAppointmentRequest() {
        const selectedTimeRange = $('#selectedTimeRange').val();
        const notes = $('#patientNotes').val();
    
        if (!notes) {
            alert("Please provide notes");
            return;
        }
    
        const [startStr, endStr] = selectedTimeRange.split(' - ');
    
        const data = {
            doctor_id: doctorId,
            start: startStr,
            end: endStr,
            notes: notes
        };
    
        // Obtén el token CSRF del meta tag
        const csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
        fetch('http://127.0.0.1:8000/api/create_appointment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token  // Usar el csrf_token que acabas de obtener
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { 
                    throw new Error(`Error ${response.status}: ${err.error}`); 
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Appointment scheduled successfully');
            $('#appointmentModal').modal('hide');
        })
        .catch(error => {
            alert('Error scheduling appointment: ' + error.message);
            console.error('Error:', error);
        });
    }
    
    

    function handleEventClick(info) {
        console.log("Event clicked:", info);
        
        info.el.style.backgroundColor = info.event.extendedProps.color;

        if (userRole === 'patient' && info.event.title === "Available") {
            const startStr = info.event.start.toISOString();
            const endStr = info.event.end.toISOString();
            showAppointmentModal(startStr, endStr);
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

    function handleTimeRangeSelection(info) {
        console.log("Time range selected:", info);
        
        const events = calendar.getEvents();
        const selectedRangeIsAvailable = events.some(event => 
            info.start >= event.start && info.end <= event.end && event.title === "Available"
        );

        if (userRole === 'patient' && selectedRangeIsAvailable) {
            const startStr = info.start.toISOString(); 
            const endStr = info.end.toISOString(); 
            showAppointmentModal(startStr, endStr);
        } else {
            console.log("Interval not available");
        }
    }

    try {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            timeZone: 'local',
            slotDuration: '00:30:00',
            events: apiUrl,
            eventColor: '#378006',
            eventClick: handleEventClick,
            eventMouseEnter: handleEventMouseEnter,
            eventMouseLeave: handleEventMouseLeave,
            select: handleTimeRangeSelection
        });
        
        console.log("Rendering calendar...");
        calendar.render();
        console.log("Calendar rendered successfully");
        
    } catch (error) {
        console.error("Error occurred while initializing calendar:", error);
    }    

    $('#confirmAppointment').click(sendAppointmentRequest);
}
