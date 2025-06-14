"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Container, Modal } from "react-bootstrap"
import styled, { keyframes } from "styled-components"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCalendarAlt,
  faUser,
  faUserMd,
  faCheckCircle,
  faExclamationTriangle,
  faTimes,
  faStethoscope,
  faClock,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons"
import PatientList from "./PatientList"
import axios from "axios"

const Appointment = () => {
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showPatientList, setShowPatientList] = useState(false)
  const [showDoctorList, setShowDoctorList] = useState(false)
  const [appointmentsData, setAppointmentsData] = useState([])
  const [branchCode, setBranchCode] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const datePickerRef = useRef(null)
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")
    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from localStorage:", code)
      fetchAppointments(code)
    } else {
      console.warn("Branch code not found in localStorage")
    }

    const interval = 30
    setTimeSlots(getTimeSlotsForDate(new Date(), interval))
  }, [])

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(true)
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
        setTimeout(() => setSuccessMessage(""), 300) // Wait for animation to complete
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Auto-hide error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      setShowErrorMessage(true)
      const timer = setTimeout(() => {
        setShowErrorMessage(false)
        setTimeout(() => setErrorMessage(""), 300) // Wait for animation to complete
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const fetchAppointments = (code) => {
    axios
      .get(`${Cosmetologybaseurl}AppointmentView/?branch_code=${code}`)
      .then((response) => {
        setAppointmentsData(response.data)
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error)
      })
  }

  const fetchDoctors = () => {
    const url = `${Cosmetologybaseurl}get_doctors/`
    axios
      .get(url, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.success) {
          setDoctors(response.data.doctors)
        } else {
          setErrorMessage("Failed to fetch doctors")
        }
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error)
        setErrorMessage("Failed to fetch doctors")
      })
  }

  const generateTimeSlots = (startTime, endTime, interval) => {
    const slots = []
    let current = startTime
    while (current < endTime) {
      const next = new Date(current.getTime() + interval * 60000)
      slots.push(
        `${current.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${next.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      )
      current = next
    }
    return slots
  }

  const getTimeSlotsForDate = (date, interval) => {
    const startTime = new Date(date.setHours(10, 0, 0, 0))
    const endTime = new Date(date.setHours(20, 0, 0, 0))
    return generateTimeSlots(startTime, endTime, interval)
  }

  const handleBookAppointment = (slot) => {
    setSelectedSlot(slot)
    setShowPatientList(true)
    // Clear any previous messages
    setSuccessMessage("")
    setErrorMessage("")
    setShowSuccessMessage(false)
    setShowErrorMessage(false)
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setTimeSlots(getTimeSlotsForDate(new Date(date), 30))
    setShowDatePicker(false)
  }

  const handleSelectPatient = (patient) => {
    // Check if the patient has an appointment on the same date
    const hasAppointmentSameDate = appointmentsData.some(
      (appointment) =>
        appointment.appointmentDate === selectedDate.toISOString().split("T")[0] &&
        appointment.mobileNumber === patient.mobileNumber,
    )

    if (hasAppointmentSameDate) {
      setErrorMessage(`Patient with this mobile number already has an appointment today`)
      setShowPatientList(false)
      setIsCreatingAppointment(false)
      return
    }

    // Store selected patient and proceed to doctor selection
    setSelectedPatient(patient)
    setShowPatientList(false)
    fetchDoctors() // Fetch doctors when patient is selected
    setShowDoctorList(true)
  }

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor)

    const appointmentData = {
      patientUID: selectedPatient.patientUID,
      patientName: selectedPatient.patientName,
      mobileNumber: selectedPatient.mobileNumber,
      appointmentTime: selectedSlot,
      appointmentDate: selectedDate.toISOString().split("T")[0],
      branch_code: branchCode,
      patient_handledby: doctor.name,
    }

    console.log("Sending appointment data:", appointmentData) // Debug log

    // Save the appointment
    axios
      .post(`${Cosmetologybaseurl}Appointmentpost/`, appointmentData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then((response) => {
        console.log("Appointment response:", response) // Debug log

        // Show success message
        setSuccessMessage(
          `Appointment booked successfully! Patient: ${selectedPatient.patientName}, Doctor: Dr. ${doctor.name}, Time: ${selectedSlot}`,
        )

        // Close modals and reset state
        setShowDoctorList(false)
        setIsCreatingAppointment(false)
        setSelectedPatient(null)
        setSelectedDoctor(null)
        setSelectedSlot(null)

        // Refresh appointments data
        fetchAppointments(branchCode)
      })
      .catch((error) => {
        console.error("Error saving appointment:", error)
        console.error("Error response:", error.response) // Debug log

        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to book appointment. Please try again."

        setErrorMessage(errorMessage)

        // Don't close modals on error, allow user to try again
      })
  }

  const handleCloseDoctorModal = () => {
    setShowDoctorList(false)
    setSelectedPatient(null)
    setSelectedDoctor(null)
  }

  const handleClosePatientModal = () => {
    setShowPatientList(false)
    setSelectedPatient(null)
  }

  // Function to check if a slot is already booked
  const isSlotBooked = (slot) => {
    const isBooked = appointmentsData.some(
      (appointment) =>
        appointment.appointmentDate === selectedDate.toISOString().split("T")[0] &&
        appointment.appointmentTime === slot,
    )
    return isBooked
  }

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false)
    setTimeout(() => setSuccessMessage(""), 300)
  }

  const handleCloseErrorMessage = () => {
    setShowErrorMessage(false)
    setTimeout(() => setErrorMessage(""), 300)
  }

  return (
    <StyledContainer>
      <h3 className="text-center mb-4">Appointment</h3>

      {/* Custom Success Message */}
      {successMessage && (
        <MessageContainer show={showSuccessMessage} type="success">
          <MessageContent>
            <MessageIcon>
              <FontAwesomeIcon icon={faCheckCircle} />
            </MessageIcon>
            <MessageText>{successMessage}</MessageText>
            <CloseButton onClick={handleCloseSuccessMessage}>
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
          </MessageContent>
          <ProgressBar type="success" />
        </MessageContainer>
      )}

      {/* Custom Error Message */}
      {errorMessage && (
        <MessageContainer show={showErrorMessage} type="error">
          <MessageContent>
            <MessageIcon>
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </MessageIcon>
            <MessageText>{errorMessage}</MessageText>
            <CloseButton onClick={handleCloseErrorMessage}>
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
          </MessageContent>
          <ProgressBar type="error" />
        </MessageContainer>
      )}

      <AppointmentContainer>
        <ListGroupContainer>
          <div className="text-center mb-4">
            <DateDisplay onClick={() => setShowDatePicker(!showDatePicker)}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "8px", color: "#C85C8E" }} />
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DateDisplay>
            {showDatePicker && (
              <DatePickerWrapper ref={datePickerRef}>
                <DatePicker selected={selectedDate} onChange={handleDateChange} inline />
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

        {/* Patient Selection Modal */}
        <Modal show={showPatientList} onHide={handleClosePatientModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faUser} style={{ marginRight: "8px", color: "#C85C8E" }} />
              Select a Patient
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PatientList onSelectPatient={handleSelectPatient} branchCode={branchCode} />
          </Modal.Body>
        </Modal>

        {/* Enhanced Doctor Selection Modal */}
        <EnhancedModal show={showDoctorList} onHide={handleCloseDoctorModal} size="lg">
          <EnhancedModalHeader closeButton>
            <EnhancedModalTitle>
              <TitleIcon>
                <FontAwesomeIcon icon={faUserMd} />
              </TitleIcon>
              Select a Doctor
            </EnhancedModalTitle>
          </EnhancedModalHeader>
          <EnhancedModalBody>
            {selectedPatient && (
              <EnhancedPatientInfo>
                <PatientInfoHeader>
                  <FontAwesomeIcon icon={faUser} />
                  <span>Appointment Details</span>
                </PatientInfoHeader>
                <PatientInfoGrid>
                  <PatientInfoItem>
                    <PatientInfoLabel>Patient:</PatientInfoLabel>
                    <PatientInfoValue>{selectedPatient.patientName}</PatientInfoValue>
                  </PatientInfoItem>
                  <PatientInfoItem>
                    <PatientInfoLabel>Mobile:</PatientInfoLabel>
                    <PatientInfoValue>{selectedPatient.mobileNumber}</PatientInfoValue>
                  </PatientInfoItem>
                  <PatientInfoItem>
                    <PatientInfoLabel>Time Slot:</PatientInfoLabel>
                    <PatientInfoValue>
                      <FontAwesomeIcon icon={faClock} style={{ marginRight: "5px" }} />
                      {selectedSlot}
                    </PatientInfoValue>
                  </PatientInfoItem>
                </PatientInfoGrid>
              </EnhancedPatientInfo>
            )}

            <DoctorSectionHeader>
              <FontAwesomeIcon icon={faStethoscope} />
              <span>Available Doctors</span>
            </DoctorSectionHeader>

            <EnhancedDoctorListContainer>
              {doctors.length > 0 ? (
                <DoctorGrid>
                  {doctors.map((doctor, index) => (
                    <DoctorCard key={doctor.id || index} onClick={() => handleSelectDoctor(doctor)}>
                      <DoctorCardHeader>
                        <DoctorAvatar>
                          <FontAwesomeIcon icon={faUserMd} />
                        </DoctorAvatar>
                        <DoctorBasicInfo>
                          <DoctorName>Dr. {doctor.name}</DoctorName>
                          {doctor.specialization && (
                            <DoctorSpecialization>
                              <FontAwesomeIcon icon={faStethoscope} />
                              {doctor.specialization}
                            </DoctorSpecialization>
                          )}
                        </DoctorBasicInfo>
                      </DoctorCardHeader>

                      {doctor.experience && (
                        <DoctorExperience>
                          <FontAwesomeIcon icon={faGraduationCap} />
                          <span>Experience: {doctor.experience}</span>
                        </DoctorExperience>
                      )}

                      <SelectDoctorButton>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Select Doctor
                      </SelectDoctorButton>
                    </DoctorCard>
                  ))}
                </DoctorGrid>
              ) : (
                <LoadingContainer>
                  <LoadingSpinner />
                  <LoadingText>Loading doctors...</LoadingText>
                </LoadingContainer>
              )}
            </EnhancedDoctorListContainer>
          </EnhancedModalBody>
        </EnhancedModal>
      </AppointmentContainer>
    </StyledContainer>
  )
}

// Animations
const slideInDown = keyframes`
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`

const slideOutUp = keyframes`
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(-100%);
        opacity: 0;
    }
`

const progressAnimation = keyframes`
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
`

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`

const pulse = keyframes`
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
`

const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`

// Styled Components
const StyledContainer = styled(Container)`
    margin-top: 65px;
    position: relative;
`

const MessageContainer = styled.div`
  position: fixed;
  top: 65px;
  left: 85%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 400px;
  max-width: 600px;
  color: ${(props) => (props.type === "success" ? "rgb(65, 107, 48)" : "rgb(224, 62, 57)")};
  background: ${(props) =>
    props.type === "success"
      ? "linear-gradient(135deg, rgb(255, 255, 255), rgb(255, 255, 255))"
      : "linear-gradient(135deg, rgb(255, 255, 255), rgb(255, 255, 255))"};
  border-radius: 12px;
  border: 2px solid
    ${(props) => (props.type === "success" ? "rgb(149, 192, 132)" : "rgb(219, 104, 100)")};
  box-shadow: 0 8px 32px
    ${(props) => (props.type === "success" ? "rgb(198, 221, 189)" : "rgb(216, 167, 152)")};
  overflow: hidden;
  animation: ${(props) => (props.show ? slideInDown : slideOutUp)} 0.3s ease-out;
  backdrop-filter: blur(10px);
`

const MessageContent = styled.div`
    display: flex;
    align-items: center;
    padding: 16px 20px;
`

const MessageIcon = styled.div`
    font-size: 24px;
    margin-right: 12px;
    flex-shrink: 0;
`

const MessageText = styled.div`
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
`

const CloseButton = styled.button`
    background: none;
    color: black;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    margin-left: 12px;
    flex-shrink: 0;

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`

const ProgressBar = styled.div`
    height: 4px;
    background: ${(props) => (props.type === "success" ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.3)")};
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        animation: ${progressAnimation} 3s linear;
    }
`

const AppointmentContainer = styled(Container)`
    padding: 20px;
    max-width: 700px;
    background-color: #725F83;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const ListGroupContainer = styled(Container)`
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 400px;
`

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
`

const CenteredButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`

const DateDisplay = styled.div`
    padding: 10px;
    font-size: 16px;
    width: fit-content;
    margin: 0 auto;
    cursor: pointer;
    position: relative;
    color: #C85C8E;
    font-weight: bold;
`

const DatePickerWrapper = styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 10px;
`

const SlotButton = styled(Button)`
    padding: 0.5rem 1rem;
    font-size: 16px;
    border: 1px solid #BCAEC7;
    background-color: #fff;
    color: #BCAEC7;
    border-radius: 20px;
    transition: all 0.3s;
    ${(props) =>
      props.isSelected &&
      `
        background-color: #BCAEC7;
        color: #fff;
    `}
    ${(props) =>
      props.disabled &&
      `
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
`

// Enhanced Modal Styles
const EnhancedModal = styled(Modal)`
    .modal-dialog {
        max-width: 900px;
    }
`

const EnhancedModalHeader = styled(Modal.Header)`
    background: linear-gradient(135deg, #C85C8E 0%, #A07BC6 100%);
    color: white;
    border-bottom: none;
    padding: 20px 30px;
    
    .btn-close {
        filter: brightness(0) invert(1);
        opacity: 0.8;
        
        &:hover {
            opacity: 1;
        }
    }
`

const EnhancedModalTitle = styled(Modal.Title)`
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
`

const TitleIcon = styled.div`
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-size: 1.2rem;
`

const EnhancedModalBody = styled(Modal.Body)`
    padding: 30px;
    background: #f8f9fa;
`

const EnhancedPatientInfo = styled.div`
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 30px;
    border: 1px solid #e9ecef;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    animation: ${fadeInUp} 0.5s ease-out;
`

const PatientInfoHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    color: #C85C8E;
    font-weight: 600;
    font-size: 1.1rem;
    
    svg {
        margin-right: 10px;
        font-size: 1.2rem;
    }
`

const PatientInfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
`

const PatientInfoItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`

const PatientInfoLabel = styled.span`
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
`

const PatientInfoValue = styled.span`
    font-size: 1rem;
    color: #495057;
    font-weight: 600;
    display: flex;
    align-items: center;
    
    svg {
        color: #C85C8E;
        margin-right: 5px;
    }
`

const DoctorSectionHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    color: #495057;
    font-weight: 600;
    font-size: 1.2rem;
    
    svg {
        margin-right: 12px;
        color: #C85C8E;
        font-size: 1.3rem;
    }
`

const EnhancedDoctorListContainer = styled.div`
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #C85C8E;
        border-radius: 3px;
        
        &:hover {
            background: #A07BC6;
        }
    }
`

const DoctorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
`

const DoctorCard = styled.div`
    background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
    border-radius: 15px;
    padding: 25px;
    border: 2px solid #e9ecef;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    animation: ${fadeInUp} 0.5s ease-out;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #C85C8E 0%, #A07BC6 100%);
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }
    
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 35px rgba(200, 92, 142, 0.15);
        border-color: #C85C8E;
        
        &::before {
            transform: scaleX(1);
        }
    }
    
    &:active {
        transform: translateY(-4px);
        animation: ${pulse} 0.3s ease;
    }
`

const DoctorCardHeader = styled.div`
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
`

const DoctorAvatar = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #C85C8E 0%, #A07BC6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    margin-right: 15px;
    flex-shrink: 0;
    box-shadow: 0 4px 15px rgba(200, 92, 142, 0.3);
`

const DoctorBasicInfo = styled.div`
    flex: 1;
`

const DoctorName = styled.h5`
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.2rem;
`

const DoctorSpecialization = styled.div`
    display: flex;
    align-items: center;
    color: #6c757d;
    font-size: 0.95rem;
    font-weight: 500;
    
    svg {
        margin-right: 8px;
        color: #C85C8E;
        font-size: 0.9rem;
    }
`

const DoctorExperience = styled.div`
    display: flex;
    align-items: center;
    color: #495057;
    font-size: 0.9rem;
    margin-bottom: 20px;
    padding: 10px 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 3px solid #C85C8E;
    
    svg {
        margin-right: 10px;
        color: #C85C8E;
    }
`

const SelectDoctorButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #C85C8E 0%, #A07BC6 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    
    svg {
        margin-right: 8px;
        font-size: 1rem;
    }
    
    &:hover {
        background: linear-gradient(135deg, #A07BC6 0%, #8B5A9F 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(200, 92, 142, 0.4);
    }
`

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #6c757d;
`

const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #C85C8E;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 20px;
`

const LoadingText = styled.p`
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
`

export default Appointment
