function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);
    var calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    // Obtener el doctor_id del atributo de datos
    var doctorId = calendarEl.getAttribute("data-doctor-id");

    try {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            timeZone: 'local',
            slotDuration: '00:30:00', 
            events: apiUrl,
            eventColor: '#378006',
            eventClick: function (info) {
                console.log("Event clicked:", info);
                info.el.style.backgroundColor = info.event.extendedProps.color;
                if (userRole === 'patient') {
                    var start = info.event.startStr;
                    var end = info.event.endStr;
                    console.log("Redirecting to create_appointment with start time:", start, "and end time:", end);
                    window.location.href = "/create_appointment/?doctor_id=" + doctorId + "&start=" + start + "&end=" + end;
                }
            },
            selectable: userRole === 'doctor',
            select: function (info) {
                console.log("Time range selected:", info);
                if (userRole === 'doctor') {
                    var start = info.startStr;
                    var end = info.endStr;
                    console.log("Redirecting to create_appointment with start time:", start, "and end time:", end);
                    window.location.href = "/create_appointment/?doctor_id=" + doctorId + "&start=" + start + "&end=" + end;
                }
            }
        });
        console.log("Rendering calendar...");
        calendar.render();
        console.log("Calendar rendered successfully");
    } catch (error) {
        console.error("Error occurred while initializing calendar:", error);
    }
}