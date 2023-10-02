import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

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
  const [userType, setUserType] = useState(''); 
  const [doctorNotes, setDoctorNotes] = useState({}); 

  useEffect(() => {
    const csrfToken = getCsrfToken(); 
  
    fetch(`/api/get_all_appointments/`, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken, 
      },
      credentials: 'include',
    })
      .then(response => {
        if (response.status === 404) {
          window.location.href = '/accounts/login/';
        } else {
          return response.json();
      }
    })
      .then(data => {
        setAppointments(data);
        console.log(data);  // Añadir esta línea para verificar los datos
      });
  
    fetch('/api/get_user_type/', {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
    })
      .then(response => response.json())
      .then(data => setUserType(data.userType));
  }, []);

  const handleStatusChange = (id, newStatus, notes) => {
    const csrfToken = getCsrfToken(); 
    fetch(`/api/update_appointment/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ status: newStatus, doctor_notes: notes }),
    })
      .then(() => {
        setAppointments(appointments.map(appt =>
          appt.id === id ? { ...appt, status: newStatus, doctor_notes: notes } : appt 
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
                Patient: {appt.patient_username} 
            </Typography>
            <Typography variant="body1" gutterBottom>
                Doctor: {appt.doctor_username}
            </Typography>
            <Typography variant="body1" gutterBottom>
                Patient Notes: {appt.patient_notes}
            </Typography>
            {/* Campo para notas del doctor */}
            {userType === 'DOCTOR' && (
              <>
                <TextField
                  label="Doctor Notes"
                  variant="outlined"
                  fullWidth
                  value={doctorNotes[appt.id] || ''}
                  onChange={(e) => setDoctorNotes({ ...doctorNotes, [appt.id]: e.target.value })}
                  style={{ marginBottom: '10px' }}
                />
                <Button variant="contained" color="primary" onClick={() => handleStatusChange(appt.id, 'ACCEPTED', doctorNotes[appt.id])}>
                  Accept
                </Button>
                <Button variant="contained" color="secondary" onClick={() => handleStatusChange(appt.id, 'REJECTED', doctorNotes[appt.id])} style={{ marginLeft: '10px' }}>
                  Reject
                </Button>
              </>
            )}
            {userType === 'PATIENT' && (
              <Button variant="contained" color="secondary" onClick={() => handleStatusChange(appt.id, 'CANCELLED')} style={{ marginLeft: '10px' }}>
                Cancel
              </Button>
            )}
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
              Patient Notes: {appt.patient_notes}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Doctor Notes: {appt.doctor_notes}
            </Typography>
              <Button variant="contained" color="secondary" onClick={() => handleStatusChange(appt.id, 'CANCELLED')} style={{ marginLeft: '10px' }}>
                Cancel
              </Button>
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