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
    border-left: 5px solid ${props => props.hasData ? '#9AE6B4' : '#FEB2B2'};

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
    background-color: #6B4A8F;
    border: 1px solid #ddd;
`;

const TableRow = styled.tr`
    &:nth-child(even) {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.td`
    padding: 8px;
    border: 1px solid #ddd;
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

const BillingContainer = styled.div`
    margin-bottom: 20px;
    padding: 15px;
    border: none;
    border-radius: 5px;
    background-color:#E8F5E8;
    border-left: 4px solid #4CAF50;
`;

const BillingItemsContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #E8F5E8;
    flex: 1;
    overflow-y: auto;
    height: fit-content;
    scrollbar-width: none;
    width: fit-content;
`;

const ProcedureItemsContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #FFF8E1;
    flex: 1;
    overflow-y: auto;
    height: fit-content;
    scrollbar-width: none;
    width: fit-content;
`;

const ConsumerItemsContainer = styled.div`
    margin-bottom: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #E3F2FD;
    flex: 1;
    overflow-y: auto;
    height: fit-content;
    scrollbar-width: none;
    width: fit-content;
`;

const BillingList = styled.ul`
    list-style-type: disc;
    padding-left: 20px;
`;

const BillingItem = styled.li`
    margin-bottom: 8px;
    font-size: 0.95em;
`;

const ProcedureDetailsList = styled.ul`
    list-style-type: disc;
    padding-left: 20px;
`;

const ProcedureDetailItem = styled.li`
    margin-bottom: 8px;
    font-size: 0.95em;
`;

const ConsumerList = styled.ul`
    list-style-type: disc;
    padding-left: 20px;
`;

const ConsumerItem = styled.li`
    margin-bottom: 8px;
    font-size: 0.95em;
`;


const MedicalHistory = ({ patientUID }) => {
    const location = useLocation();
    const id = patientUID;
    const [patientHistory, setPatientHistory] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [branchCode, setBranchCode] = useState('');
    const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;

    const parseTests = (testsString) => {
        if (!testsString) return [];
        const regex = /([^,(]+(?:\([^)]*\))?)/g;
        const matches = [...testsString.matchAll(regex)].map((match) => match[0].trim()).filter(Boolean);
        return matches;
    };

    const parseProcedures = (proceduresString) => {
        if (!proceduresString) return [];
        return proceduresString
            .split("Procedure:")
            .filter((procedure) => procedure.trim() !== "")
            .map((procedure) => `Procedure: ${procedure.trim()}`);
    };

    const getPatientName = (appointmentData) => {
        if (appointmentData.summary?.patientName) return appointmentData.summary.patientName;
        if (appointmentData.billing?.patientName) return appointmentData.billing.patientName;
        if (appointmentData.procedure?.patientName) return appointmentData.procedure.patientName;
        return 'Unknown Patient';
    };

    const getPatientUID = (appointmentData) => {
        if (appointmentData.summary?.patientUID) return appointmentData.summary.patientUID;
        if (appointmentData.billing?.patientUID) return appointmentData.billing.patientUID;
        if (appointmentData.procedure?.patientUID) return appointmentData.procedure.patientUID;
        return id;
    };

    const getDataTypes = (appointmentData) => {
        const types = [];
        if (appointmentData.summary) types.push('Summary');
        if (appointmentData.billing) types.push('Billing');
        if (appointmentData.procedure) types.push('Procedure');
        return types.join(', ');
    };

    useEffect(() => {
        const code = localStorage.getItem('selectedBranch');
        if (code) {
            setBranchCode(code);
        } else {
            console.warn('Branch code not found in localStorage');
        }

        if (id && code) {
            const handleFetchDetails = async () => {
                try {
                    const response = await axios.post(`${Cosmetologybaseurl}get_patient_details/`, { 
                        id,
                        branch_code: code
                    }, {
                        withCredentials: true
                    });
                    setPatientHistory(response.data);
                } catch (error) {
                    console.error('Error fetching patient history:', error);
                }
            };
            handleFetchDetails();
        }
    }, [id, branchCode, Cosmetologybaseurl]);

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
    };

    const renderSummaryData = (summary) => {
        if (!summary) return null;

        return (
            <>
                {/* Diagnosis and Findings Row */}
                <Row>
                    {summary.diagnosis && (
                        <DiagnosisContainer>
                            <Section style={{ flex: 1 }}>
                                <img src={Image2} style={{height: "20%", width: "20%"}} alt="Diagnosis" />
                                <SectionTitle className='mt-2'>Diagnosis</SectionTitle>
                                <DiagnosisList>
                                    {summary.diagnosis.split('\n').map((diagnosis, index) => (
                                        <DiagnosisItem key={index}>{diagnosis.trim()}</DiagnosisItem>
                                    ))}
                                </DiagnosisList>
                            </Section>
                        </DiagnosisContainer>
                    )}
                    
                    {summary.findings && (
                        <FindingsContainer>
                            <Section style={{ flex: 1 }}>
                                <img src={Image3} style={{height:"20%",width:"20%"}} alt="Findings" />
                                <SectionTitle className='mt-2'>Findings</SectionTitle>
                                <FindingsList>
                                    {summary.findings.split('\n').map((findings, index) => (
                                        <FindingsItem key={index}>{findings.trim()}</FindingsItem>
                                    ))}
                                </FindingsList>
                            </Section>
                        </FindingsContainer>
                    )}
                </Row>

                {/* Complaints */}
                {summary.complaints && (
                    <Section style={{ flex: 1 }}>
                        <SectionTitle className='mt-2'>Complaints</SectionTitle>
                        {Array.isArray(summary.complaints) && summary.complaints.length > 0 ? (
                            <PrescriptionTable>
                                <thead>
                                    <tr>
                                        <TableHeader>Complaints</TableHeader>
                                        <TableHeader>Duration</TableHeader>
                                        <TableHeader>Duration Unit</TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.complaints.map((complaint, index) => (
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
                )}

                {/* Prescription */}
                {summary.prescription && (
                    <Section>
                        <SectionTitle>Prescription:</SectionTitle>
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
                                {summary.prescription.split('\n').map((line, index) => {
                                    const parts = line.split('-').map(part => part.trim());
                                    const medication = parts[0] ? parts[0].split(': ')[1] : 'N/A';
                                    const dosage = parts[1] ? parts[1].split(': ')[1] : 'N/A';
                                    const frequency = parts[2] || 'N/A';
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
                    </Section>
                )}

                {/* Plans */}
                {summary.plans && (
                    <PlansContainer>
                        <Section>
                            <SectionTitle>Plans</SectionTitle>
                            <PlansList>
                                {summary.plans.split('\n').map((item, index) => (
                                    <PlansItem key={index}>{item}</PlansItem>
                                ))}
                            </PlansList>
                        </Section>
                    </PlansContainer>
                )}

                {/* Tests */}
                {summary.tests && (
                    <TestContainer>
                        <Section>
                            <PiTestTubeThin style={{ fontSize: "2rem" }} />
                            <SectionTitle className="mt-2">Tests</SectionTitle>
                            <TestsList>
                                {parseTests(summary.tests).map((test, index) => (
                                    <TestItem key={index}>{test}</TestItem>
                                ))}
                            </TestsList>
                        </Section>
                    </TestContainer>
                )}

                {/* Procedures List */}
                {summary.proceduresList && (
                    <ProceduresContainer>
                        <Section>
                            <SectionTitle>Procedures</SectionTitle>
                            <ProceduresList>
                                {parseProcedures(summary.proceduresList).map((procedureDetail, index) => (
                                    <ProceduresItem key={index}>{procedureDetail}</ProceduresItem>
                                ))}
                            </ProceduresList>
                        </Section>
                    </ProceduresContainer>
                )}

                {/* Next Visit */}
                {summary.nextVisit && (
                    <Section>
                        <SectionTitle>Next Visit:</SectionTitle>
                        <SectionContent>{summary.nextVisit}</SectionContent>
                    </Section>
                )}

                {/* Vitals */}
                {summary.vital && (
                    <Section>
                        <SectionTitle>Vitals</SectionTitle>
                        <VitalsContainer>
                            {(() => {
                                const vitals = typeof summary.vital === "string" 
                                    ? JSON.parse(summary.vital) 
                                    : summary.vital;
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
            </>
        );
    };


const renderBillingData = (billing) => {
    if (!billing) return null;

    return (
        <>
            {/* Billing Items */}
            {billing.table_data && billing.table_data.length > 0 && (
                <BillingItemsContainer>
                    <Section>
                        <SectionTitle>Prescription:</SectionTitle>
                        <BillingList>
                            {billing.table_data.map((item, index) => (
                                <BillingItem key={index}>
                                    <strong>{item.particulars || 'N/A'}</strong> - 
                                    Qty: {item.qty || 'N/A'}
                                </BillingItem>
                            ))}
                        </BillingList>
                        
                    </Section>
                </BillingItemsContainer>
            )}
        </>
    );
};

const renderProcedureData = (procedure) => {
    if (!procedure || !procedure.procedures || procedure.procedures.length === 0) return null;

    return (
        <Row>
            <ProcedureItemsContainer>
                <Section>
                    <SectionTitle>🏥 Procedures</SectionTitle>
                    <ProcedureDetailsList>
                        {procedure.procedures
                            .filter(proc => proc.procedure !== 'Consultation Fee') // Exclude Consultation Fee
                            .map((proc, index) => (
                                <ProcedureDetailItem key={index}>
                                    Procedure: {proc.procedure} - Date: {new Date(proc.procedureDate).toLocaleDateString('en-GB')}
                                </ProcedureDetailItem>
                        ))}
                    </ProcedureDetailsList>
                </Section>
            </ProcedureItemsContainer>
        </Row>
    );
};

    return (
        <Container>
            <Sidebar>
                {patientHistory.length > 0 ? (
                    patientHistory.map((historyItem, index) => (
                        <AppointmentItem
                            key={index}
                            onClick={() => handleAppointmentClick(historyItem)}
                            isActive={selectedAppointment && selectedAppointment.appointmentDate === historyItem.appointmentDate}
                            hasData={historyItem.summary || historyItem.billing || historyItem.procedure}
                        >
                            <PatientInfo>
                                <PatientDetails>
                                    <PatientText>{getPatientName(historyItem)}</PatientText>
                                    <PatientText>{getPatientUID(historyItem)}</PatientText>
                                </PatientDetails>
                            </PatientInfo>
                            <DateInfo>
                                <p>{new Date(historyItem.appointmentDate).toLocaleDateString()}</p>
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
                        <h3>Medical History - {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</h3>
                        
                        {/* Render Summary Data */}
                        {selectedAppointment.summary && renderSummaryData(selectedAppointment.summary)}
                        
                        {/* Render Billing Data */}
                        {selectedAppointment.billing && renderBillingData(selectedAppointment.billing)}
                        
                        {/* Render Procedure Data */}
                        {selectedAppointment.procedure && renderProcedureData(selectedAppointment.procedure)}
                        
                        {!selectedAppointment.summary && !selectedAppointment.billing && !selectedAppointment.procedure && (
                            <p>No data available for this appointment.</p>
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