import { useEffect, useState } from "react"
import { IoPersonCircleSharp, IoAdd, IoSearch } from "react-icons/io5"
import { Modal } from "react-bootstrap"
import styled from "styled-components"
import PatientForm from "./PatientForm"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import apiRequest from "./apiRequest"

const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL


  const fetchPatients = async () => {
    try {
      const response = await apiRequest(`${Cosmetologybaseurl}patients/`, "GET")

      if (response.success && Array.isArray(response.data)) {
        setPatients(response.data)
      } else {
        setPatients([])
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast.error("Failed to load patients. Please try again.")
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobileNumber.includes(searchTerm)
  )

  const handleAddPatientClick = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    fetchPatients()
  }

  return (
    <StyledContainer className="patient">
      <ToastContainer position="top-right" autoClose={5000} />

      <SearchHeader className="header1">
        <SearchBar className="search-bar">
          <IoSearch className="search-icon" />
          <SearchInput
            type="text"
            placeholder="Name or Mobile Number"
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchBar>

        <IoAdd className="icon" onClick={handleAddPatientClick} />
      </SearchHeader>

      <PatientListContainer className="patient-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientItem
              key={patient.id}
              className="patient-item"
              onClick={() => onSelectPatient(patient)}
            >
              <PatientInfo className="patient-info">
                <ProfileIcon>
                  <IoPersonCircleSharp className="person" />
                </ProfileIcon>

                <PatientDetails>
                  <PatientName>{patient.patientName}</PatientName>
                  <PatientMobile>{patient.mobileNumber}</PatientMobile>
                  {patient.purposeOfVisit && (
                    <PatientPurpose>{patient.purposeOfVisit}</PatientPurpose>
                  )}
                </PatientDetails>
              </PatientInfo>
            </PatientItem>
          ))
        ) : (
          <NoPatients>
            {searchTerm
              ? "No patients match your search"
              : "No patients found. Add a new patient to get started."}
          </NoPatients>
        )}
      </PatientListContainer>

      <CustomModal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Patient</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <PatientForm onClose={handleCloseModal} />
        </Modal.Body>
      </CustomModal>
    </StyledContainer>
  )
}

// Styled components
const StyledContainer = styled.div`
    padding: 20px;
`

const SearchHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
`

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 20px;
    padding: 8px 15px;
    width: 80%;
`

const SearchInput = styled.input`
    border: none;
    outline: none;
    background: transparent;
    margin-left: 10px;
    width: 100%;
    font-size: 16px;
`

const PatientListContainer = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
    max-height: 70vh;
    overflow-y: auto;
`

const PatientItem = styled.li`
    background-color: white;
    border-radius: 8px;
    margin-bottom: 10px;
    padding: 15px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
`

const PatientInfo = styled.div`
    display: flex;
    align-items: center;
`

const ProfileIcon = styled.div`
    font-size: 40px;
    color: #865CAF;
    margin-right: 15px;
`

const PatientDetails = styled.div`
    flex: 1;
`

const PatientName = styled.div`
    font-weight: bold;
    font-size: 18px;
    color: #333;
`

const PatientMobile = styled.div`
    color: #666;
    font-size: 14px;
    margin-top: 4px;
`

const PatientPurpose = styled.div`
    color: #865CAF;
    font-size: 12px;
    margin-top: 4px;
    font-style: italic;
`

const NoPatients = styled.div`
    text-align: center;
    padding: 30px;
    color: #666;
    font-style: italic;
`

const CustomModal = styled(Modal)`
    .modal-dialog {
        max-width: 800px;
    }
    
    .modal-content {
        border-radius: 10px;
    }
    
    .modal-header {
        background-color: #865CAF;
        color: white;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }
    
    .modal-title {
        font-weight: 600;
    }
    
    .close {
        color: white;
    }
`

export default PatientList
