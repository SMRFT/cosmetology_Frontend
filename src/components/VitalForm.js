import React, { useState } from "react"
import styled from "styled-components"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import apiRequest from "./apiRequest" // ✅ use your apiRequest

function VitalForm({ patientUID, patientName, mobileNumber }) {
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    pulseRate: "",
    bloodPressure: "",
    patientUID,
    patientName,
    mobileNumber,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await apiRequest(
        `${Cosmetologybaseurl}vitalform/`,
        "POST",
        formData
      )

      if (response.success) {
        toast.success(`Vital data for ${patientName} submitted successfully!`)

        // Reset form (keep patient info)
        setFormData({
          height: "",
          weight: "",
          pulseRate: "",
          bloodPressure: "",
          patientUID,
          patientName,
          mobileNumber,
        })
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Error submitting vital data:", error)
      toast.error("Error submitting form data. Please try again.")
    }
  }

  return (
    <FormContainer>
      <ToastContainer position="top-right" autoClose={5000} />
      <h3 className="text-center mb-4">Patient Vitals</h3>

      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label>Height (cm)</Label>
            <Input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Weight (kg)</Label>
            <Input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Pulse Rate (bpm)</Label>
            <Input
              type="text"
              name="pulseRate"
              value={formData.pulseRate}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Blood Pressure (mmHg)</Label>
            <Input
              type="text"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              placeholder="e.g., 120/80"
              required
            />
          </FormGroup>
        </FormRow>

        <ButtonContainer>
          <SubmitButton type="submit">Submit</SubmitButton>
        </ButtonContainer>
      </Form>
    </FormContainer>
  )
}

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-image: url${'/images/background-vital.jpg'};
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const FormRow = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;

    & > div {
        flex: 1;
        margin-right: 10px;
    }

    & > div:last-child {
        margin-right: 0;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
`;

const Label = styled.label`
    font-size: 14px;
    margin-bottom: 5px;
    display: block;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
`;

const SubmitButton = styled.button`
    background-color: #865CAF;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
        background-color: #7A1CAC;
    }
`;

export default VitalForm;