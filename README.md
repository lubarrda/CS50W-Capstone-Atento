# Atento - The Appointment Management Hub

Welcome to Atento, the centralized hub crafted for optimizing the appointment scheduling process. Atento provides a streamlined platform for efficient appointment management.

## Key Components

### Atento Core (`/atento`)
This directory contains the primary settings and configurations for the Atento project.

### Atento Care App (`/atento_care`)
The `atento_care` app is a specialized healthcare solution within Atento. Key components include:
- **Backend Logic (`api.py`)**: Manages data related to doctor availability and scheduled appointments.
- **Database Models (`models.py`)**: Defines the database structure for doctors, patients, availability, and appointments.
- **Frontend Templates and Scripts**: Provides the frontend interface and interactivity. Key components include:
  - Templates: `doctor_calendar.html`, `add_availability.html`, and other profile and form templates.
  - Scripts: `doctor_calendar.js` for dynamic calendar functionalities and interactions.


### Doctor Appointment Manager (`/static/react_app`)
This is a React-based module that offers an enhanced user experience. It fetches and displays appointments, allowing users to change appointment data.

## Distinctiveness and Complexity

Atento stands out as a distinctive appointment management system that effectively bridges the often-fragmented communication in the healthcare domain. Unlike generic scheduling or booking systems, Atento is specifically tailored to accommodate the intricacies and nuances of doctor-patient interactions.

**Why Atento is Distinctive**:

1. **Integration Django and React**: Atento uses Django for the backend and React. Specifically, the React part, located in `/static/react_app`, is the heart of our scheduling interface. It fetches and shows appointments, lets users change appointment statuses, and updates in real-time. This setup makes Atento special.

2. **Real-time Availability and Scheduling**: Unlike static booking systems, Atento provides real-time updates. When doctors set their availability, it's instantly reflected to the patients, ensuring no double bookings or scheduling conflicts.
3. **Role-Based Features**: Atento offers distinct features based on user roles (Doctor or Patient), ensuring a customized experience tailored to the specific needs of each role.

**Complexity Justification**:

1. **Data Synchronization**: The `atento_care` app ensures meticulous data synchronization between the frontend and backend, maintaining data integrity and providing users with up-to-date information.
2. **Nested Modules**: The inclusion of the `doctor-appointment-manager`, a React-based module within `atento_care`, underscores Atento's multi-layered complexity. This module not only offers a dynamic appointment interface but also interacts seamlessly with Django's backend.
3. **Dynamic UI/UX**: Through React and the custom JavaScript in `doctor_calendar.js`, Atento provides a dynamic interface where appointment statuses can be changed on-the-fly, reflecting changes instantaneously without the need for page reloads. The calendar functionality further refines the user experience, allowing direct interactions with available slots.
4. **Comprehensive Features**: From setting availability, viewing doctor profiles, to managing appointment statuses, making it a comprehensive solution for both doctors and patients.

In summary, Atento is not just another appointment system. It's a thoughtfully designed platform, leveraging the best of both Django and React, complemented by custom JavaScript functionalities, to provide a seamless, efficient, and user-friendly experience.


## File Structure and Components

### Atento Core (`/atento`)
This directory contains the primary settings and configurations for the Atento project.

### `(/atento_care)`
This is the core Django application managing the backend logic, database models, and main user interactions.

### (`views.py`)
Within `views.py`, the views handling the logic and interaction between the frontend and backend are defined:

*Registration and Authentication:*
- **`register_request`**: Allows users to register on Atento.
- **`login_request`**: Authenticates users and lets them log in.
- **`logout_request`**: Logs out an authenticated user.

*User Profiles:*
- **`doctor_form`** and **`patient_form`**: Allow doctor and patient type users respectively to fill and save their details.
- **`update_doctor_profile`** and **`update_patient_profile`**: Allow users to update their profile information.
- **`my_account`**: Displays the profile of the authenticated user, be it a doctor or a patient.
- **`view_doctor_profile`** and **`view_patient_profile`**: Allow other users to view the profile of a specific doctor or patient.

*Doctor Availability:*
- **`add_availability`**: Enables doctors to add their availability.
- **`view_availability`**: Displays and manages doctor's availability.

*Doctor Listing and Calendar:*
- **`DoctorListView`**: Lists all registered doctors.
- **`DoctorCalendarView`**: Displays the calendar and availability of a specific doctor.

#### `api.py`
Manages the backend logic for fetching and handling data related to doctor availability and scheduled appointments. It interacts with the database models to ensure real-time updates of availability slots and appointment scheduling.

#### `models.py`
Defines the database models for storing information about doctors, their availability, and scheduled appointments.

#### `doctor_calendar.html`
Constructs the doctor's calendar interface, integrating with the FullCalendar library for a visually appealing scheduling platform.

#### `/static/js/doctor_calendar.js`
This JavaScript file handles the core logic and interactivity for the doctor's calendar view, providing a seamless appointment scheduling experience. It interfaces with the FullCalendar library, offering a dynamic visual representation of doctor availability and scheduled appointments. 
-Initialization: Sets up the calendar with real-time appointment data.
-Appointment Booking: Enables patients to request and doctors to review or modify appointments.
-Interactivity: Provides feedback and interactive elements for users to interact with the calendar.
-Integration: Seamlessly communicates with the Django backend to ensure accurate and live updates.
This script ensures a dynamic and responsive user experience in the appointment scheduling process.

### `/static/react_app`
This directory houses the React application (doctor-appointment-manager) responsible for the interactive scheduling interface, acting as a bridge between patients and doctors for efficient appointment management.

This is the main React component. It manages the fetching of appointments, displaying them based on their status, and offers UI elements to change the status of these appointments (e.g., accept, reject, cancel). The component leverages state and effects to ensure real-time updates and interactions, integrating seamlessly with the Django backend through API calls.

## How to Run Atento

1. **Clone the Repository**: Clone this repository to your local machine.
2. **Virtual Environment** (Optional): If you're using a virtual environment (recommended), activate it now.
3. **Install Dependencies**: Navigate to the project directory and run `pip install -r requirements.txt` to install necessary dependencies.
4. **Database Setup**: Apply migrations using `python3 manage.py migrate` (or `python manage.py migrate` depending on your setup).
5. **Run the Server**: Start the server using `python3 manage.py runserver` (or `python manage.py runserver` depending on your setup) and visit `localhost:8000` in your browser.
6. **Create Superuser**: Set up an admin account using `python3 manage.py createsuperuser` (or `python manage.py createsuperuser` depending on your setup).

## Additional Information

Atento integrates Django for backend operations and React for a dynamic frontend experience. The hub also utilizes jQuery, FullCalendar, and Bootstrap to provide a feature-rich, responsive design.

## Dependencies
- Django
- React
- jQuery
- FullCalendar
- Bootstrap 


---

For queries or further information, please contact: @lubarrda