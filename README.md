# Atento Care Web Application

## Introduction

Atento Care is a web-based healthcare application designed to streamline the appointment scheduling process for both patients and doctors. The application allows patients to view the availability of doctors and schedule appointments based on available time slots, whereas doctors have the facility to confirm these appointments, making the healthcare service more efficient and convenient.

## Distinctiveness and Complexity

This project stands out due to its dynamic and interactive calendar functionality, which is a complex feature that enables real-time scheduling of appointments. The implementation of this calendar required sophisticated JavaScript functionalities, and integration with a back-end system for data persistence. The error-handling mechanisms, coupled with a sleek, user-friendly interface, add to the complexity and distinctiveness of the project, satisfying the Capstone CS50's web project requirements. 

## File Structure and Contents

- `doctor_calendar.js`: This JavaScript file contains functions that initialize the calendar, handle events like clicks and mouse movements, and send appointment data to the server using AJAX and Fetch API.
- `api/`: This directory contains files related to the API implementation for creating and managing appointments.
- `templates/`: This folder contains HTML templates which render the different pages of the web application.
- `styles/`: Here, you will find CSS files responsible for styling and layout of the application.
- `views.py`: This Python file contains the back-end logic for rendering templates and handling data between the front-end and the database.
- `models.py`: In this file, you'll find the database models that define the structure of the database.
- Other essential files include `requirements.txt` for listing all the necessary Python packages, and `manage.py` for managing the Django project.

## How to Run the Application

1. Ensure you have Python and Django installed on your system.
2. Install the necessary packages listed in the `requirements.txt` file by running `pip install -r requirements.txt`.
3. Run the Django server using the command `python manage.py runserver`.
4. Open your web browser and navigate to `http://127.0.0.1:8000/` to access the application.

## Additional Information

- The application has been tested thoroughly to handle various edge cases and errors gracefully.
- Patients and doctors have different user roles, and their interfaces are customized accordingly.
- The project demonstrates a good grasp of front-end and back-end integration, utilizing technologies like Django, JavaScript, and AJAX.

## Python Packages

The Python packages required to run this application are listed in the `requirements.txt` file. Be sure to install them before trying to run the application.

---

We hope you find this project both distinctive and complex, showcasing the integration of various web technologies and the development of a useful, real-world application.

