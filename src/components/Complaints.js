import React, { useEffect, useState, useCallback } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import { Col, Row, Form, Button } from "react-bootstrap";
import styled from "styled-components";
import { BsPatchPlusFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import apiRequest from "./apiRequest"; // ✅ use this

const ComplaintsContainer = styled.div`
flex: 1;
margin: 0 15px;
padding: 10px;
background-color: #b798c0;
border-radius: 10px;
text-align: center;
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

const Complaints = ({ preSelectedComplaints, onSelectComplaints }) => {
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsInputs, setComplaintsInputs] = useState([
    { selectedComplaints: [], duration: "", durationUnit: "" },
  ]);
  const [newComplaint, setNewComplaint] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const memoizedOnSelectComplaints = useCallback(onSelectComplaints, []);

  // ✅ GET complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await apiRequest("complaints/", "GET")

        if (response.success) {
          setComplaintsList(response.data || [])
        } else {
          console.error("Error fetching complaints:", response.error)
          showMessage("Error fetching complaints", "error")
        }
      } catch (error) {
        console.error("Unexpected error fetching complaints:", error)
        showMessage("Error fetching complaints", "error")
      }
    }

    fetchComplaints();
  }, []);

  // ✅ Handle preSelected
  useEffect(() => {
    if (preSelectedComplaints && complaintsList.length > 0) {
      try {
        const parsed =
          typeof preSelectedComplaints === "string"
            ? JSON.parse(preSelectedComplaints)
            : preSelectedComplaints;

        const updatedInputs = parsed.map((item) => ({
          selectedComplaints: complaintsList.filter(
            (c) => c.complaints === item.complaints
          ),
          duration: item.duration || "",
          durationUnit: item.durationUnit || "",
        }));

        setComplaintsInputs(updatedInputs);
      } catch (error) {
        console.error("Error parsing preSelectedComplaints:", error);
        showMessage("Error parsing complaints", "error");
      }
    }
  }, [preSelectedComplaints, complaintsList]);

  // ✅ Sync to parent
  useEffect(() => {
    memoizedOnSelectComplaints(complaintsInputs);
  }, [complaintsInputs, memoizedOnSelectComplaints]);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleComplaintChange = (selected, index) => {
    const newInputs = [...complaintsInputs];
    newInputs[index].selectedComplaints = selected;
    setComplaintsInputs(newInputs);
  };

  const handleDurationChange = (e, index) => {
    const newInputs = [...complaintsInputs];
    newInputs[index].duration = e.target.value;
    setComplaintsInputs(newInputs);
  };

  const handleDurationUnitChange = (e, index) => {
    const newInputs = [...complaintsInputs];
    newInputs[index].durationUnit = e.target.value;
    setComplaintsInputs(newInputs);
  };

  const handleAddNewSection = () => {
    setComplaintsInputs([
      ...complaintsInputs,
      { selectedComplaints: [], duration: "", durationUnit: "" },
    ]);
  };

  const handleRemoveSection = (index) => {
    setComplaintsInputs(complaintsInputs.filter((_, i) => i !== index));
  };

  // ✅ POST complaint
  const handleAddNewComplaint = async () => {
    if (!newComplaint.trim()) {
      showMessage("Please enter a valid complaint.", "error");
      return;
    }

    try {
      const response = await apiRequest("complaints/", "POST", { complaints: newComplaint })

      if (response.success) {
        setComplaintsList((prev) => [...prev, response.data])
        setShowAddInput(false)
        setNewComplaint("")
        showMessage("New complaint added successfully!")
      } else {
        console.error("Error adding complaint:", response.error)
        showMessage("Failed to add complaint", "error")
      }
    } catch (error) {
      console.error("Unexpected error adding complaint:", error)
      showMessage("Failed to add complaint", "error")
    }
  };

  return (
    <ComplaintsContainer>
      {message && <MessageContainer type={messageType}>{message}</MessageContainer>}

      {complaintsInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <Col md="3">
            <Form.Group>
              <Form.Label>Complaints</Form.Label>
              <Typeahead
                className="ms-2"
                id={`complaints-${index}`}
                labelKey="complaints"
                onChange={(selected) => handleComplaintChange(selected, index)}
                options={complaintsList}
                selected={input.selectedComplaints || []}
                multiple
              />
            </Form.Group>
          </Col>

          <Col md="2">
            <Form.Group>
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="text"
                value={input.duration}
                onChange={(e) => handleDurationChange(e, index)}
              />
            </Form.Group>
          </Col>

          <Col md="2">
            <Form.Group>
              <Form.Label>Unit</Form.Label>
              <Form.Control
                as="select"
                value={input.durationUnit}
                onChange={(e) => handleDurationUnitChange(e, index)}
              >
                <option value="">Select</option>
                <option value="Days">Days</option>
                <option value="Months">Months</option>
                <option value="Years">Years</option>
              </Form.Control>
            </Form.Group>
          </Col>

          <Col sm="1">
            <Form.Label>&nbsp;</Form.Label>
            <div style={{ display: "flex" }}>
              <BsPatchPlusFill size={24} onClick={handleAddNewSection} style={{ cursor: "pointer" }} />
              {index !== 0 && (
                <MdDelete size={24} onClick={() => handleRemoveSection(index)} style={{ cursor: "pointer", marginLeft: "10px" }} />
              )}
            </div>
          </Col>
        </Row>
      ))}

      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <Col md="4">
            <Form.Group>
              <Form.Label>New Complaint</Form.Label>
              <FlexContainer>
                <Form.Control
                  value={newComplaint}
                  onChange={(e) => setNewComplaint(e.target.value)}
                />
                <Button onClick={handleAddNewComplaint} style={{ marginLeft: "10px" }}>
                  Save
                </Button>
              </FlexContainer>
            </Form.Group>
          </Col>
        </Row>
      )}

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? "Close" : "Add New Complaint"}
      </button>
    </ComplaintsContainer>
  );
};

export default Complaints;