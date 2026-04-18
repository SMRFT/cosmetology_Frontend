"use client"

import { useEffect, useState } from "react"
import { Typeahead } from "react-bootstrap-typeahead"
import { BsPatchPlusFill } from "react-icons/bs"
import { MdDelete } from "react-icons/md"
import { AiOutlineCalendar } from "react-icons/ai"
import { Col, Row, Form, Button } from "react-bootstrap"
import styled from "styled-components"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import apiRequest from "./apiRequest" // ✅ COMMON API

const ProceduresContainer = styled.div`
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

const DateDisplay = styled.div`
  margin-top: 10px;
  text-align: center;
`

const CalendarIcon = styled(AiOutlineCalendar)`
  cursor: pointer;
`

const Procedures = ({ onSelectProcedures, preSelectedProcedures }) => {
  const [proceduresList, setProceduresList] = useState([])
  const [proceduresInputs, setProceduresInputs] = useState([])
  const [showAddInput, setShowAddInput] = useState(false)
  const [newProcedure, setNewProcedure] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")

  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  // ✅ FETCH PROCEDURES
  useEffect(() => {
    const fetchProcedures = async () => {
      const res = await apiRequest(
        `${Cosmetologybaseurl}Procedure/`,
        "GET"
      )

      if (res.success) {
        const formatted = res.data.map((p) => ({
          procedure: p.procedure || "",
        }))
        setProceduresList(formatted)
      } else {
        console.error("Fetch procedures error:", res.error)
      }
    }

    fetchProcedures()
  }, [])

  // ✅ PRESELECT PARSE
  useEffect(() => {
    if (preSelectedProcedures) {
      try {
        const parsed = preSelectedProcedures.split("\n").map((item) => {
          const match = item.match(
            /^(?:Procedure:\s*)?(.*?)(?:\s+-\s+Date:\s*(.*))?$/
          )

          const procedure = match ? match[1].trim() : ""
          const dateText = match && match[2] ? match[2].trim() : null
          const selectedDate = dateText
            ? new Date(dateText.split("/").reverse().join("-"))
            : null

          return {
            selectedProcedures: procedure ? [{ procedure }] : [],
            selectedDate: !isNaN(selectedDate) ? selectedDate : null,
          }
        })

        setProceduresInputs(parsed)
      } catch (err) {
        console.error(err)
        showMessage("Error parsing pre-selected procedures", "error")
      }
    } else {
      setProceduresInputs([{ selectedProcedures: [], selectedDate: null }])
    }
  }, [preSelectedProcedures])

  const showMessage = (msg, type = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 3000)
  }

  const handleAddInput = () => {
    setProceduresInputs([
      ...proceduresInputs,
      { selectedProcedures: [], selectedDate: null },
    ])
  }

  const handleDeleteInput = (index) => {
    if (proceduresInputs.length <= 1) return
    const newInputs = proceduresInputs.filter((_, i) => i !== index)
    setProceduresInputs(newInputs)
    onSelectProcedures(newInputs)
  }

  // ✅ ADD NEW PROCEDURE
  const handleAddNewProcedure = async () => {
    if (!newProcedure.trim()) {
      showMessage("Procedure name cannot be empty.", "error")
      return
    }

    const res = await apiRequest(
      `${Cosmetologybaseurl}Procedure/`,
      "POST",
      { procedure: newProcedure }
    )

    if (res.success) {
      setProceduresList([...proceduresList, res.data])
      setShowAddInput(false)
      setNewProcedure("")
      showMessage("New Procedure stored successfully!")
    } else {
      console.error("Add procedure error:", res.error)
      showMessage("Error adding new procedure.", "error")
    }
  }

  const handleProcedureChange = (selected, index) => {
    const newInputs = [...proceduresInputs]
    newInputs[index].selectedProcedures = selected
    setProceduresInputs(newInputs)
    onSelectProcedures(newInputs)
  }

  const handleDateChange = (date, index) => {
    const newInputs = [...proceduresInputs]
    newInputs[index].selectedDate = date
    setProceduresInputs(newInputs)
    onSelectProcedures(newInputs)
  }

  const formatDate = (date) => {
    if (!date) return ""
    const d = date.getDate().toString().padStart(2, "0")
    const m = (date.getMonth() + 1).toString().padStart(2, "0")
    const y = date.getFullYear()
    return `${d}/${m}/${y}`
  }

  return (
    <ProceduresContainer>
      {message && <MessageContainer type={messageType}>{message}</MessageContainer>}

      {proceduresInputs.map((input, index) => (
        <Row className="justify-content-center mb-3" key={index}>
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>Procedures</Form.Label>

            <FlexContainer>
              <BsPatchPlusFill size={24} onClick={handleAddInput} style={{ marginRight: "10px" }} />

              <Typeahead
                id={`procedures-${index}`}
                labelKey="procedure"
                options={proceduresList}
                selected={input.selectedProcedures}
                onChange={(selected) => handleProcedureChange(selected, index)}
                placeholder="Select Procedures"
              />

              {index > 0 && (
                <MdDelete size={24} onClick={() => handleDeleteInput(index)} />
              )}

              <DatePicker
                selected={input.selectedDate || null}
                onChange={(date) => handleDateChange(date, index)}
                customInput={<CalendarIcon size={24} />}
                dateFormat="dd/MM/yyyy"
              />
            </FlexContainer>

            <DateDisplay>
              {input.selectedDate
                ? `Procedure Date: ${formatDate(input.selectedDate)}`
                : "Procedure Date: Select a date"}
            </DateDisplay>
          </CenteredFormGroup>
        </Row>
      ))}

      {showAddInput && (
        <Row className="justify-content-center mb-3">
          <CenteredFormGroup as={Col} md="4">
            <Form.Label>New Procedure</Form.Label>
            <FlexContainer>
              <Form.Control
                type="text"
                value={newProcedure}
                onChange={(e) => setNewProcedure(e.target.value)}
                placeholder="Enter new procedure"
              />
              <Button onClick={handleAddNewProcedure} style={{ marginLeft: "10px" }}>
                Save
              </Button>
            </FlexContainer>
          </CenteredFormGroup>
        </Row>
      )}

      <button onClick={() => setShowAddInput(!showAddInput)}>
        {showAddInput ? "Close" : "Add New Procedure"}
      </button>
    </ProceduresContainer>
  )
}

export default Procedures