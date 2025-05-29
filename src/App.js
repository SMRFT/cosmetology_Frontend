"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import Register from "./components/Register"
import Logo from "../src/components/images/salem-cosmetic-logo.png"
import "bootstrap/dist/css/bootstrap.min.css"
import { AdminLogin, DoctorLogin, PharmacistLogin, ReceptionistLogin } from "./components/Login"
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
import Branch from "./components/Branch"
import "./App.css"

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
        PharmacistLogin: ["/Pharmacy"],
        ReceptionistLogin: ["/Reception"],
      },
      Doctor: {
        DoctorLogin: ["/Doctor"],
        PharmacistLogin: ["/Pharmacy"],
        ReceptionistLogin: ["/Reception"],
        // AdminLogin not allowed for Doctor
      },
      Receptionist: {
        ReceptionistLogin: ["/Reception"],
        // Only ReceptionistLogin allowed
      },
      Pharmacist: {
        PharmacistLogin: ["/Pharmacy"],
        // Only PharmacistLogin allowed
      },
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

  // Determine if we should show the main logo (for login pages and home)
  const shouldShowLogo = !(
    (location.pathname.startsWith("/Admin") && location.pathname !== "/AdminLogin") ||
    (location.pathname.startsWith("/Doctor") && location.pathname !== "/DoctorLogin") ||
    (location.pathname.startsWith("/Reception") && location.pathname !== "/ReceptionistLogin") ||
    (location.pathname.startsWith("/Pharmacy") && location.pathname !== "/PharmacistLogin")
  )

  // Determine if we should show the unified header
  const shouldShowHeader =
    isLoggedIn &&
    ((location.pathname.startsWith("/Admin") && location.pathname !== "/AdminLogin") ||
      (location.pathname.startsWith("/Doctor") && location.pathname !== "/DoctorLogin") ||
      (location.pathname.startsWith("/Reception") && location.pathname !== "/ReceptionistLogin") ||
      (location.pathname.startsWith("/Pharmacy") && location.pathname !== "/PharmacistLogin"))

  // Get the current user role for header display
  const getHeaderUserRole = () => {
    if (location.pathname.startsWith("/Admin")) return "Admin"
    if (location.pathname.startsWith("/Doctor")) return "Doctor"
    if (location.pathname.startsWith("/Reception")) return "Receptionist"
    if (location.pathname.startsWith("/Pharmacy")) return "Pharmacist"
    return null
  }

  return (
    <div className="App">
      {(shouldShowLogo || location.pathname === "/DoctorLogin") && (
        <div className="logo-container">
          <img src={Logo || "/placeholder.svg"} alt="Shanmuga Hospital Logo" className="logo" />
        </div>
      )}

      {shouldShowHeader && <Header userRole={getHeaderUserRole()} />}

      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Branch" element={<Branch />} />
          <Route path="/Register" element={<Register />} />

          {/* Login routes - always accessible */}
          <Route path="/AdminLogin" element={<AdminLogin setUserRole={setUserRole} />} />
          <Route path="/PharmacistLogin" element={<PharmacistLogin setUserRole={setUserRole} />} />
          <Route path="/DoctorLogin" element={<DoctorLogin setUserRole={setUserRole} />} />
          <Route path="/ReceptionistLogin" element={<ReceptionistLogin setUserRole={setUserRole} />} />

          {/* Common routes */}
          <Route path="/VitalForm" element={<VitalForm />} />
          <Route path="/BillingProcedureReport" element={<BillingProcedureReport />} />

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

          {/* Pharmacy routes - protected */}
          <Route
            path="/Pharmacy"
            element={
              <ProtectedRoute requiredAccess="/Pharmacy">
                <Pharmacy />
              </ProtectedRoute>
            }
          />

          {/* Redirect all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
