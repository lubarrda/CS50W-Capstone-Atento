
    function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);

    const calendarEl = document.getElementById('calendar');

    // Check if the calendar element exists
    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    const doctorId = calendarEl.getAttribute("data-doctor-id");
    let calendar;

    // Function to format date in a readable string format
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
        return new Date(date).toLocaleString(undefined, options);
    }

    // Function to display the patient appointment modal with necessary information
    function showAppointmentModal(startStr, endStr, existingEvent) {
        console.log("Start Date String:", startStr);
        console.log("End Date String:", endStr);
        console.log(existingEvent);


        const startTimeSelect = $('#startTime');
        const endTimeSelect = $('#endTime');

        const startDateTime = new Date(startStr);
        const endDateTime = new Date(endStr);

        // Set the date field with the formatted start date
        $('#appointmentDate').val(formatDate(startStr));
        $('#patientNotes').val('');
        $('#appointmentStatus').val("Available");

        // Clear and populate the start and end time fields
        startTimeSelect.empty();
        endTimeSelect.empty();

        // Initialize time options and populate the time selection fields
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

        // Enable the time selection fields
        startTimeSelect.prop('disabled', false);
        endTimeSelect.prop('disabled', false);

        // Logic to adjust the selectable end time based on selected start time
        startTimeSelect.change(function() {
            let selectedStartOptionIndex = this.selectedIndex;
            if (selectedStartOptionIndex >= 0) {
                endTimeSelect.prop('disabled', false);
                endTimeSelect.children('option').each(function(index, option) {
                    option.disabled = index <= selectedStartOptionIndex;
                });
            }
        });

        // Store the original start and end dates in the date element's data attributes
        $('#appointmentDate').data('start', startStr);
        $('#appointmentDate').data('end', endStr);


        // Display the appointment modal
        $('#appointmentModal').modal('show');
    }

    // Function to reload calendar events
    function reloadEvents() {
        calendar.refetchEvents();
    }

    // Function to send appointment request to the backend
    function sendAppointmentRequest() {
        // Get necessary data from the form
        const notes = $('#patientNotes').val();
        const selectedTimeRange = $('#startTime').val();

        // Validate the data
        if (!notes) {
            alert("Please provide notes");
            return;
        }

        // Get the selected start and end times
        const startStr = $('#appointmentDate').data('start');
        const endStr = $('#appointmentDate').data('end');
        const [startTimeStr, endTimeStr] = selectedTimeRange.split(' - ');
        const startDate = new Date(startStr.split('T')[0] + 'T' + startTimeStr + 'Z');
        const endDate = new Date(endStr.split('T')[0] + 'T' + endTimeStr + 'Z');

        // Validate the date format
        if (isNaN(startDate) || isNaN(endDate)) {
            alert("Invalid date format. Please select a valid time range.");
            return;
        }

        // Create the data object to send to the backend
        const data = {
            doctor_id: doctorId,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            notes: notes
        };

        // Check if the selected time slot is available
        const existingEvent = calendar.getEvents().find(event => 
            event.start.toISOString() === data.start && 
            event.end.toISOString() === data.end &&
            event.title === "Available"
        );

        if (!existingEvent) {
            alert('The time slot may not be available or already booked.');
            return;
        }

        

        // Get the CSRF token from the meta tag
        const csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        console.log(data);


        // Send the POST request to create a new appointment
        fetch('/api/create_appointment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token  
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            // Handle the response from the backend
            if (!response.ok) {
                return response.json().then(data => Promise.reject(data));
            }
            return response.json();
        })
        .then(data => {
            console.log("Received response:", data);
        
            const appointment = data.appointment;
        
            if (!appointment) {
                throw new Error("No appointment data in the response.");
            }
        
            let existingEventToUpdate = calendar.getEvents().find(event =>
                event.start.toISOString() === appointment.start &&
                event.end.toISOString() === appointment.end &&
                event.title === "Available"
            );
        
            if (existingEventToUpdate) {
                // Update the existing event
                existingEventToUpdate.setProp('title', appointment.status );
                existingEventToUpdate.setProp('color', appointment.color );
                existingEventToUpdate.setExtendedProp('notes', appointment.patient_notes);
            }
        
            console.log(data);
            reloadEvents();
        
            // Hide the appointment modal
            $('#appointmentModal').modal('hide');
        })
        .catch(error => {
            // Handle any errors that occur during the fetch
            console.error('Error:', error);
            alert('Error scheduling appointment: ' + (error.error || 'The time slot may not be available or already booked.'));
        });
        
    }

    function handleEventClick(info) {
        const clickedEvent = info.event;
    
        // Log all the data of the clicked event
        console.log("Event Details:");
        console.log("ID:", clickedEvent.id);
        console.log("Title:", clickedEvent.title);
        console.log("Start Time:", clickedEvent.start.toISOString());
        console.log("End Time:", clickedEvent.end ? clickedEvent.end.toISOString() : "N/A");
        console.log("Extended Properties:", clickedEvent.extendedProps);
        
        const status = clickedEvent.title;
    
        if (userRole === 'doctor' && status === 'REQUESTED') {
            // console.log(all)
        } else if (userRole === 'patient' && status === "Available") {
            const startStr = clickedEvent.start.toISOString();
            const endStr = clickedEvent.end ? clickedEvent.end.toISOString() : null;
            showAppointmentModal(startStr, endStr, !status.includes('Available') ? clickedEvent : null);
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
    
    try {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek',
            timeZone: 'UTC',
            selectable: true,
            events: apiUrl,
            eventClick: handleEventClick,
            eventMouseEnter: handleEventMouseEnter,
            eventMouseLeave: handleEventMouseLeave,
            headerToolbar: {
                right: 'prev,next today',
                center: 'title',
                left: 'dayGridMonth,timeGridWeek,timeGridDay'
            }
        });
        calendar.render();
    } catch (error) {
        console.error('Error initializing calendar:', error);
    }
    
    $('#confirmAppointment').click(sendAppointmentRequest);    


      
}

