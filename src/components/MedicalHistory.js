import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { PiTestTubeThin } from "react-icons/pi";

const Container = styled.div`
    display: flex;
    height: 75vh;
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
  background-color: #f0f0f0;
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

    // Helper function to safely parse JSON strings
    const safeJsonParse = (jsonString, fallback = null) => {
        if (!jsonString || jsonString === '""' || jsonString === "''") return fallback;
        try {
            // Handle double-encoded JSON strings
            let parsed = jsonString;
            if (typeof jsonString === 'string') {
                // Remove outer quotes if present
                if ((jsonString.startsWith('"') && jsonString.endsWith('"')) || 
                    (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
                    parsed = jsonString.slice(1, -1);
                }
                // Unescape escaped quotes
                parsed = parsed.replace(/\\"/g, '"').replace(/\\'/g, "'");
                return JSON.parse(parsed);
            }
            return parsed;
        } catch (error) {
            console.warn('Failed to parse JSON:', jsonString, error);
            return fallback;
        }
    };

    // Helper function to parse complaints data
    const parseComplaints = (complaintsData) => {
        if (!complaintsData) return [];
        
        // If it's already an array, return it
        if (Array.isArray(complaintsData)) return complaintsData;
        
        // Try to parse as JSON
        const parsed = safeJsonParse(complaintsData, []);
        if (Array.isArray(parsed)) return parsed;
        
        // If it's a string, try to split it
        if (typeof complaintsData === 'string') {
            return [{ complaints: complaintsData, duration: '', durationUnit: '' }];
        }
        
        return [];
    };

    // Helper function to parse vitals data
    const parseVitals = (vitalsData) => {
        if (!vitalsData) return {};
        
        // If it's already an object, return it
        if (typeof vitalsData === 'object' && !Array.isArray(vitalsData)) return vitalsData;
        
        // Try to parse as JSON
        const parsed = safeJsonParse(vitalsData, {});
        return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    };

    // Helper function to parse procedures list
    const parseProceduresList = (proceduresData) => {
        if (!proceduresData || proceduresData === '""' || proceduresData === "''") return [];
        
        // If it's already an array, return it
        if (Array.isArray(proceduresData)) return proceduresData;
        
        // Try to parse as JSON
        const parsed = safeJsonParse(proceduresData, '');
        if (Array.isArray(parsed)) return parsed;
        
        // If it's a string, split by common delimiters
        if (typeof parsed === 'string' && parsed.trim()) {
            return parsed.split(/Procedure:|,|\n/).filter(item => item.trim()).map(item => item.trim());
        }
        
        return [];
    };

const parseTests = (testsString) => {
    if (!testsString || testsString.trim() === '') return [];

    // Regex to split on commas not within parentheses
    const splitByTopLevelComma = (str) => {
        const result = [];
        let current = '';
        let depth = 0;

        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (char === '(') depth++;
            if (char === ')') depth--;
            if (char === ',' && depth === 0) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        if (current.trim()) result.push(current.trim());
        return result;
    };

    return splitByTopLevelComma(testsString);
};


    const parseProcedures = (proceduresString) => {
        if (!proceduresString) return [];
        return proceduresString
            .split("Procedure:")
            .filter((procedure) => procedure.trim() !== "")
            .map((procedure) => `Procedure: ${procedure.trim()}`);
    };

    // Fixed prescription parsing function
    const parsePrescription = (prescriptionString) => {
        if (!prescriptionString || prescriptionString.trim() === '') return [];
        
        const prescriptions = [];
        
        // Split by newlines and commas to handle different formats
        const lines = prescriptionString.split(/\n|,(?=\s*Prescription:)/).filter(line => line.trim());
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // More precise regex to extract prescription details
            const prescriptionMatch = line.match(/^Prescription:\s*(.+?)\s*-\s*Dosage:\s*(.+?)\s*-\s*(.+?)\s*-\s*Duration:\s*(.+?)\s*-\s*Total Dosage:\s*(.+?)$/);
            
            if (prescriptionMatch) {
                const [, medication, dosage, frequency, duration, totalDosage] = prescriptionMatch;
                prescriptions.push({
                    medication: medication.trim() || 'N/A',
                    dosage: dosage.trim() || 'N/A',
                    frequency: frequency.trim() || 'N/A',
                    duration: duration.trim() || 'N/A',
                    totalDosage: totalDosage.trim() || 'N/A'
                });
            } else {
                // Try alternative parsing for different formats
                const parts = line.split(' - ');
                if (parts.length >= 5) {
                    // Extract medication name after "Prescription:"
                    const medicationPart = parts[0].replace(/^Prescription:\s*/, '').trim();
                    const dosagePart = parts[1].replace(/^Dosage:\s*/, '').trim();
                    const frequencyPart = parts[2].trim();
                    const durationPart = parts[3].replace(/^Duration:\s*/, '').trim();
                    const totalDosagePart = parts[4].replace(/^Total Dosage:\s*/, '').trim();
                    
                    prescriptions.push({
                        medication: medicationPart || 'N/A',
                        dosage: dosagePart || 'N/A',
                        frequency: frequencyPart || 'N/A',
                        duration: durationPart || 'N/A',
                        totalDosage: totalDosagePart || 'N/A'
                    });
                } else {
                    // Fallback for non-standard formats
                    prescriptions.push({
                        medication: line.replace(/^Prescription:\s*/, '').trim(),
                        dosage: 'N/A',
                        frequency: 'N/A',
                        duration: 'N/A',
                        totalDosage: 'N/A'
                    });
                }
            }
        });
        
        return prescriptions;
    };

    const getPatientName = (appointmentData) => {
        if (appointmentData.summary?.patientName) return appointmentData.summary.patientName;
        if (appointmentData.billing?.patientName) return appointmentData.billing.patientName;
        if (appointmentData.procedure?.patientName) return appointmentData.procedure.patientName;
        if (appointmentData.patientName) return appointmentData.patientName;
        return 'Unknown Patient';
    };

    const getPatientUID = (appointmentData) => {
        if (appointmentData.summary?.patientUID) return appointmentData.summary.patientUID;
        if (appointmentData.billing?.patientUID) return appointmentData.billing.patientUID;
        if (appointmentData.procedure?.patientUID) return appointmentData.procedure.patientUID;
        if (appointmentData.patientUID) return appointmentData.patientUID;
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

        const parsedComplaints = parseComplaints(summary.complaints);
        const parsedVitals = parseVitals(summary.vital);
        const parsedProceduresList = parseProceduresList(summary.proceduresList);
        const parsedPrescription = parsePrescription(summary.prescription);

        return (
            <>
                {/* Diagnosis and Findings Row */}
                <Row>
                    {summary.diagnosis && summary.diagnosis.trim() && (
                        <DiagnosisContainer>
                            <Section style={{ flex: 1 }}>
                                <SectionTitle className='mt-2'>Diagnosis</SectionTitle>
                                <DiagnosisList>
                                    {summary.diagnosis.split(/\n|,/).filter(d => d.trim()).map((diagnosis, index) => (
                                        <DiagnosisItem key={index}>{diagnosis.trim()}</DiagnosisItem>
                                    ))}
                                </DiagnosisList>
                            </Section>
                        </DiagnosisContainer>
                    )}
                                        
                    {summary.findings && summary.findings.trim() && (
                        <FindingsContainer>
                            <Section style={{ flex: 1 }}>
                                <SectionTitle className='mt-2'>Findings</SectionTitle>
                                <FindingsList>
                                    {summary.findings.split('\n').filter(f => f.trim()).map((findings, index) => (
                                        <FindingsItem key={index}>{findings.trim()}</FindingsItem>
                                    ))}
                                </FindingsList>
                            </Section>
                        </FindingsContainer>
                    )}
                </Row>

                {/* Complaints */}
                {parsedComplaints.length > 0 && (
                    <Section style={{ flex: 1 }}>
                        <SectionTitle className='mt-2'>Complaints</SectionTitle>
                        <PrescriptionTable>
                            <thead>
                                <tr>
                                    <TableHeader>Complaints</TableHeader>
                                    <TableHeader>Duration</TableHeader>
                                    <TableHeader>Duration Unit</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedComplaints.map((complaint, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{complaint.complaints || 'N/A'}</TableCell>
                                        <TableCell>{complaint.duration || 'N/A'}</TableCell>
                                        <TableCell>{complaint.durationUnit || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </PrescriptionTable>
                    </Section>
                )}

                {/* Prescription */}
                {parsedPrescription.length > 0 && (
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
                                {parsedPrescription.map((prescription, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{prescription.medication}</TableCell>
                                        <TableCell>{prescription.dosage}</TableCell>
                                        <TableCell>{prescription.frequency}</TableCell>
                                        <TableCell>{prescription.duration}</TableCell>
                                        <TableCell>{prescription.totalDosage}</TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </PrescriptionTable>
                    </Section>
                )}

                {/* Plans */}
                {summary.plans && summary.plans.trim() && (
                    <PlansContainer>
                        <Section>
                            <SectionTitle>Plans</SectionTitle>
                            <PlansList>
                                {summary.plans.split('\n').filter(plan => plan.trim()).map((item, index) => (
                                    <PlansItem key={index}>{item.trim()}</PlansItem>
                                ))}
                            </PlansList>
                        </Section>
                    </PlansContainer>
                )}

                {/* Tests */}
                {summary.tests && summary.tests.trim() && (
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
                {parsedProceduresList.length > 0 && (
                    <ProceduresContainer>
                        <Section>
                            <SectionTitle>Procedures</SectionTitle>
                            <ProceduresList>
                                {parsedProceduresList.map((procedureDetail, index) => (
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
                {Object.keys(parsedVitals).length > 0 && (
                    <Section>
                        <SectionTitle>Vitals</SectionTitle>
                        <VitalsContainer>
                            {Object.entries(parsedVitals).map(([key, value]) => (
                                <VitalItem key={key}>
                                    <SectionContent>{value}</SectionContent>
                                    <VitalLabel>{key}</VitalLabel>
                                </VitalItem>
                            ))}
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
                                .filter(proc => proc.procedure !== 'Consultation Fee')
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

    // Function to render direct appointment data (for the new format)
    const renderDirectAppointmentData = (appointmentData) => {
        if (!appointmentData) return null;

        const parsedComplaints = parseComplaints(appointmentData.complaints);
        const parsedVitals = parseVitals(appointmentData.vital);
        const parsedProceduresList = parseProceduresList(appointmentData.proceduresList);
        const parsedPrescription = parsePrescription(appointmentData.prescription);

        return (
            <>
                {/* Diagnosis and Findings Row */}
                <Row>
                    {appointmentData.diagnosis && appointmentData.diagnosis.trim() && (
                        <DiagnosisContainer>
                            <Section style={{ flex: 1 }}>
                                <SectionTitle className='mt-2'>Diagnosis</SectionTitle>
                                <DiagnosisList>
                                    {appointmentData.diagnosis.split(/\n|,/).filter(d => d.trim()).map((diagnosis, index) => (
                                        <DiagnosisItem key={index}>{diagnosis.trim()}</DiagnosisItem>
                                    ))}
                                </DiagnosisList>
                            </Section>
                        </DiagnosisContainer>
                    )}
                                        
                    {appointmentData.findings && appointmentData.findings.trim() && (
                        <FindingsContainer>
                            <Section style={{ flex: 1 }}>
                                <SectionTitle className='mt-2'>Findings</SectionTitle>
                                <FindingsList>
                                    {appointmentData.findings.split('\n').filter(f => f.trim()).map((findings, index) => (
                                        <FindingsItem key={index}>{findings.trim()}</FindingsItem>
                                    ))}
                                </FindingsList>
                            </Section>
                        </FindingsContainer>
                    )}
                </Row>

                {/* Complaints */}
                {parsedComplaints.length > 0 && (
                    <Section style={{ flex: 1 }}>
                        <SectionTitle className='mt-2'>Complaints</SectionTitle>
                        <PrescriptionTable>
                            <thead>
                                <tr>
                                    <TableHeader>Complaints</TableHeader>
                                    <TableHeader>Duration</TableHeader>
                                    <TableHeader>Duration Unit</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedComplaints.map((complaint, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{complaint.complaints || 'N/A'}</TableCell>
                                        <TableCell>{complaint.duration || 'N/A'}</TableCell>
                                        <TableCell>{complaint.durationUnit || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </PrescriptionTable>
                    </Section>
                )}

                {/* Prescription */}
                {parsedPrescription.length > 0 && (
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
                                {parsedPrescription.map((prescription, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{prescription.medication}</TableCell>
                                        <TableCell>{prescription.dosage}</TableCell>
                                        <TableCell>{prescription.frequency}</TableCell>
                                        <TableCell>{prescription.duration}</TableCell>
                                        <TableCell>{prescription.totalDosage}</TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </PrescriptionTable>
                    </Section>
                )}

                {/* Plans */}
                {appointmentData.plans && appointmentData.plans.trim() && (
                    <PlansContainer>
                        <Section>
                            <SectionTitle>Plans</SectionTitle>
                            <PlansList>
                                {appointmentData.plans.split('\n').filter(plan => plan.trim()).map((item, index) => (
                                    <PlansItem key={index}>{item.trim()}</PlansItem>
                                ))}
                            </PlansList>
                        </Section>
                    </PlansContainer>
                )}

                {/* Tests */}
                {appointmentData.tests && appointmentData.tests.trim() && (
                    <TestContainer>
                        <Section>
                            <PiTestTubeThin style={{ fontSize: "2rem" }} />
                            <SectionTitle className="mt-2">Tests</SectionTitle>
                            <TestsList>
                                {parseTests(appointmentData.tests).map((test, index) => (
                                    <TestItem key={index}>{test}</TestItem>
                                ))}
                            </TestsList>
                        </Section>
                    </TestContainer>
                )}

                {/* Procedures List */}
                {parsedProceduresList.length > 0 && (
                    <ProceduresContainer>
                        <Section>
                            <SectionTitle>Procedures</SectionTitle>
                            <ProceduresList>
                                {parsedProceduresList.map((procedureDetail, index) => (
                                    <ProceduresItem key={index}>{procedureDetail}</ProceduresItem>
                                ))}
                            </ProceduresList>
                        </Section>
                    </ProceduresContainer>
                )}

                {/* Next Visit */}
                {appointmentData.nextVisit && (
                    <Section>
                        <SectionTitle>Next Visit:</SectionTitle>
                        <SectionContent>{appointmentData.nextVisit}</SectionContent>
                    </Section>
                )}

                {/* Vitals */}
                {Object.keys(parsedVitals).length > 0 && (
                    <Section>
                        <SectionTitle>Vitals</SectionTitle>
                        <VitalsContainer>
                            {Object.entries(parsedVitals).map(([key, value]) => (
                                <VitalItem key={key}>
                                    <SectionContent>{value}</SectionContent>
                                    <VitalLabel>{key}</VitalLabel>
                                </VitalItem>
                            ))}
                        </VitalsContainer>
                    </Section>
                )}
            </>
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
                            hasData={historyItem.summary || historyItem.billing || historyItem.procedure || historyItem.diagnosis || historyItem.prescription}
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

                        {/* Render Direct Appointment Data (for new format) */}
                        {!selectedAppointment.summary && !selectedAppointment.billing && !selectedAppointment.procedure && 
                         (selectedAppointment.diagnosis || selectedAppointment.prescription || selectedAppointment.complaints) && 
                         renderDirectAppointmentData(selectedAppointment)}
                                                
                        {!selectedAppointment.summary && !selectedAppointment.billing && !selectedAppointment.procedure && 
                         !selectedAppointment.diagnosis && !selectedAppointment.prescription && !selectedAppointment.complaints && (
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