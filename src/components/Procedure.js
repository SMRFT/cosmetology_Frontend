import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BsPatchPlusFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { AiOutlineCalendar } from 'react-icons/ai';
import { Col, Row, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
const ProceduresContainer = styled.div`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #B798C0; // Light brown background
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

const DateDisplay = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const CalendarIcon = styled(AiOutlineCalendar)`
  cursor: pointer;
`;

// Component
const Procedures = ({ onSelectProcedures, preSelectedProcedures }) => {
  const [proceduresList, setProceduresList] = useState([]);
  const [proceduresInputs, setProceduresInputs] = useState([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newProcedure, setNewProcedure] = useState('');
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  useEffect(() => {
    axios
      .get(`${Cosmetologybaseurl}Procedure/`)
      .then((response) => {
        const formattedProceduresList = response.data.map((procedure) => ({
          procedure: procedure.procedure || '', // Ensure "procedure" key exists and has a string value
        }));
        setProceduresList(formattedProceduresList);
      })
      .catch((error) => {
        console.error('Error fetching procedures data:', error);
      });
  }, []);

  useEffect(() => {
    if (preSelectedProcedures) {
      try {
        const parsedProcedures = preSelectedProcedures.split('\n').map((item) => {
          const procedureMatch = item.match(/^(?:Procedure:\s*)?(.*?)(?:\s+-\s+Date:\s*(.*))?$/);
          const procedure = procedureMatch ? procedureMatch[1].trim() : '';
          const dateText = procedureMatch && procedureMatch[2] ? procedureMatch[2].trim() : null;
          const selectedDate = dateText
            ? new Date(dateText.split('/').reverse().join('-'))
            : null;

          return {
            selectedProcedures: procedure ? [{ procedure }] : [],
            selectedDate: !isNaN(selectedDate) ? selectedDate : null,
          };
        });

        setProceduresInputs(parsedProcedures);
      } catch (error) {
        console.error('Error parsing preSelectedProcedures:', error);
        toast.error('Error parsing pre-selected procedures');
      }
    } else {
      setProceduresInputs([{ selectedProcedures: [], selectedDate: null }]);
    }
  }, [preSelectedProcedures]);

  const handleAddInput = () => {
    setProceduresInputs([...proceduresInputs, { selectedProcedures: [], selectedDate: null }]);
  };

  const handleDeleteInput = (index) => {
    if (proceduresInputs.length <= 1) return; // Prevent deleting the last input
    const newInputs = proceduresInputs.filter((_, i) => i !== index); // Remove the procedure
    setProceduresInputs(newInputs);
    onSelectProcedures(newInputs); // Notify parent of the change
  };

  const handleAddNewProcedure = () => {
    if (newProcedure.trim() === '') return;
    const newProcedureData = { procedure: newProcedure };

    axios
      .post(`${Cosmetologybaseurl}Procedure/`, newProcedureData)
      .then((response) => {
        setProceduresList([...proceduresList, response.data]);
        setShowAddInput(false);
        setNewProcedure('');
        toast.success('New procedure added successfully!');
      })
      .catch((error) => {
        console.error('Error adding new procedure:', error);
      });
  };

  const handleProcedureChange = (selected, index) => {
    const newInputs = [...proceduresInputs];
    newInputs[index].selectedProcedures = selected;
    setProceduresInputs(newInputs);
    onSelectProcedures(newInputs); // Update parent component
  };

  const handleDateChange = (date, index) => {
    const newInputs = [...proceduresInputs];
    newInputs[index].selectedDate = date;
    setProceduresInputs(newInputs);
    onSelectProcedures(newInputs); // Update parent component
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <ProceduresContainer>
      <ToastContainer position="top-right" autoClose={5000} />
      {proceduresInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <CenteredFormGroup as={Col} md="4" controlId={`procedures-${index}`}>
            <Form.Label>Procedures</Form.Label>
            <FlexContainer>
              <BsPatchPlusFill size={24} onClick={handleAddInput} />
              <Typeahead
                id={`procedures-typeahead-${index}`}
                labelKey="procedure"
                onChange={(selected) => handleProcedureChange(selected, index)}
                options={proceduresList}
                placeholder="Select Procedures"
                selected={input.selectedProcedures}
                multiple={false}
              />
              {index > 0 && (
                <MdDelete size={24} onClick={() => handleDeleteInput(index)} />
              )}
              <DatePicker
                selected={input.selectedDate || null}
                onChange={(date) => handleDateChange(date, index)}
                customInput={<CalendarIcon size={24} />}
                popperPlacement="bottom-end"
                dateFormat="dd/MM/yyyy"
              />
            </FlexContainer>
            <DateDisplay>
              {input.selectedDate
                ? `Procedure Date: ${formatDate(input.selectedDate)}`
                : 'Procedure Date: Select a date'}
            </DateDisplay>
          </CenteredFormGroup>
        </Row>
      ))}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <Col md="4">
            <Form.Group controlId="new-Procedure">
              <Form.Label>New Procedure</Form.Label>
              <FlexContainer>
                <Form.Control
                  type="text"
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  placeholder="Enter new Procedure"
                />
                <Button onClick={handleAddNewProcedure} style={{ marginLeft: '10px' }}>
                  Save
                </Button>
              </FlexContainer>
            </Form.Group>
          </Col>
        </Row>
      )}
      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? 'Close' : 'Add New Procedure'}
      </button>
    </ProceduresContainer>
  );
};

export default Procedures;
