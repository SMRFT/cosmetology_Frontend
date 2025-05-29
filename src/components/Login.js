"use client"

import { useState, useEffect } from "react"
import { Form, Row } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./Login.css"
import Cookies from "js-cookie"

const Login = ({ title, endpoint, setUserRole }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const location = useLocation()
  const navigate = useNavigate()
  const { sectionName } = location.state || {}

  // Get API URL from environment variables
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/"
  const USE_HTTPS = process.env.REACT_APP_USE_HTTPS === "true" || false

  // Add debugging early in component
  useEffect(() => {
    console.log("Environment:", process.env.NODE_ENV)
    console.log("API URL (from env):", process.env.REACT_APP_API_URL)
    console.log("API URL (used):", API_URL)
    console.log("Use HTTPS (from env):", process.env.REACT_APP_USE_HTTPS)
    console.log("Use HTTPS (used):", USE_HTTPS)
  }, [])

  // Cookie configuration
  const cookieOptions = {
    expires: 7,
    path: "/",
    sameSite: "Strict",
    secure: USE_HTTPS,
  }

  useEffect(() => {
    // Check if branch code cookie exists and log it for debugging
    const branchCode = Cookies.get("branch_code")
    console.log("Branch code from cookies on login page:", branchCode)
  }, [location.state, sectionName])

  // Define role-based navigation mapping
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
        // Note: AdminLogin is not included for Doctor (access denied)
      },
      Receptionist: {
        ReceptionistLogin: "/Reception/Appointment",
        // Only ReceptionistLogin allowed
      },
      Pharmacist: {
        PharmacistLogin: "/Pharmacy",
        // Only PharmacistLogin allowed
      },
    }

    return navigationMap[userRole]?.[endpoint] || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      console.log("Attempting login with:", { username, endpoint })

      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password, endpoint }),
      })

      if (response.ok) {
        const responseData = await response.json()
        const userRole = responseData.role

        console.log("Login successful:", { userRole, endpoint, responseData })

        // Validate if this role can access this endpoint
        const navigationPath = getNavigationPath(userRole, endpoint)

        if (!navigationPath) {
          toast.error("Access denied for this login type")
          return
        }

        // Store essential data in localStorage
        localStorage.setItem("userRole", userRole)
        localStorage.setItem("userId", responseData.id)
        localStorage.setItem("userName", responseData.name)
        localStorage.setItem("userContact", responseData.contact)
        localStorage.setItem("loggedInAs", endpoint)

        // Check if user has multiple branch codes
        const branchCodes = responseData.branch_codes

        if (Array.isArray(branchCodes) && branchCodes.length > 1) {
          // Store branch codes in localStorage for Branch selection page
          localStorage.setItem("availableBranches", JSON.stringify(branchCodes))

          toast.success("Login successful! Please select a branch.")

          setTimeout(() => {
            navigate("/branch")
          }, 1000)
        } else {
          // Single branch code - set it directly
          const branchCode = Array.isArray(branchCodes) ? branchCodes[0] : responseData.branch_code

          // Set branch_code in cookies
          Cookies.set("branch_code", branchCode, cookieOptions)

          console.log("Branch code set in cookie:", Cookies.get("branch_code"))

          setUserRole(userRole)

          toast.success("Login successful!")

          setTimeout(() => {
            navigate(navigationPath)
          }, 1000)
        }
      } else {
        const errorText = await response.text()
        console.error("Login failed:", errorText)

        // Handle specific error messages
        if (errorText.includes("Access denied")) {
          toast.error("Access denied: You do not have permission to login from this endpoint")
        } else {
          toast.error("Login failed: " + errorText)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred while logging in")
    }
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
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
                  style={{ border: "1px solid #DAD1E1" }}
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
                  style={{ border: "1px solid #DAD1E1" }}
                />
                <Form.Control.Feedback type="invalid">Password is required.</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <center>
              <button type="submit" className="mb-3">
                Login
              </button>
            </center>
          </Form>
        </StyledContainer>
      </div>
    </>
  )
}

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
`

const AdminLogin = ({ setUserRole }) => <Login title="Admin Login" endpoint="AdminLogin" setUserRole={setUserRole} />
const PharmacistLogin = ({ setUserRole }) => (
  <Login title="Pharmacist Login" endpoint="PharmacistLogin" setUserRole={setUserRole} />
)
const DoctorLogin = ({ setUserRole }) => <Login title="Doctor Login" endpoint="DoctorLogin" setUserRole={setUserRole} />
const ReceptionistLogin = ({ setUserRole }) => (
  <Login title="Receptionist Login" endpoint="ReceptionistLogin" setUserRole={setUserRole} />
)

export { AdminLogin, PharmacistLogin, DoctorLogin, ReceptionistLogin }
