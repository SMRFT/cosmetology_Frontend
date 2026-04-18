"use client"

import { useEffect, useState } from "react"
import { Typeahead } from "react-bootstrap-typeahead"
import { Col, Row, Form, Button } from "react-bootstrap"
import styled from "styled-components"
import apiRequest from "./apiRequest" // ✅ USE COMMON API

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
  ${(props) =>
    props.type === "error"
      ? `
        background-color: white;
        color: #ff4444;
        border: 1px solid #cc0000;
      `
      : `
        background-color: white;
        color: #28a745;
        border: 1px solid #45a049;
      `}
`

const Tests = ({ preSelectedTests, onSelectTests }) => {
  const [testsList, setTestsList] = useState([])
  const [testsInputs, setTestsInputs] = useState([{ selectedTests: [] }])
  const [showAddInput, setShowAddInput] = useState(false)
  const [newTest, setNewTest] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")

  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  // ✅ PARSER (unchanged)
  const parseTests = (testsString) => {
    if (!testsString) return []

    if (Array.isArray(testsString)) {
      return testsString.map((test) => ({ test: test.test || test }))
    }

    if (typeof testsString === "string") {
      const tests = []
      let current = ""
      let parenthesesCount = 0

      for (let i = 0; i < testsString.length; i++) {
        const char = testsString[i]

        if (char === "(") {
          parenthesesCount++
        } else if (char === ")") {
          parenthesesCount--
        }

        if (char === "," && parenthesesCount === 0) {
          if (current.trim()) tests.push({ test: current.trim() })
          current = ""
        } else {
          current += char
        }
      }

      if (current.trim()) tests.push({ test: current.trim() })

      return tests
    }

    return []
  }

  // ✅ PRESELECTED TESTS
  useEffect(() => {
    if (preSelectedTests) {
      const parsed = parseTests(preSelectedTests)
      setTestsInputs([{ selectedTests: parsed }])
    } else {
      setTestsInputs([{ selectedTests: [] }])
    }
  }, [preSelectedTests])

  // ✅ FETCH TESTS USING apiRequest
  useEffect(() => {
    const fetchTests = async () => {
      const res = await apiRequest(
        `${Cosmetologybaseurl}Tests/`,
        "GET"
      )

      if (res.success) {
        const formatted = res.data.map((t) => ({
          test: t.test || "",
        }))
        setTestsList(formatted)
      } else {
        console.error("Fetch tests error:", res.error)
      }
    }

    fetchTests()
  }, [])

  // ✅ MESSAGE
  const showMessage = (msg, type = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 3000)
  }

  // ✅ ADD NEW TEST USING apiRequest
  const handleAddNewTest = async () => {
    if (!newTest.trim()) {
      showMessage("Test name cannot be empty.", "error")
      return
    }

    const res = await apiRequest(
      `${Cosmetologybaseurl}Tests/`,
      "POST",
      { test: newTest }
    )

    if (res.success) {
      setTestsList([...testsList, res.data])
      setShowAddInput(false)
      setNewTest("")
      showMessage("New Test stored successfully!")
    } else {
      console.error("Add test error:", res.error)
      showMessage("Error adding new test.", "error")
    }
  }

  // ✅ HANDLE SELECT
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
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>Tests</Form.Label>
            <FlexContainer>
              <Typeahead
                className="ms-2"
                id={`tests-${inputIndex}`}
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

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? "Close" : "Add New Test"}
      </button>
    </TestsContainer>
  )
}

export default Tests