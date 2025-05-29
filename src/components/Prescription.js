import React, { useState,useEffect,useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Col, Row, Form, Tab, Nav, Modal, Alert} from 'react-bootstrap';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import male from './images/male.png';        
import female from './images/female.png';
import { BsPatchPlusFill} from "react-icons/bs";
import { BiImageAdd, BiTrash } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import axios from 'axios';
import { FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import Diagnosis from './Diagnosis';
import Complaints from './Complaints';
import Findings from './Findings';
import Tests from './Tests';
import Procedures from './Procedure';
import jsPDF from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'jspdf-autotable';
import Cookies from 'js-cookie'; // Added import for cookies
import PDFHeader from './images/PDF_Header_branch1.png';
import PDFFooter from './images/PDF_Footer_branch1.png';

const darkGray = '#b3a591';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.bodyBackgroundColor};
`;

export const StyledContainer = styled.div`
  margin-top: 65px;
`;

export const SectionTitle = styled.h6`
  margin-top: 10px;
  text-align: center;
`;

export const PatientDetailsContainer = styled.div`
  flex-direction: column;
  align-items: center;
  background-color:  #b798c0;
  padding: 20px;
  width: 300px;
  height: 390px;
  position: absolute;
  left: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top:10px;
`;

export const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
`;

export const PatientName = styled.h5`
  margin: 0;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
  width: 100%;
`;

export const PatientText = styled.p`
  margin: 0;
  color: white;
  text-align: left;
  width: 100%;
`;

export const RightContent = styled.div`
  margin-left: 320px;
  padding: 5px;
`;

export const CenteredFormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const SummaryContainer = styled.div`
  padding: 10px;
  background-color: #b798c0; // Updated background color
  border-radius: 10px;
  width: 100%;
  height: auto;
  margin-left: auto;
  margin-right: auto;
`;

const SummaryDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 20px;
  padding: 20px;
  background-color: #ffffff; // Changed to white background
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0 auto;
`;
const SummaryTitle = styled.h3`
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
  color: #333; // Dark gray color
`;

const SummaryItemTitle = styled.h4`
  margin-top: 10px;
  margin-bottom: 10px;
  color: ${darkGray}; // Dark gray color
`;

const PatientDetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  line-height: 1.6;
`;

const PatientDetailsColumn = styled.div`
  flex: 1;
  &:first-child {
    margin-right: 20px;
  }
`;

const Divider = styled.hr`
  width: 100%;
  margin: 10px 0;
  border: 1px solid #ddd;
`;

const DateDisplay = styled.div`
  font-size: 16px;
  color: #333;
`;

const CalendarIcon = styled(FaCalendarAlt)`
  font-size: 24px;
  cursor: pointer;
  color: #C85C8E;
`;

export const ImageContainer = styled.section`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #b798c0; // Light brown background
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

export const UploadedImage = styled.img`
  width: 80px;
  height: 80px;
  margin: 5px;
  object-fit: cover;
`;
export const PdfContainer = styled.section`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color:  #b798c0; // Light blue background
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

export const PdfItem = styled.div`
  margin: 10px;
  padding: 10px;
  background-color: #ffffff; // White background for individual PDF items
  border: 1px solid #cccccc; // Light gray border
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RemoveButton = styled.button`
  background-color: #ff6b6b; // Red background
  color: #ffffff; // White text
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #ee5253; // Darker red on hover
  }
`;
export const SectionTitle2 = styled.h4`
  margin-top: 20px;
  margin-bottom: 10px;
  color: ${darkGray}; // Dark gray color
`;

export const UploadIcon = styled.i`
  font-size: 3rem;
  color: #757575; // Gray color
`;

export const UploadText = styled.p`
  font-size: 1rem;
  color: #757575; // Gray color
`;

export const PrescriptionContainer = styled.section`
flex: 1;
margin: 0 15px; // Adjusted margin for balanced spacing
padding: 20px;
background-color: #b798c0; // Light brown background
border-radius: 10px;
text-align: center;
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ContainerRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 10px; // Adjusted margin for balanced spacing
  margin-top: 10px;
