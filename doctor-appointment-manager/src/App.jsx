import React, { useEffect, useState } from "react";
import { Container, Paper, Button, Typography, Box } from "@mui/material";

function App() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch(`/api/get_all_appointments/`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => setAppointments(data));
  }, []);

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
