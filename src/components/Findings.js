import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Col, Row, Form, Button } from 'react-bootstrap';
import styled from 'styled-components';

const FindingsContainer = styled.div`
flex: 1;
margin: 0 15px;
padding: 20px;
background-color: #b798c0;
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

const Findings = ({ preSelectedFindings, onSelectFindings}) => {
  const [findingsList, setFindingsList] = useState([]);
  const [findingsInputs, setFindingsInputs] = useState([{ selectedFindings: [] }]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newFinding, setNewFinding] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  useEffect(() => {
    if (preSelectedFindings) {
      setFindingsInputs([{ selectedFindings: preSelectedFindings.split(', ') }]);
    } else {
      setFindingsInputs([{ selectedFindings: [] }]);
    }
  }, [preSelectedFindings]);

  useEffect(() => {
    axios.get(`${Cosmetologybaseurl}Findings/`)
      .then(response => {
        setFindingsList(response.data);
      })
      .catch(error => {
        console.error('Error fetching findings data:', error);
      });
  }, []);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const handleAddNewFinding = () => {
    if (!newFinding.trim()) {
      showMessage('Finding name cannot be empty.', 'error');
      return;
    }

    axios.post(`${Cosmetologybaseurl}Findings/`, { findings: newFinding })
      .then(response => {
        setFindingsList([...findingsList, response.data]);
        setShowAddInput(false);
        setNewFinding('');
        showMessage('New finding stored successfully!');
      })
      .catch(error => {
        console.error('Error adding new finding:', error);
        showMessage('Error adding new finding.', 'error');
      });
  };

  const handleFindingChange = (selected, index) => {
    const newFindingsInputs = [...findingsInputs];
    newFindingsInputs[index].selectedFindings = selected;
    setFindingsInputs(newFindingsInputs);
    onSelectFindings(selected);
  };

  return (
    <FindingsContainer>
      {message && (
        <MessageContainer type={messageType}>
          {message}
        </MessageContainer>
      )}
      
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
                selected={input.selectedFindings}
                multiple
              />
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

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

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Finding'}
      </button>
    </FindingsContainer>
  );
};

export default Findings;
