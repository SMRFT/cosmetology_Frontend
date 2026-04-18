import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import styled from 'styled-components';
import { Col, Row, Form, Button } from 'react-bootstrap';
import apiRequest from './apiRequest'; // ✅ use this

const DiagnosisContainer = styled.div`
  flex: 1;
  margin: 0 15px;
  padding: 20px;
  background-color: #b798c0;
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

const MessageContainer = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 5px;
  font-weight: bold;
  z-index: 1000;
  ${(props) => {
    if (props.type === "error") {
      return `
        background-color: white;
        color: #ff4444;
        border: 1px solid #cc0000;
      `;
    } else {
      return `
        background-color: white;
        color: #28a745;
        border: 1px solid #45a049;
      `;
    }
  }}
`;

const Diagnosis = ({ preSelectedDiagnosis, onSelectDiagnosis }) => {
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [diagnosisInputs, setDiagnosisInputs] = useState([{ selectedDiagnosis: [] }]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (preSelectedDiagnosis) {
      setDiagnosisInputs([{ selectedDiagnosis: preSelectedDiagnosis.split(', ') }]);
    } else {
      setDiagnosisInputs([{ selectedDiagnosis: [] }]);
    }
  }, [preSelectedDiagnosis]);

  // ✅ GET Diagnosis
  useEffect(() => {
    const fetchDiagnosis = async () => {
      try {
        const response = await apiRequest("diagnoses/", "GET")

        if (response.success) {
          setDiagnosisList(response.data || [])
        } else {
          console.error("Error fetching diagnosis:", response.error)
          showMessage("Error fetching diagnosis", "error")
        }
      } catch (error) {
        console.error("Unexpected error fetching diagnosis:", error)
        showMessage("Error fetching diagnosis", "error")
      }
    }

    fetchDiagnosis()
  }, [])

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // ✅ POST Diagnosis
  const handleAddNewDiagnosis = async () => {
    if (!newDiagnosis.trim()) {
      showMessage('Diagnosis name cannot be empty.', 'error');
      return;
    }

    try {
      const response = await apiRequest("diagnoses/", "POST", { diagnosis: newDiagnosis })

      if (response.success) {
        setDiagnosisList((prev) => [...prev, response.data])
        setShowAddInput(false)
        setNewDiagnosis("")
        showMessage("New Diagnosis stored successfully!")
      } else {
        console.error("Error adding diagnosis:", response.error)
        showMessage("Error adding new diagnosis.", "error")
      }
    } catch (error) {
      console.error("Unexpected error adding diagnosis:", error)
      showMessage("Error adding new diagnosis.", "error")
    }
  };

  const handleDiagnosisChange = (selected, index) => {
    const newDiagnosisInputs = [...diagnosisInputs];
    newDiagnosisInputs[index].selectedDiagnosis = selected;
    setDiagnosisInputs(newDiagnosisInputs);
    onSelectDiagnosis(selected);
  };

  return (
    <DiagnosisContainer>
      {message && <MessageContainer type={messageType}>{message}</MessageContainer>}

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

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Diagnosis'}
      </button>
    </DiagnosisContainer>
  );
};

export default Diagnosis;