"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Typeahead } from "react-bootstrap-typeahead"
import { Col, Row, Form, Button } from "react-bootstrap"
import styled from "styled-components"

const TestsContainer = styled.div`
flex: 1;
margin: 0 15px;
padding: 20px;
background-color: #b798c0;
border-radius: 10px;
text-align: center;
`

const CenteredFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`

const MessageContainer = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 5px;
  font-weight: bold;
  z-index: 1000;
  ${(props) => {
    if (props.type === "error") {
      return `
        background-color: white;
        color: #ff4444;
        border: 1px solid #cc0000;
      `
    } else {
      return `
        background-color: white;
        color: #28a745;
        border: 1px solid #45a049;
      `
    }
  }}
`

const Tests = ({ preSelectedTests, onSelectTests }) => {
  const [testsList, setTestsList] = useState([])
  const [testsInputs, setTestsInputs] = useState([{ selectedTests: [] }])
  const [showAddInput, setShowAddInput] = useState(false)
  const [newTest, setNewTest] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

const parseTests = (testsString) => {
    if (!testsString) return []
    
    // If it's already an array, return as is
    if (Array.isArray(testsString)) {
      return testsString.map(test => ({ test: test.test || test }))
    }
    
    // If it's a string, we need to parse it carefully
    if (typeof testsString === 'string') {
      // Handle the case where tests are separated by commas, but we need to respect parentheses
      const tests = []
      let current = ''
      let parenthesesCount = 0
      
      for (let i = 0; i < testsString.length; i++) {
        const char = testsString[i]
        
        if (char === '(') {
          parenthesesCount++
          current += char
        } else if (char === ')') {
          parenthesesCount--
          current += char
        } else if (char === ',' && parenthesesCount === 0) {
          // Only split on commas that are not inside parentheses
          if (current.trim()) {
            tests.push({ test: current.trim() })
          }
          current = ''
        } else {
          current += char
        }
      }
      
      // Add the last test if there's any remaining content
      if (current.trim()) {
        tests.push({ test: current.trim() })
      }
      
      return tests
    }
    
    return []
  }

  useEffect(() => {
    if (preSelectedTests) {
      const parsedTests = parseTests(preSelectedTests)
      setTestsInputs([{ selectedTests: parsedTests }])
    } else {
      setTestsInputs([{ selectedTests: [] }])
    }
  }, [preSelectedTests])

  useEffect(() => {
    axios
      .get(`${Cosmetologybaseurl}Tests/`)
      .then((response) => {
        const formattedTestsList = response.data.map((test) => ({
          test: test.test || "",
        }))
        setTestsList(formattedTestsList)
      })
      .catch((error) => {
        console.error("Error fetching tests data:", error)
      })
  }, [])

  const showMessage = (msg, type = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
    }, 3000)
  }

  const handleAddNewTest = () => {
    if (!newTest.trim()) {
      showMessage("Test name cannot be empty.", "error")
      return
    }

    axios
      .post(`${Cosmetologybaseurl}Tests/`, { test: newTest })
      .then((response) => {
        setTestsList([...testsList, response.data])
        setShowAddInput(false)
        setNewTest("")
        showMessage("New Test stored successfully!")
      })
      .catch((error) => {
        console.error("Error adding Test:", error)
        showMessage("Error adding new test.", "error")
      })
  }

  const handleTestChange = (selected, index) => {
    const newInputs = [...testsInputs]
    newInputs[index].selectedTests = selected
    setTestsInputs(newInputs)
    onSelectTests(selected)
  }

  return (
    <TestsContainer>
      {message && <MessageContainer type={messageType}>{message}</MessageContainer>}

      {testsInputs.map((input, inputIndex) => (
        <Row className="justify-content-center mb-3" key={inputIndex}>
          <CenteredFormGroup as={Col} md="4" controlId={`tests-${inputIndex}`}>
            <Form.Label>Tests</Form.Label>
            <FlexContainer>
              <Typeahead
                className="ms-2"
                id={`tests-typeahead-${inputIndex}`}
                labelKey="test"
                multiple
                onChange={(selected) => handleTestChange(selected, inputIndex)}
                options={testsList}
                placeholder="Select Tests"
                selected={Array.isArray(input.selectedTests) ? input.selectedTests : []}
              />
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      ))}

      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Test</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newTest}
                onChange={(e) => setNewTest(e.target.value)}
                placeholder="Enter new test"
              />
              <Button onClick={handleAddNewTest} style={{ marginLeft: "10px" }}>
                Save
              </Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      <button onClick={() => setShowAddInput(!showAddInput)}>{showAddInput ? "Close" : "Add New Test"}</button>
    </TestsContainer>
  )
}

export default Tests
