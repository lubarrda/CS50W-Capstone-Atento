# Atento - The Appointment Management Hub

Welcome to Atento, your centralized hub crafted for optimizing the appointment scheduling process. Anchored by robust technologies like Django and React, Atento provides a streamlined platform for efficient appointment management.

## Distinctiveness and Complexity

Within this hub, the `atento_care` app seamlessly bridges the frontend and backend, underscoring the project's multifaceted complexity through meticulous data synchronization and robust integrity. Nested within `atento_care` is the `doctor-appointment-manager` module, crafted with React, which further augments user interactivity and efficiency. The project adheres to the best practices of software development, ensuring scalability and reliability. The `atento_care` app emerges as a specialized healthcare solution:

- **Doctors**:
  - Through `atento_care`, doctors can effortlessly set and manage their availability.
  - The `add_availability.html` offers a user-friendly interface for doctors to specify their available days and timings.
  - `view_availability.html` provides a comprehensive view where doctors can manage and modify their time slots as needed.

- **Patients**:
  - Patients can seamlessly view doctors' real-time availability.
  - The `DoctorListView` displays a list of all available doctors.
  - With the `DoctorCalendarView`, patients can explore a doctor's calendar, ensuring they book appointments at mutually convenient times.

Complementing the `atento_care` app is the `doctor-appointment-manager`, a React-based module that boosts interactivity. This component not only fetches and displays appointments in real-time but also provides a dynamic interface for appointment status management, bridging patients and doctors for a comprehensive appointment experience.

In essence, Atento bridges the communication gap in the healthcare domain. Every action, from a doctor setting their availability to a patient viewing it, is updated in real-time, fostering a transparent and efficient appointment scheduling process.

## File Structure and Components

### `atento_care`
This is the core Django application managing the backend logic, database models, and main user interactions.

#### `api.py`
Manages the backend logic for fetching and handling data related to doctor availability and scheduled appointments. It interacts with the database models to ensure real-time updates of availability slots and appointment scheduling.

#### `models.py`
Defines the database models for storing information about doctors, their availability, and scheduled appointments.

#### `doctor_calendar.html`
Constructs the doctor's calendar interface, integrating with the FullCalendar library for a visually appealing scheduling platform.

### `doctor-appointment-manager`

This directory houses the React application responsible for the interactive scheduling interface, acting as a bridge between patients and doctors for efficient appointment management.

#### `src/App.js`
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