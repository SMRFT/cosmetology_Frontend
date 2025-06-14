import { useState, useEffect } from "react"
import styled from "styled-components"
import { FaFileInvoiceDollar } from "react-icons/fa"
import { Link } from "react-router-dom"
import { HiDocumentText, HiDocumentDuplicate } from "react-icons/hi2"

// Title container with margin to create space at the top
const Container = styled.div`
  margin-top: 65px; /* Added more space between the title and icons */
`

// Container to center the content on the page
const StyledContainer = styled.div`
  display: flex;
  justify-content: center; /* Centers icons horizontally */
  align-items: center; /* Centers icons vertically */
  flex-direction: column;
  text-align: center;
  background-color: #725F83;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: fit-content;
  padding: 50px;
  color: #E6DEEC;
  margin: 0 auto; /* Centers the container itself on the page */
`

// Icons container style
const IconsContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center; /* Ensures icons are centered horizontally */
  align-items: center; /* Ensures icons are centered vertically */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`

// Icon wrapper to keep icon and label together
const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
`

// Icon style
const Icon = styled(Link)`
  font-size: 5rem;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 20px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    color: #E6DEEC;
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: rgba(230, 222, 236, 0.5);
  }

  &:active {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 4rem;
    padding: 15px;
  }
`

// Icon label style
const IconLabel = styled.span`
  margin-top: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`

// Error message style
const ErrorMessage = styled.div`
  background: rgba(255, 107, 107, 0.2);
  border: 2px solid rgba(255, 107, 107, 0.5);
  color: #ff6b6b;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin: 20px;
  font-weight: 600;
`

// Loading message style
const LoadingMessage = styled.div`
  color: #E6DEEC;
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
`

const Report = () => {
  const [userRole, setUserRole] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole")

    if (role) {
      setUserRole(role)
      setIsLoading(false)
    } else {
      setError("User role not found. Please log in again.")
      setIsLoading(false)
    }
  }, [])

  // Define role-based navigation paths
  const getRoleBasedPath = (reportType) => {
    const rolePathMap = {
      Admin: {
        BillingReport: "/Admin/BillingReport",
        ProcedureReport: "/Admin/BillingProcedureReport",
        SummaryReport: "/Admin/SummaryReport",
      },
      Doctor: {
        BillingReport: "/Doctor/BillingReport",
        ProcedureReport: "/Doctor/BillingProcedureReport",
        SummaryReport: "/Doctor/SummaryReport",
      },
      Receptionist: {
        BillingReport: "/Reception/BillingReport",
        ProcedureReport: "/Reception/BillingProcedureReport",
        SummaryReport: "/Reception/SummaryReport",
      },
      Manager: {
        BillingReport: "/Manager/BillingReport",
        ProcedureReport: "/Manager/BillingProcedureReport",
        SummaryReport: "/Manager/SummaryReport",
      },
    }

    return rolePathMap[userRole]?.[reportType] || "#"
  }

  // Define which reports are available for each role
  const getAvailableReports = () => {
    const roleReportsMap = {
      Admin: [
        {
          id: "BillingReport",
          icon: FaFileInvoiceDollar,
          label: "Billing Report",
          description: "View billing and payment reports",
        },
        {
          id: "ProcedureReport",
          icon: HiDocumentDuplicate,
          label: "Procedure Report",
          description: "View procedure and treatment reports",
        },
        {
          id: "SummaryReport",
          icon: HiDocumentText,
          label: "Summary Report",
          description: "View comprehensive summary reports",
        },
      ],
      Doctor: [
        {
          id: "ProcedureReport",
          icon: HiDocumentDuplicate,
          label: "Procedure Report",
          description: "View your procedure reports",
        },
        {
          id: "SummaryReport",
          icon: HiDocumentText,
          label: "Summary Report",
          description: "View patient summary reports",
        },
      ],
      Receptionist: [
        {
          id: "BillingReport",
          icon: FaFileInvoiceDollar,
          label: "Billing Report",
          description: "View billing reports",
        },
        {
          id: "SummaryReport",
          icon: HiDocumentText,
          label: "Summary Report",
          description: "View daily summary reports",
        },
      ],
      Manager: [
        {
          id: "BillingReport",
          icon: FaFileInvoiceDollar,
          label: "Billing Report",
          description: "View comprehensive billing reports",
        },
        {
          id: "ProcedureReport",
          icon: HiDocumentDuplicate,
          label: "Procedure Report",
          description: "View all procedure reports",
        },
        {
          id: "SummaryReport",
          icon: HiDocumentText,
          label: "Summary Report",
          description: "View management summary reports",
        },
      ],
    }

    return roleReportsMap[userRole] || []
  }

  if (isLoading) {
    return (
      <Container>
        <h3 className="text-center mb-2">Report</h3>
        <StyledContainer>
          <LoadingMessage>Loading reports...</LoadingMessage>
        </StyledContainer>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <h3 className="text-center mb-2">Report</h3>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    )
  }

  const availableReports = getAvailableReports()

  if (availableReports.length === 0) {
    return (
      <Container>
        <h3 className="text-center mb-2">Report</h3>
        <StyledContainer>
          <ErrorMessage>No reports available for your role: {userRole}</ErrorMessage>
        </StyledContainer>
      </Container>
    )
  }

  return (
    <Container>
      <h3 className="text-center mb-2">Reports - {userRole}</h3>
      <StyledContainer>
        <IconsContainer>
          {availableReports.map((report) => {
            const IconComponent = report.icon
            return (
              <IconWrapper key={report.id}>
                <Icon to={getRoleBasedPath(report.id)} title={report.description}>
                  <IconComponent />
                </Icon>
                <IconLabel>{report.label}</IconLabel>
              </IconWrapper>
            )
          })}
        </IconsContainer>
      </StyledContainer>
    </Container>
  )
}

export default Report
