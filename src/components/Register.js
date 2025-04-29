import React, { useState, useEffect } from 'react';
import { Row, Form, Col } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';
import { role } from './constant';

const Register = () => {
    const [validated, setValidated] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [touchedFields, setTouchedFields] = useState({});
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
      id: '',
      name: '',
      role: '',
      branch_code: [], // Changed to array for multiple selection
      email: '',
      password: '',
      confirmPassword: ''
    });

    // Fetch branches on component mount
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/branches/');
                if (response.ok) {
                    const data = await response.json();
                    setBranches(data);
                } else {
                    console.error('Failed to fetch branches');
                    toast.error('Failed to load branches');
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
                toast.error('Error loading branches');
            }
        };

        fetchBranches();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setTouchedFields({ ...touchedFields, [id]: true });
    };

    // Handle branch selection/deselection
    const handleBranchToggle = (branchCode) => {
        const updatedBranches = [...formData.branch_code];
        const index = updatedBranches.indexOf(branchCode);
        
        if (index > -1) {
            // Remove if already selected
            updatedBranches.splice(index, 1);
        } else {
            // Add if not selected
            updatedBranches.push(branchCode);
        }
        
        setFormData({ ...formData, branch_code: updatedBranches });
    };

    // Check if a branch is selected
    const isBranchSelected = (branchCode) => {
        return formData.branch_code.includes(branchCode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        } else {
            setPasswordError('');
        }

        if (form.checkValidity() === false || formData.branch_code.length === 0) {
            e.stopPropagation();
            if (formData.branch_code.length === 0) {
                toast.error('Please select at least one branch');
            }
        } else {
            try {
                const response = await fetch('http://127.0.0.1:8000/registration/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    setFormSubmitted(true);
                    toast.success('Registration successful!');
                } else {
                    const errorText = await response.text();
                    console.error('Failed to submit data:', errorText);
                    toast.error('Failed to submit data');
                }
            } catch (error) {
                console.error('Error occurred:', error);
                toast.error('Error occurred while submitting the form');
            }
        }
        setValidated(true);
    };

    // Get display text for selected branches
    const getSelectedBranchesText = () => {
        if (formData.branch_code.length === 0) {
            return 'Select Branches';
        }
        
        if (formData.branch_code.length <= 2) {
            return formData.branch_code.map(code => {
                const branch = branches.find(b => b.branch_code === code);
                return branch ? branch.branch_name : '';
            }).join(', ');
        }
        
        return `${formData.branch_code.length} branches selected`;
    };

    return (
        <div>
        <ToastContainer position="top-right" autoClose={5000}/>
        <div className='Register'>
            <StyledContainer className='Register-container'>
                <h2 className="text-center mb-5">Registration</h2>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row className="mb-2">
                        <Col sm='6'>
                            <Form.Group controlId="id">
                                <Form.Label>ID</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={formData.id}
                                    onChange={handleChange}
                                    pattern="[a-zA-Z0-9]+"
                                    autoComplete="off"
                                    isInvalid={(touchedFields.id && !formData.id) || (formData.id && !/^[a-zA-Z0-9]+$/.test(formData.id))}
                                    style={{ border: "1px solid #DAD1E1" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formData.id && !/^[a-zA-Z0-9]+$/.test(formData.id) ? "Please enter a valid ID." : "ID is required."}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm='6'>
                            <Form.Group controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    pattern="[A-Za-z\s]+"
                                    isInvalid={(touchedFields.name && !formData.name) || (formData.name && !/^[A-Za-z\s]+$/.test(formData.name))}
                                    style={{ border: "1px solid #DAD1E1" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formData.name && !/^[A-Za-z\s]+$/.test(formData.name) ? "Please enter a valid name." : "Name is required."}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col sm='6'>
                            <Form.Group controlId="role">
                                <Form.Label>Role</Form.Label>
                                <Dropdown id="roleselect" 
                                    onSelect={(value) => setFormData({ ...formData, role: value })} 
                                    className="custom-dropdown">
                                    <Dropdown.Toggle variant="light" id="dropdown-basic" 
                                        style={{ 
                                            width: "100%", 
                                            backgroundColor: "white", 
                                            color: "black", 
                                            border: "1px solid #DAD1E1", 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            alignItems: "center" 
                                        }}>
                                        <span>{formData.role || 'Select Role'}</span>
                                        <span className="caret"></span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu style={{ 
                                        width: "100%", 
                                        textAlign: "center", 
                                        maxHeight: '250px', 
                                        overflowY: 'auto', 
                                        scrollbarWidth: "thin" 
                                    }}>
                                        {role.map((role, index) => (
                                            <Dropdown.Item key={index} eventKey={role}>
                                                {role}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Form.Control.Feedback type="invalid">
                                    Role is required.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm='6'>
                            <Form.Group controlId="branch">
                                <Form.Label>Branches</Form.Label>
                                <Dropdown id="branchselect" className="custom-dropdown">
                                    <Dropdown.Toggle variant="light" id="dropdown-branch" 
                                        style={{ 
                                            width: "100%", 
                                            backgroundColor: "white", 
                                            color: "black", 
                                            border: "1px solid #DAD1E1", 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            alignItems: "center" 
                                        }}>
                                        <span>{getSelectedBranchesText()}</span>
                                        <span className="caret"></span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu style={{ 
                                        width: '100%', 
                                        textAlign: "left", 
                                        maxHeight: '250px', 
                                        overflowY: 'auto', 
                                        scrollbarWidth: "thin" 
                                    }}>
                                        {branches.map((branch, index) => (
                                            <Dropdown.Item 
                                                key={index} 
                                                onClick={() => handleBranchToggle(branch.branch_code)}
                                                active={isBranchSelected(branch.branch_code)}
                                                className="branch-item"
                                            >
                                                <div className="d-flex align-items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isBranchSelected(branch.branch_code)} 
                                                        onChange={() => {}} 
                                                        className="mr-2"
                                                    />
                                                    <span className="ml-2">{branch.branch_name}</span>
                                                </div>
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>
                            <Form.Group controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    isInvalid={(touchedFields.email && !formData.email) || (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                                    autoComplete="off"
                                    style={{ border: "1px solid #DAD1E1" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Please enter a valid email address." : "Email is required."}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col sm="6">
                            <Form.Group controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    style={{ border: "1px solid #DAD1E1" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Password is required.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm="6">
                            <Form.Group controlId="confirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ border: "1px solid #DAD1E1" }}
                                    isInvalid={touchedFields.confirmPassword && formData.password !== formData.confirmPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {touchedFields.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match." : "Please confirm your password."}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <center>
                        <button type="submit" className="mt-2">
                            Save
                        </button>
                    </center>
                </Form>
            </StyledContainer>
        </div>
        </div>
    );
};

const StyledContainer = styled.div`
  padding: 20px;
  width: 100%;
  max-width: 450px;
  height: 100%;
  max-height: 500px;  /* Increased height to accommodate the new field and multi-select */
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default Register;