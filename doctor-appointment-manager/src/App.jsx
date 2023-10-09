import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ButtonGroup from '@mui/material/ButtonGroup';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


// Function to retrieve CSRF token for security during API calls
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
    const [filter, setFilter] = useState('ALL');
  
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
          console.log(data); 
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
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = {
          timeZone: 'UTC',
          dateStyle: 'full', 
          timeStyle: 'short'
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  
    const renderAppointments = () => {
      return appointments.filter(appt => filter === 'ALL' || appt.status === filter).map(appt => (
        <Accordion key={appt.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                    Date: {formatDate(appt.start)} | {filter === 'ALL' ? 'Status: ' + appt.status : 'Patient Notes: ' + appt.patient_notes}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body1" gutterBottom>
                    Patient Username: {appt.patient_username}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Doctor Username: {appt.doctor_username}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Patient Notes: {appt.patient_notes}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Doctor Notes: {appt.doctor_notes || 'No notes yet.'}
                </Typography>
                {userType === 'DOCTOR' && appt.status !== 'REJECTED' && appt.status !== 'CANCELLED' && (
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
                {userType === 'PATIENT' && appt.status !== 'REJECTED' && appt.status !== 'CANCELLED' && (
                    <Button variant="contained" color="secondary" onClick={() => handleStatusChange(appt.id, 'CANCELLED')} style={{ marginLeft: '10px' }}>
                        Cancel
                    </Button>
                )}
            </AccordionDetails>
        </Accordion>
      ));
    };
  
    const filterTitle = () => {
      switch (filter) {
        case 'ALL':
          return 'All Appointments';
        case 'REQUESTED':
          return 'Requested Appointments';
        case 'ACCEPTED':
          return 'Accepted Appointments';
        case 'CANCELLED':
          return 'Cancelled Appointments';
        case 'REJECTED':
          return 'Rejected Appointments';
        default:
          return 'Appointments';
      }
    };
    

    return (
      <div>
        {/* Navegación */}
        <AppBar position="static" color="primary">
    <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
            Doctor Appointment Manager
        </Typography>
        <a href="/home" style={{ marginRight: '15px', textDecoration: 'none', color: 'white' }}>Home</a>
        {userType ? (
            <>
                <a href="/my_account" style={{ marginRight: '15px', textDecoration: 'none', color: 'white' }}>My account</a>
                <a href="/logout" style={{ marginRight: '15px', textDecoration: 'none', color: 'white' }}>Logout</a>
            </>
        ) : (
            <>
                <a href="/register" style={{ marginRight: '15px', textDecoration: 'none', color: 'white' }}>Register</a>
                <a href="/login" style={{ textDecoration: 'none', color: 'white' }}>Login</a>
            </>
        )}
    </Toolbar>
</AppBar>


      {/* Filtro */}
        <div style={{ margin: '20px 0' }}>
          <Typography variant="h6" gutterBottom>
            Filter Appointments:
          </Typography>
          <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
            <Button
              style={filter === 'ALL' ? { backgroundColor: 'darkblue', color: 'white' } : {}}
              onClick={() => setFilter('ALL')}
            >
              All
            </Button>
            <Button
              style={filter === 'REQUESTED' ? { backgroundColor: 'darkblue', color: 'white' } : {}}
              onClick={() => setFilter('REQUESTED')}
            >
              Requested
            </Button>
            <Button
              style={filter === 'ACCEPTED' ? { backgroundColor: 'darkblue', color: 'white' } : {}}
              onClick={() => setFilter('ACCEPTED')}
            >
              Accepted
            </Button>
            <Button
              style={filter === 'CANCELLED' ? { backgroundColor: 'darkblue', color: 'white' } : {}}
              onClick={() => setFilter('CANCELLED')}
            >
              Cancelled
            </Button>
            <Button
              style={filter === 'REJECTED' ? { backgroundColor: 'darkblue', color: 'white' } : {}}
              onClick={() => setFilter('REJECTED')}
            >
              Rejected
            </Button>
          </ButtonGroup>

        </div>

      {/* Aquí debes incluir las citas renderizadas */}
      <Typography variant="h3" gutterBottom>
         {filterTitle()}
      </Typography>
      {renderAppointments()}
      </div> 

    );
  }

export default App;