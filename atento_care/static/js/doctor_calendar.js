function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);
    
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    const doctorId = calendarEl.getAttribute("data-doctor-id");

    function redirectToCreateAppointment(start, end) {
        window.location.href = `/create_appointment/?doctor_id=${doctorId}&start=${start}&end=${end}`;
    }

    function handleEventClick(info) {
        console.log("Event clicked:", info);
        
        // Change the event's background color upon clicking
        info.el.style.backgroundColor = info.event.extendedProps.color;

        if (userRole === 'patient' && info.event.title === "Available") {
            redirectToCreateAppointment(info.event.startStr, info.event.endStr);
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
            redirectToCreateAppointment(info.startStr, info.endStr);
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
}

