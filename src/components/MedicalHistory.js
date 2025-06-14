import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { PiTestTubeThin } from "react-icons/pi";
import Image2 from './images/diagnosis.png';
import Image3 from './images/Findings.png';

const Container = styled.div`
    display: flex;
    height: 75vh;   /* Adjust this height as needed */
    overflow: hidden;
`;

const Sidebar = styled.div`
    width: 30%;
    border-right: 1px solid #ddd;
    padding: 10px;
    background-color: #D3E7EE;
    overflow-y: auto;
`;

const AppointmentItem = styled.div`
    cursor: pointer;
    margin-bottom: 10px;
    padding: 10px;
    background-color: ${props => props.isActive ? '#A5D8FF' : '#F1FBFD'};
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 5px solid ${props => props.isChronic ? '#9AE6B4' : '#FEB2B2'};

    &:hover {
        background-color: #e6f7ff;
    }

    &:active {
        background-color: #F1FBFD;
    }
`;

export const PdfCell = styled.td`
  padding: 10px;
  background-color: #f0f0f0; // Light background for the PDF section
  border-radius: 5px;
  a {
    color: #007bff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PatientInfo = styled.div`
    display: flex;
    align-items: center;
`;

const PatientDetails = styled.div`
    display: flex;
    flex-direction: column;
    width: 150px;
`;

const PatientText = styled.p`
    font-size: 0.8em;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DateInfo = styled.div`
    font-size: 0.8em;
    color: #888;
    width: 100px;
`;

const FormType = styled.div`
    font-size: 0.8em;
    color: ${props => props.isChronic ? '#48BB78' : '#E53E3E'};
`;

const Content = styled.div`
    width: 70%;
    padding: 20px;
    overflow-y: auto;
    scrollbar-width: thin;
`;

const PrescriptionTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
`;

const TableHeader = styled.th`
    padding: 8px;
