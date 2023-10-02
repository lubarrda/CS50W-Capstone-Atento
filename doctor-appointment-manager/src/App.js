import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';


function getCsrfToken() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('csrftoken=')) {
      return cookie.substring('csrftoken='.length, cookie.length);
    }
  }
  return '';
}

function App() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    
    const csrfToken = getCsrfToken(); 

    fetch(`/api/get_all_appointments/`, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken, 
      },
    })
      .then(response => response.json())
      .then(data => setAppointments(data));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    
    const csrfToken = getCsrfToken(); 

    fetch(`/api/update_appointment/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
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
      <Typography variant="h3" gutterBottom>
        Requested Appointments
      </Typography>
      {appointments.filter(appt => appt.status === 'REQUESTED').map(appt => (
        <Card key={appt.id} variant="outlined" style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Date: {new Date(appt.start).toLocaleString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Notes: {appt.patient_notes}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => handleStatusChange(appt.id, 'ACCEPTED')}>
              Accept
            </Button>
            <Button variant="contained" color="secondary" onClick={() => handleStatusChange(appt.id, 'REJECTED')} style={{ marginLeft: '10px' }}>
              Reject
            </Button>
          </CardContent>
        </Card>
      ))}
      
      <Typography variant="h3" gutterBottom>
        Accepted Appointments
      </Typography>
      {appointments.filter(appt => appt.status === 'ACCEPTED').map(appt => (
        <Card key={appt.id} variant="outlined" style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Date: {new Date(appt.start).toLocaleString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Notes: {appt.patient_notes}
            </Typography>
          </CardContent>
        </Card>
      ))}

      <Typography variant="h3" gutterBottom>
        Rejected Appointments
      </Typography>
      {appointments.filter(appt => appt.status === 'REJECTED').map(appt => (
        <Card key={appt.id} variant="outlined" style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Date: {new Date(appt.start).toLocaleString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Notes: {appt.patient_notes}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default App;