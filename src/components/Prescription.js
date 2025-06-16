"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { Col, Row, Form, Tab, Nav } from "react-bootstrap"
import styled from "styled-components"
import "bootstrap/dist/css/bootstrap.min.css"
import { Typeahead } from "react-bootstrap-typeahead"
import "react-bootstrap-typeahead/css/Typeahead.css"
import male from "./images/male.png"
import female from "./images/female.png"
import { BsPatchPlusFill } from "react-icons/bs"
import { MdDelete } from "react-icons/md"
import axios from "axios"
import { FaCalendarAlt } from "react-icons/fa"
import DatePicker from "react-datepicker"
import Diagnosis from "./Diagnosis"
import Complaints from "./Complaints"
import Findings from "./Findings"
import Tests from "./Tests"
import Procedures from "./Procedure"
import jsPDF from "jspdf"
import "jspdf-autotable"
import PDFMain1 from "./images/PDF_Summary_branch1.jpeg"
import PDFMain2 from "./images/PDF_Summary_branch2.jpeg"

const darkGray = "#b3a591"

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.bodyBackgroundColor};
`

export const StyledContainer = styled.div`
  margin-top: 65px;
`

export const SectionTitle = styled.h6`
  margin-top: 10px;
  text-align: center;
`

export const PatientDetailsContainer = styled.div`
  flex-direction: column;
  align-items: center;
  background-color:  #b798c0;
  padding: 20px;
  width: 300px;
  height: 390px;
  position: absolute;
  left: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top:10px;
`

export const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
`

export const PatientName = styled.h5`
  margin: 0;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: left;
  width: 100%;
`

export const PatientText = styled.p`
  margin: 0;
  color: white;
  text-align: left;
  width: 100%;
`

export const RightContent = styled.div`
  margin-left: 320px;
  padding: 5px;
`

export const CenteredFormGroup = styled(Form.Group)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const SummaryContainer = styled.div`
  padding: 10px;
  background-color: #b798c0;
  border-radius: 10px;
  width: 100%;
  height: auto;
  margin-left: auto;
  margin-right: auto;
`

const SummaryDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0 auto;
`

const SummaryTitle = styled.h3`
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
  color: #333;
`

const SummaryItemTitle = styled.h4`
  margin-top: 10px;
  margin-bottom: 10px;
  color: ${darkGray};
`

const PatientDetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
  line-height: 1.6;
`

const PatientDetailsColumn = styled.div`
  flex: 1;
  &:first-child {
    margin-right: 20px;
  }
`

const Divider = styled.hr`
  width: 100%;
  margin: 10px 0;
  border: 1px solid #ddd;
`

const DateDisplay = styled.div`
  font-size: 16px;
  color: #333;
`

const CalendarIcon = styled(FaCalendarAlt)`
  font-size: 24px;
  cursor: pointer;
  color: #C85C8E;
`

export const ImageContainer = styled.section`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color: #b798c0;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`

export const UploadedImage = styled.img`
  width: 80px;
  height: 80px;
  margin: 5px;
  object-fit: cover;
`

export const PdfContainer = styled.section`
  flex: 1;
  margin-right: 10px;
  padding: 20px;
  background-color:  #b798c0;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
`

export const PdfItem = styled.div`
  margin: 10px;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const RemoveButton = styled.button`
  background-color: #ff6b6b;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #ee5253;
  }
`

export const SectionTitle2 = styled.h4`
  margin-top: 20px;
  margin-bottom: 10px;
  color: ${darkGray};
`

export const UploadIcon = styled.i`
  font-size: 3rem;
  color: #757575;
`

export const UploadText = styled.p`
  font-size: 1rem;
  color: #757575;
`

export const PrescriptionContainer = styled.section`
flex: 1;
margin: 0 15px;
padding: 20px;
background-color: #b798c0;
border-radius: 10px;
text-align: center;
`

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`

export const ContainerRow = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 10px;
  margin-top: 10px;
`

const NextVisitonContainer = styled.div`
flex: 1;
margin: 0 15px;
padding: 20px;
background-color: #b798c0;
border-radius: 10px;
text-align: center;
`

export const PlanContainer = styled.div`
flex: 1;
margin: 0 15px;
padding: 20px;
background-color: #b798c0;
border-radius: 10px;
text-align: center;
`

// ADD: New styled components for stock indicators
const StockIndicator = styled.div`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 5px;
  ${(props) => {
    if (props.stock === 0) {
      return `
        background-color: #ff4444;
        color: white;
      `
    } else if (props.stock < 20) {
      return `
        background-color: #ff9800;
        color: white;
      `
    } else {
      return `
        background-color: #4caf50;
        color: white;
      `
    }
  }}
`

const StockWarning = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  width: fit-content;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
`

const SuccessMessage = styled.div`
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
    } else if (props.type === "warning") {
      return `
        background-color: white;
        color: #ffa500;
        border: 1px solid #cc8400;
      `
    } else {
      return `
        background-color: white;
        color: #ffa500;
        border: 1px solid #45a049;
      `
    }
  }}
`

