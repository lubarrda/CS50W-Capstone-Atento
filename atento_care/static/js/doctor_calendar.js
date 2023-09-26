
    function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);

    const calendarEl = document.getElementById('calendar');

    // Check if the calendar element exists
    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    const doctor_id = calendarEl.getAttribute("data-doctor-id");
    let calendar;

    // Function to format date in a readable string format
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
        return new Date(date).toLocaleString(undefined, options);
    }

    // Function to display the patient appointment modal with necessary information
    function showAppointmentModal(start_str, end_str ) {
        console.log("Start Date String:", start_str);
        console.log("End Date String:", end_str);


        const start_time_select = $('#startTime');
        const end_time_select = $('#endTime');

        const start_date_time = new Date(start_str);
        const end_date_time = new Date(end_str);

        // Set the date field with the formatted start date
        $('#appointmentDate').val(formatDate(start_str));
        $('#patientNotes').val('');
        $('#appointmentStatus').val("Available");

        // Clear and populate the start and end time fields
        start_time_select.empty();
        end_time_select.empty();

        // Initialize time options and populate the time selection fields
        let current_time = new Date(start_date_time);
        while (current_time < end_date_time) {
            let next_time = new Date(current_time.getTime());
            next_time.setMinutes(next_time.getMinutes() + 30);

            if (next_time <= end_date_time) {
                let optionValue = `${current_time.toISOString().split('T')[1].slice(0, -1)} - ${next_time.toISOString().split('T')[1].slice(0, -1)}`;
                let optionElement = new Option(optionValue, optionValue);

                start_time_select.append(optionElement);
                end_time_select.append(optionElement.cloneNode(true));
            }

            current_time = next_time;
        }

        // // Enable the time selection fields
        // startTimeSelect.prop('disabled', false);
        // endTimeSelect.prop('disabled', false);

        // Logic to adjust the selectable end time based on selected start time
        start_time_select.change(function() {
            let selectedStartOptionIndex = this.selectedIndex;
            if (selectedStartOptionIndex >= 0) {
                end_time_select.prop('disabled', false);
                end_time_elect.children('option').each(function(index, option) {
                    option.disabled = index <= selectedStartOptionIndex;
                });
            }
        });

        // Store the original start and end dates in the date element's data attributes
        $('#appointmentDate').data('start', start_str);
        $('#appointmentDate').data('end', end_str);


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
        const patient_notes = $('#patientNotes').val();
        const selected_time_range = $('#startTime').val();

        // Validate the data
        if (!patient_notes) {
            alert("Please provide notes");
            return;
        }

        // Get the selected start and end times
        const startStr = $('#appointmentDate').data('start');
        const endStr = $('#appointmentDate').data('end');
        const [start_time_str, end_time_str] = selected_time_range.split(' - ');
        const start_date = new Date(startStr.split('T')[0] + 'T' + start_time_str + 'Z');
        const end_date = new Date(endStr.split('T')[0] + 'T' + end_time_str + 'Z');

        // Validate the date format
        if (isNaN(start_date) || isNaN(end_date)) {
            alert("Invalid date format. Please select a valid time range.");
            return;
        }

        // Create the data object to send to the backend
        const data = {
            doctor_id: doctor_id,
            start: start_date.toISOString(),
            end: end_date.toISOString(),
            patient_notes: patient_notes
        };

        // Check if the selected time slot is available to avoid overlaping withother request from other user at the same time
        const existing_event = calendar.getEvents().find(event => 
            event.start.toISOString() === data.start && 
            event.end.toISOString() === data.end &&
            event.title === "Available"
        );

        if (!existing_event) {
            alert('The time slot may not longer be available, please select another date.');
            return;
        }

        // Get the CSRF token from the meta tag
        const csrf_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        console.log("ready to send to backend:", data);


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
        // After receiving the response from the backend
        .then(data => {
            console.log("Received response from the backend:", data);
        
            // here we are linking the data with the new variable, appointment
            const appointment = data.appointment;
        
            if (!appointment) {
                throw new Error("No appointment data in the response.");
            }
        
            // Create a new event in the calendar
            calendar.addEvent({
                title: appointment.status,
                start: appointment.start,
                end: appointment.end,
                color: appointment.color,
                extendedProps: {
                patient_notes: appointment.patient_notes
        }
    });

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
        console.log("Event Details:", info.event);
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

