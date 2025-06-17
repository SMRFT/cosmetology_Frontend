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

const Diagnosis = ({ preSelectedDiagnosis, onSelectDiagnosis }) => {
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [diagnosisInputs, setDiagnosisInputs] = useState([{ selectedDiagnosis: [] }]);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;

  useEffect(() => {
    if (preSelectedDiagnosis) {
      // Ensure preSelectedDiagnosis is an array of objects if Typeahead expects objects
      // Assuming preSelectedDiagnosis is a comma-separated string of diagnosis names
      const parsedDiagnosis = preSelectedDiagnosis.split(', ').map(d => ({ diagnosis: d.trim() }));
      setDiagnosisInputs([{ selectedDiagnosis: parsedDiagnosis }]);
    } else {
      setDiagnosisInputs([{ selectedDiagnosis: [] }]);
    }
  }, [preSelectedDiagnosis]);

  useEffect(() => {
    axios.get(`${Cosmetologybaseurl}diagnoses/`)
      .then(response => {
        setDiagnosisList(response.data);
      })
      .catch(error => {
        console.error('Error fetching diagnosis data:', error);
      });
  }, []);

  const handleAddNewDiagnosis = () => {
    if (!newDiagnosis.trim()) {
      toast.error("Diagnosis name cannot be empty.");
      return;
    }

    axios.post(`${Cosmetologybaseurl}diagnoses/`, { diagnosis: newDiagnosis.trim() })
      .then(response => {
        const addedDiagnosis = response.data; // The newly added diagnosis object from the backend

        setDiagnosisList(prevList => [...prevList, addedDiagnosis]); // Add to the list of available diagnoses

        // Optionally, immediately select the newly added diagnosis in the first input field
        setDiagnosisInputs(prevInputs => {
          const updatedInputs = [...prevInputs];
          // Assuming you want to add the newly created diagnosis to the first diagnosis input's selection
          // You might need to adjust this logic if you have multiple diagnosis input fields
          // or if the new diagnosis should be selected in a specific field.
          const firstInput = updatedInputs[0];
          if (firstInput) {
            firstInput.selectedDiagnosis = [...firstInput.selectedDiagnosis, addedDiagnosis];
            onSelectDiagnosis(firstInput.selectedDiagnosis); // Notify parent of the updated selection
          }
          return updatedInputs;
        });

        setShowAddInput(false);
        setNewDiagnosis('');
        toast.success('New diagnosis stored successfully!'); // This toast should now display immediately.
      })
      .catch(error => {
        console.error('Error adding new diagnosis:', error);
        toast.error('Error adding new diagnosis.');
      });
  };

  const handleDiagnosisChange = (selected, index) => {
    const newDiagnosisInputs = [...diagnosisInputs];
    newDiagnosisInputs[index].selectedDiagnosis = selected;
    setDiagnosisInputs(newDiagnosisInputs);
    onSelectDiagnosis(selected);
  };

  return (
    <DiagnosisContainer>
      <ToastContainer position="top-right" autoClose={5000} /> {/* Toast container */}
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
                selected={input.selectedDiagnosis}
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
    </DiagnosisContainer>
  );
};

export default Diagnosis;