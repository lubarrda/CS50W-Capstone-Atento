function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    try {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            timeZone: 'local',
            events: apiUrl, // use the passed apiUrl here
            eventColor: '#378006', // Default color for events
            eventClick: function (info) {
                // Handle the click on an event
                console.log("Event clicked:", info);
                info.el.style.backgroundColor = info.event.extendedProps.color;
                if (userRole === 'patient') {
                    var start = info.event.startStr;
                    var end = info.event.endStr;
                    console.log("Redirecting to create_appointment with start time:", start, "and end time:", end);
                    window.location.href = "/create_appointment/?start=" + start + "&end=" + end;
                }
            },
            selectable: userRole === 'doctor',
            select: function (info) {
                // Handle the selection of a time range
                console.log("Time range selected:", info);
                if (userRole === 'doctor') {
                    var start = info.startStr; // The start time of the selected range
                    var end = info.endStr; // The end time of the selected range
                    console.log("Redirecting to create_appointment with start time:", start, "and end time:", end);
                    window.location.href = "/create_appointment/?start=" + start + "&end=" + end;
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
