import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import styled from 'styled-components';
import { Col, Row, Form, Button } from 'react-bootstrap';

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
      `
    } else {
      return `
        background-color: white;
        color: #28a745;
        border: 1px solid #45a049;
      `
    }
  }}
`;


const Diagnosis = ({ preSelectedDiagnosis, onSelectDiagnosis}) => {
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [diagnosisInputs, setDiagnosisInputs] = useState([{ selectedDiagnosis: [] }]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  useEffect(() => {
    if (preSelectedDiagnosis) {
      setDiagnosisInputs([{ selectedDiagnosis: preSelectedDiagnosis.split(', ') }]);
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

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const handleAddNewDiagnosis = () => {
    if (!newDiagnosis.trim()) {
      showMessage('Disgnosis name cannot be empty.', 'error');
      return;
    }

    axios.post(`${Cosmetologybaseurl}diagnoses/`, { diagnosis: newDiagnosis })
      .then(response => {
        setDiagnosisList([...diagnosisList, response.data]);
        setShowAddInput(false);
        setNewDiagnosis('');
        showMessage('New Disgnosis stored successfully!');
      })
      .catch(error => {
        console.error('Error adding new Disgnosis:', error);
        showMessage('Error adding new Disgnosis.', 'error');
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
      {message && (
        <MessageContainer type={messageType}>
          {message}
        </MessageContainer>
      )}

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
