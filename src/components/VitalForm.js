import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie'; // Added cookie import

function VitalForm({ patientUID, patientName, mobileNumber }) {
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        pulseRate: '',
        bloodPressure: '',
        patientUID: patientUID,
        patientName: patientName,
        mobileNumber: mobileNumber,
        branch_code: '' // Added branch_code field
    });
    
    // Add useEffect to get branch_code from cookies when component mounts
    useEffect(() => {
        const code = Cookies.get('branch_code');
        if (code) {
            setFormData(prevData => ({
                ...prevData,
                branch_code: code
            }));
            console.log('Branch code retrieved from cookies:', code);
        } else {
            console.warn('Branch code not found in cookies');
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Include branch code in the URL as a query parameter
            const url = formData.branch_code 
                ? `http://127.0.0.1:8000/vitalform/?branch_code=${formData.branch_code}`
                : 'http://127.0.0.1:8000/vitalform/';
                
            const vitalResponse = await axios.post(url, formData, {
                withCredentials: true // Enable sending cookies with the request
            });
            
            toast.success(`Vital data for ${patientName} submitted successfully!`);
            // Reset form data after submission but keep branch_code
            setFormData({
                height: '',
                weight: '',
                pulseRate: '',
                bloodPressure: '',
                patientUID: patientUID,
                patientName: patientName,
                mobileNumber: mobileNumber,
                branch_code: formData.branch_code // Preserve branch_code
            });
        } catch (error) {
            console.error('Error submitting vital data:', error);
            toast.error('Error submitting form data. Please try again.');
        }
    };

    return (
        <FormContainer>
            <ToastContainer position="top-right" autoClose={5000}/> 
            <h3 className="text-center mb-4">Patient Vitals</h3>
            {formData.branch_code ? (
                <small className="text-center d-block mb-2">Branch: {formData.branch_code}</small>
            ) : (
                <div className="alert alert-warning mb-3">Branch code not found. Please login again.</div>
            )}
            <Form onSubmit={handleSubmit}>
                <FormRow>
                    <FormGroup>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                            type="text"
                            id="height"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                            type="text"
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                </FormRow>
                <FormRow>
                    <FormGroup>
                        <Label htmlFor="pulseRate">Pulse Rate (bpm)</Label>
                        <Input
                            type="text"
                            id="pulseRate"
                            name="pulseRate"
                            value={formData.pulseRate}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                        <Input
                            type="text"
                            id="bloodPressure"
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
    );
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