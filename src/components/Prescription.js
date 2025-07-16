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
import Admin from "./images/SVKprescription.jpg"
import Doctor from "./images/AllDoctorsprescription.jpg"
import { FaEdit, FaSave, FaTimes } from "react-icons/fa"
import Swal from "sweetalert2"
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
  background-color: #b798c0;
  padding: 20px;
  width: 300px;
  height: 390px;
  position: absolute;
  left: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-top: 10px;
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
  padding: 20px;
  background: linear-gradient(135deg, #b798c0 0%, #a688b5 50%, #9578aa 100%);
  border-radius: 15px;
  width: 100%;
  height: auto;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 8px 25px rgba(183, 152, 192, 0.3);
  border: 2px solid rgba(183, 152, 192, 0.5);
`
const SummaryDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 20px;
  padding: 25px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f6fa 100%);
  border-radius: 15px;
  box-shadow:
    0 10px 30px rgba(183, 152, 192, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  width: 100%;
  margin: 0 auto;
  border: 1px solid rgba(183, 152, 192, 0.3);
`
const SummaryTitle = styled.h3`
  text-align: center;
  width: 100%;
  margin-bottom: 25px;
  color: #6b4c7a;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(183, 152, 192, 0.3);
  font-size: 28px;
`
const SummaryItemTitle = styled.h4`
  margin-top: 15px;
  margin-bottom: 12px;
  color: #8a6b9c;
  font-weight: 600;
  padding: 8px 15px;
  background: linear-gradient(90deg, rgba(183, 152, 192, 0.1) 0%, rgba(183, 152, 192, 0.05) 100%);
  border-left: 4px solid #b798c0;
  border-radius: 5px;
`
const PatientDetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 15px;
  line-height: 1.8;
  padding: 15px;
  background: rgba(183, 152, 192, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(183, 152, 192, 0.2);
`
const PatientDetailsColumn = styled.div`
  flex: 1;
  &:first-child {
    margin-right: 20px;
  }
  div {
    margin-bottom: 8px;
    color: #5a4a6b;
    font-weight: 500;
    strong {
      color: #6b4c7a;
    }
  }
`
const Divider = styled.hr`
  width: 100%;
  margin: 20px 0;
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #b798c0 50%, transparent 100%);
`
const DateDisplay = styled.div`
  font-size: 16px;
  color: #333;
`
const CalendarIcon = styled(FaCalendarAlt)`
  font-size: 24px;
  cursor: pointer;
  color: #c85c8e;
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
  background-color: #b798c0;
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
        color: #28a745;
        border: 1px solid #45a049;
      `
    }
  }}
`
const SummaryListItem = styled.li`
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(183, 152, 192, 0.08);
  border-radius: 6px;
  border-left: 3px solid #b798c0;
  color: #5a4a6b;
  line-height: 1.5;
  &:hover {
    background: rgba(183, 152, 192, 0.12);
  }
`
const SummaryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`
const EditIcon = styled(FaEdit)`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: white;
  font-size: 18px;
  &:hover {
    color: #f0f0f0;
  }
`
const VitalsEditContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
`
const EditButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    color: #f0f0f0;
  }
`
const VitalInput = styled.input`
  width: 60px;
  padding: 2px 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 12px;
`
// NEW: Styled component for the save button with disabled state
const SaveButton = styled.button`
  float: right;
  margin-top: -40px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  background-color: ${(props) => (props.disabled ? "#cccccc" : "#28a745")};
  color: ${(props) => (props.disabled ? "#666666" : "white")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  transition: all 0.3s ease;
  &:hover {
    background-color: ${(props) => (props.disabled ? "#cccccc" : "#218838")};
  }
`
const PrescriptionDetails = () => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState([])
  const [selectedComplaints, setSelectedComplaints] = useState([])
  const [selectedFindings, setSelectedFindings] = useState([])
  const [selectedProcedure, setSelectedProcedure] = useState([])
  const [prescriptionInputs, setPrescriptionInputs] = useState([
    { selectedPrescription: [], dosage: "", durationNumber: "", duration: "", m: false, a: false, e: false, n: false },
    { selectedPrescription: [], dosage: "", durationNumber: "", duration: "", m: false, a: false, e: false, n: false },
    { selectedPrescription: [], dosage: "", durationNumber: "", duration: "", m: false, a: false, e: false, n: false },
  ])
  const [selectedTests, setSelectedTests] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [planDetails, setPlanDetails] = useState({
    plan1: "",
    plan2: "",
    plan3: "",
  })
  const [branchCode, setBranchCode] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isEditingVitals, setIsEditingVitals] = useState(false)
  const [editableVitals, setEditableVitals] = useState({
    height: "",
    weight: "",
    pulseRate: "",
    bloodPressure: "",
  })
  const [vitalsLoaded, setVitalsLoaded] = useState(false)
  const [selectedPrescriptions, setSelectedPrescriptions] = useState(new Set())
  // NEW: State management for save functionality
  const [isSaved, setIsSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
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
  const [originalLoadedData, setOriginalLoadedData] = useState({
    diagnosis: [],
    complaints: [],
    findings: [],
    procedures: [],
    prescriptions: [],
    plans: { plan1: "", plan2: "", plan3: "" },
    tests: [],
    nextVisit: null,
  })
  const [userModifiedData, setUserModifiedData] = useState({
    diagnosis: false,
    complaints: false,
    findings: false,
    procedures: false,
    prescriptions: false,
    plans: false,
    tests: false,
    nextVisit: false,
  })
  const [stockWarnings, setStockWarnings] = useState({})
  const [loadedPrescriptionIndices, setLoadedPrescriptionIndices] = useState(new Set())
  // NEW: Function to mark data as modified and enable save button
  const markAsModified = (dataType) => {
    if (!isInitialLoad) {
      setUserModifiedData((prev) => ({
        ...prev,
        [dataType]: true,
      }))
      setHasUnsavedChanges(true)
      setIsSaved(false)
    }
  }
  // NEW: Function to reset save state when data is loaded
  const resetSaveState = () => {
    setIsSaved(false)
    setHasUnsavedChanges(false)
    setIsInitialLoad(false)
  }
  const handleSelectDiagnosis = (diagnosis) => {
    setSelectedDiagnosis(diagnosis)
    markAsModified("diagnosis")
  }
  const handleSelectComplaints = (complaints) => {
    setSelectedComplaints(complaints)
    markAsModified("complaints")
  }
  const handleSelectfindings = (findings) => {
    setSelectedFindings(findings)
    markAsModified("findings")
  }
  const handleSelectprocedure = (procedure) => {
    setSelectedProcedure(procedure)
    markAsModified("procedures")
  }
  const handleSelectTests = (tests) => {
    setSelectedTests(tests)
    markAsModified("tests")
  }
  const handleDateChange = (date) => {
    setSelectedDate(date)
    markAsModified("nextVisit")
  }
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
    } else {
      console.warn("Branch code not found in localStorage")
    }
  }, [])
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
          stock: medicine.stock || 0,
          fullData: medicine,
        }))
        setMedicineOptions(medicineData)
      })
      .catch((error) => {
        console.error("Error fetching medicine names:", error)
      })
  }, [branchCode])
  const getMedicineStock = (medicineName) => {
    const medicine = medicineOptions.find((option) => option.label.toLowerCase() === medicineName.toLowerCase())
    return medicine ? medicine.stock : null
  }
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
    if (vital) {
      setEditableVitals({
        height: vital.height || "",
        weight: vital.weight || "",
        pulseRate: vital.pulseRate || "",
        bloodPressure: vital.bloodPressure || "",
      })
    }
  }, [vital])
  const handleVitalsEdit = () => {
    setIsEditingVitals(true)
  }
  const handleVitalsCancel = () => {
    setIsEditingVitals(false)
    // Reset to original values
    setEditableVitals({
      height: vital.height || "",
      weight: vital.weight || "",
      pulseRate: vital.pulseRate || "",
      bloodPressure: vital.bloodPressure || "",
    })
  }
  const handleVitalsChange = (field, value) => {
    setEditableVitals((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
  const handleVitalsSave = () => {
    // Just update the local vital state and exit edit mode
    setVital(editableVitals)
    setIsEditingVitals(false)
    setSuccessMessage("Vitals updated (will be saved with prescription)")
    markAsModified("vitals") // NEW: Mark vitals as modified
    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }
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
    markAsModified("prescriptions")
  }
  const handlePrescriptionDeleteInput = (index) => {
    const prescriptionToDelete = prescriptionInputs[index]
    if (prescriptionToDelete.selectedPrescription && prescriptionToDelete.selectedPrescription.length > 0) {
      const medicineName = prescriptionToDelete.selectedPrescription[0].label
      setSelectedPrescriptions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(medicineName)
        return newSet
      })
    }
    setPrescriptionInputs((prev) => prev.filter((_, i) => i !== index))
    setLoadedPrescriptionIndices((prev) => {
      const newSet = new Set(prev)
      newSet.delete(index)
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
    setStockWarnings((prev) => {
      const newWarnings = { ...prev }
      delete newWarnings[index]
      return newWarnings
    })
    markAsModified("prescriptions")
  }
  // FIXED: Enhanced prescription change handler to properly handle typed medicines
  const handlePrescriptionChange = (index, key, value) => {
    if (key === "selectedPrescription") {
      // Remove previous selection from set if exists
      const currentPrescription = prescriptionInputs[index].selectedPrescription
      if (currentPrescription && currentPrescription.length > 0) {
        setSelectedPrescriptions((prev) => {
          const newSet = new Set(prev)
          newSet.delete(currentPrescription[0].label)
          return newSet
        })
      }
      // Add new selection to set if value is not empty
      if (value.length > 0) {
        const selectedItem = value[0]
        const medicineName = selectedItem.label
        setSelectedPrescriptions((prev) => new Set(prev).add(medicineName))
      }
    }
    setPrescriptionInputs((prev) => {
      const updated = [...prev]
      updated[index][key] = value
      return updated
    })
    markAsModified("prescriptions")
  }
  const handleCheckboxChange = (index, key) => {
    setPrescriptionInputs((prev) => {
      const updated = [...prev]
      updated[index][key] = !updated[index][key]
      return updated
    })
    markAsModified("prescriptions")
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
    markAsModified("plans")
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
          // NEW: Reset save state when data is loaded from server
          resetSaveState()
        } else {
          console.log("No summary data found for the given patient and date")
          // NEW: Reset save state for new records
          resetSaveState()
        }
      } catch (error) {
        console.error("Error fetching summary data", error)
        resetSaveState()
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
      const loadedIndices = new Set()
      const loadedMedicines = new Set()
      parsedPrescriptions.forEach((prescription, index) => {
        loadedIndices.add(index)
        if (prescription.selectedPrescription && prescription.selectedPrescription.length > 0) {
          loadedMedicines.add(prescription.selectedPrescription[0].label)
        }
      })
      setLoadedPrescriptionIndices(loadedIndices)
      setSelectedPrescriptions(loadedMedicines)
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
    const plans = { plan1: "", plan2: "", plan3: "" }
    lines.forEach((line) => {
      if (line.includes("Plan1:") && !plans.plan1) {
        plans.plan1 = line.split(": ")[1]?.trim() || ""
      } else if (line.includes("Plan2:") && !plans.plan2) {
        plans.plan2 = line.split(": ")[1]?.trim() || ""
      } else if (line.includes("Plan3:") && !plans.plan3) {
        plans.plan3 = line.split(": ")[1]?.trim() || ""
      }
    })
    return plans
  }
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
      if (summaryData.diagnosis) {
        const uniqueDiagnosis = [...new Set(summaryData.diagnosis.split(", ").map((d) => d.trim()))]
        newLoadedData.diagnosis = uniqueDiagnosis.map((d) => ({ diagnosis: d }))
      }
      if (summaryData.complaints && summaryData.complaints !== "[]") {
        try {
          const parsedComplaints = JSON.parse(summaryData.complaints)
          newLoadedData.complaints = parsedComplaints
        } catch (error) {
          console.error("Error parsing complaints:", error)
        }
      }
      if (summaryData.findings) {
        const uniqueFindings = [...new Set(summaryData.findings.split(", ").map((f) => f.trim()))]
        newLoadedData.findings = uniqueFindings.map((f) => ({ findings: f }))
      }
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
      if (summaryData.prescription) {
        newLoadedData.prescriptions = parsePrescriptions(summaryData.prescription)
      }
      if (summaryData.plans) {
        newLoadedData.plans = parsePlans(summaryData.plans)
      }
      if (summaryData.tests) {
        const uniqueTests = [...new Set(summaryData.tests.split(", ").map((t) => t.trim()))]
        newLoadedData.tests = uniqueTests.map((t) => ({ test: t }))
      }
      if (summaryData.nextVisit) {
        newLoadedData.nextVisit = parseNextVisit(summaryData.nextVisit)
      }
      setLoadedData(newLoadedData)
      setOriginalLoadedData(JSON.parse(JSON.stringify(newLoadedData)))
      if (selectedDiagnosis.length === 0 && newLoadedData.diagnosis.length > 0) {
        setSelectedDiagnosis(newLoadedData.diagnosis)
      }
      if (selectedComplaints.length === 0 && newLoadedData.complaints.length > 0) {
        setSelectedComplaints(newLoadedData.complaints)
      }
      if (selectedFindings.length === 0 && newLoadedData.findings.length > 0) {
        setSelectedFindings(newLoadedData.findings)
      }
      if (selectedProcedure.length === 0 && newLoadedData.procedures.length > 0) {
        setSelectedProcedure(newLoadedData.procedures)
      }
      if (selectedTests.length === 0 && newLoadedData.tests.length > 0) {
        setSelectedTests(newLoadedData.tests)
      }
    }
  }, [summaryData])
  useEffect(() => {
    if (!patientUID || !branchCode) return
    const fetchVitals = async () => {
      let vitalsFound = false
      setVitalsLoaded(false)
      if (summaryData && summaryData.vital) {
        try {
          let prescriptionVitals
          if (typeof summaryData.vital === "string") {
            prescriptionVitals = JSON.parse(summaryData.vital)
          } else {
            prescriptionVitals = summaryData.vital
          }
          if (
            prescriptionVitals &&
            (prescriptionVitals.height ||
              prescriptionVitals.weight ||
              prescriptionVitals.pulseRate ||
              prescriptionVitals.bloodPressure)
          ) {
            console.log("Loading vitals from summary data:", prescriptionVitals)
            setVital(prescriptionVitals)
            setEditableVitals({
              height: prescriptionVitals.height || "",
              weight: prescriptionVitals.weight || "",
              pulseRate: prescriptionVitals.pulseRate || "",
              bloodPressure: prescriptionVitals.bloodPressure || "",
            })
            vitalsFound = true
            setVitalsLoaded(true)
            return
          }
        } catch (error) {
          console.error("Error parsing prescription vitals:", error)
        }
      }
      if (!vitalsFound) {
        try {
          const response = await axios.get(`${Cosmetologybaseurl}vitalform/`, {
            params: {
              patientUID,
              branch_code: branchCode,
            },
          })
          const vitalData = response.data.vital[0] || {}
          if (vitalData && (vitalData.height || vitalData.weight || vitalData.pulseRate || vitalData.bloodPressure)) {
            console.log("Loading vitals from vitals API:", vitalData)
            setVital(vitalData)
            setEditableVitals({
              height: vitalData.height || "",
              weight: vitalData.weight || "",
              pulseRate: vitalData.pulseRate || "",
              bloodPressure: vitalData.bloodPressure || "",
            })
            vitalsFound = true
          }
        } catch (error) {
          console.error("Error fetching vital data:", error)
        }
      }
      if (!vitalsFound) {
        console.log("No vitals found, setting as unavailable")
        setVital({
          height: "Unavailable",
          weight: "Unavailable",
          pulseRate: "Unavailable",
          bloodPressure: "Unavailable",
        })
        setEditableVitals({
          height: "",
          weight: "",
          pulseRate: "",
          bloodPressure: "",
        })
      }
      setVitalsLoaded(true)
    }
    fetchVitals()
  }, [patientUID, branchCode, summaryData])
  // NEW: Enhanced handleSubmit with save state management
  const handleSubmit = async () => {
    // NEW: Prevent multiple saves if already saved and no changes
    if (isSaved && !hasUnsavedChanges) {
      setSuccessMessage("No changes to save")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
      return
    }
    try {
      const userName = localStorage.getItem("userName") || "Unknown"
      const userRole = localStorage.getItem("userRole") || "Doctor"
      // FIXED: Enhanced prescription filtering to include manually typed medicines
      const validPrescriptions = prescriptionInputs.filter((input) => {
        // Check if prescription is selected and has a valid label
        if (!input.selectedPrescription || input.selectedPrescription.length === 0) {
          return false
        }
        const label = input.selectedPrescription[0]?.label
        return label && label.trim() !== ""
      })
      const validPlans = Object.entries(planDetails)
        .filter(([key, value]) => value && value.trim() !== "")
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join("\n")
      const removeDuplicates = (str) => {
        if (!str || typeof str !== "string") return str
        return [
          ...new Set(
            str
              .split(", ")
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        ].join(", ")
      }
      const cleanArrayData = (data) => {
        if (!data || !Array.isArray(data)) return data
        return [...new Set(data.map((item) => (typeof item === "string" ? item.trim() : item)))].filter(Boolean)
      }
      const currentSummaryData = {
        patientName,
        patientUID,
        mobileNumber,
        appointmentDate,
        branch_code: branchCode,
        patient_handledby: userName,
        diagnosis:
          selectedDiagnosis && selectedDiagnosis.length > 0
            ? removeDuplicates(cleanArrayData(selectedDiagnosis.map((d) => d.diagnosis)).join(", "))
            : "",
        complaints: JSON.stringify(
          selectedComplaints.map((input) => ({
            complaints: removeDuplicates(input.selectedComplaints.map((c) => c.complaints).join(", ")),
            duration: input.duration,
            durationUnit: input.durationUnit,
          })),
        ),
        findings:
          selectedFindings && selectedFindings.length > 0
            ? removeDuplicates(cleanArrayData(selectedFindings.map((findings) => findings.findings)).join(", "))
            : "",
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
        tests:
          selectedTests && selectedTests.length > 0
            ? removeDuplicates(cleanArrayData(selectedTests.map((test) => test.test)).join(", "))
            : "",
        nextVisit: selectedDate ? formatDate(selectedDate) : null,
        vital: JSON.stringify({
          height: editableVitals.height,
          weight: editableVitals.weight,
          pulseRate: editableVitals.pulseRate,
          bloodPressure: editableVitals.bloodPressure,
        }),
        proceduresList: selectedProcedure
          .map((proc) => ({
            procedure: removeDuplicates(proc.selectedProcedures.map((p) => p.procedure).join(", ")),
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
        const normalizeValue = (value) => {
          if (value === null || value === undefined) return ""
          if (typeof value === "string") {
            const trimmed = value.trim()
            if (trimmed.includes(",")) {
              return removeDuplicates(trimmed)
            }
            return trimmed
          }
          if (typeof value === "object") {
            if (Array.isArray(value)) {
              return JSON.stringify(value.map((item) => (typeof item === "object" ? item : String(item).trim())))
            }
            return JSON.stringify(value)
          }
          return String(value).trim()
        }
        const areObjectsEqual = (obj1, obj2) => {
          const keys1 = Object.keys(obj1)
          const keys2 = Object.keys(obj2)
          const allKeys = [...new Set([...keys1, ...keys2])]
          for (const key of allKeys) {
            const val1 = normalizeValue(obj1[key])
            const val2 = normalizeValue(obj2[key])
            if (val1 !== val2) {
              console.log(`Difference found in key "${key}":`, {
                current: val1,
                existing: val2,
                currentLength: val1.length,
                existingLength: val2.length,
              })
              return false
            }
          }
          return true
        }
        const existingDataComparable = {
          patientName: existingData.patientName || "",
          patientUID: existingData.patientUID || "",
          mobileNumber: existingData.mobileNumber || "",
          appointmentDate: existingData.appointmentDate || "",
          branch_code: existingData.branch_code || "",
          patient_handledby: existingData.patient_handledby || "",
          diagnosis: removeDuplicates(existingData.diagnosis || ""),
          complaints: existingData.complaints || "",
          findings: removeDuplicates(existingData.findings || ""),
          prescription: existingData.prescription || "",
          plans: existingData.plans || "",
          tests: removeDuplicates(existingData.tests || ""),
          nextVisit: existingData.nextVisit || null,
          vital: existingData.vital || "",
          proceduresList: existingData.proceduresList || "",
        }
        const hasChanges = !areObjectsEqual(currentSummaryData, existingDataComparable)
        if (!hasChanges) {
          setSuccessMessage("No changes made")
          // NEW: Mark as saved even if no changes
          setIsSaved(true)
          setHasUnsavedChanges(false)
        } else {
          await axios.patch(`${Cosmetologybaseurl}summary/post/`, {
            ...currentSummaryData,
            id: existingData.id,
          })
          setSuccessMessage("Updated successfully")
          // NEW: Mark as saved after successful update
          setIsSaved(true)
          setHasUnsavedChanges(false)
          setTimeout(() => {
            Swal.fire({
              title: "Go Back?",
              text: "Do you want to go back to the appointments page?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Yes, take me there",
              cancelButtonText: "No, stay here",
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
            }).then((result) => {
              if (result.isConfirmed) {
                const navigationPath = userRole === "Admin" ? "/Admin/BookedAppointments" : "/Doctor/BookedAppointments"
                window.location.href = navigationPath
              }
              setSuccessMessage("")
            })
          }, 3000)
          return
        }
      } else {
        await axios.post(`${Cosmetologybaseurl}summary/post/`, currentSummaryData)
        setSuccessMessage("Saved successfully")
        // NEW: Mark as saved after successful creation
        setIsSaved(true)
        setHasUnsavedChanges(false)
        setTimeout(() => {
          Swal.fire({
            title: "Go Back?",
            text: "Do you want to go back to the appointments page?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, take me there",
            cancelButtonText: "No, stay here",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
          }).then((result) => {
            if (result.isConfirmed) {
              const navigationPath = userRole === "Admin" ? "/Admin/BookedAppointments" : "/Doctor/BookedAppointments"
              window.location.href = navigationPath
            }
            setSuccessMessage("")
          })
        }, 3000)
        return
      }
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
  const getMergedData = () => {
    const mergedDiagnosis = [...loadedData.diagnosis]
    const mergedComplaints = [...loadedData.complaints]
    const mergedFindings = [...loadedData.findings]
    const mergedProcedures = [...loadedData.procedures]
    const mergedTests = [...loadedData.tests]
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
    selectedFindings.forEach((item) => {
      if (!loadedData.findings.some((loaded) => loaded.findings === item.findings)) {
        mergedFindings.push(item)
      }
    })
    selectedProcedure.forEach((item) => {
      if (!loadedData.procedures.some((loaded) => JSON.stringify(loaded) === JSON.stringify(item))) {
        mergedProcedures.push(item)
      }
    })
    selectedTests.forEach((item) => {
      if (!loadedData.tests.some((loaded) => loaded.test === item.test)) {
        mergedTests.push(item)
      }
    })
    const mergedPrescriptions = []
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
    const mergedPlans = {
      plan1: planDetails.plan1 || loadedData.plans.plan1,
      plan2: planDetails.plan2 || loadedData.plans.plan2,
      plan3: planDetails.plan3 || loadedData.plans.plan3,
    }
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
  const getSummaryDetails = () => {
    const mergedData = getMergedData()
    const safeJoin = (data, field) => {
      if (!data || data.length === 0) return ""
      if (typeof data === "string") {
        return data.trim()
      }
      if (Array.isArray(data)) {
        return data
          .map((item) => {
            if (typeof item === "string") return item
            return item[field] || ""
          })
          .filter(Boolean)
          .join(", ")
      }
      return ""
    }
    const cleanString = (str) => {
      if (!str || typeof str !== "string") return ""
      return [
        ...new Set(
          str
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ].join(", ")
    }
    const diagnosissummary = cleanString(safeJoin(mergedData.diagnosis, "diagnosis"))
    const complaintssummary = (() => {
      if (!mergedData.complaints || mergedData.complaints.length === 0) return []
      if (typeof mergedData.complaints === "string") {
        try {
          const parsedComplaints = JSON.parse(mergedData.complaints)
          return parsedComplaints
            .filter((complaint) => complaint.complaints && complaint.complaints.trim() !== "")
            .map((complaint, index) => (
              <SummaryListItem key={index}>
                {complaint.complaints}
                {complaint.duration ? ` - Duration: ${complaint.duration} ${complaint.durationUnit || "N/A"}` : ""}
              </SummaryListItem>
            ))
        } catch (e) {
          const cleanedComplaints = cleanString(mergedData.complaints)
          return cleanedComplaints ? [<SummaryListItem key={0}>{cleanedComplaints}</SummaryListItem>] : []
        }
      }
      return mergedData.complaints
        .filter((input) => {
          return (
            input.selectedComplaints &&
            input.selectedComplaints.length > 0 &&
            input.selectedComplaints.some((complaint) => complaint.complaints && complaint.complaints.trim() !== "")
          )
        })
        .map((input, index) => {
          const complaintText = input.selectedComplaints
            .filter((complaint) => complaint.complaints && complaint.complaints.trim() !== "")
            .map((complaint) => complaint.complaints)
            .join(", ")
          const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || "N/A"}` : ""
          return (
            <SummaryListItem key={index}>
              {complaintText}
              {duration}
            </SummaryListItem>
          )
        })
    })()
    const findingssummary = cleanString(safeJoin(mergedData.findings, "findings"))
    const proceduresummary = (() => {
      if (!mergedData.procedures || mergedData.procedures.length === 0) return []
      if (typeof mergedData.procedures === "string") {
        const procedureLines = mergedData.procedures.split("\n").filter(Boolean)
        return procedureLines.map((line, index) => (
          <SummaryListItem key={index}>
            {line.replace("Procedure: ", "").replace(" - Date: ", " - Date: ")}
          </SummaryListItem>
        ))
      }
      return mergedData.procedures.map((procedure, index) => (
        <SummaryListItem key={index}>
          {procedure.selectedProcedures.map((p) => p.procedure).join(", ")} - Date:{" "}
          {procedure.selectedDate ? formatDate(new Date(procedure.selectedDate)) : "None"}
        </SummaryListItem>
      ))
    })()
    const prescriptionSummary = (() => {
      if (!mergedData.prescriptions || mergedData.prescriptions.length === 0) return ""
      if (typeof mergedData.prescriptions === "string") {
        return mergedData.prescriptions
      }
      return mergedData.prescriptions
        .map((input, index) => {
          const times = ["M", "A", "E", "N"]
            .map((time) => (input[time.toLowerCase()] ? time : ""))
            .filter(Boolean)
            .join(" ")
          const medicineName = input.selectedPrescription?.map((p) => p.label).join(", ")
          const isLoadedPrescription = loadedData.prescriptions.some(
            (loaded) => loaded.selectedPrescription[0]?.label === medicineName,
          )
          const stock = !isLoadedPrescription ? getMedicineStock(medicineName) : null
          const stockInfo = stock !== null ? ` [Stock: ${stock}]` : ""
          return `${index + 1}. ${medicineName} - Dosage: ${input.dosage} - ${times} - Duration: ${input.durationNumber} ${input.duration}`
        })
        .join("\n")
    })()
    const validPlans = (() => {
      if (!mergedData.plans) return []
      if (typeof mergedData.plans === "string") {
        return mergedData.plans.split("\n").filter(Boolean)
      }
      return Object.entries(mergedData.plans)
        .filter(([key, value]) => value && value.trim() !== "")
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    })()
    const testsSummary = cleanString(safeJoin(mergedData.tests, "test"))
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
        {diagnosissummary && (
          <>
            <SummaryItemTitle>Diagnosis</SummaryItemTitle>
            <SummaryList>{diagnosissummary}</SummaryList>
            <Divider />
          </>
        )}
        {complaintssummary.length > 0 && (
          <>
            <SummaryItemTitle>Complaints</SummaryItemTitle>
            <SummaryList>{complaintssummary}</SummaryList>
            <Divider />
          </>
        )}
        {findingssummary && (
          <>
            <SummaryItemTitle>Findings</SummaryItemTitle>
            <SummaryList>{findingssummary}</SummaryList>
            <Divider />
          </>
        )}
        {proceduresummary.length > 0 && (
          <>
            <SummaryItemTitle>Procedures</SummaryItemTitle>
            <SummaryList>{proceduresummary}</SummaryList>
            <Divider />
          </>
        )}
        {prescriptionSummary && (
          <>
            <SummaryItemTitle>Prescription</SummaryItemTitle>
            <SummaryList>
              <SummaryListItem style={{ whiteSpace: "pre-line" }}>{prescriptionSummary}</SummaryListItem>
            </SummaryList>
            <Divider />
          </>
        )}
        {validPlans.length > 0 && (
          <>
            <SummaryItemTitle>Plans</SummaryItemTitle>
            <SummaryList>
              {validPlans.map((plan, index) => (
                <SummaryListItem key={index}>{plan}</SummaryListItem>
              ))}
            </SummaryList>
            <Divider />
          </>
        )}
        {testsSummary && (
          <>
            <SummaryItemTitle>Tests</SummaryItemTitle>
            <SummaryList>
              <SummaryListItem>{testsSummary}</SummaryListItem>
            </SummaryList>
            <Divider />
          </>
        )}
        {mergedData.nextVisit && (
          <>
            <SummaryItemTitle>Next Visit</SummaryItemTitle>
            <SummaryList>
              <SummaryListItem>{nextVisitSummary}</SummaryListItem>
            </SummaryList>
            <Divider />
          </>
        )}
      </SummaryDetailsContainer>
    )
    // FIXED: Enhanced PDF export with better content spacing and page management
    const exportToPDF = () => {
      const doc = new jsPDF("p", "mm", "a4")
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 14
      const usableWidth = pageWidth - margin * 2
      const signatureSpace = 25 // Reduced signature space
      const minSignatureY = pageHeight - signatureSpace
      const sanitizeFilename = (str) => {
        if (!str || str === null || str === undefined) return "Unknown"
        return str
          .toString()
          .replace(/[^a-zA-Z0-9\-_]/g, "_")
          .replace(/_{2,}/g, "_")
          .replace(/^_|_$/g, "")
          .substring(0, 50)
      }
      const safeParseJSON = (jsonString) => {
        if (!jsonString) return null
        try {
          let cleanString = jsonString
          if (typeof jsonString === "string" && jsonString.startsWith('"') && jsonString.endsWith('"')) {
            cleanString = jsonString.slice(1, -1)
            cleanString = cleanString.replace(/\\"/g, '"')
          }
          return JSON.parse(cleanString)
        } catch (e) {
          console.warn("JSON parsing failed:", e)
          return jsonString
        }
      }
      const addDoctorSignature = (doc, pageNumber = 1) => {
        const doctorName = localStorage.getItem("userName") || "Doctor"
        const signatureLineY = pageHeight - 45 // Adjusted signature position
        const signatureLineStartX = pageWidth - margin - 80
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(40, 40, 40)
        doc.text(`Dr. ${doctorName}`, signatureLineStartX + 40, signatureLineY)
      }
      // Select PDF background based on branch code
      const role = localStorage.getItem("userRole")
      const PDFMain = role === "Doctor" ? Doctor : role === "Admin" ? Admin : Doctor
      const convertToBase64 = (url, callback) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
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
      convertToBase64(PDFMain, (mainImage) => {
        // Add background to first page
        doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
        let currentY = 80
        // Header information
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(40, 40, 40)
        const patientName = appointment?.patientName || "Unknown Patient"
        const patientUID = appointment?.patientUID || "Unknown UID"
        const appointmentDate = appointment?.appointmentDate || new Date().toISOString().split("T")[0]
        doc.text(`Patient: ${patientName}`, margin, currentY)
        doc.text(`Patient UID: ${patientUID}`, margin, currentY + 8)
        doc.text(`Date: ${appointmentDate}`, pageWidth - margin - 50, currentY)
        currentY += 20
        const createSubTableRows = (label, entries) => {
          if (!entries || entries.length === 0) return []
          return entries.map((entry, index) => [index === 0 ? label : "", entry])
        }
        let data = []
        // Handle diagnosis (can be string or array)
        if (selectedDiagnosis && selectedDiagnosis.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Diagnosis",
              selectedDiagnosis.map((diagnosis) => diagnosis.diagnosis || diagnosis),
            ),
          )
        }
        // Handle complaints with proper JSON parsing
        if (selectedComplaints && selectedComplaints.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Complaints",
              selectedComplaints.map((input) => {
                if (typeof input === "string") {
                  const parsed = safeParseJSON(input)
                  if (Array.isArray(parsed)) {
                    return parsed.map((c) => `${c.complaints} - Duration: ${c.duration} ${c.durationUnit}`).join(", ")
                  }
                  return input
                }
                const complaintText =
                  input.selectedComplaints?.map((complaint) => complaint.complaints).join(", ") ||
                  "No complaint provided"
                const duration = input.duration ? ` - Duration: ${input.duration} ${input.durationUnit || "N/A"}` : ""
                return `${complaintText}${duration}`
              }),
            ),
          )
        }
        // Handle findings
        if (selectedFindings && selectedFindings.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Findings",
              selectedFindings.map((findings) => findings.findings || findings),
            ),
          )
        }
        // Handle procedures with proper JSON parsing
        if (selectedProcedure && selectedProcedure.length > 0) {
          data = data.concat(
            createSubTableRows(
              "Procedures",
              selectedProcedure.map((p) => {
                if (typeof p === "string") {
                  return p
                }
                return `${p.selectedProcedures?.map((proc) => proc.procedure).join(", ")} - Date: ${p.selectedDate ? formatDate(new Date(p.selectedDate)) : "None"}`
              }),
            ),
          )
        }
        // Handle plans
        const validPlans = planDetails
          ? Object.entries(planDetails)
              .filter(([key, value]) => value && value.trim() !== "")
              .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
          : []
        if (validPlans.length > 0) {
          data.push(["Plans", validPlans.map((plan) => plan.split(":")[1]?.trim()).join("\n")])
        }
        // Handle tests - FIXED: Join all tests into single entry
        if (selectedTests && selectedTests.length > 0) {
          const allTests = selectedTests.map((test) => test.test || test).join(", ")
          data.push(["Tests", allTests])
        }
        // Handle next visit date
        if (selectedDate) {
          data.push(["Next Visit Date", selectedDate.toLocaleDateString()])
        }
        // Generate main table for all sections except prescription
        if (data.length > 0) {
          doc.autoTable({
            startY: currentY,
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
              minCellHeight: 8, // Reduced cell height
              overflow: "linebreak",
              tableWidth: "auto",
            },
            columnStyles: {
              0: { cellWidth: 50 }, // Reduced column width
              1: { cellWidth: usableWidth - 50 },
            },
            margin: { left: margin, right: margin, top: 20, bottom: signatureSpace },
            pageBreak: "auto",
            showHead: "everyPage",
            didDrawPage: (data) => {
              // Add background image to new pages
              if (data.pageNumber > 1) {
                doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
              }
              // Add doctor signature on every page
              addDoctorSignature(doc, data.pageNumber)
            },
          })
          currentY = doc.lastAutoTable.finalY + 10 // Reduced spacing
        }
        // Enhanced prescription parsing for multi-page support
        const formatPrescriptionForTable = (prescriptionData, isFromCurrentData = false) => {
          try {
            if (!prescriptionData) return []
            let prescriptions = []
            if (isFromCurrentData) {
              if (Array.isArray(prescriptionData)) {
                prescriptions = prescriptionData.map((input) => {
                  const times = ["M", "A", "E", "N"]
                    .map((time) => (input[time.toLowerCase()] ? time : ""))
                    .filter(Boolean)
                    .join(" ")
                  const medicineName = input.selectedPrescription?.map((p) => p.label).join(", ") || ""
                  const dosage = input.dosage || ""
                  const frequency = times || ""
                  const duration =
                    input.durationNumber && input.duration ? `${input.durationNumber} ${input.duration}` : ""
                  return {
                    medication: medicineName,
                    dosage: dosage,
                    frequency: frequency,
                    duration: duration,
                  }
                })
              }
            } else {
              if (typeof prescriptionData === "string") {
                const lines = prescriptionData.split("\n").filter((line) => line.trim() !== "")
                prescriptions = lines.map((line) => {
                  const parts = line.split(" - ")
                  let medication = "",
                    dosage = "",
                    frequency = "",
                    duration = ""
                  parts.forEach((part) => {
                    if (part.startsWith("Prescription:")) {
                      medication = part.replace("Prescription:", "").trim()
                    } else if (part.startsWith("Dosage:")) {
                      dosage = part.replace("Dosage:", "").trim()
                    } else if (part.startsWith("Duration:")) {
                      duration = part.replace("Duration:", "").trim()
                    } else if (part.match(/^[MAEN\s]+$/)) {
                      frequency = part.trim()
                    }
                  })
                  return { medication, dosage, frequency, duration }
                })
              }
            }
            return prescriptions
              .filter((p) => p.medication && p.medication.trim() !== "")
              .map((prescription, index) => [
                index + 1,
                prescription.medication.trim() || "-",
                prescription.dosage.trim() || "-",
                prescription.frequency.trim() || "-",
                prescription.duration.trim() || "-",
              ])
          } catch (error) {
            console.warn("Error formatting prescription:", error)
            return []
          }
        }
        // FIXED: Handle prescription section with better space management

      const validPrescriptions =
        prescriptionInputs?.filter(
          (input) => input.selectedPrescription?.length > 0 && input.selectedPrescription[0]?.label?.trim() !== "",
        ) || []

      if (validPrescriptions.length > 0) {
        const prescriptionTableData = formatPrescriptionForTable(validPrescriptions, true)
        
        if (prescriptionTableData.length > 0) {
          // Calculate available space and items per page
          const remainingSpace = pageHeight - currentY - signatureSpace
          const rowHeight = 12 // Estimated row height
          const headerHeight = 25 // Header space
          const maxRowsInCurrentPage = Math.floor((remainingSpace - headerHeight) / rowHeight)
          
          // Smart pagination logic
          const totalPrescriptions = prescriptionTableData.length
          let itemsPerPage = []
          
          if (totalPrescriptions <= 10) {
            // For 5-10 items, try to split optimally
            if (totalPrescriptions <= maxRowsInCurrentPage) {
              // All fit in current page
              itemsPerPage = [totalPrescriptions]
            } else {
              // Split across pages
              const firstPageItems = Math.min(maxRowsInCurrentPage, Math.ceil(totalPrescriptions / 2))
              const secondPageItems = totalPrescriptions - firstPageItems
              itemsPerPage = [firstPageItems, secondPageItems]
            }
          } else {
            // For more than 10 items, use larger chunks
            const maxItemsPerPage = 10
            let remaining = totalPrescriptions
            let currentPageCapacity = Math.min(maxRowsInCurrentPage, maxItemsPerPage)
            
            while (remaining > 0) {
              const itemsThisPage = Math.min(remaining, currentPageCapacity)
              itemsPerPage.push(itemsThisPage)
              remaining -= itemsThisPage
              currentPageCapacity = maxItemsPerPage // Full capacity for subsequent pages
            }
          }
          
          // Render prescription tables across pages
          let dataIndex = 0
          let pageNumber = 1
          let isFirstPrescriptionPage = true
          
          for (const itemsInThisPage of itemsPerPage) {
            // Check if we need a new page
            if (!isFirstPrescriptionPage || (pageNumber > 1)) {
              doc.addPage()
              doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
              currentY = 80
            }
            
            // Add prescription header
            doc.setFont("helvetica", "bold")
            doc.setFontSize(12)
            doc.setTextColor(40, 40, 40)
            
            if (isFirstPrescriptionPage) {
              doc.text("Prescription", margin, currentY)
            } else {
              doc.text(`Prescription`, margin, currentY)
            }
            currentY += 10
            
            // Get data for this page
            const pageData = prescriptionTableData.slice(dataIndex, dataIndex + itemsInThisPage)
            
            // Renumber the items for this page if it's a continuation
            const numberedPageData = pageData.map((row, index) => [
              dataIndex + index + 1, // Continue numbering from previous page
              row[1], // medication
              row[2], // dosage
              row[3], // frequency
              row[4]  // duration
            ])
            
            doc.autoTable({
              startY: currentY,
              head: [["#", "Medication", "Dosage", "Frequency", "Duration"]],
              body: numberedPageData,
              theme: "grid",
              headStyles: {
                fillColor: [76, 140, 115],
                textColor: [255, 255, 255],
                fontStyle: "bold",
                fontSize: 9,
              },
              bodyStyles: {
                fontSize: 8,
                textColor: [40, 40, 40],
                font: "helvetica",
              },
              styles: {
                cellWidth: "wrap",
                minCellHeight: 6,
                overflow: "linebreak",
                tableWidth: "auto",
              },
              columnStyles: {
                0: { cellWidth: 12, halign: "center" },
                1: { cellWidth: (usableWidth - 12) * 0.4 },
                2: { cellWidth: (usableWidth - 12) * 0.2 },
                3: { cellWidth: (usableWidth - 12) * 0.2 },
                4: { cellWidth: (usableWidth - 12) * 0.2 },
              },
              margin: { left: margin, right: margin, top: 10, bottom: signatureSpace },
              pageBreak: "avoid", // Prevent breaking within this table
              showHead: "everyPage",
              didDrawPage: (data) => {
                // Add background image to new pages
                if (data.pageNumber > 1) {
                  doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
                }
                // Add doctor signature on every page
                addDoctorSignature(doc, data.pageNumber)
              },
            })
            
            dataIndex += itemsInThisPage
            pageNumber++
            isFirstPrescriptionPage = false
          }
          
          // Update currentY for any content that might follow
          currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : currentY
        }
      }
        // FIXED: Ensure signature is always added to the last page
        const currentPageNumber = doc.internal.getNumberOfPages()
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY
        // If the final content is too close to signature area, add new page
        if (finalY > minSignatureY - 10) {
          doc.addPage()
          doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
          addDoctorSignature(doc, doc.internal.getNumberOfPages())
        } else {
          // Add signature to current page if not already added
          addDoctorSignature(doc, currentPageNumber)
        }
        // Generate filename
        const safeBranchCode = sanitizeFilename(branchCode || appointment?.branch_code || "Branch")
        const safePatientName = sanitizeFilename(patientName)
        const safePatientUID = sanitizeFilename(patientUID)
        const safeAppointmentDate = sanitizeFilename(appointmentDate.replace(/[-/]/g, "_"))
        const filename = `${safeBranchCode}_${safePatientName}_${safePatientUID}_${safeAppointmentDate}.pdf`
        const finalFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`
        doc.save(finalFilename)
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
  // NEW: Determine if save button should be disabled
  const isSaveDisabled = isSaved && !hasUnsavedChanges
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
                {vitalsLoaded ? (
                  <>
                    {!isEditingVitals ? (
                      <EditIcon onClick={handleVitalsEdit} title="Edit Vitals" />
                    ) : (
                      <VitalsEditContainer>
                        <EditButton onClick={handleVitalsSave} title="Save Vitals">
                          <FaSave />
                        </EditButton>
                        <EditButton onClick={handleVitalsCancel} title="Cancel">
                          <FaTimes />
                        </EditButton>
                      </VitalsEditContainer>
                    )}
                    <ProfileImage src={appointment.gender === "Male" ? male : female} alt="Profile" />
                    <PatientName className="mt-1">Name: {patientName}</PatientName>
                    <PatientText className="mt-1">Phone: {mobileNumber}</PatientText>
                    <PatientText className="mt-1">
                      Height:{" "}
                      {isEditingVitals ? (
                        <VitalInput
                          type="text"
                          value={editableVitals.height}
                          onChange={(e) => handleVitalsChange("height", e.target.value)}
                          placeholder="Height"
                        />
                      ) : (
                        <span style={{ color: vital?.height === "Unavailable" ? "#ffcccc" : "white" }}>
                          {vital?.height || "Unavailable"}
                        </span>
                      )}
                    </PatientText>
                    <PatientText className="mt-1">
                      Weight:{" "}
                      {isEditingVitals ? (
                        <VitalInput
                          type="text"
                          value={editableVitals.weight}
                          onChange={(e) => handleVitalsChange("weight", e.target.value)}
                          placeholder="Weight"
                        />
                      ) : (
                        <span style={{ color: vital?.weight === "Unavailable" ? "#ffcccc" : "white" }}>
                          {vital?.weight || "Unavailable"}
                        </span>
                      )}
                    </PatientText>
                    <PatientText className="mt-1">
                      Pulse Rate:{" "}
                      {isEditingVitals ? (
                        <VitalInput
                          type="text"
                          value={editableVitals.pulseRate}
                          onChange={(e) => handleVitalsChange("pulseRate", e.target.value)}
                          placeholder="Pulse Rate"
                        />
                      ) : (
                        <span style={{ color: vital?.pulseRate === "Unavailable" ? "#ffcccc" : "white" }}>
                          {vital?.pulseRate || "Unavailable"}
                        </span>
                      )}
                    </PatientText>
                    <PatientText className="mt-1">
                      Blood Pressure:{" "}
                      {isEditingVitals ? (
                        <VitalInput
                          type="text"
                          value={editableVitals.bloodPressure}
                          onChange={(e) => handleVitalsChange("bloodPressure", e.target.value)}
                          placeholder="Blood Pressure"
                        />
                      ) : (
                        <span style={{ color: vital?.bloodPressure === "Unavailable" ? "#ffcccc" : "white" }}>
                          {vital?.bloodPressure || "Unavailable"}
                        </span>
                      )}
                    </PatientText>
                    <PatientText className="mt-1">Purpose Of Visit: {appointment.purposeOfVisit}</PatientText>
                  </>
                ) : (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <PatientText style={{ textAlign: "center" }}>Loading vitals...</PatientText>
                  </div>
                )}
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
                            if (selected.length > 0) {
                              handlePrescriptionChange(index, "selectedPrescription", selected)
                            } else {
                              handlePrescriptionChange(index, "selectedPrescription", [])
                            }
                          }}
                          // Removed onInputChange as it was causing issues with typed values not being captured reliably.
                          // The onBlur handler below will capture typed values when the input loses focus.
                          onBlur={(e) => {
                            const typedText = e.target.value
                            const currentSelection = input.selectedPrescription
                            // If there's typed text AND it's not already in the selected state
                            if (
                              typedText &&
                              typedText.trim() !== "" &&
                              (!currentSelection || currentSelection.length === 0 || currentSelection[0].label !== typedText)
                            ) {
                              handlePrescriptionChange(index, "selectedPrescription", [{ label: typedText }])
                            } else if (typedText.trim() === "" && currentSelection.length > 0) {
                              // If the input is cleared, and there was a selection, clear it
                              handlePrescriptionChange(index, "selectedPrescription", [])
                            }
                          }}
                          selected={input.selectedPrescription || []}
                          allowNew={true}
                          newSelectionPrefix="Add custom medicine: "
                          renderMenuItemChildren={
                            !loadedPrescriptionIndices.has(index)
                              ? (option) => (
                                  <div>
                                    {option.label}
                                    {!option.customOption && getStockIndicator(option.stock)}
                                  </div>
                                )
                              : undefined
                          }
                        />
                        {!loadedPrescriptionIndices.has(index) &&
                          input.selectedPrescription &&
                          input.selectedPrescription.length > 0 && (
                            <div style={{ marginTop: "5px" }}>
                              {getMedicineStock(input.selectedPrescription[0].label) !== null ? (
                                getStockIndicator(getMedicineStock(input.selectedPrescription[0].label))
                              ) : (
                                <span style={{ fontSize: "10px", color: "#666" }}>Custom Medicine</span>
                              )}
                            </div>
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
                {/* NEW: Updated save button with disabled state and tooltip */}
                <button
                  disabled={isSaveDisabled}
                  onClick={handleSubmit}
                  title={isSaveDisabled ? "No changes to save" : "Save changes"}
                  style={{ float: "right", marginTop: "-40px" }}
                >
                  {isSaved && !hasUnsavedChanges ? "Saved" : "Save"}
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