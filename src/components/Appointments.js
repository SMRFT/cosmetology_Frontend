import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Alert, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import PatientList from './PatientList';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie'; // Import js-cookie package

const Appointment = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showPatientList, setShowPatientList] = useState(false);
    const [appointmentsData, setAppointmentsData] = useState([]);
    const [branchCode, setBranchCode] = useState('');
    const datePickerRef = useRef(null);

    useEffect(() => {
        // Get branch_code from cookies when component mounts
        const code = Cookies.get('branch_code');
        if (code) {
            setBranchCode(code);
            console.log('Branch code retrieved from cookies:', code);
        } else {
            console.warn('Branch code not found in cookies');
        }

        const interval = 30;
        setTimeSlots(getTimeSlotsForDate(new Date(), interval));
        fetchAppointments();
    }, []);

    const fetchAppointments = () => {
    axios.get(`http://127.0.0.1:8000/AppointmentView/?branch_code=${branchCode}`)
        .then(response => {
        setAppointmentsData(response.data);
        })
        .catch(error => {
        console.error('Error fetching appointments:', error);
        });
    };


    const generateTimeSlots = (startTime, endTime, interval) => {
        const slots = [];
        let current = startTime;
        while (current < endTime) {
            const next = new Date(current.getTime() + interval * 60000);
            slots.push(`${current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
            current = next;
        }
        return slots;
    };

    const getTimeSlotsForDate = (date, interval) => {
        const startTime = new Date(date.setHours(10, 0, 0, 0));
        const endTime = new Date(date.setHours(20, 0, 0, 0));
        return generateTimeSlots(startTime, endTime, interval);
    };

    const handleBookAppointment = (slot) => {
        setSelectedSlot(slot);
        setShowPatientList(true);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setTimeSlots(getTimeSlotsForDate(new Date(date), 30));
        setShowDatePicker(false);
    };

    const handleSelectPatient = (patient) => {
        const appointmentData = {
            patientUID: patient.patientUID,
            patientName: patient.patientName,
            mobileNumber: patient.mobileNumber,
            appointmentTime: selectedSlot,
            appointmentDate: selectedDate.toISOString().split('T')[0],
            branch_code: branchCode // Include branch_code in the appointment data
        };

        // Check if the patient has an appointment on the same date
        const hasAppointmentSameDate = appointmentsData.some(appointment =>
            appointment.appointmentDate === appointmentData.appointmentDate &&
            appointment.mobileNumber === appointmentData.mobileNumber
        );

        if (hasAppointmentSameDate) {
            toast.error(`Patient with this mobile number already has an appointment today`);
            setShowPatientList(false);
            setIsCreatingAppointment(false);
            return;
        }

        // If not booked, proceed to save the appointment
        axios.post('http://127.0.0.1:8000/Appointmentpost/', appointmentData, {
            headers: {
                'Content-Type': 'application/json',
                // Include branch_code in request headers as well for additional security
                'X-Branch-Code': branchCode
            },
            withCredentials: true // Enable sending cookies with the request
        })
        .then(response => {
            toast.success(`Appointment booked for ${selectedSlot} with ${patient.patientName}`);
            setShowPatientList(false);
            setIsCreatingAppointment(false);
            fetchAppointments(); // Update appointments data after booking
        })
        .catch(error => {
            console.error('There was an error saving the appointment!', error);
            toast.error(error.response?.data?.error || 'Failed to book appointment');
        });
    };

    // Function to check if a slot is already booked
    const isSlotBooked = (slot) => {
        const isBooked = appointmentsData.some(appointment =>
            appointment.appointmentDate === selectedDate.toISOString().split('T')[0] &&
            appointment.appointmentTime === slot
        );

        return isBooked;
    };

    return (
        <StyledContainer>
        <ToastContainer position="top-right" autoClose={5000}/>
        <h3 className="text-center mb-4">Appointment</h3>
        <AppointmentContainer>
            <ListGroupContainer>
                <div className="text-center mb-4">
                    <DateDisplay onClick={() => setShowDatePicker(!showDatePicker)}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: "#C85C8E" }} />
                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </DateDisplay>
                    {showDatePicker && (
                        <DatePickerWrapper ref={datePickerRef}>
                            <DatePicker
                                selected={selectedDate}
                                onChange={handleDateChange}
                                inline
                            />
                        </DatePickerWrapper>
                    )}
                </div>

                {!isCreatingAppointment ? (
                    <CenteredButtonContainer>
                        <button onClick={() => setIsCreatingAppointment(true)}>Book Appointment</button>
                    </CenteredButtonContainer>
                ) : (
                    <ListContainer>
                        {timeSlots.map((slot, index) => (
                            <SlotButton
                                key={index}
                                onClick={() => handleBookAppointment(slot)}
                                disabled={isSlotBooked(slot)}
                                isSelected={selectedSlot === slot}
                            >
                                {slot}
                            </SlotButton>
                        ))}
                    </ListContainer>
                )}
            </ListGroupContainer>
            <Modal show={showPatientList} onHide={() => setShowPatientList(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select a Patient</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PatientList onSelectPatient={handleSelectPatient} branchCode={branchCode} />
                </Modal.Body>
            </Modal>
            </AppointmentContainer>
        </StyledContainer>
    );
};

const StyledContainer = styled(Container)`
    margin-top: 65px;
`;
const AppointmentContainer = styled(Container)`
    padding: 20px;
    max-width: 700px;
    background-color: #725F83;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ListGroupContainer = styled(Container)`
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 400px;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 400px;
    overflow-y: auto;
    width: 100%;
    margin: 0 auto;
    gap: 10px;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }
`;

const CenteredButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const DateDisplay = styled.div`
    padding: 10px;
    font-size: 16px;
    width: fit-content;
    margin: 0 auto;
    cursor: pointer;
    position: relative;
    color: #C85C8E;
    font-weight: bold;
`;

const DatePickerWrapper = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 10px;
`;

const SlotButton = styled(Button)`
    padding: 0.5rem 1rem;
    font-size: 16px;
    border: 1px solid #BCAEC7;
    background-color: #fff;
    color: #BCAEC7;
    border-radius: 20px;
    transition: all 0.3s;
    ${(props) => props.isSelected && `
        background-color: #BCAEC7;
        color: #fff;
    `}
    ${(props) => props.disabled && `
        background-color: #BCAEC7 !important;
        color: #fff;
        border: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        cursor: not-allowed;
    `}
    &:hover {
        background-color: #BCAEC7;
        color: #fff;
        border: 1px solid #BCAEC7;
    }
`;

export default Appointment;