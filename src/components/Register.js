import { useState, useEffect } from "react";
import { Row, Form, Col, InputGroup } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [validated, setValidated] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touchedFields, setTouchedFields] = useState({});
  const [branches, setBranches] = useState([]);
  const role = ["Admin", "Manager", "Doctor", "Receptionist"];
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    role: "",
    branch_code: [],
    contact: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${Cosmetologybaseurl}branches/`);
        if (response.ok) {
          const data = await response.json();
          setBranches(data);
        } else {
          console.error("Failed to fetch branches");
          toast.error("Failed to load branches");
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Error loading branches");
      }
    };

    fetchBranches();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setTouchedFields((prevTouched) => ({ ...prevTouched, [id]: true }));

    // Clear password error if passwords now match
    // This logic should be adjusted if 'confirmPassword' is no longer in formData directly
    if (id === "password" || id === "confirmPassword") {
      // Re-evaluate the password match based on the new state
      const newPassword = id === "password" ? value : formData.password;
      const newConfirmPassword =
        id === "confirmPassword" ? value : formData.confirmPassword;
      if (newPassword === newConfirmPassword) {
        setPasswordError("");
      }
    }
  };

  // Handle branch selection/deselection
  const handleBranchToggle = (branchCode) => {
    setFormData((prevData) => {
      const updatedBranches = prevData.branch_code.includes(branchCode)
        ? prevData.branch_code.filter((code) => code !== branchCode)
        : [...prevData.branch_code, branchCode];

      return { ...prevData, branch_code: updatedBranches };
    });
    setTouchedFields((prevTouched) => ({ ...prevTouched, branch_code: true }));
  };

  // Check if a branch is selected
  const isBranchSelected = (branchCode) => {
    return formData.branch_code.includes(branchCode);
  };

  const isValidEmail = (val) => /^\S+@\S+\.\S+$/.test(val);
  const isValidPhone = (val) => /^\d{10}$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    const form = e.currentTarget;

    let formIsValid = true;

    // Validate Contact (Email/Phone)
    if (!isValidEmail(formData.contact) && !isValidPhone(formData.contact)) {
      toast.error("Please enter a valid email or 10-digit phone number.");
      formIsValid = false;
    }

    // Validate Password Match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      formIsValid = false;
    } else {
      setPasswordError("");
    }

    // Validate Branch Selection
    if (formData.branch_code.length === 0) {
      toast.error("Please select at least one branch.");
      formIsValid = false;
    }

    // Check basic form validity (required fields and patterns)
    if (form.checkValidity() === false) {
      formIsValid = false;
    }

    setValidated(true);

    if (!formIsValid) {
      e.stopPropagation();
      return;
    }

    try {
      // Create a copy of formData and delete confirmPassword before sending
      const submitData = { ...formData };

      const response = await fetch(`${Cosmetologybaseurl}registration/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success("Registration successful!");
        // Reset form data and validation states
        setFormData({
          id: "",
          name: "",
          role: "",
          branch_code: [],
          contact: "",
          password: "",
        });
        setValidated(false);
        setFormSubmitted(false);
        setTouchedFields({});
        setPasswordError("");
      } else {
        const errorData = await response.json();
        console.error("Failed to submit data:", errorData);
        if (errorData && errorData.detail) {
          toast.error(`Registration failed: ${errorData.detail}`);
        } else {
          toast.error("Failed to submit data. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error occurred:", err);
      toast.error("Error occurred while submitting the form");
    }
  };

  // Get display text for selected branches
  const getSelectedBranchesText = () => {
    if (formData.branch_code.length === 0) {
      return "Select Branches";
    }

    if (formData.branch_code.length <= 2) {
      return formData.branch_code
        .map((code) => {
          const branch = branches.find((b) => b.branch_code === code);
          return branch ? branch.branch_name : "";
        })
        .filter(Boolean)
        .join(", ");
    }

    return `${formData.branch_code.length} branches selected`;
  };

  // Helper for validation display logic
  const shouldShowValidation = (fieldId) => {
    return (formSubmitted && validated) || (touchedFields[fieldId] && validated);
  };

  return (
    <div className="Register">
      <ToastContainer position="top-right" autoClose={5000} />
      <StyledContainer className="Register-container">
        <h2 className="text-center mb-5">Registration</h2>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-2">
            <Col sm="6">
              <Form.Group controlId="id">
                <Form.Label>ID</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={formData.id}
                  onChange={handleChange}
                  pattern="[a-zA-Z0-9]+"
                  autoComplete="off"
                  isInvalid={
                    shouldShowValidation("id") &&
                    (!formData.id || !/^[a-zA-Z0-9]+$/.test(formData.id))
                  }
                  style={{ border: "1px solid #DAD1E1" }}
                />
                <Form.Control.Feedback type="invalid">
                  {formData.id && !/^[a-zA-Z0-9]+$/.test(formData.id)
                    ? "Please enter a valid ID (alphanumeric only)."
                    : "ID is required."}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm="6">
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  isInvalid={
                    shouldShowValidation("name") &&
                    (!formData.name || !/^[A-Za-z\s]+$/.test(formData.name))
                  }
                  style={{ border: "1px solid #DAD1E1" }}
                />
                <Form.Control.Feedback type="invalid">
                  {formData.name && !/^[A-Za-z\s]+$/.test(formData.name)
                    ? "Please enter a valid name (alphabets and spaces only)."
                    : "Name is required."}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm="6">
              <Form.Group controlId="role">
                <Form.Label>Role</Form.Label>
                <Dropdown
                  id="roleselect"
                  onSelect={(value) => {
                    setFormData({ ...formData, role: value });
                    setTouchedFields({ ...touchedFields, role: true });
                  }}
                  className="custom-dropdown"
                >
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-basic"
                    className={
                      shouldShowValidation("role") && !formData.role
                        ? "is-invalid"
                        : ""
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      color: "black",
                      border: "1px solid #DAD1E1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{formData.role || "Select Role"}</span>
                    <span className="caret"></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    style={{
                      width: "100%",
                      textAlign: "center",
                      maxHeight: "250px",
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                    }}
                  >
                    {role.map((roleItem, index) => (
                      <Dropdown.Item key={index} eventKey={roleItem}>
                        {roleItem}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                  {shouldShowValidation("role") && !formData.role && (
                    <div className="invalid-feedback d-block">
                      Role is required.
                    </div>
                  )}
                </Dropdown>
              </Form.Group>
            </Col>
            <Col sm="6">
              <Form.Group controlId="branch">
                <Form.Label>Branches</Form.Label>
                <Dropdown id="branchselect" className="custom-dropdown">
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-branch"
                    className={
                      shouldShowValidation("branch_code") &&
                      formData.branch_code.length === 0
                        ? "is-invalid"
                        : ""
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      color: "black",
                      border: "1px solid #DAD1E1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{getSelectedBranchesText()}</span>
                    <span className="caret"></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    style={{
                      width: "100%",
                      textAlign: "left",
                      maxHeight: "250px",
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                    }}
                  >
                    {branches.length > 0 ? (
                      branches.map((branch, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => handleBranchToggle(branch.branch_code)}
                          active={isBranchSelected(branch.branch_code)}
                          className="branch-item"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: "10px" }}
                          >
                            <input
                              type="checkbox"
                              checked={isBranchSelected(branch.branch_code)}
                              onChange={() => {}}
                            />
                            <span>{branch.branch_name}</span>
                          </div>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No branches found</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                  {shouldShowValidation("branch_code") &&
                    formData.branch_code.length === 0 && (
                      <div className="invalid-feedback d-block">
                        Please select at least one branch.
                      </div>
                    )}
                </Dropdown>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <Form.Group controlId="contact">
                <Form.Label>Email / Phone</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter Email or 10-digit Phone Number"
                  isInvalid={
                    shouldShowValidation("contact") &&
                    (!formData.contact ||
                      (!isValidEmail(formData.contact) &&
                        !isValidPhone(formData.contact)))
                  }
                  autoComplete="off"
                  style={{ border: "1px solid #DAD1E1" }}
                />
                <Form.Control.Feedback type="invalid">
                  {!formData.contact
                    ? "Email or phone number is required."
                    : "Please enter a valid email or 10-digit phone number."}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm="6">
              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    isInvalid={
                      shouldShowValidation("password") &&
                      (!formData.password || passwordError)
                    }
                    style={{ border: "1px solid #DAD1E1" }}
                  />
                  <InputGroup.Text
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer", border: "1px solid #DAD1E1" }}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    {!formData.password
                      ? "Password is required."
                      : passwordError}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col sm="6">
              <Form.Group controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={
                      shouldShowValidation("confirmPassword") &&
                      (!formData.confirmPassword || passwordError)
                    }
                    style={{ border: "1px solid #DAD1E1" }}
                  />
                  <InputGroup.Text
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: "pointer", border: "1px solid #DAD1E1" }}
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                    />
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    {!formData.confirmPassword
                      ? "Please confirm your password."
                      : passwordError}
                  </Form.Control.Feedback>
                </InputGroup>
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
  );
};

const StyledContainer = styled.div`
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;

  .custom-dropdown .dropdown-toggle.is-invalid {
    border-color: var(--bs-form-invalid-border-color);
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  }
`;

export default Register;