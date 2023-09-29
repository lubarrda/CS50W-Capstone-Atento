import React, { useEffect, useState } from 'react';

function App() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch CSRF token from cookie or Django frontend
    const csrfToken = getCsrfToken(); // Define this function to fetch CSRF token

    fetch('/api/get_all_appointments/', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken, // Include CSRF token in the request headers
      },
    })
      .then(response => response.json())
      .then(data => setAppointments(data));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    // Fetch CSRF token again for the PUT request
    const csrfToken = getCsrfToken(); // Define this function to fetch CSRF token

    fetch(`/api/update_appointment/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken, // Include CSRF token in the request headers
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(() => {
        setAppointments(appointments.map(appt =>
          appt.id === id ? { ...appt, status: newStatus } : appt
        ));
      });
  };

  return (
    <div>
      <h1>Requested Appointments</h1>
      {appointments.filter(appt => appt.status === 'REQUESTED').map(appt => (
        <div key={appt.id}>
          <p>Date: {new Date(appt.start).toLocaleString()}</p>
          <p>Notes: {appt.patient_notes}</p>
          <button onClick={() => handleStatusChange(appt.id, 'ACCEPTED')}>Accept</button>
          <button onClick={() => handleStatusChange(appt.id, 'REJECTED')}>Reject</button>
        </div>
      ))}

      <h1>Accepted Appointments</h1>
      {appointments.filter(appt => appt.status === 'ACCEPTED').map(appt => (
        <div key={appt.id}>
          <p>Date: {new Date(appt.start).toLocaleString()}</p>
          <p>Notes: {appt.patient_notes}</p>
          {/* You can add a button to reject an accepted appointment */}
        </div>
      ))}

      <h1>Rejected Appointments</h1>
      {appointments.filter(appt => appt.status === 'REJECTED').map(appt => (
        <div key={appt.id}>
          <p>Date: {new Date(appt.start).toLocaleString()}</p>
          <p>Notes: {appt.patient_notes}</p>
          {/* You can add a button to accept a rejected appointment */}
        </div>
      ))}
    </div>
  );
}

export default App;
