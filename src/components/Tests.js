import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';


const TestsContainer = styled.div`
  flex: 1;
  margin-right: 10px;
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


const Tests = ({ preSelectedTests, onSelectTests }) => {
  const [testsList, setTestsList] = useState([]);
  const [testsInputs, setTestsInputs] = useState([{ selectedTests: [] }]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTest, setNewTest] = useState('');

  const parseTests = (testsString) => {
    if (!testsString) return [];
    const regex = /([^,(]+(?:\([^)]*\))?)/g; // Matches items while respecting parentheses
    const matches = [...testsString.matchAll(regex)].map((match) => match[0].trim()).filter(Boolean);
    return matches;
  };
  
  // Usage
  useEffect(() => {
    if (preSelectedTests) {
      const parsedTests = parseTests(preSelectedTests);
      setTestsInputs([{ selectedTests: parsedTests }]);
    } else {
      setTestsInputs([{ selectedTests: [] }]);
    }
  }, [preSelectedTests]);
  

  useEffect(() => {
    axios
      .get('https://api.shinovadatabase.in/Tests/')
      .then((response) => {
        // Ensure each object in the array has the "test" key with string values
        const formattedTestsList = response.data.map((test) => ({
          test: test.test || '', // Ensure "test" key exists and has a string value
        }));
        setTestsList(formattedTestsList);
      })
      .catch((error) => {
        console.error('Error fetching tests data:', error);
        toast.error('Error fetching tests data'); // Error toast
      });
  }, []);

  const handleAddNewTest = () => {
    axios
      .post('https://api.shinovadatabase.in/Tests/', { test: newTest })
      .then((response) => {
        setTestsList([...testsList, response.data]);
        setShowAddInput(false);
        setNewTest('');
        toast.success('New test added successfully!'); // Success toast for adding a test
      })
      .catch((error) => {
        console.error('Error adding new test:', error);
        toast.error('Error adding new test'); // Error toast
      });
  };

  const handleTestChange = (selected, index) => {
    const newInputs = [...testsInputs];
    newInputs[index].selectedTests = selected;
    setTestsInputs(newInputs); // Update the diagnosis selection in the state
    onSelectTests(selected); // Pass the selected data to the parent component
  };


  return (
    <TestsContainer>
      <ToastContainer position="top-right" autoClose={5000}/> {/* Toast container */}
      {testsInputs.map((input, inputIndex) => (
        <Row className="justify-content-center mb-3" key={inputIndex}>
          <CenteredFormGroup as={Col} md="4" controlId={`tests-${inputIndex}`}>
            <Form.Label>Tests</Form.Label>
            <FlexContainer>
            <Typeahead
              className="ms-2"
              id={`tests-typeahead-${inputIndex}`}
              labelKey="test"
              multiple
              onChange={(selected) => handleTestChange(selected, inputIndex)}
              options={testsList}
              placeholder="Select Tests"
              selected={Array.isArray(input.selectedTests) ? input.selectedTests : []}
            />
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Test</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newTest}
                onChange={(e) => setNewTest(e.target.value)}
                placeholder="Enter new test"
              />
              <Button onClick={handleAddNewTest} style={{ marginLeft: '10px' }}>Save</Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Test'}
      </button>
    </TestsContainer>
  );
};

export default Tests;