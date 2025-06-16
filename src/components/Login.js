import { useState } from "react"
import { Form, Row } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import mainImage from "../components/images/background-panel-image-login.png"

const UnifiedLogin = ({ setUserRole }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [availableBranches, setAvailableBranches] = useState([])
  const [allBranches, setAllBranches] = useState([])
  const [showBranchSelection, setShowBranchSelection] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Get API URL from environment variables
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  // Define role-based navigation mapping
  const getNavigationPath = (userRole) => {
    const navigationMap = {
      Admin: "/Admin/BookedAppointments",
      Doctor: "/Doctor/BookedAppointments",
      Receptionist: "/Reception/Appointment",
      Manager: "/Manager/Report",
    }
    return navigationMap[userRole] || "/"
  }

  // Determine endpoint based on user role
  const getEndpointForRole = (userRole) => {
    const endpointMap = {
      Admin: "AdminLogin",
      Doctor: "DoctorLogin",
      Receptionist: "ReceptionistLogin",
      Manager: "ManagerLogin",
    }
    return endpointMap[userRole]
  }

  // API 1: Fetch all branches from API
  const fetchAllBranches = async () => {
    try {
      const response = await fetch(`${Cosmetologybaseurl}branches/`)
      if (!response.ok) {
        throw new Error("Failed to fetch branches")
      }

      const data = await response.json()
      console.log("Fetched all branches from API:", data)

      if (Array.isArray(data)) {
        setAllBranches(data)
        return data
      } else {
        console.error("Expected branches to be an array")
        return []
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
      toast.error("Failed to fetch branch information")
      return []
    }
  }

  // Filter branches based on user's available branch codes
  const getFilteredBranches = (branchCodes, allBranchesData) => {
    if (!Array.isArray(branchCodes) || !Array.isArray(allBranchesData)) {
      return []
    }

    return allBranchesData.filter((branch) => branchCodes.includes(branch.branch_code))
  }

  // API 2: Handle initial login (username/password validation)
  const handleInitialLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Attempting login with:", { username })

      // Single API call for authentication
      const response = await fetch(`${Cosmetologybaseurl}login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
          endpoint: "UnifiedLogin",
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        const userRole = responseData.role

        console.log("Login successful:", { userRole, responseData })

        // Get the appropriate endpoint for this role
        const endpoint = getEndpointForRole(userRole)

        // Validate navigation path
        const navigationPath = getNavigationPath(userRole)

        if (!navigationPath) {
          toast.error("Invalid user role")
          setIsLoading(false)
          return
        }

        // Store user data for later use
        setUserData({
          ...responseData,
          endpoint,
          navigationPath,
        })

        // Check if user has multiple branch codes
        const branchCodes = responseData.branch_codes || []

        // Only show branch selection if user has multiple active branches
        if (Array.isArray(branchCodes) && branchCodes.length > 1) {
          // Fetch all branches to get branch names (API 1)
          const allBranchesData = await fetchAllBranches()

          // Filter branches based on user's available branch codes
          const userBranches = getFilteredBranches(branchCodes, allBranchesData)

          if (userBranches.length > 0) {
            // Show branch selection interface with branch names
            setAvailableBranches(userBranches)
            setShowBranchSelection(true)
            toast.success("Login successful! Please select a branch.")
            setIsLoading(false)
          } else {
            toast.error("No valid branches found for your account")
            setIsLoading(false)
          }
        } else {
          // Single branch code - proceed with login directly
          const branchCode =
            Array.isArray(branchCodes) && branchCodes.length === 1 ? branchCodes[0] : responseData.branch_code || ""

          if (!branchCode) {
            toast.error("No Active Branch Found for this User")
            setIsLoading(false)
            return
          }

          // For single branch, we still need branch name, so fetch branches
          const allBranchesData = await fetchAllBranches()
          const selectedBranchObj = allBranchesData.find((branch) => branch.branch_code === branchCode)
          const branchName = selectedBranchObj ? selectedBranchObj.branch_name : branchCode

          // Proceed directly with login for single branch users
          proceedWithLogin(responseData, branchCode, branchName, endpoint, navigationPath)
        }
      } else {
        const errorText = await response.text()
        console.error("Login failed:", errorText)

        // Handle specific error messages
        if (errorText.includes("Access denied")) {
          toast.error("Access denied: Invalid credentials")
        } else {
          toast.error("Login failed: " + errorText)
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred while logging in")
      setIsLoading(false)
    }
  }

  // Handle branch selection and proceed with login
  const handleBranchLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!selectedBranch) {
      toast.error("Please select a branch")
      setIsLoading(false)
      return
    }

    // Find the selected branch name
    const selectedBranchObj = availableBranches.find((branch) => branch.branch_code === selectedBranch)
    const branchName = selectedBranchObj ? selectedBranchObj.branch_name : selectedBranch

    // Proceed with login using stored userData
    proceedWithLogin(userData, selectedBranch, branchName, userData.endpoint, userData.navigationPath)
  }

  // Common function to proceed with login after branch selection
  const proceedWithLogin = (responseData, branchCode, branchName, endpoint, navigationPath) => {
    // Store essential data in localStorage
    localStorage.setItem("userRole", responseData.role)
    localStorage.setItem("userId", responseData.id)
    localStorage.setItem("userName", responseData.name)
    localStorage.setItem("userContact", responseData.contact)
    localStorage.setItem("loggedInAs", endpoint)
    localStorage.setItem("selectedBranch", branchCode)
    localStorage.setItem("selectedBranchName", branchName)

    setUserRole(responseData.role)

    toast.success(`Login successful! Welcome to ${branchName}`)
    setIsLoading(false)

    setTimeout(() => {
      navigate(navigationPath)
    }, 1000)
  }

  // Reset branch selection and go back to login form
  const handleBackToBranchSelection = () => {
    setShowBranchSelection(false)
    setSelectedBranch("")
    setAvailableBranches([])
    setAllBranches([])
    setUserData(null)
  }

  const handleBackClick = () => {
    if (showBranchSelection) {
      handleBackToBranchSelection()
    } else {
      navigate("/")
    }
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <LoginContainer className="login mt-3">
        <BackButton onClick={handleBackClick}>← {showBranchSelection ? "Back to Login" : "Back"}</BackButton>
        <LoginFormContainer className="login-container">
          {!showBranchSelection ? (
            // Initial Login Form
            <>
              <h2 className="text-center mb-5">Login</h2>
              <Form onSubmit={handleInitialLogin}>
                <Row className="mb-3">
                  <Form.Group controlId="formUsername">
                    <Form.Label>User ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter user ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                      required
                      style={{ border: "1px solid #DAD1E1" }}
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback type="invalid">Password is required.</Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <center>
                  <LoginButton type="submit" className="mb-3" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </LoginButton>
                </center>
              </Form>
            </>
          ) : (
            // Branch Selection Form
            <>
              <h2 className="text-center mb-4">Select Branch</h2>
              <UserInfo className="mb-4">
                <p>
                  <strong>Welcome, {userData?.name}!</strong>
                </p>
                <p>Role: {userData?.role}</p>
                <p>Please select your branch to continue:</p>
              </UserInfo>
              <Form onSubmit={handleBranchLogin}>
                <Row className="mb-4">
                  <Form.Group controlId="formBranch">
                    <Form.Label>Available Branches</Form.Label>
                    <BranchSelect
                      as="select"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      required
                      disabled={isLoading}
                    >
                      <option value="">-- Choose Branch --</option>
                      {availableBranches.map((branch) => (
                        <option key={branch.branch_code} value={branch.branch_code}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </BranchSelect>
                    <Form.Control.Feedback type="invalid">Branch selection is required.</Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <center>
                  <LoginButton type="submit" className="mb-3" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Continue with Selected Branch"}
                  </LoginButton>
                </center>
              </Form>

              {/* Display selected branch info */}
              {selectedBranch && (
                <SelectedBranchInfo>
                  <p>
                    <strong>Selected Branch:</strong>{" "}
                    {availableBranches.find((branch) => branch.branch_code === selectedBranch)?.branch_name}
                  </p>
                </SelectedBranchInfo>
              )}
            </>
          )}
        </LoginFormContainer>
      </LoginContainer>
    </>
  )
}

// Styled Components
const LoginContainer = styled.div`
  position: fixed;
  top: 13%;
  left: 50%;
  transform: translateX(-50%);
  width: 65%;
  height: 80%;
  background-image: url(${mainImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const BackButton = styled.button`
  position: absolute;
  top: 30px;
  left: 30px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  color: #472563;
  font-weight: 600;
  transition: all 0.3s ease;
  z-index: 3;
  
  &:hover {
    background: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`

const LoginFormContainer = styled.div`
  color: #472563;
  font-weight: bold;
  z-index: 2;
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: rgba(237, 237, 237, 0.1);
  font-size: 1.2rem;
  padding: 20px;
  width: 100%;
  max-width: 450px;
  height: 100%;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  h2 {
    color: #472563;
    font-weight: 600;
    margin-bottom: 2rem;
  }
  
  .form-label {
    color: #472563;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .form-control {
    border-radius: 10px;
    padding: 12px 15px;
    border: 2px solid #E8E8E8;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #472563;
      box-shadow: 0 0 0 0.2rem rgba(71, 37, 99, 0.25);
    }
  }
`

const BranchSelect = styled(Form.Control)`
  border-radius: 10px;
  padding: 12px 15px;
  border: 2px solid #E8E8E8;
  transition: all 0.3s ease;
  background-color: white;
  
  &:focus {
    border-color: #472563;
    box-shadow: 0 0 0 0.2rem rgba(71, 37, 99, 0.25);
  }
  
  option {
    padding: 8px;
    background-color: white;
    color: #472563;
    
    &:hover {
      background-color: #f8f5fa;
    }
  }
`

const LoginButton = styled.button`
  background: linear-gradient(135deg, #472563, #6c5492);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  
  &:hover {
    background: linear-gradient(135deg, #5a2f7a, #7d6197);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(71, 37, 99, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #8a7a9e, #a99eb9);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const UserInfo = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  
  p {
    margin-bottom: 5px;
    color: #472563;
    
    &:last-child {
      margin-bottom: 0;
      font-style: italic;
    }
  }
  
  strong {
    color: #472563;
  }
`

const SelectedBranchInfo = styled.div`
  background: rgba(71, 37, 99, 0.1);
  border: 1px solid rgba(71, 37, 99, 0.2);
  padding: 10px 15px;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
  
  p {
    margin: 0;
    color: #472563;
    font-size: 0.9rem;
  }
  
  strong {
    color: #472563;
  }
`

export default UnifiedLogin
