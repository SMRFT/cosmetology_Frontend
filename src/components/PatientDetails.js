"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { IoPersonCircleSharp, IoAdd, IoSearch } from "react-icons/io5"
import { Modal, Button } from "react-bootstrap"
import PatientForm from "./PatientForm"
import styled from "styled-components"
import "./PatientList.css"
import MedicalHistory from "./MedicalHistory"
import { ToastContainer, toast } from "react-toastify"
import { FaEdit, FaEye, FaTrash, FaNotesMedical, FaFileInvoiceDollar } from "react-icons/fa"
import "react-toastify/dist/ReactToastify.css"
import Cookies from "js-cookie"

const PatientDetails = () => {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false)
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false)
  const [selectedPatientUID, setSelectedPatientUID] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [branchCode, setBranchCode] = useState("")
  const [showEditPatientModal, setShowEditPatientModal] = useState(false)

  // New states for billing modal
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [selectedPatientForBilling, setSelectedPatientForBilling] = useState(null)
  const [userRole, setUserRole] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    // Get branch_code and user role from cookies when component mounts
    const code = Cookies.get("branch_code")
    const role = Cookies.get("userRole") || localStorage.getItem("userRole") || ""

    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from cookies:", code)
    } else {
      console.warn("Branch code not found in cookies")
    }

    setUserRole(role)
    console.log("User role:", role)

    fetchPatients()
  }, [])

  const fetchPatients = () => {
    // Get branch_code from cookies
    const branchCode = Cookies.get("branch_code")

    // If branch code exists, add it as a query parameter
    const url = branchCode
      ? `http://127.0.0.1:8000/patients/?branch_code=${branchCode}`
      : "http://127.0.0.1:8000/patients/"

    axios
      .get(url, {
        withCredentials: true, // Enable sending cookies with the request
      })
      .then((response) => {
        setPatients(response.data)
      })
      .catch((error) => {
        console.error("There was an error fetching the patients!", error)
        toast.error("Failed to load patients. Please try again.")
      })
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || patient.mobileNumber.includes(searchTerm),
  )

  const handleAddPatientClick = () => {
    setShowAddPatientModal(true)
  }

  const handleCloseAddPatientModal = () => {
    setShowAddPatientModal(false)
    fetchPatients() // Fetch the latest patient data when the modal closes
  }

  const handleMedicalHistoryClick = (patient) => {
    // Extract the ID if patientUID is an object
    const id = typeof patient.patientUID === "object" ? patient.patientUID.patientUID : patient.patientUID
    setSelectedPatientUID(id) // Set only the extracted ID
    setShowMedicalHistoryModal(true)
  }

  const handleCloseMedicalHistoryModal = () => {
    setShowMedicalHistoryModal(false)
    setSelectedPatientUID(null)
  }

  const handleViewDetailsClick = (patient) => {
    setSelectedPatient(patient)
    setShowPatientDetailsModal(true)
  }

  const handleEditDetailsClick = (patient) => {
    setSelectedPatient(patient)
    setShowEditPatientModal(true)
  }

  const handleCloseEditPatientModal = () => {
    setShowEditPatientModal(false)
    setSelectedPatient(null)
    fetchPatients() // Refresh patient list after edit
  }

  const handleClosePatientDetailsModal = () => {
    setShowPatientDetailsModal(false)
    setSelectedPatient(null)
  }

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient)
    setShowDeleteConfirmModal(true)
  }

  const confirmDeletePatient = () => {
    if (!patientToDelete) return

    // Include branch code in the delete request URL if available
    const url = branchCode
      ? `http://127.0.0.1:8000/Patients_data/${patientToDelete.patientUID}/?branch_code=${branchCode}`
      : `http://127.0.0.1:8000/Patients_data/${patientToDelete.patientUID}/`

    axios
      .delete(url, {
        withCredentials: true, // Enable sending cookies with the request
      })
      .then(() => {
        toast.success("Patient deleted successfully")
        setShowDeleteConfirmModal(false)
        fetchPatients() // Refresh the list after deletion
      })
      .catch((error) => {
        console.error("Error deleting patient:", error)
        toast.error("Error deleting patient.")
      })
  }

  // New function to handle billing icon click
  const handleBillingIconClick = (patient) => {
    setSelectedPatientForBilling(patient)
    setShowBillingModal(true)
  }

  // Function to navigate to bill page with patient data
  const handleBillingSelection = (type) => {
    if (!selectedPatientForBilling) return

    // Store patient data in sessionStorage to access in the bill component
    sessionStorage.setItem("selectedPatient", JSON.stringify(selectedPatientForBilling))

    // Navigate to the appropriate billing page
    if (type === "bill") {
      navigate("/Reception/NewBill")
    } else if (type === "procedure") {
      navigate("/Reception/NewProcedureBill")
    }

    // Close the modal
    setShowBillingModal(false)
    setSelectedPatientForBilling(null)
  }

  const handleCloseBillingModal = () => {
    setShowBillingModal(false)
    setSelectedPatientForBilling(null)
  }

  // Check if user is receptionist
  const isReceptionist = userRole.toLowerCase() === "receptionist"

  return (
    <StyledContainer className="patient">
      <ToastContainer position="top-right" autoClose={5000} />
      <h3 className="text-center mb-2">Patient Details</h3>
      <header className="header1">
        <div className="search-bar" style={{ width: "30%" }}>
          <IoSearch className="search-icon" />
          <input type="text" placeholder="Name or Mobile Number" value={searchTerm} onChange={handleSearch} />
        </div>
        <IoAdd className="plus-icon" onClick={handleAddPatientClick} />
      </header>
      <ul className="patient-list">
        {filteredPatients.map((patient) => (
          <li key={patient.id} className="patient-item">
            <div className="patient-info">
              <IoPersonCircleSharp className="person" />
              <div>
                <div className="patient-name">{patient.patientName}</div>
                <div className="patient-mobile">{patient.mobileNumber}</div>
              </div>
            </div>
            <PatientActions>
              <button onClick={() => handleMedicalHistoryClick(patient)} title="Medical History">
                <FaNotesMedical />
              </button>
              <button onClick={() => handleViewDetailsClick(patient)} title="View Details">
                <FaEye />
              </button>
              <button onClick={() => handleEditDetailsClick(patient)} title="Edit Details">
                <FaEdit />
              </button>
              <button onClick={() => handleDeleteClick(patient)} title="Delete Patient">
                <FaTrash />
              </button>
              {/* Only show billing button for Receptionists */}
              {isReceptionist && (
                <button onClick={() => handleBillingIconClick(patient)} title="Billing Options">
                  <FaFileInvoiceDollar />
                </button>
              )}
            </PatientActions>
          </li>
        ))}
      </ul>

      {/* Add Patient Modal */}
      <Modal show={showAddPatientModal} onHide={handleCloseAddPatientModal} className="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title>Add Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PatientForm />
        </Modal.Body>
      </Modal>

      {/* Medical History Modal */}
      <Modal show={showMedicalHistoryModal} onHide={handleCloseMedicalHistoryModal} className="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title>Medical History</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedPatientUID && <MedicalHistory patientUID={selectedPatientUID} />}</Modal.Body>
      </Modal>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Modal show={showPatientDetailsModal} onHide={handleClosePatientDetailsModal} className="custom-modal-width">
          <Modal.Header closeButton>
            <Modal.Title>Patient Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Patient Id:</strong> {selectedPatient.patientUID}
            </p>
            <p>
              <strong>Patient Name:</strong> {selectedPatient.patientName}
            </p>
            <p>
              <strong>Mobile Number:</strong> {selectedPatient.mobileNumber}
            </p>
            <p>
              <strong>Age:</strong> {selectedPatient.age}
            </p>
            <p>
              <strong>Gender:</strong> {selectedPatient.gender}
            </p>
            <p>
              <strong>Email:</strong> {selectedPatient.email}
            </p>
            <p>
              <strong>Blood Group:</strong> {selectedPatient.bloodGroup}
            </p>
            <p>
              <strong>Language:</strong> {selectedPatient.language}
            </p>
            <p>
              <strong>Purpose Of Visit:</strong> {selectedPatient.purposeOfVisit}
            </p>
            <p>
              <strong>Address:</strong> {selectedPatient.address}
            </p>
          </Modal.Body>
        </Modal>
      )}

      {/* Edit Patient Modal */}
      <Modal show={showEditPatientModal} onHide={handleCloseEditPatientModal} className="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title>Edit Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && <PatientForm patientData={selectedPatient} onClose={handleCloseEditPatientModal} />}
        </Modal.Body>
      </Modal>

      {/* Billing Options Modal */}
      <Modal show={showBillingModal} onHide={handleCloseBillingModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Billing Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatientForBilling && (
            <div className="text-center mb-3">
              <p>
                <strong>Patient:</strong> {selectedPatientForBilling.patientName}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedPatientForBilling.mobileNumber}
              </p>
            </div>
          )}
          <BillingOptionsContainer>
            <BillingOptionButton onClick={() => handleBillingSelection("bill")} className="bill-option">
              <FaFileInvoiceDollar size={24} />
              <span>New Bill</span>
            </BillingOptionButton>
            <BillingOptionButton onClick={() => handleBillingSelection("procedure")} className="procedure-option">
              <FaNotesMedical size={24} />
              <span>New Procedure Bill</span>
            </BillingOptionButton>
          </BillingOptionsContainer>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBillingModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this patient?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeletePatient}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
    margin-top: 65px;
`

const PatientActions = styled.div`
    display: flex;
    gap: 10px;
    margin-left: auto;
    button {
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
    }
`


const BillingOptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin: 20px 0;
`

const BillingOptionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 20px;
    border: 2px solid #9b85a8;
    border-radius: 10px;
    background-color: f8f9fa;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    font-weight: 500;
    
    &:hover {
        border-color: #9b85a8;
        background-color: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &.bill-option:hover {
        border-color: #9b85a8;
        color: #9b85a8;
    }
    
    &.procedure-option:hover {
        border-color: #9b85a8;
        color: #9b85a8;
    }
    
    span {
        font-weight: 600;
    }
`

export default PatientDetails
