import React, { useEffect, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoPersonCircleSharp, IoAdd, IoSearch } from 'react-icons/io5';
import { Modal,Button } from 'react-bootstrap';
import PatientForm from './PatientForm';
import styled from 'styled-components';
import './PatientList.css';
import MedicalHistory from './MedicalHistory';
import { ToastContainer, toast } from 'react-toastify';
import { FaEdit, FaEye, FaTrash, FaNotesMedical } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';
const PatientDetails = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddPatientModal, setShowAddPatientModal] = useState(false);
    const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
    const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
    const [selectedPatientUID, setSelectedPatientUID] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        fetchPatients();
    }, []);
    const fetchPatients = () => {
        axios.get('https://api.shinovadatabase.in/patients/')
            .then(response => {
                setPatients(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the patients!', error);
            });
    };
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };
    const filteredPatients = patients.filter(patient =>
        patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mobileNumber.includes(searchTerm)
    );
    const handleAddPatientClick = () => {
        setShowAddPatientModal(true);
    };
    const handleCloseAddPatientModal = () => {
        setShowAddPatientModal(false);
        fetchPatients(); // Fetch the latest patient data when the modal closes
    };
    const handleMedicalHistoryClick = (patient) => {
        // Extract the ID if patientUID is an object
        const id = typeof patient.patientUID === 'object' ? patient.patientUID.patientUID : patient.patientUID;
        setSelectedPatientUID(id); // Set only the extracted ID
        setShowMedicalHistoryModal(true);
    };
    const handleCloseMedicalHistoryModal = () => {
        setShowMedicalHistoryModal(false);
        setSelectedPatientUID(null);
    };
    const handleViewDetailsClick = (patient) => {
        setSelectedPatient(patient);
        setShowPatientDetailsModal(true);
    };
    const [showEditPatientModal, setShowEditPatientModal] = useState(false);
    const handleEditDetailsClick = (patient) => {
        setSelectedPatient(patient);
        setShowEditPatientModal(true);
    };
    const handleCloseEditPatientModal = () => {
        setShowEditPatientModal(false);
        setSelectedPatient(null);
        fetchPatients(); // Refresh patient list after edit
    };
    const handleClosePatientDetailsModal = () => {
        setShowPatientDetailsModal(false);
        setSelectedPatient(null);
    };
    const handleDeleteClick = (patient) => {
        setPatientToDelete(patient);
        setShowDeleteConfirmModal(true);
    };
    const confirmDeletePatient = () => {
        if (!patientToDelete) return;
        axios
            .delete(`https://api.shinovadatabase.in/Patients_data/${patientToDelete.patientUID}/`)
            .then(() => {
                toast.success("Patient deleted successfully");
                setShowDeleteConfirmModal(false);
                fetchPatients(); // Refresh the list after deletion
            })
            .catch(error => {
                console.error("Error deleting patient:", error);
                toast.error("Error deleting patient.");
            });
    };
    return (
        <StyledContainer className="patient">
            <ToastContainer position="top-right" autoClose={5000}/>
            <h3 className="text-center mb-2">Patient Details</h3>
            <header className="header1">
                <div className="search-bar" style={{ width: "30%" }}>
                    <IoSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Name or Mobile Number"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
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
                            <button onClick={() => handleMedicalHistoryClick(patient)} title='Medical History'>
                                <FaNotesMedical />
                            </button>
                            <button onClick={() => handleViewDetailsClick(patient)} title='View Details'>
                                <FaEye/>
                            </button>
                            <button onClick={() => handleEditDetailsClick(patient)} title='Edit Details'>
                                <FaEdit/>
                            </button>
                            <button onClick={() => handleDeleteClick(patient)} title='Delete Patient'>
                                <FaTrash/>
                            </button>
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
                <Modal.Body>
                    {selectedPatientUID && <MedicalHistory patientUID={selectedPatientUID} />}
                </Modal.Body>
            </Modal>
            {/* Patient Details Modal */}
            {selectedPatient && (
                <Modal show={showPatientDetailsModal} onHide={handleClosePatientDetailsModal} className="custom-modal-width">
                    <Modal.Header closeButton>
                        <Modal.Title>Patient Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Patient Id:</strong> {selectedPatient.patientUID}</p>
                        <p><strong>Patient Name:</strong> {selectedPatient.patientName}</p>
                        <p><strong>Mobile Number:</strong> {selectedPatient.mobileNumber}</p>
                        <p><strong>Age:</strong> {selectedPatient.age}</p>
                        <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                        <p><strong>Email:</strong> {selectedPatient.email}</p>
                        <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
                        <p><strong>Language:</strong> {selectedPatient.language}</p>
                        <p><strong>Purpose Of Visit:</strong> {selectedPatient.purposeOfVisit}</p>
                        <p><strong>Address:</strong> {selectedPatient.address}</p>
                    </Modal.Body>
                </Modal>
            )}
        <Modal show={showEditPatientModal} onHide={handleCloseEditPatientModal} className="custom-modal-width">
            <Modal.Header closeButton>
                <Modal.Title>Edit Patient</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedPatient && (
                    <PatientForm
                        patientData={selectedPatient}
                        onClose={handleCloseEditPatientModal}
                    />
                )}
            </Modal.Body>
        </Modal>
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this patient?
                </Modal.Body>
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
    );
};
const StyledContainer = styled.div`
    margin-top: 65px;
`;
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
`;
export default PatientDetails;