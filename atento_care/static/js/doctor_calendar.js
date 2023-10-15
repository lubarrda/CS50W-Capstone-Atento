
    function initializeCalendar(apiUrl, userRole) {
    console.log("initializeCalendar called with API URL:", apiUrl, "and user role:", userRole);

    const calendarEl = document.getElementById('calendar');
    const doctor_id = calendarEl.getAttribute("data-doctor-id");
    let calendar;
    let csrf_token; // Define csrf_token at a higher scope

    // Check if the calendar element exists
    if (!calendarEl) {
        console.error("No element with ID 'calendar' found");
        return;
    }

    // Function to format date in a readable string format
    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
        return new Date(date).toLocaleString(undefined, options);
    }

        // Function to reload calendar events
    function reloadEvents() {
        calendar.refetchEvents();
    }

    // Function to display the patient appointment modal with necessary information
    function showAppointmentModal(start_str, end_str) {
        // Set the date field with the formatted start date
        $('#appointmentDate').val(formatDate(start_str));
        $('#patientNotes').val('');
        $('#appointmentStatus').val("Available");
    
        // Set the start and end time inputs
        let startOptionValue = new Date(start_str).toISOString().split('T')[1].slice(0, -1);
        let endOptionValue = new Date(end_str).toISOString().split('T')[1].slice(0, -1);
    
        $('#startTime').val(startOptionValue);
        $('#endTime').val(endOptionValue);
    
        // Store the original start and end dates in the date element's data attributes
        $('#appointmentDate').data('start', start_str);
        $('#appointmentDate').data('end', end_str);
    
        // Display the appointment modal
        console.log("start_str:", start_str);
        console.log("end_str:", end_str);

        $('#appointmentModal').modal('show');
    }

    // Function to send appointment request to the backend
    function sendAppointmentRequest() {
        // Get necessary data from the form
        const patient_notes = $('#patientNotes').val();
        const start_time_str = $('#startTime').val();
        const end_time_str = $('#endTime').val();
    
        // Validate the data
        if (!patient_notes) {
            alert("Please provide notes");
            return;
        }
    
        // Get the selected start and end dates
        const startStr = $('#appointmentDate').data('start');
        const endStr = $('#appointmentDate').data('end');
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

            // Refresh the page
            location.reload();
    
            // Hide the appointment modal
            $('#appointmentModal').modal('hide');
        })

        .catch(error => {
            // Handle any errors that occur during the fetch
            console.error('Error:', error);
            alert('Error scheduling appointment: ' + (error.error || 'The time slot may not be available or already booked.'));
        });
    }


    function showDoctorModal(clickedEvent) {
        const event_id = clickedEvent.id;
    
        // Fetch the existing event details from the backend
        fetch(`/api/get_appointment/${event_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            // Use the existing comments from the response, if available
            const doctor_notes = data.doctor_notes || '';
    
            // Populate the modal fields with the event data
            $('#doctorAppointmentDate').val(clickedEvent.start.toISOString().split('T')[0]);
            $('#doctorAppointmentTime').val(
                `${clickedEvent.start.toISOString().split('T')[1].slice(0, -1)} - ${clickedEvent.end.toISOString().split('T')[1].slice(0, -1)}`
            );
            $('#doctorAppointmentStatus').val(clickedEvent.extendedProps.status);
            $('#patientNotes').val(clickedEvent.extendedProps.patient_notes);
            $('#doctorNotes').val(doctor_notes);
    
            // Show the modal
            $('#doctorModal').modal('show');
        })
        .catch(error => {
            console.error('Error fetching appointment details:', error);
        });
    
        // Event listener for the "Update Appointment" button
        $('#updateAppointment').off('click').click(function() {
            // Get the updated status and doctor's notes from the modal
            const status = $('#doctorAppointmentStatus').val();
            const doctor_notes = $('#doctorNotes').val();
            
            // Call the function to send the updated data to the backend
            updateAppointment(event_id, status, doctor_notes, clickedEvent);
        });

    }


    function updateAppointment(event_id, status, doctor_notes, clickedEvent) {
        // Send a PUT request to the backend to update the appointment
        fetch(`/api/update_appointment/${event_id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token  // 
            },
            body: JSON.stringify({
                status: status,
                doctor_notes: doctor_notes
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response
            alert('Appointment updated successfully!');
            if (status === 'REJECTED' || status === 'CANCELLED') {
                // Remove the event from the calendar
                clickedEvent.remove();
            } else {
                // If the status is not 'REJECTED' or 'CANCELLED', update the doctor_notes and other details
                clickedEvent.setExtendedProp('doctor_notes', doctor_notes);
                clickedEvent.setExtendedProp('status', status);
            }
            $('#doctorModal').modal('hide'); // hide the modal
            reloadEvents();
        })
        .catch(error => {
            // Handle any errors
            console.error('Error updating appointment:', error);
            alert('Error updating appointment.');
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
        
        
        if (userRole === 'doctor' && clickedEvent.extendedProps.status !== 'Available' && clickedEvent.extendedProps.status !== 'Booked') {
            showDoctorModal(clickedEvent);
        } else if (userRole === 'patient' && clickedEvent.extendedProps.status === "Available") {
            const startStr = clickedEvent.start.toISOString();
            const endStr = clickedEvent.end ? clickedEvent.end.toISOString() : null;
            showAppointmentModal(startStr, endStr, clickedEvent.extendedProps.status.includes('Available'));
        } else {
            alert("Sorry, you cannot book beyond your available slots."
            );
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

        $('.close, .btn-secondary').on('click', function () {
            $('#appointmentModal').modal('hide');
            
        });
        $('.close, .btn-secondary').on('click', function () {
            $('#doctorModal').modal('hide');
        });


}

