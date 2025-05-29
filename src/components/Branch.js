"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { FaStore } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"

const BranchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to right, #B5A7C1, rgb(226, 216, 235));
  font-family: 'Poppins', sans-serif;
`

const Title = styled.h1`
  font-size: 2rem;
  color: #7E569B;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 10px;
`

const Dropdown = styled.select`
  padding: 12px 20px;
  border: 2px solid #7E569B;
  border-radius: 10px;
  background-color: white;
  font-size: 1rem;
  color: #333;
  outline: none;
  width: 250px;
  margin-bottom: 20px;

  &:hover {
    border-color: rgb(105, 67, 133);
  }
`

const Button = styled.button`
  padding: 12px 24px;
  background-color: #7E569B;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: rgb(105, 67, 133);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`

const Branch = () => {
  const navigate = useNavigate()
  const [selectedBranch, setSelectedBranch] = useState("")
  const [branches, setBranches] = useState([])

  // Define role-based navigation mapping (same as in Login.js)
  const getNavigationPath = (userRole, endpoint) => {
    const navigationMap = {
      Admin: {
        AdminLogin: "/Admin/BookedAppointments",
        DoctorLogin: "/Doctor/BookedAppointments",
        PharmacistLogin: "/Pharmacy",
        ReceptionistLogin: "/Reception/Appointment",
      },
      Doctor: {
        DoctorLogin: "/Doctor/BookedAppointments",
        PharmacistLogin: "/Pharmacy",
        ReceptionistLogin: "/Reception/Appointment",
      },
      Receptionist: {
        ReceptionistLogin: "/Reception/Appointment",
      },
      Pharmacist: {
        PharmacistLogin: "/Pharmacy",
      },
    }

    return navigationMap[userRole]?.[endpoint] || "/"
  }

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      navigate("/")
      return
    }

    const fetchBranches = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/branches/")
        if (!response.ok) {
          throw new Error("Failed to fetch branches")
        }

        const data = await response.json()
        console.log("Fetched branches from API:", data)

        if (Array.isArray(data)) {
          setBranches(data)
        } else {
          console.error("Expected branches to be an array")
        }
      } catch (error) {
        console.error("Error fetching branches:", error)
      }
    }

    fetchBranches()
  }, [navigate])

  const handleProceed = () => {
    if (!selectedBranch) return

    // Set branch code in cookies
    Cookies.set("branch_code", selectedBranch, { expires: 7, path: "/" })
    localStorage.setItem("branch_id", selectedBranch)

    const userRole = localStorage.getItem("userRole")
    const endpoint = localStorage.getItem("loggedInAs")

    console.log("Branch selection - Role:", userRole, "Endpoint:", endpoint)

    // Use the same navigation logic as Login.js
    const path = getNavigationPath(userRole, endpoint)

    console.log("Navigating to:", path)
    navigate(path)
  }

  if (!branches.length) {
    return (
      <BranchContainer>
        <Title>
          <FaStore /> No branches available
        </Title>
        <p style={{ color: "#7E569B", textAlign: "center" }}>
          Please contact your administrator or try logging in again.
        </p>
      </BranchContainer>
    )
  }

  return (
    <BranchContainer>
      <Title>
        <FaStore /> Select Your Branch
      </Title>
      <Dropdown value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
        <option value="">-- Choose Branch --</option>
        {branches.map(({ branch_code, branch_name }) => (
          <option key={branch_code} value={branch_code}>
            {branch_name}
          </option>
        ))}
      </Dropdown>

      <Button onClick={handleProceed} disabled={!selectedBranch}>
        Continue
      </Button>
    </BranchContainer>
  )
}

export default Branch
