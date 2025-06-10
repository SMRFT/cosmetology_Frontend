import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';

const FindingsContainer = styled.div`
flex: 1;
margin: 0 15px; // Adjusted margin for balanced spacing
padding: 20px;
background-color: #b798c0; // Light brown background
border-radius: 10px;
text-align: center;
`;

const CenteredFormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Findings = ({ preSelectedFindings, onSelectFindings}) => {
  const [findingsList, setFindingsList] = useState([]);
  const [findingsInputs, setFindingsInputs] = useState([{ selectedFindings: [] }]);
  const [selectedFindings, setSelectedFindings] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newFinding, setNewFinding] = useState('');

    useEffect(() => {
      // Ensure preSelectedFindings is a valid string (or array, depending on your expected type)
      if (preSelectedFindings) {
        // If preSelectedFindings is a comma-separated string, split it into an array
        setFindingsInputs([{ selectedFindings: preSelectedFindings.split(', ') }]);
      } else {
        setFindingsInputs([{ selectedFindings: [] }]); // Default to an empty array if preSelectedFindings is null/undefined
      }
    }, [preSelectedFindings]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/Findings/')
      .then(response => {
        setFindingsList(response.data);
      })
      .catch(error => {
        console.error('Error fetching findings data:', error);
      });
  }, []);

  const handleAddInput = () => {
    setFindingsInputs([...findingsInputs, { selectedFindings: [] }]);
  };

  const handleDeleteInput = (index) => {
    const newInputs = findingsInputs.filter((_, i) => i !== index);
    setFindingsInputs(newInputs);
  };

  const handleAddNewFinding = () => {
    axios.post('http://127.0.0.1:8000/Findings/', { findings: newFinding })
      .then(response => {
        setFindingsList([...findingsList, response.data]);
        setShowAddInput(false);
        setNewFinding('');
        toast.success('New finding stored successfully!');
      })
      .catch(error => console.error('Error adding new finding:', error));
      
  };

  const handleFindingChange = (selected, index) => {
    const newFindingsInputs = [...findingsInputs];
    newFindingsInputs[index].selectedFindings = selected;
    setFindingsInputs(newFindingsInputs); // Update the diagnosis selection in the state
    onSelectFindings(selected); // Pass the selected data to the parent component
  };

  return (
    <FindingsContainer>
      <ToastContainer position="top-right" autoClose={5000}/> {/* Toast container */}
      {findingsInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <CenteredFormGroup as={Col} md="4" controlId={`findings-${index}`}>
            <Form.Label>Findings</Form.Label>
            <FlexContainer>
              <Typeahead
                className="ms-2"
                id={`findings-typeahead-${index}`}
                labelKey="findings"
                onChange={(selected) => handleFindingChange(selected, index)}
                options={findingsList}
                placeholder="Select Findings"
                selected={input.selectedFindings}  // This ensures the selected diagnoses are shown in the input field
                multiple
              />
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

      {/* New Finding Input Section */}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Finding</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newFinding}
                onChange={(e) => setNewFinding(e.target.value)}
                placeholder="Enter new finding"
              />
              <Button onClick={handleAddNewFinding} style={{ marginLeft: '10px' }}>Save</Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      {/* Button to show/hide the new finding input field */}
      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Finding'}
      </button>

    </FindingsContainer>
  );
};

export default Findings;