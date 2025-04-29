import React, { useState, useEffect } from 'react';
import { Form, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import Cookies from 'js-cookie'; // Import js-cookie package

const Login = ({ title, endpoint, setUserRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { sectionName } = location.state || {};

  useEffect(() => {}, [location.state, sectionName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://127.0.0.1:8000/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials for cookies
        body: JSON.stringify({ username, password, endpoint }),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        const userRole = responseData.role;
        
        // Store essential data in localStorage
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', responseData.id);
        localStorage.setItem('userName', responseData.name);
        localStorage.setItem('userEmail', responseData.email);
        localStorage.setItem('loggedInAs', endpoint);
        
        // Check if user has multiple branch codes
        const branchCodes = responseData.branch_codes;
        
        if (Array.isArray(branchCodes) && branchCodes.length > 1) {
          // Store branch codes in localStorage for Branch selection page
          localStorage.setItem('availableBranches', JSON.stringify(branchCodes));
          
          toast.success('Login successful! Please select a branch.');
          
          setTimeout(() => {
            navigate('/branch');
          }, 1000);
        } else {
          // Single branch code - set it directly
          const branchCode = Array.isArray(branchCodes) ? branchCodes[0] : responseData.branch_code;
          
          // Set branch_code in cookies with expiration of 7 days
          Cookies.set('branch_code', branchCode, { expires: 7, path: '/' });
          
          setUserRole(userRole); // Update state immediately
          
          toast.success('Login successful!');
      
          setTimeout(() => {
            if (userRole === 'Pharmacist' && endpoint === 'PharmacistLogin') {
              navigate('/Pharmacy');
            } else if (userRole === 'Receptionist' && endpoint === 'ReceptionistLogin') {
              navigate('/Reception/Appointment');
            } else if (userRole === 'Doctor' && endpoint === 'DoctorLogin') {
              navigate('/Doctor/BookedAppointments');
            } else if (userRole === 'Doctor' && endpoint === 'PharmacistLogin') {
              navigate('/Pharmacy');
            } else if (userRole === 'Doctor' && endpoint === 'ReceptionistLogin') {
              navigate('/Reception/Appointment');
            } else {
              toast.error('Access denied');
            }
          }, 1000);
        }
      } else {
        const errorText = await response.text();
        toast.error('Login failed: ' + errorText);
      }
    } catch (error) {
      toast.error('An error occurred while logging in');
    }
  };
  
  return (
    <>
    <ToastContainer position="top-right" autoClose={1000}/>
    <div className="login mt-3">
      <StyledContainer className="login-container">
        <h2 className="text-center mb-5">{title}</h2>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
                style={{ border: '1px solid #DAD1E1' }}
              />
              <Form.Control.Feedback type="invalid">Username is required.</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                style={{ border: '1px solid #DAD1E1' }}
              />
              <Form.Control.Feedback type="invalid">Password is required.</Form.Control.Feedback>
            </Form.Group>
          </Row>
          <center>
            <button type="submit" className="mb-3">Login</button>
          </center>
        </Form>
      </StyledContainer>
    </div>
    </>
  );
};

const StyledContainer = styled.div`
  padding: 20px;
  width: 100%;
  max-width: 400px;
  height: 100%;
  max-height: 350px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const PharmacistLogin = ({ setUserRole }) => <Login title="Pharmacist Login" endpoint="PharmacistLogin" setUserRole={setUserRole} />;
const DoctorLogin = ({ setUserRole }) => <Login title="Doctor Login" endpoint="DoctorLogin" setUserRole={setUserRole} />;
const ReceptionistLogin = ({ setUserRole }) => <Login title="Receptionist Login" endpoint="ReceptionistLogin" setUserRole={setUserRole} />;

export { PharmacistLogin, DoctorLogin, ReceptionistLogin };