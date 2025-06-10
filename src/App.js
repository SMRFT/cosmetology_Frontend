"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import styled from "styled-components"
import Register from "./components/Register"
import Logo from "../src/components/images/salem-cosmetic-logo.png"
import "bootstrap/dist/css/bootstrap.min.css"
import UnifiedLogin from "./components/Login" // Import the new unified login
import Pharmacy from "./components/Pharmacy"
import Reception from "./components/Reception"
import Doctor from "./components/Doctor"
import HomePage from "./components/HomePage"
import PatientDetails from "./components/PatientDetails"
import Appointment from "./components/Appointments"
import BookedAppointments from "./components/BookedAppointments"
import Prescription from "./components/Prescription"
import VitalForm from "./components/VitalForm"
import Bill from "./components/Bill"
import Header from "./components/Header"
import BillingReport from "./components/BillingReport"
import BillingProcedureReport from "./components/BillingProcedureReport"
import SummaryReport from "./components/SummaryReport"
import ProcedureComponent from "./components/ProcedureBill"
import Report from "./components/Report"
import UserManagement from "./components/UserManagement"
import "./App.css"
import NewBill from "./components/NewBill"
import NewProcedureBill from "./components/NewProcedureBill"

function App() {
  const location = useLocation()
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"))

  useEffect(() => {
    console.log("Current user role from localStorage:", localStorage.getItem("userRole"))
    setUserRole(localStorage.getItem("userRole"))
  }, [location])

  const isLoggedIn = userRole !== null

  // Role-based access control helper
  const hasAccess = (requiredRole, currentPath) => {
    if (!isLoggedIn) return false

    const loggedInAs = localStorage.getItem("loggedInAs")

    // Define access rules based on role and endpoint
    const accessRules = {
      Admin: {
        AdminLogin: ["/Admin"],
        DoctorLogin: ["/Doctor"],
        ReceptionistLogin: ["/Reception"],
      },
      Doctor: {
        DoctorLogin: ["/Doctor"],
        ReceptionistLogin: ["/Reception"],
        // AdminLogin not allowed for Doctor
      },
      Manager: {
        ManagerLogin: ["/Manager"],
        // Only ManagerLogin allowed
      },
      Receptionist: {
        ReceptionistLogin: ["/Reception"],
        // Only ReceptionistLogin allowed
      }
    }

    const userAccessRules = accessRules[userRole]
    if (!userAccessRules || !userAccessRules[loggedInAs]) {
      return false
    }

    // Check if current path starts with any allowed path
    return userAccessRules[loggedInAs].some((allowedPath) => currentPath.startsWith(allowedPath))
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredAccess }) => {
    if (!hasAccess(userRole, requiredAccess)) {
      return <Navigate to="/" replace />
    }
    return children
  }

  // Determine if we should show the main logo (updated for unified login)
  const shouldShowLogo =
    !(
      (location.pathname.startsWith("/Admin") && location.pathname !== "/login") ||
      (location.pathname.startsWith("/Doctor") && location.pathname !== "/login") ||
      (location.pathname.startsWith("/Reception") && location.pathname !== "/login") ||
      (location.pathname.startsWith("/Manager") && location.pathname !== "/login") ||
      (location.pathname !== "/login")
    ) && location.pathname !== "/" // Don't show logo on unified login page

  // Determine if we should show the unified header (updated for unified login)
  const shouldShowHeader =
    isLoggedIn &&
    location.pathname !== "/login" &&
    location.pathname !== "/" &&
    location.pathname !== "/branch" &&
    (location.pathname.startsWith("/Admin") ||
      location.pathname.startsWith("/Doctor") ||
      location.pathname.startsWith("/Manager") ||
      location.pathname.startsWith("/Reception"))

  // Get the current user role for header display
  const getHeaderUserRole = () => {
    if (location.pathname.startsWith("/Admin")) return "Admin"
    if (location.pathname.startsWith("/Doctor")) return "Doctor"
    if (location.pathname.startsWith("/Reception")) return "Receptionist"
    if (location.pathname.startsWith("/Manager")) return "Manager"
    return null
  }

  return (
    <AppContainer>
      {shouldShowLogo && (
        <LogoContainer>
          <LogoImage src={Logo || "/placeholder.svg"} alt="Salem Cosmetic Clinic Logo" />
        </LogoContainer>
      )}

      {shouldShowHeader && <Header userRole={getHeaderUserRole()} />}

      <MainContent shouldShowHeader={shouldShowHeader}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UnifiedLogin setUserRole={setUserRole} />} />
          <Route path="/register" element={<Register />} />

          {/* Common routes */}
          <Route path="/VitalForm" element={<VitalForm />} />

          {/* Admin routes - protected */}
          <Route
            path="/Admin/*"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <Doctor appointments={[]} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Appointment"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <Appointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/BookedAppointments"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <BookedAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/PatientDetails"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Bill"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <Bill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/ProcedureBill"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <ProcedureComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Report"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Pharmacy"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <Pharmacy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Register"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <Register />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/BillingReport"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <BillingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/SummaryReport"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <SummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/BillingProcedureReport"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <BillingProcedureReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Prescription"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <Prescription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/UserManagement"
            element={
              <ProtectedRoute requiredAccess="/Admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Doctor routes - protected */}
          <Route
            path="/Doctor/*"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <Doctor appointments={[]} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctor/BookedAppointments"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <BookedAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctor/PatientDetails"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctor/BillingReport"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <BillingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctor/SummaryReport"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <SummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctor/Report"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctor/BillingProcedureReport"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <BillingProcedureReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Doctor/Prescription"
            element={
              <ProtectedRoute requiredAccess="/Doctor">
                <Prescription />
              </ProtectedRoute>
            }
          />

        {/* Manager routes - protected */}
          <Route
            path="/Manager/BillingReport"
            element={
              <ProtectedRoute requiredAccess="/Manager">
                <BillingReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Manager/SummaryReport"
            element={
              <ProtectedRoute requiredAccess="/Manager">
                <SummaryReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Manager/Report"
            element={
              <ProtectedRoute requiredAccess="/Manager">
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Manager/BillingProcedureReport"
            element={
              <ProtectedRoute requiredAccess="/Manager">
                <BillingProcedureReport />
              </ProtectedRoute>
            }
          />

          {/* Receptionist routes - protected */}
          <Route
            path="/Reception/*"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <Reception />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reception/Appointment"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <Appointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reception/PatientDetails"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reception/Bill"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <Bill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reception/ProcedureBill"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <ProcedureComponent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Reception/Pharmacy"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <Pharmacy />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Reception/NewBill"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <NewBill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reception/NewProcedureBill"
            element={
              <ProtectedRoute requiredAccess="/Reception">
                <NewProcedureBill />
              </ProtectedRoute>
            }
          />

          {/* Redirect all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MainContent>
    </AppContainer>
  )
}

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`

const LogoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: fixed;
  background: white; /* Optional: add background to avoid content behind the logo */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 6px 0; 
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`

const LogoImage = styled.img`
  max-width: 50%; /* Adjust as necessary */
  height: auto;
  
  @media (max-width: 768px) {
    max-height: 60px;
  }
  
  @media (max-width: 480px) {
    max-height: 50px;
  }
`

const MainContent = styled.div`
  margin-top: ${(props) => (props.shouldShowHeader ? "140px" : "")};
  min-height: calc(100vh - ${(props) => (props.shouldShowHeader ? "120px" : "0px")});
  
  @media (max-width: 768px) {
    margin-top: ${(props) => (props.shouldShowHeader ? "140px" : "0")};
    min-height: calc(100vh - ${(props) => (props.shouldShowHeader ? "140px" : "0px")});
  }
  
  @media (max-width: 480px) {
    margin-top: ${(props) => (props.shouldShowHeader ? "160px" : "0")};
    min-height: calc(100vh - ${(props) => (props.shouldShowHeader ? "160px" : "0px")});
  }
`

export default App