`;

const TableRow = styled.tr`
    &:nth-child(even) {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.td`
    padding: 8px;
`;

const TestsList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const DiagnosisList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const DiagnosisItem = styled.li`
    margin-bottom: 5px;
`;

const FindingsList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const FindingsItem = styled.li`
    margin-bottom: 5px;
`;
const TestItem = styled.li`
    margin-bottom: 5px;
`;

const Section = styled.div`
    margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
    color: black;
    margin-bottom: 10px;
    font-size: 1rem;
`;

const SectionContent = styled.p`
    margin: 5px 0;
`;

const VitalsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
`;

const VitalItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const VitalLabel = styled.span`
    font-size: 0.9em;
    color: #888;
    margin-top: 5px;
`;
const Row = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
`;
const DiagnosisContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:200px;
    scrollbar-width: none;
    width:fit-content;
`;

const ComplaintsContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:200px;
    scrollbar-width: none;
    width:fit-content;
`;

const FindingsContainer = styled.div`
      margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#F8DEFF;
    flex: 1;
    overflow-y: auto;
    height:200px;
    scrollbar-width: none;
    width:fit-content;
`;
const TestContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#DDE8FF;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    width:fit-content;
`;

const PlansContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:fit-content;
    scrollbar-width: none;
    width:fit-content;
`;

const PlansList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const PlansItem = styled.li`
    margin-bottom: 5px;
`;

const ProceduresContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color:#E2DEFF;
    flex: 1;
    overflow-y: auto;
    height:fit-content;
    scrollbar-width: none;
    width:fit-content;
`;

const ProceduresList = styled.ul`
    list-style-type: disc;
    padding-left: 40px;
`;

const ProceduresItem = styled.li`
    margin-bottom: 5px;
`;

const MedicalHistory = ({ patientUID }) => { // Destructure patientUID from props
    const location = useLocation();
    const id = patientUID; // Use patientUID directly
    const [patientDetails, setPatientDetails] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [branchCode, setBranchCode] = useState('');
    const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;

    const parseTests = (testsString) => {
        if (!testsString) return [];
        const regex = /([^,(]+(?:\([^)]*\))?)/g; // Matches items while respecting parentheses
        const matches = [...testsString.matchAll(regex)].map((match) => match[0].trim()).filter(Boolean);
        return matches;
    };

    const parseProcedures = (proceduresString) => {
        if (!proceduresString) return [];
        
        // Split the string by "Procedure:" to separate each procedure
        return proceduresString
          .split("Procedure:")
          .filter((procedure) => procedure.trim() !== "") // Remove empty entries
          .map((procedure) => `Procedure: ${procedure.trim()}`); // Add back "Procedure:" prefix
    };
    
    useEffect(() => {
        // Get branch_code from localStorage when component mounts
        const code = localStorage.getItem('selectedBranch');
        if (code) {
            setBranchCode(code);
            console.log('Branch code retrieved from localStorage:', code);
        } else {
            console.warn('Branch code not found in localStorage');
        }

        if (id && code) { // Ensure branchCode is available before fetching
            const handleFetchDetails = async () => {
                try {
                    const response = await axios.post(`${Cosmetologybaseurl}get_patient_details/`, { 
                        id,
                        branch_code: code // Send branch_code in the request body for POST
                    }, {
                        withCredentials: true
                    });
                    setPatientDetails(response.data);
                } catch (error) {
                    console.error('Error fetching patient details:', error);
                }
            };
            handleFetchDetails();
        }
    }, [id, branchCode, Cosmetologybaseurl]); // Added Cosmetologybaseurl to dependencies

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
    };

    return (
        <Container>
            <Sidebar>
                {patientDetails.length > 0 ? (
                    patientDetails.map((detail, index) => (
                        <AppointmentItem
                            key={index}
                            onClick={() => handleAppointmentClick(detail)}
                            isActive={selectedAppointment && selectedAppointment.appointmentDate === detail.appointmentDate}
                            isChronic={detail.formType === 'Chronic form'}
                        >
                            <PatientInfo>
                                <PatientDetails>
                                    <PatientText>{detail.patientName}</PatientText>
                                    <PatientText>{detail.patientUID}</PatientText>
                                    <FormType isChronic={detail.formType === 'Chronic form'}>{detail.formType}</FormType>
                                </PatientDetails>
                            </PatientInfo>
                            <DateInfo>
                                <p>{new Date(detail.appointmentDate).toLocaleDateString()}</p>
                            </DateInfo>
                        </AppointmentItem>
                    ))
                ) : (
                    <p>No appointments found for the provided UID.</p>
                )}
            </Sidebar>
            <Content>
                {selectedAppointment ? (
                    <div>
                       <Row>
                       <DiagnosisContainer>
                           <Section style={{ flex: 1 }}>
                            <img src={Image2} style={{height: "20%", width: "20%"}} alt="Diagnosis" />
                            <SectionTitle className='mt-2'>Diagnosis</SectionTitle>
                            <DiagnosisList>
                                {selectedAppointment.diagnosis && selectedAppointment.diagnosis.split('\n').map((diagnosis, index) => (
                                    <DiagnosisItem key={index}>{diagnosis.trim()}</DiagnosisItem>
                                ))}
                            </DiagnosisList>
                        </Section>
                        </DiagnosisContainer>
                            <FindingsContainer>
                            <Section style={{ flex: 1 }}>
                            <img src={Image3} style={{height:"20%",width:"20%"}} alt="Findings" />
                            <SectionTitle className='mt-2'>Findings</SectionTitle>
                            <FindingsList>
                                {selectedAppointment.findings && selectedAppointment.findings.split('\n').map((findings, index) => (
                                    <FindingsItem key={index}>{findings.trim()}</FindingsItem>
                                ))}
                            </FindingsList>
                            </Section>
                            </FindingsContainer>
                        </Row>
                        
                        <Section style={{ flex: 1 }}>
                            <SectionTitle className='mt-2'>Complaints</SectionTitle>
                            {Array.isArray(selectedAppointment.complaints) && selectedAppointment.complaints.length > 0 ? (
                                <PrescriptionTable>
                                    <thead>
                                        <tr>
                                            <TableHeader>Complaints</TableHeader>
                                            <TableHeader>Duration</TableHeader>
                                            <TableHeader>Duration Unit</TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedAppointment.complaints.map((complaint, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{complaint.complaints}</TableCell>
                                                <TableCell>{complaint.duration}</TableCell>
                                                <TableCell>{complaint.durationUnit}</TableCell>
                                            </TableRow>
                                        ))}
                                    </tbody>
                                </PrescriptionTable>
                            ) : (
                                <p>No complaints recorded.</p>
                            )}
                        </Section>
                        <Section>
                            <SectionTitle>Prescription:</SectionTitle>
                            {selectedAppointment.prescription ? (
                                <PrescriptionTable>
                                    <thead>
                                        <tr>
                                            <TableHeader>Medication</TableHeader>
                                            <TableHeader>Dosage</TableHeader>
                                            <TableHeader>Frequency</TableHeader>
                                            <TableHeader>Duration</TableHeader>
                                            <TableHeader>Total Dosage</TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedAppointment.prescription.split('\n').map((line, index) => {
                                            const parts = line.split('-').map(part => part.trim());

                                            const medication = parts[0] ? parts[0].split(': ')[1] : 'N/A';
                                            const dosage = parts[1] ? parts[1].split(': ')[1] : 'N/A';
                                            const frequency = parts[2] || 'N/A'; // Directly use the part if present
                                            const duration = parts[3] ? parts[3].split(': ')[1] : 'N/A';
                                            const totalDosage = parts[4] ? parts[4].split(': ')[1] : 'N/A';

                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{medication}</TableCell>
                                                    <TableCell>{dosage}</TableCell>
                                                    <TableCell>{frequency}</TableCell>
                                                    <TableCell>{duration}</TableCell>
                                                    <TableCell>{totalDosage}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </tbody>
                                </PrescriptionTable>
                            ) : (
                                <p>No prescription data available</p>
                            )}
                        </Section>

                        <PlansContainer>
                        <Section>
                            <SectionTitle>Plans</SectionTitle>
                            <PlansList>
                            {selectedAppointment.plans && selectedAppointment.plans.split('\n').map((item, index) => (
                                <PlansItem key={index}>{item}</PlansItem>
                            ))}
                            </PlansList>
                        </Section>
                        </PlansContainer>


                        <TestContainer>
                        <Section>
                            <PiTestTubeThin style={{ fontSize: "2rem" }} />
                            <SectionTitle className="mt-2">Tests</SectionTitle>
                            <TestsList>
                            {parseTests(selectedAppointment.tests).map((test, index) => (
                                <TestItem key={index}>{test}</TestItem>
                            ))}
                            </TestsList>
                        </Section>
                        </TestContainer>

                        <ProceduresContainer>
                        <Section>
                            <SectionTitle>Procedures</SectionTitle>
                            <ProceduresList>
                            {parseProcedures(selectedAppointment.proceduresList).map((procedureDetail, index) => (
                                <ProceduresItem key={index}>{procedureDetail}</ProceduresItem>
                            ))}
                            </ProceduresList>
                        </Section>
                        </ProceduresContainer>

                        <Section>
                        <SectionTitle>Next Visit:</SectionTitle>
                        <SectionContent>
                            {selectedAppointment?.nextVisit || 'No next visit scheduled'}
                        </SectionContent>
                        </Section>

                        {selectedAppointment.vital && (
                        <Section>
                            <SectionTitle>Vitals</SectionTitle>
                            <VitalsContainer>
                                {(() => {
                                    // Parse `vital` if it's a JSON string
                                    const vitals =
                                        typeof selectedAppointment.vital === "string"
                                            ? JSON.parse(selectedAppointment.vital)
                                            : selectedAppointment.vital;
                                    return Object.entries(vitals).map(([key, value]) => (
                                        <VitalItem key={key}>
                                            <SectionContent>{value}</SectionContent>
                                            <VitalLabel>{key}</VitalLabel>
                                        </VitalItem>
                                    ));
                                })()}
                            </VitalsContainer>
                        </Section>
                        )}
                    </div>
                ) : (
                    <p>Select an appointment to view details.</p>
                )}
            </Content>
        </Container>
    );
};

export default MedicalHistory;