`;

const NextVisitonContainer = styled.div`
flex: 1;
margin: 0 15px; // Adjusted margin for balanced spacing
padding: 20px;
background-color: #b798c0; // Light brown background
border-radius: 10px;
text-align: center;
`;

export const PlanContainer = styled.div`
flex: 1;
margin: 0 15px; // Adjusted margin for balanced spacing
padding: 20px;
background-color: #b798c0; // Light brown background
border-radius: 10px;
text-align: center;
`;

const PrescriptionDetails = () => { 
  const [selectedDiagnosis, setSelectedDiagnosis] = useState([]);
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [selectedfindings, setSelectedFindings] = useState([]);
  const [selectedprocedure, setSelectedprocedure] = useState([]);
  const [prescriptionInputs, setPrescriptionInputs] = useState([
    { selectedPrescription: [], dosage: '', durationNumber: '', duration: '', m: false, a: false, e: false, n: false },
    { selectedPrescription: [], dosage: '', durationNumber: '', duration: '', m: false, a: false, e: false, n: false },
    { selectedPrescription: [], dosage: '', durationNumber: '', duration: '', m: false, a: false, e: false, n: false },
  ]);
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [planDetails, setPlanDetails] = useState({
    plan1: '',
    plan2: '',
    plan3: ''
  });
  const [branchCode, setBranchCode] = useState('');

  const handleSelectDiagnosis = (diagnosis) => setSelectedDiagnosis(diagnosis);
  const handleSelectComplaints = (complaints) => {setSelectedComplaints(complaints);};
  const handleSelectfindings = (findings) => setSelectedFindings(findings);
  const handleSelectprocedure = (procedure) => setSelectedprocedure(procedure);
  const handleSelectTests = (tests) => setSelectedTests(tests);
  const handleDateChange = (date) => setSelectedDate(date);

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const location = useLocation();
  const { appointment, patientUID, mobileNumber, patientName, appointmentDate } = location.state;
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [vital, setVital] = useState([]);

  useEffect(() => {
    // Get branch_code from cookies when component mounts
    const code = Cookies.get('branch_code');
    if (code) {
      setBranchCode(code);
      console.log('Branch code retrieved from cookies:', code);
    } else {
      console.warn('Branch code not found in cookies');
    }
    
    // Fetch medicine options from the API
  // Fetch medicine options from the API
  axios.get('http://127.0.0.1:8000/pharmacy/data/', {
    params: { branch_code: branchCode }
  })
    .then(response => {
      const medicineData = response.data.map(medicine => ({
        label: medicine.medicine_name,
        category: medicine.medicine_category,
        fullData: medicine // Store full medicine data for reference
      }));
      setMedicineOptions(medicineData);
    })
    .catch(error => {
      console.error('Error fetching medicine names:', error);
    });
}, [branchCode]);

// Helper function to check if dosage should be hidden
const shouldHideDosage = (selectedPrescription) => {
  if (!selectedPrescription || selectedPrescription.length === 0) return false;
  
  const selectedMedicine = selectedPrescription[0];
  // Check if it's a custom entry (no category) or if category is Topicals
  if (selectedMedicine.category) {
    return selectedMedicine.category === 'Topicals';
  }
  
  // For custom entries, check if the name matches any Topicals medicine
  const matchedMedicine = medicineOptions.find(option => 
    option.label.toLowerCase() === selectedMedicine.label.toLowerCase()
  );
  return matchedMedicine && matchedMedicine.category === 'Topicals';
};

  useEffect(() => {
    if (!patientUID || !branchCode) return; // Only fetch if patientUID and branchCode are provided

    axios.get(`http://127.0.0.1:8000/vitalform/`, {
      params: { 
        patientUID: patientUID,
        branch_code: branchCode
      }
    })
      .then(response => {
        const vitalResponse = response.data.vital[0]; // Assuming you only get one record
        setVital(vitalResponse);
      })
      .catch(error => {
        console.error('Error fetching vital data:', error);
      });
  }, [patientUID, branchCode]);

  // Add a new prescription input
  const handlePrescriptionAddInput = () => {
    setPrescriptionInputs((prev) => [
      ...prev,
      {
        selectedPrescription: [],
        dosage: '',
        m: false,
        a: false,
        e: false,
        n: false,
        durationNumber: '',
        duration: '',
      },
    ]);
  };

  // Delete a prescription input
  const handlePrescriptionDeleteInput = (index) => {
    setPrescriptionInputs((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle changes in prescription inputs
  const handlePrescriptionChange = (index, key, value) => {
    setPrescriptionInputs((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  // Handle checkbox changes for M, A, E, N
  const handleCheckboxChange = (index, key) => {
    setPrescriptionInputs((prev) => {
      const updated = [...prev];
      updated[index][key] = !updated[index][key];
      return updated;
    });
  };

  const calculateTotalDosage = (input) => {
    const dosage = parseFloat(input.dosage) || 0;
    const durationNumber = parseInt(input.durationNumber) || 0;
    const durationFactor = input.duration === 'Months' ? 30 : 1;
    const timesSelected = (input.m ? 1 : 0) + (input.a ? 1 : 0) + (input.e ? 1 : 0) + (input.n ? 1 : 0);
    return dosage * timesSelected * durationNumber * durationFactor;
  };

  const handlePlanChange = (event) => {
    const { id, value } = event.target;
    setPlanDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const uploaded = files.map((file) => ({
      src: URL.createObjectURL(file),
      alt: file.name,
    }));
    setUploadedImages(prevImages => [...prevImages, ...uploaded]);
    setImages(prevImages => [...prevImages, ...files]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(prevImages =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    setImages(prevImages =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };


  const handleSubmit2 = async () => {
    if (images.length === 0) {
      setMessage('Please select at least one image');
      return;
    }
    const formData = new FormData();
    formData.append('patient_name', appointment.patientName+'_'+appointment.patientUID+'_'+appointmentDate);
    formData.append('branch_code', branchCode); // Include branch_code in 
    images.forEach(image => formData.append('images', image)); // Append each image to formData
    try {
      const response = await axios.post('http://127.0.0.1:8000/upload_file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Branch-Code': branchCode // Include branch_code in headers
        },
      });
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.success('Failed to upload images');
    }
  };

  const [summaryData, setSummaryData] = useState(null);  
  // Fetch summary data
  useEffect(() => {
    if (!patientUID || !appointmentDate || !branchCode) return;

    const fetchSummaryData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/summary_get/", {
          params: { 
            patientUID, 
            appointmentDate,
            branch_code: branchCode 
          },
          headers: {
            'X-Branch-Code': branchCode
          }
        });
  
        if (response.data && response.data.length > 0) {
          const data = response.data[0];
          setSummaryData(data);  
          // Set `nextVisit` in state if available
          if (data.nextVisit) {
            const parsedDate = parseNextVisit(data.nextVisit); // Ensure valid date
            setSelectedDate(parsedDate);
          }
  
          // Populate plan details if they exist
          if (data.plans) {
            const plans = parsePlans(data.plans); // Parse the stored plans string
            setPlanDetails(plans);
          }
        } else {
          console.log("No summary data found for the given patient and date");
        }
      } catch (error) {
        console.error("Error fetching summary data", error);
      }
    };
  
    fetchSummaryData();
  }, [patientUID, appointmentDate, branchCode]);
  
  // Helper function to parse `nextVisit` date
  const parseNextVisit = (nextVisit) => {
    try {
      const [day, month, year] = nextVisit.split('/'); // Assuming `dd/MM/yyyy` format
      return new Date(`${year}-${month}-${day}`);
    } catch (error) {
      console.error("Error parsing nextVisit date:", error);
      return null; // Fallback for invalid dates
    }
  };
  
  useEffect(() => {
    if (summaryData && summaryData.prescription) {
      const parsedPrescriptions = parsePrescriptions(summaryData.prescription);
      setPrescriptionInputs(parsedPrescriptions);
    }
  }, [summaryData]);  

  // Helper function to parse prescriptions from the database format
const parsePrescriptions = (prescriptionString) => {
  if (!prescriptionString) return [];

  // Split by newlines to get individual prescriptions
  const prescriptionLines = prescriptionString.split('\n').filter(line => line.trim() !== '');
  
  return prescriptionLines.map((prescriptionLine) => {
    // Split by ' - ' to get different parts
    const parts = prescriptionLine.split(' - ');
    
    // Extract prescription name (remove "Prescription: " prefix)
    const prescriptionName = parts[0]?.replace('Prescription:', '').trim() || '';
    
    // Extract dosage (remove "Dosage: " prefix)
    const dosage = parts[1]?.replace('Dosage:', '').trim() || '';
    
    // Extract timing (M, A, E, N) - this is the third part
    const timingPart = parts[2]?.trim() || '';
    
    // Extract duration (remove "Duration: " prefix and split)
    // Find the part that contains "Duration:" - it might not always be at index 3
    const durationPartIndex = parts.findIndex(part => part.includes('Duration:'));
    const durationPart = durationPartIndex !== -1 ? parts[durationPartIndex].replace('Duration:', '').trim() : '';
    const durationParts = durationPart.split(' ');
    
    return {
      selectedPrescription: [{ label: prescriptionName }],
      dosage: dosage,
      m: timingPart.includes('M'),
      a: timingPart.includes('A'),
      e: timingPart.includes('E'),
      n: timingPart.includes('N'),
      durationNumber: durationParts[0] || '',
      duration: durationParts[1] || '',
    };
  });
};

  // Helper function to parse plans
  const parsePlans = (plansString) => {
    if (!plansString) return { plan1: '', plan2: '', plan3: '' }; // Default values if no plans exist

    const lines = plansString.split("\n");
    return {
      plan1: lines[0]?.split(": ")[1]?.trim() || "", // Extract value and trim whitespace
      plan2: lines[1]?.split(": ")[1]?.trim() || "",
      plan3: lines[2]?.split(": ")[1]?.trim() || "",
    };
  };
const handleSubmit = async () => {
  try {
    const userName = localStorage.getItem("userName") || "Unknown";

    const validPrescriptions = prescriptionInputs.filter(input => 
      input.selectedPrescription?.length > 0 && 
      input.selectedPrescription[0]?.label?.trim() !== ''
    );

    const validPlans = Object.entries(planDetails)
      .filter(([key, value]) => value && value.trim() !== '')
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join('\n');

    const summaryData = {
      patientName,
      patientUID,
      mobileNumber,
      appointmentDate,
      branch_code: branchCode,
      patient_handledby: userName,
      diagnosis: selectedDiagnosis.map(d => d.diagnosis).join(', '),
      complaints: JSON.stringify(
        selectedComplaints.map(input => ({
          complaints: input.selectedComplaints.map(c => c.complaints).join(', '),
          duration: input.duration,
          durationUnit: input.durationUnit,
        }))
      ),
      findings: selectedfindings.map(f => f.findings).join(', '),
      // IMPORTANT: Create fresh prescription string from current state only
      prescription: validPrescriptions.map(input => {
        const times = ['M', 'A', 'E', 'N']
          .map(time => (input[time.toLowerCase()] ? time : ''))
          .filter(Boolean)
          .join(' ');
        const totalDosage = calculateTotalDosage(input);
        return `Prescription: ${input.selectedPrescription?.map(p => p.label).join(', ')} - Dosage: ${input.dosage} - ${times} - Duration: ${input.durationNumber} ${input.duration} - Total Dosage: ${totalDosage}`;
      }).join('\n'),
      // Only save valid plans
      plans: validPlans,
      tests: selectedTests && selectedTests.length > 0 ? selectedTests.map(test => test.test).join(', ') : '',
      uploadedImages: uploadedImages.map(img => ({ src: img.src, alt: img.alt })),
      nextVisit: selectedDate ? formatDate(selectedDate) : null,
      vital: JSON.stringify({
        height: vital?.height,
        weight: vital?.weight,
        pulseRate: vital?.pulseRate,
        bloodPressure: vital?.bloodPressure,
      }),
      proceduresList: selectedprocedure.map(proc => ({
        procedure: proc.selectedProcedures.map(p => p.procedure).join(', '),
        date: proc.selectedDate ? formatDate(proc.selectedDate) : '',
      }))
        .map(proc => `Procedure: ${proc.procedure} - Date: ${proc.date}`)
        .join('\n'),
    };

    // Check if data already exists
    const getResponse = await axios.get('http://127.0.0.1:8000/summary_get/', {
      params: { 
        patientUID, 
        appointmentDate,
        branch_code: branchCode 
      },
      headers: {
        'X-Branch-Code': branchCode
      }
    });

    if (getResponse.data && getResponse.data.length > 0) {
      // PATCH request will completely replace the existing data
      const patchResponse = await axios.patch('http://127.0.0.1:8000/summary/post/', summaryData, {
        headers: {
          'X-Branch-Code': branchCode
        }
      });
      toast.success(`Updated Successfully`);
    } else {
      // POST request for new data
      const postResponse = await axios.post('http://127.0.0.1:8000/summary/post/', summaryData, {
        headers: {
          'X-Branch-Code': branchCode
        }
      });
      toast.success(`Saved Successfully`);
    }
  } catch (error) {
    console.error('Error submitting data', error);
  }
};

  const [pdfFiles, setPdfFiles] = useState([]);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const handleFileChange2 = (e) => {
    const files = Array.from(e.target.files);
    const uploaded = files.map((file) => ({
      name: file.name,
    }));
    setUploadedPdfs(prevPdfs => [...prevPdfs, ...uploaded]);
    setPdfFiles(prevPdfs => [...prevPdfs, ...files]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setUploadedPdfs(prevPdfs =>
      prevPdfs.filter((_, index) => index !== indexToRemove)
    );
    setPdfFiles(prevPdfs =>
      prevPdfs.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit3 = async () => {
    if (pdfFiles.length === 0) {
      setMessage('Please select at least one PDF file');
      return;
    }
    const formData = new FormData();
    formData.append('patient_name', `${appointment.patientName}_${appointment.patientUID}_${appointmentDate}`);
    formData.append('branch_code', branchCode); // Include branch_code in formData
    pdfFiles.forEach(pdf => formData.append('pdf_files', pdf)); // Append each PDF to formData

    try {
      const response = await axios.post('http://127.0.0.1:8000/upload_pdf/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Branch-Code': branchCode // Include branch_code in headers
        },
      });
      toast.success('PDFs uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload PDFs');
    }
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit();
      await handleSubmit2();
    } catch (error) {
      toast.error('Error Submitting Data');
    }
  };

  const summaryRef = useRef(null);
// Modified getSummaryDetails function - only display typed data
const getSummaryDetails = () => {
  // Filter out empty prescriptions for display
  const validPrescriptions = prescriptionInputs.filter(input => 
    input.selectedPrescription?.length > 0 && 
    input.selectedPrescription[0]?.label?.trim() !== ''
  );

  // Filter out empty plans for display
  const validPlans = Object.entries(planDetails)
    .filter(([key, value]) => value && value.trim() !== '')
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);

  // Content generation
  const diagnosissummary = selectedDiagnosis.map((diagnosis) => (
    <li key={diagnosis.id}>{diagnosis.diagnosis}</li>
  ));
  
  const complaintssummary = selectedComplaints.map((input) => {
    const complaintText = input.selectedComplaints.map(complaint => complaint.complaints).join(', ') || 'No complaint provided';
    const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || 'N/A'}` : '';
    return <li key={input.id}>{complaintText}{duration}</li>;
  });
  
  const findingssummary = selectedfindings.map((findings) => (
    <li key={findings.id}>{findings.findings}</li>
  ));
  
  const proceduresummary = selectedprocedure.map((procedure, index) => (
    <li key={index}>
      {procedure.selectedProcedures.map(p => p.procedure).join(', ')} - Date: {procedure.selectedDate ? formatDate(new Date(procedure.selectedDate)) : 'None'}
    </li>
  ));

  // Only show valid prescriptions
  const prescriptionSummary = validPrescriptions.map((input, index) => {
    const times = ['M', 'A', 'E', 'N'].map(time => input[time.toLowerCase()] ? time : '').filter(Boolean).join(' ');
    return `${index + 1}. ${input.selectedPrescription?.map(p => p.label).join(', ')} - Dosage: ${input.dosage} - ${times} - Duration: ${input.durationNumber} ${input.duration}`;
  }).join('\n');

  const testsSummary = selectedTests.map(test => test.test).join(', ');
  const nextVisitSummary = selectedDate ? formatDate(selectedDate) : ' ';

  const summaryContent = (
    <SummaryDetailsContainer>
      <SummaryTitle>Summary</SummaryTitle>
      
      {/* Patient Details */}
      <PatientDetailsRow>
        <PatientDetailsColumn>
          <div><strong>NAME:</strong> {appointment.patientName}</div>
          <div><strong>SEX:</strong> {appointment.gender}</div>
        </PatientDetailsColumn>
        <PatientDetailsColumn>
          <div><strong>MOBILE:</strong> {appointment.mobileNumber}</div>
        </PatientDetailsColumn>
      </PatientDetailsRow>
      <Divider />

      {/* Diagnosis */}
      {selectedDiagnosis.length > 0 && (
        <>
          <SummaryItemTitle>Diagnosis</SummaryItemTitle>
          <ul>{diagnosissummary}</ul>
          <Divider />
        </>
      )}

      {/* Complaints */}
      {selectedComplaints.length > 0 && (
        <>
          <SummaryItemTitle>Complaints</SummaryItemTitle>
          <ul>{complaintssummary}</ul>
          <Divider />
        </>
      )}

      {/* Findings */}
      {selectedfindings.length > 0 && (
        <>
          <SummaryItemTitle>Findings</SummaryItemTitle>
          <ul>{findingssummary}</ul>
          <Divider />
        </>
      )}

      {/* Procedures */}
      {selectedprocedure.length > 0 && (
        <>
          <SummaryItemTitle>Procedures</SummaryItemTitle>
          <ul>{proceduresummary}</ul>
          <Divider />
        </>
      )}

      {/* Prescription - Only show if there are valid prescriptions */}
      {validPrescriptions.length > 0 && (
        <>
          <SummaryItemTitle>Prescription</SummaryItemTitle>
          <ul>
            <li>{prescriptionSummary}</li>
          </ul>
          <Divider />
        </>
      )}

      {/* Plans - Only show if there are valid plans */}
      {validPlans.length > 0 && (
        <>
          <SummaryItemTitle>Plans</SummaryItemTitle>
          <ul>
            {validPlans.map((plan, index) => (
              <li key={index}>{plan}</li>
            ))}
          </ul>
          <Divider />
        </>
      )}

      {/* Tests */}
      {selectedTests.length > 0 && (
        <>
          <SummaryItemTitle>Tests</SummaryItemTitle>
          <ul>
            <li>{testsSummary}</li>
          </ul>
          <Divider />
        </>
      )}

      {/* Next Visit */}
      {selectedDate && (
        <>
          <SummaryItemTitle>Next Visit</SummaryItemTitle>
          <ul>
            <li>{nextVisitSummary}</li>
          </ul>
          <Divider />
        </>
      )}
    </SummaryDetailsContainer>
  );

    const convertToBase64 = (url, callback) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        callback(dataURL);
      };
      img.onerror = error => console.error('Error converting image to Base64:', error);
    };

 // Modified exportToPDF function - only include typed data
  const exportToPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const headerFooterHeight = 35;
    
    convertToBase64(PDFHeader, headerImage => {
      convertToBase64(PDFFooter, footerImage => {
        pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerFooterHeight);
        let startY = headerFooterHeight + 10;
        
        const createSubTableRows = (label, entries) => {
          if (!entries || entries.length === 0) {
            return [];
          }
          return entries.map((entry, index) => [index === 0 ? label : '', entry]);
        };

        let data = [];
        data.push(['Branch Code', branchCode || 'Not Available']);
        
        // Only add sections with data
        if (selectedDiagnosis.length > 0) {
          data = data.concat(createSubTableRows('Diagnosis', selectedDiagnosis.map(d => d.diagnosis)));
        }
        
        if (selectedComplaints.length > 0) {
          data = data.concat(
            createSubTableRows(
              'Complaints', 
              selectedComplaints.map(input => {
                const complaintText = input.selectedComplaints.map(complaint => complaint.complaints).join(', ') || 'No complaint provided';
                const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || 'N/A'}` : '';
                return `${complaintText}${duration}`;
              })
            )
          );
        }
        
        if (selectedfindings.length > 0) {
          data = data.concat(createSubTableRows('Findings', selectedfindings.map(f => f.findings)));
        }
        
        if (selectedprocedure.length > 0) {
          data = data.concat(createSubTableRows('Procedures', selectedprocedure.map(p => `${p.selectedProcedures.map(proc => proc.procedure).join(', ')} - Date: ${p.selectedDate ? formatDate(new Date(p.selectedDate)) : 'None'}`)));
        }
        
        // Only add prescription if there are valid prescriptions
        if (validPrescriptions.length > 0) {
          data.push(['Prescription', prescriptionSummary]);
        }
        
        // Only add plans if there are valid plans
        if (validPlans.length > 0) {
          data.push(['Plans', validPlans.join(', ')]);
        }
        
        if (selectedTests.length > 0) {
          data = data.concat(createSubTableRows('Tests', selectedTests.map(test => test.test)));
        }
        
        if (selectedDate) {
          data.push(['Next Visit Date', selectedDate.toLocaleDateString()]);
        }

        // Create table only if there's data
        if (data.length > 1) { // More than just branch code
          pdf.autoTable({
            startY,
            head: [['Section', 'Details']],
            body: data,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: {
              cellWidth: 'wrap',
              minCellHeight: 10,
              overflow: 'linebreak',
              tableWidth: 'auto',
              margin: { left: 10, right: 10 },
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: pageWidth - 80 },
            },
            margin: { top: startY, bottom: headerFooterHeight },
            didDrawPage: (data) => {
              pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerFooterHeight);
              pdf.addImage(footerImage, 'PNG', 0, pageHeight - headerFooterHeight, pageWidth, headerFooterHeight);
            }
          });
        }

        // Rest of the image handling code remains the same...
        let currentY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : startY;
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        currentY += 10;

        const imageWidth = 25;
        const imageHeight = 30;
        const imagesPerRow = Math.floor((pageWidth - 20) / (imageWidth + 5));
        let currentRow = 0;

        uploadedImages.forEach((img, index) => {
          const x = 10 + (index % imagesPerRow) * (imageWidth + 5);
          
          if (currentY + imageHeight + 20 > pageHeight - headerFooterHeight - 20) {
            pdf.addPage();
            currentY = headerFooterHeight + 10;
            pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerFooterHeight);
            pdf.addImage(footerImage, 'PNG', 0, pageHeight - headerFooterHeight, pageWidth, headerFooterHeight);
            currentRow = 0;
          }

          pdf.addImage(img.src, 'JPEG', x, currentY, imageWidth, imageHeight);
          pdf.setFontSize(10);
          pdf.text(`Image ${index + 1}`, x + imageWidth / 4, currentY + imageHeight + 5);

          if ((index + 1) % imagesPerRow === 0) {
            currentY += imageHeight + 20;
          }
        });

        pdf.save(`${branchCode}_${appointment.patientName}_${appointment.patientUID}_${appointmentDate}`);
      });
    });
  };
  
  return (
    <div ref={summaryRef}>
      {summaryContent}
      <button style={{marginTop:"25px",marginRight:"180px"}} onClick={exportToPDF}>Export to PDF</button>
    </div>
  );
};
  return (
    <StyledContainer>
      <ToastContainer position="top-right" autoClose={5000}/> {/* Toast container */}
      <Tab.Container defaultActiveKey="consulting-room">
      <Nav style={{ justifyContent: 'center' }}>
        <Nav.Item>
          <Nav.Link eventKey="consulting-room" style={{ color: "#725F83" }}>
            Consulting Room
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="instructions" style={{ color: "#725F83" }}>
            Instructions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="summary" style={{ color: "#725F83" }}>
            Summary
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="consulting-room">
        <RightContent>
          <PatientDetailsContainer>
            <ProfileImage src={appointment.gender === 'Male' ? male : female} alt="Profile" />
            <PatientName className='mt-1'>Name: {patientName}</PatientName>
            <PatientText className='mt-1'>Phone: {mobileNumber}</PatientText>
            <PatientText className='mt-1'>Height: {vital?.height}</PatientText>
            <PatientText className='mt-1'>Weight: {vital?.weight}</PatientText>
            <PatientText className='mt-1'>Pulse Rate: {vital?.pulseRate}</PatientText>
            <PatientText className='mt-1'>Blood Pressure: {vital?.bloodPressure}</PatientText>
            <PatientText className='mt-1'>Purpose Of Visit: {appointment.purposeOfVisit}</PatientText>
          </PatientDetailsContainer>

        <ContainerRow>
        <Diagnosis onSelectDiagnosis={handleSelectDiagnosis} preSelectedDiagnosis={summaryData?.diagnosis || ''} />
        <Findings onSelectFindings ={handleSelectfindings} preSelectedFindings={summaryData?.findings || ''}  />
         </ContainerRow>

         <ContainerRow>
         <Complaints onSelectComplaints ={handleSelectComplaints} preSelectedComplaints={summaryData?.complaints || ''} />
         </ContainerRow>
         
      </RightContent>
        </Tab.Pane>
            <Tab.Pane eventKey="instructions" className='mt-3'>
            <ContainerRow>
            <PrescriptionContainer>
            <SectionTitle>Prescription</SectionTitle>
            {prescriptionInputs.map((input, index) => (
              <Form.Group as={Row} className="align-items-center mb-3" controlId={`prescription-${index}`} key={index}>
                <Col sm="3">
                  <Typeahead
                    id={`prescription-${index}`}
                    labelKey="label"
                    multiple={false}
                    options={medicineOptions}
                    placeholder="Choose prescription..."
                    onChange={(selected) => {
                      handlePrescriptionChange(index, 'selectedPrescription', selected.length > 0 ? selected : []);
                    }}
                    onInputChange={(text) => {
                      const found = medicineOptions.some(option => option.label.toLowerCase() === text.toLowerCase());
                      if (!found && text.trim() !== '') {
                        handlePrescriptionChange(index, 'selectedPrescription', [{ label: text }]);
                      }
                    }}
                    selected={input.selectedPrescription || []}
                    allowNew={true}
                  />
                </Col>
                  {/* Conditionally render Dosage field */}
                    <Col sm="2">
                      <Form.Control
                        type="text"
                        placeholder="Dosage"
                        value={input.dosage || ''}
                        onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                        disabled={shouldHideDosage(input.selectedPrescription)}
                      />
                    </Col>
                <Col sm="3">
                  <Form.Check inline label="M" type="checkbox" checked={input.m} onChange={() => handleCheckboxChange(index, 'm')} />
                  <Form.Check inline label="A" type="checkbox" checked={input.a} onChange={() => handleCheckboxChange(index, 'a')} />
                  <Form.Check inline label="E" type="checkbox" checked={input.e} onChange={() => handleCheckboxChange(index, 'e')} />
                  <Form.Check inline label="N" type="checkbox" checked={input.n} onChange={() => handleCheckboxChange(index, 'n')} />
                </Col>
                <Col sm="1">
                  <Form.Control
                    type="text"
                    placeholder="Number"
                    value={input.durationNumber || ''} // Ensure it's from the state
                    onChange={(e) => handlePrescriptionChange(index, 'durationNumber', e.target.value)}
                  />
                </Col>
                <Col sm="2">
                  <Form.Control
                    as="select"
                    value={input.duration || ''} // Ensure it's from the state
                    onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                  >
                    <option value="">Duration</option>
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </Form.Control>
                </Col>

                <Col sm="1" className="text-end">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BsPatchPlusFill size={24} onClick={handlePrescriptionAddInput} style={{ cursor: 'pointer', marginLeft: '10px' }} />
                    <MdDelete size={24} onClick={() => handlePrescriptionDeleteInput(index)} style={{ cursor: 'pointer', marginLeft: '10px' }} />
                  </div>
                </Col>
              </Form.Group>
            ))}
          </PrescriptionContainer>
        </ContainerRow>

        <ContainerRow>
        <PlanContainer className="mt-2">
          <Row className="justify-content-around">
            <Col md="3" className="text-center">
              <Form.Group controlId="plan1">
                <Form.Label>Plan1</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Plan1 details"
                  value={planDetails.plan1}
                  onChange={handlePlanChange}
                />
              </Form.Group>
            </Col>
            <Col md="3" className="text-center">
              <Form.Group controlId="plan2">
                <Form.Label>Plan2</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Plan2 details"
                  value={planDetails.plan2}
                  onChange={handlePlanChange}
                />
              </Form.Group>
            </Col>
            <Col md="3" className="text-center">
              <Form.Group controlId="plan3">
                <Form.Label>Plan3</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Plan3 details"
                  value={planDetails.plan3}
                  onChange={handlePlanChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </PlanContainer>
        </ContainerRow>

        <ContainerRow>
         <Tests onSelectTests ={handleSelectTests} preSelectedTests={summaryData?.tests || ''} />
         <Procedures onSelectProcedures={handleSelectprocedure} preSelectedProcedures={summaryData?.proceduresList || ''}/>
         <NextVisitonContainer>
            <SectionTitle>Next Visit</SectionTitle>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date); // Update the selected date
              }}
              customInput={<CalendarIcon />}
              popperPlacement="bottom-end"
              dateFormat="dd/MM/yyyy"
            />
            <DateDisplay>
              {selectedDate
                ? `Next Visit on: ${selectedDate.toLocaleDateString('en-GB')}` // Format date as `dd/MM/yyyy`
                : 'Next Visit on: Select a date'}
            </DateDisplay>
          </NextVisitonContainer>
        </ContainerRow>

          </Tab.Pane>
          <Tab.Pane eventKey="summary">
        <br/>

        <SummaryContainer>
        <center>
          {getSummaryDetails()}
          <button style={{float:"right",marginTop:"-40px"}} onClick={handleSubmitAll}>
            Save
          </button>
        </center>
      </SummaryContainer>    
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </StyledContainer>
  );
};

export default PrescriptionDetails;