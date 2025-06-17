import { useState, useEffect } from "react"
import styled from "styled-components"
import { IoCall } from "react-icons/io5"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import maleIcon from "./images/male-gender.png"
import femaleIcon from "./images/femenine.png"
import transgenderIcon from "./images/transgender.png"
import "./BookedAppointments.css"

function BookedAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [currentPage, setCurrentPage] = useState(0)
  const [branchCode, setBranchCode] = useState("")
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const navigate = useNavigate()
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  const cardsPerPage = 8

  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")
    if (code) {
      setBranchCode(code)
      fetchAppointments(code)
    } else {
      console.warn("Branch code not found in localStorage")
    }
    fetchDoctors()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [selectedDate, selectedDoctor, appointments])

  const fetchDoctors = () => {
    const branchCode = localStorage.getItem("selectedBranch")
    const url = branchCode
      ? `${Cosmetologybaseurl}get_doctors/?branch_code=${branchCode}`
      : `${Cosmetologybaseurl}get_doctors/`

    axios
      .get(url, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.success) {
          setDoctors(response.data.doctors)
        }
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error)
      })
  }

  const fetchAppointments = () => {
    const branchCode = localStorage.getItem("selectedBranch")
    let url = `${Cosmetologybaseurl}AppointmentView/`
    const params = []

    if (branchCode) {
      params.push(`branch_code=${branchCode}`)
    }

    if (selectedDoctor) {
      params.push(`doctor_name=${selectedDoctor}`)
    }

    if (params.length > 0) {
      url += "?" + params.join("&")
    }

    axios
      .get(url, {
        withCredentials: true,
      })
      .then((response) => {
        setAppointments(response.data)
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error)
      })
  }

  const filterAppointments = () => {
    let filtered = appointments.filter((appointment) => appointment.appointmentDate === selectedDate)

    if (selectedDoctor) {
      filtered = filtered.filter((appointment) => appointment.patient_handledby === selectedDoctor)
    }

    setFilteredAppointments(filtered)
  }

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value)
  }

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value)
  }

  const getGenderIcon = (gender) => {
    switch (gender.toLowerCase()) {
      case "male":
        return maleIcon
      case "female":
        return femaleIcon
      default:
        return transgenderIcon
    }
  }

  const generateTimeSlots = () => {
    let startTime = new Date(`${selectedDate}T10:00:00`)
    const endTime = new Date(`${selectedDate}T20:00:00`)
    const timeSlots = []

    while (startTime < endTime) {
      const endTimeSlot = new Date(startTime.getTime() + 30 * 60000)
      const timeSlot = {
        start: startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        end: endTimeSlot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      timeSlots.push(timeSlot)
      startTime = endTimeSlot
    }

    return timeSlots
  }

  const timeSlots = generateTimeSlots()

  const handleViewDetailsClick = (appointment) => {
    const role = localStorage.getItem("userRole")
    const basePath = role === "Admin" ? "/Admin/prescription" : "/Doctor/prescription"

    navigate(basePath, {
      state: {
        appointment,
        appointmentDate: appointment.appointmentDate,
        patientUID: appointment.patientUID,
        patientName: appointment.patientName,
        mobileNumber: appointment.mobileNumber,
        branch_code: branchCode,
      },
    })
  }

  const nextPage = () => {
    if ((currentPage + 1) * cardsPerPage < timeSlots.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentSlots = timeSlots.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)

  return (
    <StyledContainer className="appointments-container">
      <h3 className="text-center mb-4">Booked Appointments</h3>
            <div className="date-picker-wrapper">
                <input type="date" value={selectedDate} onChange={handleDateChange} className="date-picker" />
            </div>
      <Pagination>
        <PaginationButton onClick={prevPage} disabled={currentPage === 0}>
          Previous
        </PaginationButton>
        <PaginationButton onClick={nextPage} disabled={(currentPage + 1) * cardsPerPage >= timeSlots.length}>
          Next
        </PaginationButton>
      </Pagination>

      <div className="appointments-list">
        {currentSlots.map((timeSlot, index) => {
          const { start, end } = timeSlot
          const appointmentsInSlot = filteredAppointments.filter(
            (appointment) => appointment.appointmentTime >= start && appointment.appointmentTime < end,
          )
          const hasAppointments = appointmentsInSlot.length > 0

          return (
            <FlipCard
              key={index}
              className={hasAppointments ? "flip-card" : "flip-card no-appointment"}
              hasAppointments={hasAppointments}
            >
              <div className="flip-card-inner">
                <div
                  className={`flip-card-front ${hasAppointments ? "time-slot-background" : "no-appointment-background"}`}
                >
                  <TopSection>
                    <p className="time">{`${start} - ${end}`}</p>
                  </TopSection>
                  {hasAppointments ? (
                    <BottomSection>
                      <h2 className="mt-2">{appointmentsInSlot[0].patientName}</h2>
                      <MobileAndGenderContainer>
                        <p>
                          <IoCall className="mobile-icon" />
                          {appointmentsInSlot[0].mobileNumber}
                        </p>
                        <GenderIcon
                          src={getGenderIcon(appointmentsInSlot[0].gender)}
                          alt={appointmentsInSlot[0].gender}
                        />
                      </MobileAndGenderContainer>
                      <p>Purpose: {appointmentsInSlot[0].purposeOfVisit}</p>
                      <DoctorInfo>
                        <strong>Doctor: {appointmentsInSlot[0].patient_handledby}</strong>
                      </DoctorInfo>
                    </BottomSection>
                  ) : (
                    <BottomSection>
                      <p className="mt-2">No appointment</p>
                    </BottomSection>
                  )}
                </div>
                {hasAppointments && (
                  <div className="flip-card-back">
                    <AppointmentDetails>
                      <h4 style={{ fontSize: "1.3rem" }}>Appointment Details</h4>
                      <center>
                        <Button className="mt-4" onClick={() => handleViewDetailsClick(appointmentsInSlot[0])}>
                          View Details
                        </Button>
                      </center>
                    </AppointmentDetails>
                  </div>
                )}
              </div>
            </FlipCard>
          )
        })}
      </div>
    </StyledContainer>
  )
}

// Styled Components
const StyledContainer = styled.div`
    margin-top: 65px;
`

const TopSection = styled.div`
    background-color: #865CAF;
    color: white;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
`

const BottomSection = styled.div`
    padding: 5px;
    width: 100%;
    box-sizing: border-box;
`

const GenderIcon = styled.img`
    width: 24px;
    height: 24px;
    margin-bottom: 8px;
`

const MobileAndGenderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
`

const DoctorInfo = styled.div`
    margin-top: 8px;
    padding: 5px;
    background-color: #f0f0f0;
    border-radius: 5px;
    text-align: center;
    font-size: 12px;
    color: #865CAF;
`

const AppointmentDetails = styled.div`
    padding: 20px;
    text-align: center;
`

const Button = styled.div`
    padding: 10px;
    background-color: white;
    color: #000;
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
    width: 50%;
    text-align: center;
`

const FlipCard = styled.div`
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: background-color 0.3s ease;
    width: 100%;
    perspective: 1000px;
    ${(props) =>
      !props.hasAppointments &&
      `
        pointer-events: none;
        opacity: 0.5;
        transition: opacity 0.3s ease;
    `}
`

const Pagination = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    gap: 20px;
`

const PaginationButton = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background-color: #865CAF;
    color: white;
    
    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        padding: 8px 16px;
        font-size: 14px;
    }

    @media (max-width: 480px) {
        padding: 6px 12px;
        font-size: 12px;
    }
`

export default BookedAppointments
