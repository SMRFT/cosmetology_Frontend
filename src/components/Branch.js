import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaStore } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie package

const BranchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to right, #B5A7C1, rgb(226, 216, 235));
  font-family: 'Poppins', sans-serif;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #7E569B;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Dropdown = styled.select`
  padding: 12px 20px;
  border: 2px solid #7E569B;
  border-radius: 10px;
  background-color: white;
  font-size: 1rem;
  color: #333;
  outline: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 250px;

  &:hover {
    border-color: rgb(105, 67, 133);
  }
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #7E569B;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: rgb(105, 67, 133);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Define a mapping for branch codes to readable names
const branchNames = {
  "SSC001": "Branch 1 - Salem",
  "SSC002": "Branch 2 - Kumarapalayam",
  // Add more branch mappings as needed
};

const Branch = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState("");
  const [availableBranches, setAvailableBranches] = useState([]);
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    // Get available branches from localStorage
    const branchesData = localStorage.getItem("availableBranches");
    if (branchesData) {
      try {
        const branches = JSON.parse(branchesData);
        setAvailableBranches(branches);
      } catch (error) {
        console.error("Error parsing branch data:", error);
        setAvailableBranches([]);
      }
    } else {
      // If no branches found, redirect to home
      navigate("/");
    }
  }, [navigate]);

  const handleBranchSelect = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleProceed = () => {
    if (selectedBranch) {
      // Set branch_code in cookies with expiration of 7 days
      Cookies.set('branch_code', selectedBranch, { expires: 7, path: '/' });
      
      // Store selected branch in localStorage for reference
      localStorage.setItem("branch_id", selectedBranch);
      
      // Navigate based on user role
      const endpoint = localStorage.getItem("loggedInAs");
      
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
        navigate('/HomePage');
      }
    }
  };

  if (availableBranches.length === 0) {
    return (
      <BranchContainer>
        <Title><FaStore /> Loading branches...</Title>
      </BranchContainer>
    );
  }

  return (
    <BranchContainer>
      <Title><FaStore /> Select Your Branch</Title>
      <Dropdown value={selectedBranch} onChange={handleBranchSelect}>
        <option value="">-- Choose Branch --</option>
        {availableBranches.map((branch) => (
          <option key={branch} value={branch}>
            {branchNames[branch] || branch}
          </option>
        ))}
      </Dropdown>
      <Button onClick={handleProceed} disabled={!selectedBranch}>
        Continue
      </Button>
    </BranchContainer>
  );
};

export default Branch;