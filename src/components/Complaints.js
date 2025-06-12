import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typeahead } from "react-bootstrap-typeahead";
import { Col, Row, Form, Button, Alert } from "react-bootstrap";
import styled from "styled-components";
import { BsPatchPlusFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ComplaintsContainer = styled.div`
flex: 1;
margin: 0 15px; // Adjusted margin for balanced spacing
padding: 20px;
background-color: #b798c0; // Light brown background
border-radius: 10px;
text-align: center;
`;
const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;
const Complaints = ({ preSelectedComplaints, onSelectComplaints }) => {
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsInputs, setComplaintsInputs] = useState([
    { selectedComplaints: [], duration: "", durationUnit: "" },
  ]);
  const [newComplaint, setNewComplaint] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  // Fetch complaints from the API
   const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  useEffect(() => {
    axios
      .get(`${Cosmetologybaseurl}complaints/`)
      .then((response) => {
        setComplaintsList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching complaints data:", error);
      });
  }, []);
  // Parse preSelectedComplaints and set it to the complaintsInputs state
  useEffect(() => {
    if (preSelectedComplaints && complaintsList.length > 0) {
      try {
        // If preSelectedComplaints is a string, parse it; if not, use it directly
        const parsedComplaints = typeof preSelectedComplaints === 'string'
          ? JSON.parse(preSelectedComplaints)
          : preSelectedComplaints;
        const updatedInputs = parsedComplaints.map((item) => ({
          selectedComplaints: complaintsList.filter(
            (complaint) => complaint.complaints === item.complaints
          ),
          duration: item.duration || "",
          durationUnit: item.durationUnit || "",
        }));
        setComplaintsInputs(updatedInputs);
      } catch (error) {
        console.error("Error parsing preSelectedComplaints:", error);
        toast.error("Error parsing preSelectedComplaints")
      }
    }
  }, [preSelectedComplaints, complaintsList]);
  // Synchronize with parent component
  useEffect(() => {
    onSelectComplaints(complaintsInputs);
  }, [complaintsInputs, onSelectComplaints]);
  // Handle complaint selection
  const handleComplaintChange = (selected, index) => {
    const newInputs = [...complaintsInputs];
    newInputs[index].selectedComplaints = selected;
    setComplaintsInputs(newInputs);
  };
  // Handle duration input
  const handleDurationChange = (e, index) => {
    const newInputs = [...complaintsInputs];
    newInputs[index].duration = e.target.value;
    setComplaintsInputs(newInputs);
  };
  // Handle duration unit selection
  const handleDurationUnitChange = (e, index) => {
    const newInputs = [...complaintsInputs];
    newInputs[index].durationUnit = e.target.value;
    setComplaintsInputs(newInputs);
  };
  // Add a new complaint section
  const handleAddNewSection = () => {
    const newInputs = [
      ...complaintsInputs,
      { selectedComplaints: [], duration: "", durationUnit: "" },
    ];
    setComplaintsInputs(newInputs);
  };
  // Remove a complaint section
  const handleRemoveSection = (index) => {
    const updatedInputs = complaintsInputs.filter((_, i) => i !== index);
    setComplaintsInputs(updatedInputs);
  };
  // Add a new complaint to the list
  const handleAddNewComplaint = () => {
    if (newComplaint.trim() === "") {
      toast.error("Please enter a valid complaint.");
      return;
    }
    axios
      .post(`${Cosmetologybaseurl}complaints/`, {
        complaints: newComplaint,
      })
      .then((response) => {
        setComplaintsList([...complaintsList, response.data]);
        setShowAddInput(false);
        setNewComplaint("");
        toast.success("New complaint added successfully!");
      })
      .catch((error) => {
        console.error("Error adding new complaint:", error);
        toast.error("Failed to add complaint. Please try again.");
      });
  };
  return (
    <ComplaintsContainer>
      <ToastContainer position="top-right" autoClose={5000}/> {/* Toast container */}
      {complaintsInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <Col md="3">
            <Form.Group controlId={`complaints-${index}`}>
              <Form.Label>Complaints</Form.Label>
              <Typeahead
                className="ms-2"
                id={`complaints-typeahead-${index}`}
                labelKey="complaints"
                onChange={(selected) => handleComplaintChange(selected, index)}
                options={complaintsList}
                selected={Array.isArray(input.selectedComplaints)
                  ? input.selectedComplaints
                  : []}
                placeholder="Select Complaints"
                multiple
              />
            </Form.Group>
          </Col>
          <Col md="2">
            <Form.Group controlId={`duration-${index}`}>
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="text"
                value={input.duration}
                onChange={(e) => handleDurationChange(e, index)}
                placeholder="Enter duration"
              />
            </Form.Group>
          </Col>
          <Col md="2">
            <Form.Group controlId={`durationUnit-${index}`}>
              <Form.Label>Duration Unit</Form.Label>
              <Form.Control
                as="select"
                value={input.durationUnit}
                onChange={(e) => handleDurationUnitChange(e, index)}
              >
                <option value="">Select Unit</option>
                <option value="Days">Days</option>
                <option value="Months">Months</option>
                <option value="Years">Years</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col sm="1" className="text-end">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BsPatchPlusFill size={24} onClick={handleAddNewSection} style={{ cursor: 'pointer', marginLeft: '10px' }} />
              {index !== 0 && ( <MdDelete size={24} onClick={() => handleRemoveSection(index)} style={{ cursor: 'pointer', marginLeft: '10px' }} /> )}
            </div>
          </Col>          
        </Row>
      ))}
      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <Col md="4">
            <Form.Group controlId="newComplaint">
              <Form.Label>New Complaint</Form.Label>
              <FlexContainer>
                <Form.Control
                  type="text"
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                  placeholder="Enter new complaint"
                />
                <Button
                  onClick={handleAddNewComplaint}
                  style={{ marginLeft: "10px" }}
                >
                  Save
                </Button>
              </FlexContainer>
            </Form.Group>
          </Col>
        </Row>
      )}
      <button onClick={() => setShowAddInput(!showAddInput)} className="mt-3">
        {showAddInput ? "Close" : "Add New Complaint"}
      </button>
    </ComplaintsContainer>
  );
};
export default Complaints;