const PrescriptionDetails = () => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState([])
  const [selectedComplaints, setSelectedComplaints] = useState([])
  const [selectedfindings, setSelectedFindings] = useState([])
  const [selectedprocedure, setSelectedprocedure] = useState([])
  const [prescriptionInputs, setPrescriptionInputs] = useState([
    { selectedPrescription: [], dosage: "", durationNumber: "", duration: "", m: false, a: false, e: false, n: false },
    { selectedPrescription: [], dosage: "", durationNumber: "", duration: "", m: false, a: false, e: false, n: false },
    { selectedPrescription: [], dosage: "", durationNumber: "", duration: "", m: false, a: false, e: false, n: false },
  ])

  const [uploadedImages, setUploadedImages] = useState([])
  const [selectedTests, setSelectedTests] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [planDetails, setPlanDetails] = useState({
    plan1: "",
    plan2: "",
    plan3: "",
  })
  const [branchCode, setBranchCode] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // ADD: New state to track loaded data separately
  const [loadedData, setLoadedData] = useState({
    diagnosis: [],
    complaints: [],
    findings: [],
    procedures: [],
    prescriptions: [],
    plans: { plan1: "", plan2: "", plan3: "" },
    tests: [],
    nextVisit: null,
  })

  // ADD: New state for stock warnings
  const [stockWarnings, setStockWarnings] = useState({})

  const [loadedPrescriptionIndices, setLoadedPrescriptionIndices] = useState(new Set())

  const handleSelectDiagnosis = (diagnosis) => setSelectedDiagnosis(diagnosis)
  const handleSelectComplaints = (complaints) => {
    setSelectedComplaints(complaints)
  }
  const handleSelectfindings = (findings) => setSelectedFindings(findings)
  const handleSelectprocedure = (procedure) => setSelectedprocedure(procedure)
  const handleSelectTests = (tests) => setSelectedTests(tests)
  const handleDateChange = (date) => setSelectedDate(date)
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid Date"
    }

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const location = useLocation()
  const { appointment, patientUID, mobileNumber, patientName, appointmentDate } = location.state
  const [medicineOptions, setMedicineOptions] = useState([])
  const [vital, setVital] = useState([])

  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")
    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from localStorage:", code)
    } else {
      console.warn("Branch code not found in localStorage")
    }
  }, [])

  // UPDATED: Enhanced medicine fetching to include stock information
  useEffect(() => {
    if (!branchCode) return

    axios
      .get(`${Cosmetologybaseurl}pharmacy/data/`, {
        params: { branch_code: branchCode },
      })
      .then((response) => {
        const medicineData = response.data.map((medicine) => ({
          label: medicine.medicine_name,
          category: medicine.medicine_category,
          stock: medicine.stock || 0, // ADD: Include stock information
          fullData: medicine,
        }))
        setMedicineOptions(medicineData)
        console.log("Medicine data with stock:", medicineData) // ADD: Debug log
      })
      .catch((error) => {
        console.error("Error fetching medicine names:", error)
      })
  }, [branchCode])

  // ADD: Function to get stock information for a medicine
  const getMedicineStock = (medicineName) => {
    const medicine = medicineOptions.find((option) => option.label.toLowerCase() === medicineName.toLowerCase())
    return medicine ? medicine.stock : null
  }

  // ADD: Function to get stock indicator component
  const getStockIndicator = (stock) => {
    if (stock === null || stock === undefined) return null

    let text = ""
    if (stock === 0) {
      text = "OUT OF STOCK"
    } else if (stock < 20) {
      text = `LOW STOCK (${stock})`
    } else {
      text = `IN STOCK (${stock})`
    }

    return <StockIndicator stock={stock}>{text}</StockIndicator>
  }

  const checkStockWarnings = (prescriptionInputs) => {
    const warnings = {}

    prescriptionInputs.forEach((input, index) => {
      // Only show stock warnings for new prescriptions (not loaded data)
      if (
        !loadedPrescriptionIndices.has(index) &&
        input.selectedPrescription &&
        input.selectedPrescription.length > 0
      ) {
        const medicineName = input.selectedPrescription[0].label
        const stock = getMedicineStock(medicineName)

        if (stock !== null) {
          if (stock === 0) {
            warnings[index] = {
              type: "danger",
              message: `⚠️ ${medicineName} is OUT OF STOCK!`,
            }
          } else if (stock < 20) {
            warnings[index] = {
              type: "warning",
              message: `⚠️ ${medicineName} has LOW STOCK (${stock} remaining)`,
            }
          }
        }
      }
    })

    setStockWarnings(warnings)
  }

  // ADD: Update stock warnings when prescriptions change
  useEffect(() => {
    checkStockWarnings(prescriptionInputs)
  }, [prescriptionInputs, medicineOptions, loadedPrescriptionIndices])

  const shouldHideDosage = (selectedPrescription) => {
    if (!selectedPrescription || selectedPrescription.length === 0) return false

    const selectedMedicine = selectedPrescription[0]
    if (selectedMedicine.category) {
      return selectedMedicine.category === "Topicals"
    }

    const matchedMedicine = medicineOptions.find(
      (option) => option.label.toLowerCase() === selectedMedicine.label.toLowerCase(),
    )
    return matchedMedicine && matchedMedicine.category === "Topicals"
  }

  useEffect(() => {
    if (!patientUID || !branchCode) return

    console.log("Fetching vital data with:", patientUID, branchCode)

    axios
      .get(`${Cosmetologybaseurl}vitalform/`, {
        params: {
          patientUID,
          branch_code: branchCode,
        },
      })
      .then((response) => {
        console.log("Vital data response:", response.data)
        setVital(response.data.vital[0] || {}); // set the first item or empty object
      })
      .catch((error) => {
        console.error("Error fetching vital data:", error)
      })
  }, [patientUID, branchCode])

  const handlePrescriptionAddInput = () => {
    setPrescriptionInputs((prev) => [
      ...prev,
      {
        selectedPrescription: [],
        dosage: "",
        m: false,
        a: false,
        e: false,
        n: false,
        durationNumber: "",
        duration: "",
      },
    ])
    // New prescriptions are not from loaded data
    // loadedPrescriptionIndices will automatically not include the new index
  }

  const handlePrescriptionDeleteInput = (index) => {
    setPrescriptionInputs((prev) => prev.filter((_, i) => i !== index))
    // Remove from loaded indices if it was loaded
    setLoadedPrescriptionIndices((prev) => {
      const newSet = new Set(prev)
      newSet.delete(index)
      // Adjust indices for remaining items
      const adjustedSet = new Set()
      Array.from(newSet).forEach((loadedIndex) => {
        if (loadedIndex > index) {
          adjustedSet.add(loadedIndex - 1)
        } else {
          adjustedSet.add(loadedIndex)
        }
      })
      return adjustedSet
    })
    // Remove stock warning for deleted input
    setStockWarnings((prev) => {
      const newWarnings = { ...prev }
      delete newWarnings[index]
      return newWarnings
    })
  }

  const handlePrescriptionChange = (index, key, value) => {
    setPrescriptionInputs((prev) => {
      const updated = [...prev]
      updated[index][key] = value
      return updated
    })
  }

  const handleCheckboxChange = (index, key) => {
    setPrescriptionInputs((prev) => {
      const updated = [...prev]
      updated[index][key] = !updated[index][key]
      return updated
    })
  }

  const calculateTotalDosage = (input) => {
    const dosage = Number.parseFloat(input.dosage) || 0
    const durationNumber = Number.parseInt(input.durationNumber) || 0
    const durationFactor = input.duration === "Months" ? 30 : 1
    const timesSelected = (input.m ? 1 : 0) + (input.a ? 1 : 0) + (input.e ? 1 : 0) + (input.n ? 1 : 0)
    return dosage * timesSelected * durationNumber * durationFactor
  }

  const handlePlanChange = (event) => {
    const { id, value } = event.target
    setPlanDetails((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const [summaryData, setSummaryData] = useState(null)

  useEffect(() => {
    if (!patientUID || !appointmentDate || !branchCode) return

    const fetchSummaryData = async () => {
      try {
        const response = await axios.get(`${Cosmetologybaseurl}summary_get/`, {
          params: {
            patientUID,
            appointmentDate,
            branch_code: branchCode,
          },
        })

        if (response.data && response.data.length > 0) {
          const data = response.data[0]
          setSummaryData(data)
          if (data.nextVisit) {
            const parsedDate = parseNextVisit(data.nextVisit)
            setSelectedDate(parsedDate)
          }

          if (data.plans) {
            const plans = parsePlans(data.plans)
            setPlanDetails(plans)
          }
        } else {
          console.log("No summary data found for the given patient and date")
        }
      } catch (error) {
        console.error("Error fetching summary data", error)
      }
    }

    fetchSummaryData()
  }, [patientUID, appointmentDate, branchCode])

  const parseNextVisit = (nextVisit) => {
    try {
      const [day, month, year] = nextVisit.split("/")
      return new Date(`${year}-${month}-${day}`)
    } catch (error) {
      console.error("Error parsing nextVisit date:", error)
      return null
    }
  }

  useEffect(() => {
    if (summaryData && summaryData.prescription) {
      const parsedPrescriptions = parsePrescriptions(summaryData.prescription)
      setPrescriptionInputs(parsedPrescriptions)
      // Track which prescriptions are from loaded data
      const loadedIndices = new Set()
      parsedPrescriptions.forEach((_, index) => {
        loadedIndices.add(index)
      })
      setLoadedPrescriptionIndices(loadedIndices)
    }
  }, [summaryData])

  const parsePrescriptions = (prescriptionString) => {
    if (!prescriptionString) return []

    const prescriptionLines = prescriptionString.split("\n").filter((line) => line.trim() !== "")

    return prescriptionLines.map((prescriptionLine) => {
      const parts = prescriptionLine.split(" - ")

      const prescriptionName = parts[0]?.replace("Prescription:", "").trim() || ""

      const dosage = parts[1]?.replace("Dosage:", "").trim() || ""

      const timingPart = parts[2]?.trim() || ""

      const durationPartIndex = parts.findIndex((part) => part.includes("Duration:"))
      const durationPart = durationPartIndex !== -1 ? parts[durationPartIndex].replace("Duration:", "").trim() : ""
      const durationParts = durationPart.split(" ")

      return {
        selectedPrescription: [{ label: prescriptionName }],
        dosage: dosage,
        m: timingPart.includes("M"),
        a: timingPart.includes("A"),
        e: timingPart.includes("E"),
        n: timingPart.includes("N"),
        durationNumber: durationParts[0] || "",
        duration: durationParts[1] || "",
      }
    })
  }

  const parsePlans = (plansString) => {
    if (!plansString) return { plan1: "", plan2: "", plan3: "" }

    const lines = plansString.split("\n")
    return {
      plan1: lines[0]?.split(": ")[1]?.trim() || "",
      plan2: lines[1]?.split(": ")[1]?.trim() || "",
      plan3: lines[2]?.split(": ")[1]?.trim() || "",
    }
  }

  // UPDATED: Modified useEffect to store loaded data separately and merge with current input
  useEffect(() => {
    if (summaryData) {
      const newLoadedData = {
        diagnosis: [],
        complaints: [],
        findings: [],
        procedures: [],
        prescriptions: [],
        plans: { plan1: "", plan2: "", plan3: "" },
        tests: [],
        nextVisit: null,
      }

      // Store loaded diagnosis
      if (summaryData.diagnosis) {
        newLoadedData.diagnosis = summaryData.diagnosis.split(", ").map((d) => ({ diagnosis: d.trim() }))
      }

      // Store loaded complaints
      if (summaryData.complaints && summaryData.complaints !== "[]") {
        try {
          const parsedComplaints = JSON.parse(summaryData.complaints)
          newLoadedData.complaints = parsedComplaints
        } catch (error) {
          console.error("Error parsing complaints:", error)
        }
      }

      // Store loaded findings
      if (summaryData.findings) {
        newLoadedData.findings = summaryData.findings.split(", ").map((f) => ({ findings: f.trim() }))
      }

      // Store loaded procedures
      if (summaryData.proceduresList) {
        newLoadedData.procedures = summaryData.proceduresList.split("\n").map((line) => {
          const procedureMatch = line.match(/Procedure: (.*?) - Date:/)
          const dateMatch = line.match(/Date: (.*)/)
          return {
            selectedProcedures: procedureMatch ? [{ procedure: procedureMatch[1].trim() }] : [],
            selectedDate: dateMatch ? new Date(dateMatch[1].split("/").reverse().join("-")) : null,
          }
        })
      }

      // Store loaded prescriptions
      if (summaryData.prescription) {
        newLoadedData.prescriptions = parsePrescriptions(summaryData.prescription)
      }

      // Store loaded plans
      if (summaryData.plans) {
        newLoadedData.plans = parsePlans(summaryData.plans)
      }

      // Store loaded tests
      if (summaryData.tests) {
        newLoadedData.tests = summaryData.tests.split(", ").map((t) => ({ test: t.trim() }))
      }

      // Store loaded next visit
      if (summaryData.nextVisit) {
        newLoadedData.nextVisit = parseNextVisit(summaryData.nextVisit)
      }

      setLoadedData(newLoadedData)

      // Only populate input fields if they are currently empty
      if (selectedDiagnosis.length === 0 && newLoadedData.diagnosis.length > 0) {
        setSelectedDiagnosis(newLoadedData.diagnosis)
      }
      if (selectedComplaints.length === 0 && newLoadedData.complaints.length > 0) {
        setSelectedComplaints(newLoadedData.complaints)
      }
      if (selectedfindings.length === 0 && newLoadedData.findings.length > 0) {
        setSelectedFindings(newLoadedData.findings)
      }
      if (selectedprocedure.length === 0 && newLoadedData.procedures.length > 0) {
        setSelectedprocedure(newLoadedData.procedures)
      }
      if (selectedTests.length === 0 && newLoadedData.tests.length > 0) {
        setSelectedTests(newLoadedData.tests)
      }
    }
  }, [summaryData])

  const handleSubmit = async () => {
    try {
      const userName = localStorage.getItem("userName") || "Unknown"

      const validPrescriptions = prescriptionInputs.filter(
        (input) => input.selectedPrescription?.length > 0 && input.selectedPrescription[0]?.label?.trim() !== "",
      )

      const validPlans = Object.entries(planDetails)
        .filter(([key, value]) => value && value.trim() !== "")
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join("\n")

      const currentSummaryData = {
        patientName,
        patientUID,
        mobileNumber,
        appointmentDate,
        branch_code: branchCode,
        patient_handledby: userName,
        diagnosis: selectedDiagnosis.map((d) => d.diagnosis).join(", "),
        complaints: JSON.stringify(
          selectedComplaints.map((input) => ({
            complaints: input.selectedComplaints.map((c) => c.complaints).join(", "),
            duration: input.duration,
            durationUnit: input.durationUnit,
          })),
        ),
        findings: selectedfindings.map((f) => f.findings).join(", "),
        prescription: validPrescriptions
          .map((input) => {
            const times = ["M", "A", "E", "N"]
              .map((time) => (input[time.toLowerCase()] ? time : ""))
              .filter(Boolean)
              .join(" ")
            const totalDosage = calculateTotalDosage(input)
            return `Prescription: ${input.selectedPrescription?.map((p) => p.label).join(", ")} - Dosage: ${input.dosage} - ${times} - Duration: ${input.durationNumber} ${input.duration} - Total Dosage: ${totalDosage}`
          })
          .join("\n"),
        plans: validPlans,
        tests: selectedTests && selectedTests.length > 0 ? selectedTests.map((test) => test.test).join(", ") : "",
        uploadedImages: uploadedImages.map((img) => ({ src: img.src, alt: img.alt })),
        nextVisit: selectedDate ? formatDate(selectedDate) : null,
        vital: JSON.stringify({
          height: vital?.height,
          weight: vital?.weight,
          pulseRate: vital?.pulseRate,
          bloodPressure: vital?.bloodPressure,
        }),
        proceduresList: selectedprocedure
          .map((proc) => ({
            procedure: proc.selectedProcedures.map((p) => p.procedure).join(", "),
            date: proc.selectedDate ? formatDate(proc.selectedDate) : "",
          }))
          .map((proc) => `Procedure: ${proc.procedure} - Date: ${proc.date}`)
          .join("\n"),
      }

      const getResponse = await axios.get(`${Cosmetologybaseurl}summary_get/`, {
        params: {
          patientUID,
          appointmentDate,
          branch_code: branchCode,
        },
      })

      if (getResponse.data && getResponse.data.length > 0) {
        const existingData = getResponse.data[0]

        // Enhanced deep comparison function
        const normalizeValue = (value) => {
          if (value === null || value === undefined) return ""
          if (typeof value === "string") return value.trim()
          if (typeof value === "object") return JSON.stringify(value)
          return String(value)
        }

        const areObjectsEqual = (obj1, obj2) => {
          const keys1 = Object.keys(obj1)
          const keys2 = Object.keys(obj2)

          // Get all unique keys from both objects
          const allKeys = [...new Set([...keys1, ...keys2])]

          for (const key of allKeys) {
            const val1 = normalizeValue(obj1[key])
            const val2 = normalizeValue(obj2[key])

            if (val1 !== val2) {
              console.log(`Difference found in key "${key}":`, { current: val1, existing: val2 })
              return false
            }
          }
          return true
        }

        // Create a comparable version of existingData with same structure as currentSummaryData
        const existingDataComparable = {
          patientName: existingData.patientName || "",
          patientUID: existingData.patientUID || "",
          mobileNumber: existingData.mobileNumber || "",
          appointmentDate: existingData.appointmentDate || "",
          branch_code: existingData.branch_code || "",
          patient_handledby: existingData.patient_handledby || "",
          diagnosis: existingData.diagnosis || "",
          complaints: existingData.complaints || "",
          findings: existingData.findings || "",
          prescription: existingData.prescription || "",
          plans: existingData.plans || "",
          tests: existingData.tests || "",
          uploadedImages: existingData.uploadedImages || [],
          nextVisit: existingData.nextVisit || null,
          vital: existingData.vital || "",
          proceduresList: existingData.proceduresList || "",
        }

        // Check if there are actual changes
        const hasChanges = !areObjectsEqual(currentSummaryData, existingDataComparable)

        if (!hasChanges) {
          setSuccessMessage("No changes made")
        } else {
          // Only make PATCH request if there are actual changes
          await axios.patch(`${Cosmetologybaseurl}summary/post/`, currentSummaryData)
          setSuccessMessage("Updated successfully")
        }
      } else {
        // No existing data, so this is a new entry
        await axios.post(`${Cosmetologybaseurl}summary/post/`, currentSummaryData)
        setSuccessMessage("Saved successfully")
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error submitting data", error)
      setSuccessMessage("Error submitting data")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }
  const summaryRef = useRef(null)

  // UPDATED: Helper function to merge loaded data with current input data
  const getMergedData = () => {
    // Start with the loaded data
    const mergedDiagnosis = [...loadedData.diagnosis]
    const mergedComplaints = [...loadedData.complaints]
    const mergedFindings = [...loadedData.findings]
    const mergedProcedures = [...loadedData.procedures]
    const mergedTests = [...loadedData.tests]

    // Add new (not previously loaded) items from current state
    selectedDiagnosis.forEach((item) => {
      if (!loadedData.diagnosis.some((loaded) => loaded.diagnosis === item.diagnosis)) {
        mergedDiagnosis.push(item)
      }
    })

    selectedComplaints.forEach((item) => {
      if (!loadedData.complaints.some((loaded) => JSON.stringify(loaded) === JSON.stringify(item))) {
        mergedComplaints.push(item)
      }
    })

    selectedfindings.forEach((item) => {
      if (!loadedData.findings.some((loaded) => loaded.findings === item.findings)) {
        mergedFindings.push(item)
      }
    })

    selectedprocedure.forEach((item) => {
      if (!loadedData.procedures.some((loaded) => JSON.stringify(loaded) === JSON.stringify(item))) {
        mergedProcedures.push(item)
      }
    })

    selectedTests.forEach((item) => {
      if (!loadedData.tests.some((loaded) => loaded.test === item.test)) {
        mergedTests.push(item)
      }
    })

    // Handle Prescriptions: Prioritize current prescriptionInputs
    // If a prescription from loadedData is also present in prescriptionInputs (by name),
    // use the one from prescriptionInputs. Otherwise, add both.
    const mergedPrescriptions = []
    // eslint-disable-next-line no-unused-vars
    const processedLoadedPrescriptions = new Set() // To avoid duplicates

    prescriptionInputs.forEach((input) => {
      if (input.selectedPrescription?.length > 0 && input.selectedPrescription[0]?.label?.trim() !== "") {
        mergedPrescriptions.push(input)
      }
    })

    loadedData.prescriptions.forEach((loadedRx) => {
      const isAlreadyInCurrent = prescriptionInputs.some(
        (currentRx) =>
          currentRx.selectedPrescription?.length > 0 &&
          currentRx.selectedPrescription[0]?.label === loadedRx.selectedPrescription[0]?.label,
      )
      if (!isAlreadyInCurrent) {
        mergedPrescriptions.push(loadedRx)
      }
    })

    // Handle Plans: Current planDetails override loadedData.plans
    const mergedPlans = {
      plan1: planDetails.plan1 || loadedData.plans.plan1,
      plan2: planDetails.plan2 || loadedData.plans.plan2,
      plan3: planDetails.plan3 || loadedData.plans.plan3,
    }

    // Handle Next Visit: Current selectedDate overrides loadedData.nextVisit
    const mergedNextVisit = selectedDate || loadedData.nextVisit

    return {
      diagnosis: mergedDiagnosis,
      complaints: mergedComplaints,
      findings: mergedFindings,
      procedures: mergedProcedures,
      prescriptions: mergedPrescriptions,
      tests: mergedTests,
      plans: mergedPlans,
      nextVisit: mergedNextVisit,
    }
  }

  // UPDATED: Modified getSummaryDetails function to use merged data and include stock information
  const getSummaryDetails = () => {
    const mergedData = getMergedData()

    const diagnosissummary = mergedData.diagnosis.map((diagnosis, index) => {
      const cleanDiagnosis = diagnosis.diagnosis?.replace(/^[.\s\n]+/, "").trim() // remove leading dot/newlines
      return <li key={index}>{cleanDiagnosis}</li>
    })

    const complaintssummary = mergedData.complaints.map((input, index) => {
      const complaintText = input.selectedComplaints
        ? input.selectedComplaints.map((complaint) => complaint.complaints).join(", ")
        : "No complaint provided"
      const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || "N/A"}` : ""
      return (
        <li key={index}>
          {complaintText}
          {duration}
        </li>
      )
    })

    const findingssummary = mergedData.findings.map((findings, index) => <li key={index}>{findings.findings}</li>)

    const proceduresummary = mergedData.procedures.map((procedure, index) => (
      <li key={index}>
        {procedure.selectedProcedures.map((p) => p.procedure).join(", ")} - Date:{" "}
        {procedure.selectedDate ? formatDate(new Date(procedure.selectedDate)) : "None"}
      </li>
    ))

    // UPDATED: Enhanced prescription summary with stock information
    const prescriptionSummary = mergedData.prescriptions
      .map((input, index) => {
        const times = ["M", "A", "E", "N"]
          .map((time) => (input[time.toLowerCase()] ? time : ""))
          .filter(Boolean)
          .join(" ")
        const medicineName = input.selectedPrescription?.map((p) => p.label).join(", ")
        // Only show stock info for new prescriptions (not loaded data)
        const isLoadedPrescription = loadedData.prescriptions.some(
          (loaded) => loaded.selectedPrescription[0]?.label === medicineName,
        )
        const stock = !isLoadedPrescription ? getMedicineStock(medicineName) : null
        const stockInfo = stock !== null ? ` [Stock: ${stock}]` : ""
        return `${index + 1}. ${medicineName}${stockInfo} - Dosage: ${input.dosage} - ${times} - Duration: ${input.durationNumber} ${input.duration}`
      })
      .join("\n")

    const validPlans = Object.entries(mergedData.plans)
      .filter(([key, value]) => value && value.trim() !== "")
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)

    const testsSummary = mergedData.tests.map((test) => test.test).join(", ")
    const nextVisitSummary = mergedData.nextVisit ? formatDate(mergedData.nextVisit) : " "

    const summaryContent = (
      <SummaryDetailsContainer>
        <SummaryTitle>Summary</SummaryTitle>

        <PatientDetailsRow>
          <PatientDetailsColumn>
            <div>
              <strong>NAME:</strong> {appointment.patientName}
            </div>
            <div>
              <strong>SEX:</strong> {appointment.gender}
            </div>
          </PatientDetailsColumn>
          <PatientDetailsColumn>
            <div>
              <strong>MOBILE:</strong> {appointment.mobileNumber}
            </div>
            <div>
              <strong>DATE:</strong> {appointmentDate}
            </div>
          </PatientDetailsColumn>
        </PatientDetailsRow>
        <Divider />

        {mergedData.diagnosis.length > 0 && (
          <>
            <SummaryItemTitle>Diagnosis</SummaryItemTitle>
            <ul>{diagnosissummary}</ul>
            <Divider />
          </>
        )}

        {mergedData.complaints.length > 0 && (
          <>
            <SummaryItemTitle>Complaints</SummaryItemTitle>
            <ul>{complaintssummary}</ul>
            <Divider />
          </>
        )}

        {mergedData.findings.length > 0 && (
          <>
            <SummaryItemTitle>Findings</SummaryItemTitle>
            <ul>{findingssummary}</ul>
            <Divider />
          </>
        )}

        {mergedData.procedures.length > 0 && (
          <>
            <SummaryItemTitle>Procedures</SummaryItemTitle>
            <ul>{proceduresummary}</ul>
            <Divider />
          </>
        )}

        {mergedData.prescriptions.length > 0 && (
          <>
            <SummaryItemTitle>Prescription</SummaryItemTitle>
            <ul>
              <li style={{ whiteSpace: "pre-line" }}>{prescriptionSummary}</li>
            </ul>
            <Divider />
          </>
        )}

        {validPlans.length > 0 && (
          <>
            <SummaryItemTitle>Plans</SummaryItemTitle>
            <ul>
              {validPlans.map((plan, index) => (
                <li key={index}>{plan}</li>
              ))}
            </ul>
            <Divider />
          </>
        )}

        {mergedData.tests.length > 0 && (
          <>
            <SummaryItemTitle>Tests</SummaryItemTitle>
            <ul>
              <li>{testsSummary}</li>
            </ul>
            <Divider />
          </>
        )}

        {mergedData.nextVisit && (
          <>
            <SummaryItemTitle>Next Visit</SummaryItemTitle>
            <ul>
              <li>{nextVisitSummary}</li>
            </ul>
            <Divider />
          </>
        )}
      </SummaryDetailsContainer>
    )

    const convertToBase64 = (url, callback) => {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.src = url
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL("image/png")
        callback(dataURL)
      }
      img.onerror = (error) => console.error("Error converting image to Base64:", error)
    }

    // Enhanced exportToPDF function with better patient details presentation
    const exportToPDF = () => {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Select PDF background based on branch code
      const backgroundImageMap = {
        SCC001: PDFMain1,
        SCC002: PDFMain2,
      }

      const PDFMain = backgroundImageMap[branchCode] || PDFMain1

      // Determine startY based on branch code
      let startY = 50 // Default

      if (branchCode === "SCC002") {
        startY = 80
      }

      convertToBase64(PDFMain, (mainImage) => {
        // Add full background image
        pdf.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
        // Enhanced patient details styling
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(16)
        pdf.setTextColor(40, 40, 40)
        pdf.text(`Patient: ${appointment.patientName.toUpperCase()}`, 16, startY)

        // Patient details with improved formatting
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(11)
        pdf.text(`Patient UID: ${appointment.patientUID}`, 16, startY + 10)
        pdf.text(`Mobile: ${appointment.mobileNumber}`, 16, startY + 20)

        pdf.text(`Date: ${appointmentDate}`, 140, startY)
        pdf.text(`Gender: ${appointment.gender}`, 140, startY + 10)

        startY += 15

        const createSubTableRows = (label, entries) => {
          if (!entries || entries.length === 0) {
            return []
          }
          return entries.map((entry, index) => [index === 0 ? label : "", entry])
        }

        let data = []

        // Filter out empty prescriptions for display
        const validPrescriptions = prescriptionInputs.filter(
          (input) => input.selectedPrescription?.length > 0 && input.selectedPrescription[0]?.label?.trim() !== "",
        )

        // Filter out empty plans for display
        const validPlans = Object.entries(planDetails)
          .filter(([key, value]) => value && value.trim() !== "")
          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)

        // UPDATED: Enhanced prescription summary for PDF with stock information
        const prescriptionSummary = validPrescriptions
          .map((input, index) => {
            const times = ["M", "A", "E", "N"]
              .map((time) => (input[time.toLowerCase()] ? time : ""))
              .filter(Boolean)
              .join(" ")
            const medicineName = input.selectedPrescription?.map((p) => p.label).join(", ")
            // Only show stock info for new prescriptions (not loaded data)
            const isLoadedPrescription = loadedData.prescriptions.some(
              (loaded) => loaded.selectedPrescription[0]?.label === medicineName,
            )
            const stock = !isLoadedPrescription ? getMedicineStock(medicineName) : null
            const stockInfo = stock !== null ? ` [Stock: ${stock}]` : ""
            return `${index + 1}. ${medicineName}${stockInfo} - Dosage: ${input.dosage} - ${times} - Duration: ${input.durationNumber} ${input.duration}`
          })
          .join("\n")

        // Only add sections with data
        if (selectedDiagnosis.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Diagnosis",
              selectedDiagnosis.map((d) => d.diagnosis),
            ),
          )
        }

        if (selectedComplaints.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Complaints",
              selectedComplaints.map((input) => {
                const complaintText =
                  input.selectedComplaints.map((complaint) => complaint.complaints).join(", ") ||
                  "No complaint provided"
                const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || "N/A"}` : ""
                return `${complaintText}${duration}`
              }),
            ),
          )
        }

        if (selectedfindings.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Findings",
              selectedfindings.map((f) => f.findings),
            ),
          )
        }

        if (selectedprocedure.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Procedures",
              selectedprocedure.map(
                (p) =>
                  `${p.selectedProcedures.map((proc) => proc.procedure).join(", ")} - Date: ${p.selectedDate ? formatDate(new Date(p.selectedDate)) : "None"}`,
              ),
            ),
          )
        }

        // Only add prescription if there are valid prescriptions
        if (validPrescriptions.length > 0) {
          data.push(["Prescription", prescriptionSummary])
        }

        // Only add plans if there are valid plans
        if (validPlans.length > 0) {
          data.push(["Plans", validPlans.join(", ")])
        }

        if (selectedTests.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Tests",
              selectedTests.map((test) => test.test),
            ),
          )
        }

        if (selectedDate) {
          data.push(["Next Visit Date", selectedDate.toLocaleDateString()])
        }

        // Create table only if there's data
        if (data.length > 0) {
          pdf.autoTable({
            startY,
            head: [["Section", "Details"]],
            body: data,
            theme: "grid",
            headStyles: {
              fillColor: [116, 180, 155],
              textColor: [255, 255, 255],
              fontStyle: "bold",
              fontSize: 10,
            },
            bodyStyles: {
              fontSize: 9,
              textColor: [40, 40, 40],
              font: "helvetica",
            },
            styles: {
              cellWidth: "wrap",
              minCellHeight: 10,
              overflow: "linebreak",
              tableWidth: "auto",
            },
            columnStyles: {
              0: { cellWidth: 60 },
              1: { cellWidth: pageWidth - 80 },
            },
            margin: { left: 14, right: 14 },
          })
        }

        // Handle images section
        let currentY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : startY
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        currentY += 10

        const imageWidth = 25
        const imageHeight = 30
        const imagesPerRow = Math.floor((pageWidth - 20) / (imageWidth + 5))

        uploadedImages.forEach((img, index) => {
          const x = 10 + (index % imagesPerRow) * (imageWidth + 5)

          // Check if we need a new page
          if (currentY + imageHeight + 20 > pageHeight - 20) {
            pdf.addPage()
            // Add background to new page
            pdf.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
            currentY = 85 // Reset Y position for new page
          }

          pdf.addImage(img.src, "JPEG", x, currentY, imageWidth, imageHeight)
          pdf.setFontSize(10)
          pdf.text(`Image ${index + 1}`, x + imageWidth / 4, currentY + imageHeight + 5)

          if ((index + 1) % imagesPerRow === 0) {
            currentY += imageHeight + 20
          }
        })

        // Save the PDF
        pdf.save(`${branchCode}_${appointment.patientName}_${appointment.patientUID}_${appointmentDate}`)
      })
    }

    return (
      <div ref={summaryRef}>
        {summaryContent}
        <button style={{ marginTop: "25px", marginRight: "180px" }} onClick={exportToPDF}>
          Export to PDF
        </button>
      </div>
    )
  }

  return (
    <StyledContainer>
      {successMessage && (
        <SuccessMessage
          type={
            successMessage.includes("Error") ? "error" : successMessage.includes("No changes") ? "warning" : "success"
          }
        >
          {successMessage}
        </SuccessMessage>
      )}
      <Tab.Container defaultActiveKey="consulting-room">
        <Nav style={{ justifyContent: "center" }}>
          <Nav.Item>
            <Nav.Link eventKey="consulting-room" style={{ color: "#725F83" }}>
              Consulting Room
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="instructions" style={{ color: "#725F83" }}>
              Instructions
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="summary" style={{ color: "#725F83" }}>
              Summary
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="consulting-room">
            <RightContent>
              <PatientDetailsContainer>
                <ProfileImage src={appointment.gender === "Male" ? male : female} alt="Profile" />
                <PatientName className="mt-1">Name: {patientName}</PatientName>
                <PatientText className="mt-1">Phone: {mobileNumber}</PatientText>
                <PatientText className="mt-1">Height: {vital?.height}</PatientText>
                <PatientText className="mt-1">Weight: {vital?.weight}</PatientText>
                <PatientText className="mt-1">Pulse Rate: {vital?.pulseRate}</PatientText>
                <PatientText className="mt-1">Blood Pressure: {vital?.bloodPressure}</PatientText>
                <PatientText className="mt-1">Purpose Of Visit: {appointment.purposeOfVisit}</PatientText>
              </PatientDetailsContainer>

              <ContainerRow>
                <Diagnosis
                  onSelectDiagnosis={handleSelectDiagnosis}
                  preSelectedDiagnosis={summaryData?.diagnosis || ""}
                />
                <Findings onSelectFindings={handleSelectfindings} preSelectedFindings={summaryData?.findings || ""} />
              </ContainerRow>

              <ContainerRow>
                <Complaints
                  onSelectComplaints={handleSelectComplaints}
                  preSelectedComplaints={summaryData?.complaints || ""}
                />
              </ContainerRow>
            </RightContent>
          </Tab.Pane>
          <Tab.Pane eventKey="instructions" className="mt-3">
            <ContainerRow>
              <PrescriptionContainer>
                <SectionTitle>Prescription</SectionTitle>
                {prescriptionInputs.map((input, index) => (
                  <div key={index}>
                    <Form.Group as={Row} className="align-items-center mb-3" controlId={`prescription-${index}`}>
                      <Col sm="3">
                        <Typeahead
                          id={`prescription-${index}`}
                          labelKey="label"
                          multiple={false}
                          options={medicineOptions}
                          placeholder="Choose prescription..."
                          onChange={(selected) => {
                            handlePrescriptionChange(index, "selectedPrescription", selected.length > 0 ? selected : [])
                          }}
                          onInputChange={(text) => {
                            const found = medicineOptions.some(
                              (option) => option.label.toLowerCase() === text.toLowerCase(),
                            )
                            if (!found && text.trim() !== "") {
                              handlePrescriptionChange(index, "selectedPrescription", [{ label: text }])
                            }
                          }}
                          selected={input.selectedPrescription || []}
                          allowNew={true}
                          // Only show stock information for new prescriptions
                          renderMenuItemChildren={
                            !loadedPrescriptionIndices.has(index)
                              ? (option) => (
                                  <div>
                                    {option.label}
                                    {getStockIndicator(option.stock)}
                                  </div>
                                )
                              : undefined
                          }
                        />
                        {/* Only display stock indicator for new prescriptions */}
                        {!loadedPrescriptionIndices.has(index) &&
                          input.selectedPrescription &&
                          input.selectedPrescription.length > 0 && (
                            <div style={{ marginTop: "5px" }}>{getStockIndicator}</div>
                          )}
                      </Col>
                      <Col sm="2">
                        <Form.Control
                          type="text"
                          placeholder="Dosage"
                          value={input.dosage || ""}
                          onChange={(e) => handlePrescriptionChange(index, "dosage", e.target.value)}
                          disabled={shouldHideDosage(input.selectedPrescription)}
                        />
                      </Col>
                      <Col sm="3">
                        <Form.Check
                          inline
                          label="M"
                          type="checkbox"
                          checked={input.m}
                          onChange={() => handleCheckboxChange(index, "m")}
                        />
                        <Form.Check
                          inline
                          label="A"
                          type="checkbox"
                          checked={input.a}
                          onChange={() => handleCheckboxChange(index, "a")}
                        />
                        <Form.Check
                          inline
                          label="E"
                          type="checkbox"
                          checked={input.e}
                          onChange={() => handleCheckboxChange(index, "e")}
                        />
                        <Form.Check
                          inline
                          label="N"
                          type="checkbox"
                          checked={input.n}
                          onChange={() => handleCheckboxChange(index, "n")}
                        />
                      </Col>
                      <Col sm="1">
                        <Form.Control
                          type="text"
                          placeholder="Number"
                          value={input.durationNumber || ""}
                          onChange={(e) => handlePrescriptionChange(index, "durationNumber", e.target.value)}
                        />
                      </Col>
                      <Col sm="2">
                        <Form.Control
                          as="select"
                          value={input.duration || ""}
                          onChange={(e) => handlePrescriptionChange(index, "duration", e.target.value)}
                        >
                          <option value="">Duration</option>
                          <option value="Days">Days</option>
                          <option value="Months">Months</option>
                          <option value="Years">Years</option>
                        </Form.Control>
                      </Col>

                      <Col sm="1" className="text-end">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <BsPatchPlusFill
                            size={24}
                            onClick={handlePrescriptionAddInput}
                            style={{ cursor: "pointer", marginLeft: "10px" }}
                          />
                          <MdDelete
                            size={24}
                            onClick={() => handlePrescriptionDeleteInput(index)}
                            style={{ cursor: "pointer", marginLeft: "10px" }}
                          />
                        </div>
                      </Col>
                    </Form.Group>

                    {/* ADD: Display stock warning if exists */}
                    {stockWarnings[index] && <StockWarning>{stockWarnings[index].message}</StockWarning>}
                  </div>
                ))}
              </PrescriptionContainer>
            </ContainerRow>

            <ContainerRow>
              <PlanContainer className="mt-2">
                <Row className="justify-content-around">
                  <Col md="3" className="text-center">
                    <Form.Group controlId="plan1">
                      <Form.Label>Plan1</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Plan1 details"
                        value={planDetails.plan1}
                        onChange={handlePlanChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="3" className="text-center">
                    <Form.Group controlId="plan2">
                      <Form.Label>Plan2</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Plan2 details"
                        value={planDetails.plan2}
                        onChange={handlePlanChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="3" className="text-center">
                    <Form.Group controlId="plan3">
                      <Form.Label>Plan3</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Plan3 details"
                        value={planDetails.plan3}
                        onChange={handlePlanChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </PlanContainer>
            </ContainerRow>

            <ContainerRow>
              <Tests onSelectTests={handleSelectTests} preSelectedTests={summaryData?.tests || ""} />
              <Procedures
                onSelectProcedures={handleSelectprocedure}
                preSelectedProcedures={summaryData?.proceduresList || ""}
              />
              <NextVisitonContainer>
                <SectionTitle>Next Visit</SectionTitle>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date)
                  }}
                  customInput={<CalendarIcon />}
                  popperPlacement="bottom-end"
                  dateFormat="dd/MM/yyyy"
                />
                <DateDisplay>
                  {selectedDate
                    ? `Next Visit on: ${selectedDate.toLocaleDateString("en-GB")}`
                    : "Next Visit on: Select a date"}
                </DateDisplay>
              </NextVisitonContainer>
            </ContainerRow>
          </Tab.Pane>
          <Tab.Pane eventKey="summary">
            <br />

            <SummaryContainer>
              <center>
                {getSummaryDetails()}
                <button style={{ float: "right", marginTop: "-40px" }} onClick={handleSubmit}>
                  Save
                </button>
              </center>
            </SummaryContainer>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </StyledContainer>
  )
}

export default PrescriptionDetails
