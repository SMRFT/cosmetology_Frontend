import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';

const DiagnosisContainer = styled.div`
flex: 1;
margin: 0 15px; // Adjusted margin for balanced spacing
padding: 20px;
background-color: #b798c0; // Light brown background
border-radius: 10px;
text-align: center;
`;

const CenteredFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Diagnosis = ({ preSelectedDiagnosis, onSelectDiagnosis}) => {
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [diagnosisInputs, setDiagnosisInputs] = useState([{ selectedDiagnosis: [] }]);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  useEffect(() => {
    // Ensure preSelectedDiagnosis is a valid string (or array, depending on your expected type)
    if (preSelectedDiagnosis) {
      // If preSelectedDiagnosis is a comma-separated string, split it into an array
      setDiagnosisInputs([{ selectedDiagnosis: preSelectedDiagnosis.split(', ') }]);
    } else {
      setDiagnosisInputs([{ selectedDiagnosis: [] }]); // Default to an empty array if preSelectedDiagnosis is null/undefined
    }
  }, [preSelectedDiagnosis]);

  useEffect(() => {
    // Fetching diagnosis data
    axios.get(`${Cosmetologybaseurl}diagnoses/`)
      .then(response => {
        setDiagnosisList(response.data);
      })
      .catch(error => {
        console.error('Error fetching diagnosis data:', error);
      });
  }, []);

  const handleAddNewDiagnosis = () => {
    axios.post(`${Cosmetologybaseurl}diagnoses/`, { diagnosis: newDiagnosis })
      .then(response => {
        setDiagnosisList([...diagnosisList, response.data]);
        setShowAddInput(false);
        setNewDiagnosis('');
        toast.success('New diagnosis stored successfully!');
      })
      .catch(error => console.error('Error adding new diagnosis:', error));
  };

  const handleDiagnosisChange = (selected, index) => {
    const newDiagnosisInputs = [...diagnosisInputs];
    newDiagnosisInputs[index].selectedDiagnosis = selected;
    setDiagnosisInputs(newDiagnosisInputs); // Update the diagnosis selection in the state
    onSelectDiagnosis(selected); // Pass the selected data to the parent component
  };

  return (
    <DiagnosisContainer>
      <ToastContainer position="top-right" autoClose={5000}/> {/* Toast container */}
      {diagnosisInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <CenteredFormGroup as={Col} md="4" controlId={`diagnosis-${index}`}>
            <Form.Label>Diagnosis</Form.Label>
            <FlexContainer>
              <Typeahead
                className="ms-2"
                id={`diagnosis-typeahead-${index}`}
                labelKey="diagnosis"
                onChange={(selected) => handleDiagnosisChange(selected, index)}
                options={diagnosisList}
                placeholder="Select Diagnosis"
                selected={input.selectedDiagnosis}  // This ensures the selected diagnoses are shown in the input field
                multiple
              />
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

      {/* New Diagnosis Input Section */}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Diagnosis</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                placeholder="Enter new diagnosis"
              />
              <Button onClick={handleAddNewDiagnosis} style={{ marginLeft: '10px' }}>
                Save
              </Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      {/* Button to show/hide the new diagnosis input field */}
      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Diagnosis'}
      </button>

      {successMessage && (
        <Alert variant="success" style={{ marginTop: '20px' }}>
          {successMessage}
        </Alert>
      )}
    </DiagnosisContainer>
  );
};

export default Diagnosis;
