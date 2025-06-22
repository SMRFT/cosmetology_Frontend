"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import styled from "styled-components"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { FaCalendarAlt, FaPlus, FaTrash } from "react-icons/fa"
import "bootstrap/dist/css/bootstrap.min.css"
import { Row, Col } from "react-bootstrap"
import jsPDF from "jspdf"
import "jspdf-autotable"
import PDFMain1 from "./images/PDF_Main_branch1.jpeg"
import PDFMain2 from "./images/PDF_Main_branch2.jpeg"
import { consumerItems } from "./constant"
import CreatableSelect from "react-select/creatable"
import { IoMdArrowRoundBack } from "react-icons/io"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const DatePickerWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  .react-datepicker-wrapper {
    width: 0;
    overflow: hidden;
  }

  .calendar-icon {
    margin-right: 10px;
    color: #C85C8E;
    cursor: pointer;
  }

  .date-display {
    font-size: 16px;
    color: #C85C8E;
    cursor: pointer;
    font-weight: 500;
  }
`

const PatientProcedureContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  gap: 20px;
  flex-wrap: wrap;
`

const PatientCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #d7cae2 0%, #c8b9d4 100%);
  color: #725F83;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  height: auto;
  width: fit-content;
  min-width: 250px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #c8b9d4 0%, #b8a5c7 100%);
  }

  .card-title {
    margin-bottom: 12px;
    font-size: 1.3em;
    font-weight: 600;
    text-transform: capitalize;
    letter-spacing: 0.5px;
    text-align: center;
  }

  .card-subtitle {
    margin-bottom: 18px;
    font-size: 1em;
    font-weight: 500;
    opacity: 0.8;
  }

  .btn {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-1px);
    }
  }

  .data-source {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.8;
    margin-top: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: ${(props) => (props.dataSource === "stored" ? "#28a745" : "#007bff")};
    color: white;
  }
`

const PatientContainer = styled.div`
  margin-bottom: 20px;
`

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  font-weight: 500;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const ProcedureNetContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const PaymentTypeContainer = styled.div`
  display: flex;
  align-items: center;
`

const PaymentTypeLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
`

const PaymentTypeInput = styled.select`
  padding: 8px;
  font-size: 16px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`

const ProcedureNetLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
`

const ProcedureNetInput = styled.input`
  padding: 8px;
  font-size: 16px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`

const EditableInput = styled.input`
  width: 100px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #9b85a8;
    box-shadow: 0 0 0 2px rgba(155, 133, 168, 0.2);
  }
`

const ConsumerNetContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const ConsumerNetLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
`

const ConsumerNetInput = styled.input`
  padding: 8px;
  font-size: 16px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`

const Container = styled.div`
  margin-top: 65px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ad97b4 0%, #9b85a8 100%);
`

const InfoText = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const PatientInfo = styled.div`
  flex: 1;
  
  div {
    margin-bottom: 5px;
    font-weight: 500;
    
    strong {
      font-weight: 600;
      margin-right: 8px;
    }
  }
`

const DoctorInfo = styled.div`
  flex: 1;
  text-align: right;
  
  div {
    font-weight: 500;
    
    strong {
      font-weight: 600;
    }
  }
`

const AddRowButton = styled.button`
  background-color: #9b85a8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  
  &:hover {
    background-color: #8a7497;
  }
`

const ProcedureSelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #9b85a8;
    box-shadow: 0 0 0 2px rgba(155, 133, 168, 0.2);
  }
`

const ConsultationSection = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #dee2e6;
`

const ConsultationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`

const ConsultationLabel = styled.label`
  font-weight: 500;
  margin-right: 10px;
`

const ConsultationInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 120px;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 15px;
`

const SectionTitle = styled.h4`
  font-weight: 600;
  margin: 0;
`

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #9b85a8;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    margin-top: 15px;
    font-size: 16px;
    color: #666;
    font-weight: 500;
  }
`

const NoDataMessage = styled.div`
  text-align: center;
  font-size: 18px;
  color: #888;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 20px 0;
  
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background-color: #9b85a8;
      color: white;
      font-weight: 600;
      text-align: center;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    td {
      text-align: center;
    }
  }
`

const ProcedureComponent = () => {
  // State declarations
  const [patients, setPatients] = useState([])
  const [detailedRecords, setDetailedRecords] = useState([])
  const [storedProcedureData, setStoredProcedureData] = useState([])
  const [freshProcedureData, setFreshProcedureData] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [consumerRecords, setConsumerRecords] = useState([])
  const [viewDetails, setViewDetails] = useState(false)
  const [procedureNetAmount, setProcedureNetAmount] = useState("0")
  const [consumerNetAmount, setConsumerNetAmount] = useState("0")
  const [totalAmount, setTotalAmount] = useState("0")
  const [PaymentType, setPaymentType] = useState("Card")
  const [consumerSection, setConsumerSection] = useState("Consumer")
  const [procedureSection, setProcedureSection] = useState("Procedure")
  const [branchCode, setBranchCode] = useState("")
  const [isDataFromStored, setIsDataFromStored] = useState(false)
  const [editableTotals, setEditableTotals] = useState({})
  const [proceduresList, setProceduresList] = useState([])
  const [additionalProcedures, setAdditionalProcedures] = useState([])
  const [consultationFee, setConsultationFee] = useState(0)
  const [showConsumerTable, setShowConsumerTable] = useState(false)
  const [savedProcedureBillingData, setSavedProcedureBillingData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasData, setHasData] = useState(true)

  const datePickerRef = useRef(null)
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  // Initialize branch code from localStorage
  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")
    if (code) {
      setBranchCode(code)
    } else {
      console.warn("Branch code not found in localStorage")
    }
  }, [])

  // Fetch procedures list on component mount
  useEffect(() => {
    fetchProceduresList()
  }, [])

  // Initialize with current date when branch code is available
  useEffect(() => {
    if (branchCode) {
      const currentDate = new Date()
      setSelectedDate(currentDate)
      fetchProcedureDataWithPriority(currentDate)
    }
  }, [branchCode])

  // Fetch saved procedure billing data when patient is selected
  useEffect(() => {
    if (selectedPatient && branchCode && selectedDate) {
      fetchSavedProcedureBillingData()
    }
  }, [selectedPatient, branchCode, selectedDate])

  // Update patient records when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      updateSelectedPatientRecords()
      // Reset consumer and additional procedure states
      setConsumerRecords([])
      setShowConsumerTable(false)
    } else {
      resetPatientData()
    }
  }, [selectedPatient, patients, storedProcedureData, freshProcedureData, isDataFromStored])

  // Calculate totals when relevant data changes
  useEffect(() => {
    calculateTotals()
  }, [detailedRecords, additionalProcedures, consumerRecords, consultationFee, editableTotals])

  // Fetch procedures list from API
  const fetchProceduresList = async () => {
    try {
      const response = await axios.get(`${Cosmetologybaseurl}Procedure/`)
      const formattedProceduresList = response.data.map((procedure, index) => ({
        id: procedure.id || `proc_${index}`,
        procedure: procedure.procedure || "",
      }))
      setProceduresList(formattedProceduresList)
    } catch (error) {
      console.error("Error fetching procedures data:", error)
      toast.error("Error fetching procedures data")
    }
  }

  // ENHANCED: Improved function to handle stored data fetching with better error handling
  const fetchProcedureDataWithPriority = async (date) => {
    if (!branchCode || !date) return

    setIsLoading(true)
    const formattedDate = format(date, "yyyy-MM-dd")

    try {
      // Step 1: Try to fetch stored data without patientUID first
      console.log("Checking for stored procedure data...")

      // First attempt: Try to get stored data for the date and branch only
      let storedResponse
      try {
        storedResponse = await fetch(
          `${Cosmetologybaseurl}get/stored/procedurebill/?appointmentDate=${formattedDate}&branch_code=${branchCode}`,
        )
      } catch (error) {
        console.log("Initial stored procedure data fetch failed, trying alternative approach...")
        storedResponse = null
      }

      let hasStoredData = false
      let storedPatients = []

      if (storedResponse && storedResponse.ok) {
        try {
          const storedData = await storedResponse.json()
          console.log("Raw stored data received:", storedData)

          if (storedData && Array.isArray(storedData) && storedData.length > 0) {
            // Transform stored data to match expected format
            storedPatients = transformStoredDataToPatientFormat(storedData)
            hasStoredData = true
            setIsDataFromStored(true)
          } else {
            console.log("No stored data found or empty array")
          }
        } catch (parseError) {
          console.error("Error parsing stored procedure data:", parseError)
        }
      }

      // Step 2: If we have stored data, use it exclusively
      if (hasStoredData && storedPatients.length > 0) {
        setPatients(storedPatients.map((patient) => ({ ...patient, dataSource: "stored" })))
        setStoredProcedureData(storedPatients)
        setFreshProcedureData([])
        setHasData(true)
        setIsDataFromStored(true)
        return // Exit early - don't fetch fresh data
      }

      setIsDataFromStored(false)

      try {
        const freshResponse = await axios.get(
          `${Cosmetologybaseurl}get_procedures_bill/?appointmentDate=${formattedDate}&branch_code=${branchCode}`,
        )

        if (
          freshResponse.data &&
          Array.isArray(freshResponse.data.detailedRecords) &&
          freshResponse.data.detailedRecords.length > 0
        ) {
          // Use fresh data
          setFreshProcedureData(freshResponse.data.detailedRecords)
          setPatients(freshResponse.data.detailedRecords.map((patient) => ({ ...patient, dataSource: "fresh" })))
          setStoredProcedureData([])
          setHasData(true)
        } else {
          // No data found at all
          setPatients([])
          setStoredProcedureData([])
          setFreshProcedureData([])
          setHasData(false)
          toast.info("No procedure data found for the selected date")
        }
      } catch (freshError) {
        console.error("Error fetching fresh procedure data:", freshError)
        setPatients([])
        setStoredProcedureData([])
        setFreshProcedureData([])
        setHasData(false)
        toast.warning("No procedure data available for the selected date")
      }
    } catch (error) {
      console.error("Error in fetchProcedureDataWithPriority:", error)
      setPatients([])
      setStoredProcedureData([])
      setFreshProcedureData([])
      setHasData(false)
      toast.error("Error fetching procedure data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ENHANCED: Transform stored data format to match expected patient format
  const transformStoredDataToPatientFormat = (storedData) => {
    return storedData.map((record) => {
      let procedures = []
      let consumer = []

      // Parse procedures JSON string - handle the exact format from your MongoDB
      try {
        if (record.procedures && typeof record.procedures === "string") {
          procedures = JSON.parse(record.procedures)
          console.log("Parsed procedures for", record.patientName, ":", procedures)
        } else if (Array.isArray(record.procedures)) {
          procedures = record.procedures
        }
      } catch (error) {
        console.error("Error parsing procedures JSON:", error, record.procedures)
        procedures = []
      }

      // Parse consumer JSON string - handle the exact format from your MongoDB
      try {
        if (record.consumer && typeof record.consumer === "string") {
          consumer = JSON.parse(record.consumer)
          console.log("Parsed consumer for", record.patientName, ":", consumer)
        } else if (Array.isArray(record.consumer)) {
          consumer = record.consumer
        }
      } catch (error) {
        console.error("Error parsing consumer JSON:", error, record.consumer)
        consumer = []
      }

      return {
        patientUID: record.patientUID,
        patientName: record.patientName,
        patient_handledby: record.patient_handledby,
        appointmentDate: record.appointmentDate,
        procedures: procedures,
        consumer: consumer,
        procedureNetAmount: record.procedureNetAmount || "0",
        consumerNetAmount: record.consumerNetAmount || "0",
        totalAmount:
          record.totalAmount ||
          (
            (Number.parseFloat(record.procedureNetAmount) || 0) + (Number.parseFloat(record.consumerNetAmount) || 0)
          ).toFixed(2),
        PaymentType: record.PaymentType || "Card",
        consumerBillNumber: record.consumerBillNumber,
        procedureBillNumber: record.procedureBillNumber,
        isStored: true,
        dataSource: "stored",
      }
    })
  }

  // Fetch saved procedure billing data for specific patient
  const fetchSavedProcedureBillingData = async () => {
    if (!selectedPatient || !branchCode || !selectedDate) return

    try {
      const response = await fetch(
        `${Cosmetologybaseurl}get/stored/procedurebill/?patientUID=${selectedPatient.patientUID}&appointmentDate=${format(selectedDate, "yyyy-MM-dd")}&branch_code=${branchCode}`,
      )

      if (response.ok) {
        const storedData = await response.json()
        if (storedData && storedData.table_data && storedData.table_data.length > 0) {
          setSavedProcedureBillingData(storedData.table_data)
          loadSavedProcedureBillingDetails(storedData)
        } else {
          setSavedProcedureBillingData([])
        }
      } else if (response.status === 204) {
        // No content found - this is expected when no saved data exists
        setSavedProcedureBillingData([])
        console.log("No saved procedure billing data found for this patient")
      } else {
        console.error("Error fetching saved procedure billing data:", response.status)
        setSavedProcedureBillingData([])
      }
    } catch (error) {
      console.error("Error fetching saved procedure billing data:", error)
      setSavedProcedureBillingData([])
    }
  }

  // Load saved procedure billing details into form
  const loadSavedProcedureBillingDetails = (storedData) => {
    setPaymentType(storedData.paymentType || "Card")
    setConsultationFee(storedData.consultationFee || 0)
    setProcedureNetAmount(storedData.procedureNetAmount || "0")
    setConsumerNetAmount(storedData.consumerNetAmount || "0")
    setTotalAmount(storedData.totalAmount || "0")

    // Parse table_data if it's a string
    let tableData = []
    try {
      if (typeof storedData.table_data === "string") {
        tableData = JSON.parse(storedData.table_data)
      } else if (Array.isArray(storedData.table_data)) {
        tableData = storedData.table_data
      }
    } catch (error) {
      console.error("Error parsing table_data:", error)
      tableData = []
    }

    // Load saved procedure items as additional procedures (excluding consultation fee)
    const savedProcedureRows = tableData
      .filter((item) => item.particulars !== "Consultation Fee" && item.section === "Procedure")
      .map((item, index) => ({
        id: `saved-proc-${index}`,
        procedure: item.particulars,
        quantity: item.qty,
        price: item.price,
        CGST_percentage: item.CGST_percentage !== "N/A" ? item.CGST_percentage : 0,
        CGST_value: item.CGST_value !== "N/A" ? item.CGST_value : 0,
        SGST_percentage: item.SGST_percentage !== "N/A" ? item.SGST_percentage : 0,
        SGST_value: item.SGST_value !== "N/A" ? item.SGST_value : 0,
        selected: true,
        total: item.total || (Number.parseFloat(item.price) * Number.parseFloat(item.qty)).toFixed(2),
        isSaved: true,
      }))

    // Load saved consumer items
    const savedConsumerRows = tableData
      .filter((item) => item.section === "Consumer")
      .map((item, index) => ({
        id: `saved-consumer-${index}`,
        particulars: item.particulars,
        quantity: item.qty,
        price: item.price,
        CGST_percentage: item.CGST_percentage !== "N/A" ? item.CGST_percentage : 0,
        CGST_value: item.CGST_value !== "N/A" ? item.CGST_value : 0,
        SGST_percentage: item.SGST_percentage !== "N/A" ? item.SGST_percentage : 0,
        SGST_value: item.SGST_value !== "N/A" ? item.SGST_value : 0,
        selected: true,
        total: item.total || (Number.parseFloat(item.price) * Number.parseFloat(item.qty)).toFixed(2),
        isSaved: true,
      }))

    setAdditionalProcedures(savedProcedureRows)
    setConsumerRecords(savedConsumerRows)

    // Show consumer table if there are consumer records
    if (savedConsumerRows.length > 0) {
      setShowConsumerTable(true)
    }
  }

  // ENHANCED: Update selected patient records based on data source
  const updateSelectedPatientRecords = () => {
    if (!selectedPatient) return

    console.log("Updating patient records for:", selectedPatient.patientName)
    console.log("Patient data source:", selectedPatient.dataSource)
    console.log("Patient procedures:", selectedPatient.procedures)

    // Prioritize stored data if available
    if (selectedPatient.dataSource === "stored" || selectedPatient.isStored) {
      // Use stored data - create proper structure for procedures display
      const transformedRecord = {
        patientUID: selectedPatient.patientUID,
        patientName: selectedPatient.patientName,
        patient_handledby: selectedPatient.patient_handledby,
        appointmentDate: selectedPatient.appointmentDate,
        procedures: selectedPatient.procedures || [],
        isStored: true,
      }

      setDetailedRecords([transformedRecord])

      // Also populate consumer records if they exist
      if (selectedPatient.consumer && selectedPatient.consumer.length > 0) {
        const transformedConsumerRecords = selectedPatient.consumer.map((item, index) => ({
          id: `stored-consumer-${index}`,
          item: item.item || item.particulars,
          qty: item.qty || item.quantity,
          price: item.price,
          total: item.total,
          isStored: true,
        }))
        setConsumerRecords(transformedConsumerRecords)
        setShowConsumerTable(true)
      }

      // Set the totals from stored data
      setProcedureNetAmount(selectedPatient.procedureNetAmount || "0")
      setConsumerNetAmount(selectedPatient.consumerNetAmount || "0")
      setTotalAmount(selectedPatient.totalAmount || "0")
      setPaymentType(selectedPatient.PaymentType || "Card")
    } else {
      // Use fresh data
      const freshPatientData = freshProcedureData.filter((record) => record.patientUID === selectedPatient.patientUID)
      if (freshPatientData.length > 0) {
        setDetailedRecords(freshPatientData)
      } else {
        setDetailedRecords([])
      }
    }
  }

  // Reset patient-related data
  const resetPatientData = () => {
    setDetailedRecords([])
    setConsumerRecords([])
    setAdditionalProcedures([])
    setConsultationFee(0)
    setShowConsumerTable(false)
    setSavedProcedureBillingData([])
  }

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedPatient(null) // Reset selected patient when date changes
    fetchProcedureDataWithPriority(date)
  }

  // Handle view patient details
  const handleViewClick = (patient) => {
    setSelectedPatient(patient)
    setViewDetails(true)
  }

  // Handle back button
  const handleBackClick = () => {
    setSelectedPatient(null)
    setViewDetails(false)
    resetPatientData()
  }

  // Handle payment type change
  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value)
  }

  // Enhanced save function with better error handling and validation
  const handleSave = async () => {
    if (!selectedPatient) {
      toast.error("No patient selected")
      return
    }

    try {
      const appointmentDate = detailedRecords[0]?.appointmentDate

      // Process detailed records procedures
      const proceduresWithoutPatientInfo = detailedRecords.flatMap(({ procedures }) => {
        return procedures.map((procedure, index) => {
          const key = `procedure-${index}`
          const price = Number.parseFloat(procedure.price) || 0
          const gst = Number.parseFloat(procedure.gst) || 0
          const total = editableTotals[key] ? Number.parseFloat(editableTotals[key]) : price + gst
          return {
            ...procedure,
            total: total.toFixed(2),
          }
        })
      })

      // Process additional procedures
      const additionalProceduresData = additionalProcedures
        .filter((procedure) => procedure.selected)
        .map((procedure) => {
          const key = `additional-${procedure.id}`
          const price = Number.parseFloat(procedure.price) || 0
          const gst = Number.parseFloat(procedure.gst) || 0
          const total = editableTotals[key] ? Number.parseFloat(editableTotals[key]) : price + gst
          return {
            procedure: procedure.procedure,
            procedureDate: procedure.procedureDate,
            price: price.toString(),
            gstRate: procedure.gstRate,
            gst: gst.toString(),
            total: total.toFixed(2),
          }
        })

      // Combine all procedures
      const allProcedures = [...proceduresWithoutPatientInfo, ...additionalProceduresData]

      // Add consultation fee if applicable
      if (consultationFee > 0) {
        allProcedures.push({
          procedure: "Consultation Fee",
          procedureDate: format(new Date(), "yyyy-MM-dd"),
          price: consultationFee.toString(),
          gstRate: 0,
          gst: "0",
          total: consultationFee.toFixed(2),
        })
      }

      // Prepare payload
      const payload = {
        patientName: selectedPatient.patientName,
        patientUID: selectedPatient.patientUID,
        patient_handledby: selectedPatient.patient_handledby || "N/A",
        procedures: allProcedures,
        consumer: consumerRecords,
        appointmentDate: appointmentDate,
        procedureNetAmount: procedureNetAmount,
        consumerNetAmount: consumerNetAmount,
        totalAmount: totalAmount,
        PaymentType,
        consumerSection,
        procedureSection,
        consultationFee: consultationFee,
        branch_code: branchCode,
        isFromStoredData: isDataFromStored,
      }

      // Send request
      const response = await axios.post(`${Cosmetologybaseurl}Post_Procedure_Bill/`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })

      toast.success(`Procedure bill generated successfully for ${selectedPatient.patientName}`)

      // Refresh the saved data after successful save
      await fetchSavedProcedureBillingData()
    } catch (error) {
      console.error("Error generating enhanced procedure bill:", error)
      toast.error("Error generating enhanced procedure bill")
    }
  }

  // Helper function to calculate totals
  const calculateTotals = () => {
    const procedureTotal = detailedRecords.reduce((sum, record) => {
      return (
        sum +
        record.procedures.reduce((procSum, procedure, index) => {
          const key = `procedure-${index}`
          const price = Number.parseFloat(procedure.price) || 0
          const gst = Number.parseFloat(procedure.gst) || 0
          const total = editableTotals[key] ? Number.parseFloat(editableTotals[key]) : price + gst
          return procSum + total
        }, 0)
      )
    }, 0)

    const additionalProcedureTotal = additionalProcedures
      .filter((proc) => proc.selected)
      .reduce((sum, proc) => {
        const key = `additional-${proc.id}`
        const price = Number.parseFloat(proc.price) || 0
        const gst = Number.parseFloat(proc.gst) || 0
        const total = editableTotals[key] ? Number.parseFloat(editableTotals[key]) : price + gst
        return sum + total
      }, 0)

    const consumerTotal = consumerRecords.reduce((sum, record) => {
      return sum + (Number.parseFloat(record.total) || 0)
    }, 0)

    const newProcedureNetAmount = (procedureTotal + additionalProcedureTotal + consultationFee).toFixed(2)
    const newConsumerNetAmount = consumerTotal.toFixed(2)
    const newTotalAmount = (Number.parseFloat(newProcedureNetAmount) + Number.parseFloat(newConsumerNetAmount)).toFixed(
      2,
    )

    setProcedureNetAmount(newProcedureNetAmount)
    setConsumerNetAmount(newConsumerNetAmount)
    setTotalAmount(newTotalAmount)
  }

  // Add new procedure row functionality
  const handleAddProcedureRow = () => {
    const newRowId = `additional-procedure-${Date.now()}`
    setAdditionalProcedures((prev) => [
      ...prev,
      {
        id: newRowId,
        procedure: "",
        selectedProcedureId: "",
        procedureDate: format(new Date(), "yyyy-MM-dd"),
        price: "",
        gstRate: 18,
        gst: "",
        selected: true,
      },
    ])
  }

  // Delete procedure row functionality
  const handleDeleteProcedureRow = (rowId) => {
    const rowToDelete = additionalProcedures.find((row) => row.id === rowId)
    if (rowToDelete && !rowToDelete.isSaved) {
      setAdditionalProcedures((prev) => prev.filter((row) => row.id !== rowId))
    } else {
      toast.warning("Cannot delete saved procedure data. Please remove it from the database first.")
    }
  }

  // Handle procedure selection from dropdown
  const handleProcedureSelect = (rowId, selectedValue) => {
    if (!selectedValue) {
      setAdditionalProcedures((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? {
                ...row,
                procedure: "",
                selectedProcedureId: "",
              }
            : row,
        ),
      )
      return
    }

    const selectedProcedure = proceduresList.find((proc) => proc.id.toString() === selectedValue.toString())

    if (selectedProcedure) {
      setAdditionalProcedures((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? {
                ...row,
                procedure: selectedProcedure.procedure,
                selectedProcedureId: selectedProcedure.id,
              }
            : row,
        ),
      )
    }
  }

  // Update additional procedure data with auto GST calculation
  const handleAdditionalProcedureChange = (rowId, field, value) => {
    setAdditionalProcedures((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value }

          // Recalculate GST when price or gstRate changes
          if (field === "price" || field === "gstRate") {
            const price = Number.parseFloat(field === "price" ? value : row.price) || 0
            const gstRate = Number.parseFloat(field === "gstRate" ? value : row.gstRate) || 0
            updatedRow.gst = calculateGST(price, gstRate)
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  const handlePriceChange = (index, newPrice) => {
    const updatedRecords = [...detailedRecords]
    const price = Number.parseFloat(newPrice)
    updatedRecords.forEach((record) => {
      if (record.procedures[index]) {
        record.procedures[index].price = isNaN(price) ? "" : Math.round(price)
        record.procedures[index].gst = calculateGST(Math.round(price), record.procedures[index].gstRate)
      }
    })
    setDetailedRecords(updatedRecords)
  }

  // Enhanced total change with editable functionality for both existing and additional procedures
  const handleTotalChange = (index, newTotal, isAdditional = false, rowId = null) => {
    let key
    if (isAdditional && rowId) {
      key = `additional-${rowId}`
    } else {
      key = `procedure-${index}`
    }

    setEditableTotals((prev) => ({
      ...prev,
      [key]: newTotal,
    }))

    if (!isAdditional) {
      // Reverse calculate price from total for existing procedures
      const updatedRecords = [...detailedRecords]
      const total = Number.parseFloat(newTotal)

      updatedRecords.forEach((record) => {
        if (record.procedures[index]) {
          const gstRate = record.procedures[index].gstRate || 0
          const gst = (total * gstRate) / (100 + gstRate)
          const price = total - gst
          record.procedures[index].price = isNaN(price) ? "" : price.toFixed(2)
          record.procedures[index].gst = isNaN(gst) ? "" : gst.toFixed(2)
        }
      })
      setDetailedRecords(updatedRecords)
    }
  }

  // Enhanced total change specifically for additional procedures
  const handleAdditionalTotalChange = (rowId, newTotal) => {
    handleTotalChange(null, newTotal, true, rowId)

    // Reverse calculate price from total for additional procedures
    const total = Number.parseFloat(newTotal)
    setAdditionalProcedures((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const gstRate = row.gstRate || 0
          const gst = (total * gstRate) / (100 + gstRate)
          const price = total - gst
          return {
            ...row,
            price: isNaN(price) ? "" : price.toFixed(2),
            gst: isNaN(gst) ? "" : gst.toFixed(2),
          }
        }
        return row
      }),
    )
  }

  const handleGstRateChange = (index, newGstRate) => {
    const updatedRecords = [...detailedRecords]
    const gstRate = Number.parseFloat(newGstRate)
    updatedRecords.forEach((record) => {
      if (record.procedures[index]) {
        record.procedures[index].gstRate = isNaN(gstRate) ? 0 : gstRate
        record.procedures[index].gst = calculateGST(record.procedures[index].price, gstRate)
      }
    })
    setDetailedRecords(updatedRecords)
  }

  const calculateGST = (price, gstRate) => {
    return price && gstRate ? ((price * gstRate) / 100).toFixed(2) : "0"
  }

  const calculateTotal = (price, gst) => {
    return price && gst ? Math.round(Number.parseFloat(price) + Number.parseFloat(gst)).toString() : "0"
  }

const consumerOptions = consumerItems.map((item) => ({
  value: item,
  label: item,
}));

  const handleConsumerChange = (index, field, value) => {
    setConsumerRecords((prevRecords) => {
      const updatedRecords = [...prevRecords]
      if (field === "item") {
        updatedRecords[index][field] = value
      } else {
        updatedRecords[index][field] = value
      }

      if (field === "qty" || field === "price") {
        const qty = Number.parseFloat(updatedRecords[index].qty)
        const price = Number.parseFloat(updatedRecords[index].price)
        updatedRecords[index].total = !isNaN(qty) && !isNaN(price) ? (qty * price).toFixed(2) : "0"
      }

      return updatedRecords
    })
  }

  const handleSelectChange = (selectedOption, index) => {
    const newRecords = [...consumerRecords]
    newRecords[index].item = selectedOption ? selectedOption.value : ""
    setConsumerRecords(newRecords)
  }

  const handleShowConsumerTable = () => {
    setShowConsumerTable(true)
    if (consumerRecords.length === 0) {
      setConsumerRecords([{ item: "", qty: "", price: "", total: "" }])
    }
  }

  const addConsumerRow = () => {
    setConsumerRecords((prevRecords) => [...prevRecords, { item: "", qty: "", price: "", total: "" }])
  }

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

  const handleDownload = () => {
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const backgroundImageMap = {
      SCC001: PDFMain1,
      SCC002: PDFMain2,
    }
    const PDFMain = backgroundImageMap[branchCode] || PDFMain1

    convertToBase64(PDFMain, (mainImage) => {
      doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)

      // ✨ Header
      const startY = 85
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(30, 30, 30)
      doc.text(`Patient Name:`, 16, startY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(13)
      doc.text(`${selectedPatient.patientName.toUpperCase()}`, 60, startY)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text(`Patient UID:`, 16, startY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(13)
      doc.text(`${selectedPatient.patientUID}`, 60, startY + 8)

      let yOffset = startY + 20

      // 🧾 Procedure Table
      const allProcedureTable = []

      if (detailedRecords.length > 0 || additionalProcedures.some((p) => p.selected)) {
        const existingProcedureTable = detailedRecords.flatMap((record) =>
          record.procedures.map((procedure, index) => {
            const key = `procedure-${index}`
            const total =
              editableTotals[key] || calculateTotal(procedure.price, calculateGST(procedure.price, procedure.gstRate))
            return [
              procedure.procedure,
              procedure.procedureDate,
              `${procedure.price}`,
              `${procedure.gstRate}%`,
              `${calculateGST(procedure.price, procedure.gstRate)}`,
              total,
            ]
          }),
        )

        const additionalProcedureTable = additionalProcedures
          .filter((procedure) => procedure.selected)
          .map((procedure) => {
            const key = `additional-${procedure.id}`
            const total = editableTotals[key] || calculateTotal(procedure.price, procedure.gst)
            return [
              procedure.procedure,
              procedure.procedureDate,
              `${procedure.price}`,
              `${procedure.gstRate}%`,
              `${procedure.gst}`,
              total,
            ]
          })

        allProcedureTable.push(...existingProcedureTable, ...additionalProcedureTable)

        doc.autoTable({
          head: [["Procedure", "Procedure Date", "Price", "GST Rate (%)", "GST", "Total"]],
          body: allProcedureTable,
          startY: yOffset,
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
          margin: { left: 14, right: 14 },
        })

        yOffset = doc.lastAutoTable.finalY + 10
      }

      // 🍽️ Consumer Table
      if (consumerRecords.length > 0 && consumerRecords.some((record) => record.item)) {
        const consumerTable = consumerRecords
          .filter((record) => record.item)
          .map((record) => [record.item, record.qty, `${record.price}`, `${record.total}`])

        if (consumerTable.length > 0) {
          doc.autoTable({
            head: [["Item", "Qty", "Price", "Total"]],
            body: consumerTable,
            startY: yOffset,
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
            margin: { left: 14, right: 14 },
          })

          yOffset = doc.lastAutoTable.finalY + 10
        }
      }

      // 💵 Separate Consultation Fee (if applicable)
      if (consultationFee > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.setTextColor(33, 33, 33)
        doc.text("Consultation Fee", 14, yOffset)
        doc.text(":", 80, yOffset)
        doc.text(`Rs. ${consultationFee.toFixed(2)}`, 85, yOffset)
        yOffset += 8
      }

      // ✅ Final Total
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(0, 100, 0)
      doc.text(`Net Total: Rs. ${totalAmount}`, 14, yOffset + 5)

      // 📁 Save
      doc.save(`${selectedPatient.patientName}_Bill.pdf`)
    })
  }

  return (
    <Container className="container">
      <ToastContainer position="top-right" autoClose={5000} />
      <h3 className="text-center mb-4">Procedure Bill</h3>
      {selectedPatient && (
        <button onClick={handleBackClick}>
          <IoMdArrowRoundBack />
        </button>
      )}
      {viewDetails ? (
        <div>
          <div>
            {selectedPatient ? (
              <InfoContainer className="mt-2">
                <InfoText>
                  <PatientInfo>
                    <div>
                      <strong>Name:</strong> {selectedPatient.patientName}
                    </div>
                    <div>
                      <strong>PatientUID:</strong> {selectedPatient.patientUID}
                    </div>
                  </PatientInfo>
                  <DoctorInfo>
                    <div>
                      <strong>Doctor Name:</strong> {selectedPatient.patient_handledby || "N/A"}
                    </div>
                  </DoctorInfo>
                </InfoText>
              </InfoContainer>
            ) : null}
          </div>
          <br />
          <div>
            {(detailedRecords.length > 0 || additionalProcedures.length > 0) && (
              <>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 style={{ fontWeight: "600" }}>
                    Procedures
                  </h4>
                  <AddRowButton onClick={handleAddProcedureRow}>
                    <FaPlus /> Add Procedure
                  </AddRowButton>
                </div>

                <TableContainer>
                  <table>
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Procedure</th>
                        <th>Procedure Date</th>
                        <th>Price</th>
                        <th>GST Rate (%)</th>
                        <th>GST</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* ENHANCED: Display stored procedures properly */}
                      {isDataFromStored &&
                        detailedRecords.map((record, recordIndex) => {
                          return record.procedures.map((procedure, index) => {
                            const key = `stored-procedure-${recordIndex}-${index}`

                            // For stored data, use the values directly from the stored procedure
                            const procedureName = procedure.procedure || "N/A"
                            const procedureDate = procedure.procedureDate || "N/A"
                            const price = procedure.price || "0"
                            const gstRate = procedure.gstRate || 0
                            const gst = procedure.gst || "0"
                            const total = procedure.total || "0"

                            return (
                              <tr key={key}>
                                <td>
                                  <input type="checkbox" checked disabled />
                                </td>
                                <td>{procedureName}</td>
                                <td>{procedureDate}</td>
                                <td>
                                  <EditableInput
                                    type="text"
                                    value={price}
                                    onChange={(e) => handlePriceChange(index, e.target.value)}
                                    placeholder="Enter price"
                                  />
                                </td>
                                <td>
                                  <EditableInput
                                    type="text"
                                    value={gstRate}
                                    onChange={(e) => handleGstRateChange(index, e.target.value)}
                                    placeholder="Enter GST rate"
                                  />
                                </td>
                                <td>{gst}</td>
                                <td>
                                  <EditableInput
                                    type="text"
                                    value={editableTotals[key] || total}
                                    onChange={(e) => handleTotalChange(index, e.target.value)}
                                    placeholder="Enter total"
                                  />
                                </td>
                              </tr>
                            )
                          })
                        })}

                      {/* Fresh data procedures - only show if NOT using stored data */}
                      {!isDataFromStored &&
                        detailedRecords.map((record, recordIndex) => {
                          return record.procedures.map((procedure, index) => {
                            const key = `procedure-${index}`
                            const gst = calculateGST(procedure.price, procedure.gstRate)
                            const total = editableTotals[key] || calculateTotal(procedure.price, gst)

                            return (
                              <tr key={`${recordIndex}-${index}`}>
                                <td>
                                  <input type="checkbox" checked disabled />
                                </td>
                                <td>{procedure.procedure}</td>
                                <td>{procedure.procedureDate}</td>
                                <td>
                                  <EditableInput
                                    type="text"
                                    value={procedure.price}
                                    onChange={(e) => handlePriceChange(index, e.target.value)}
                                    placeholder="Enter price"
                                  />
                                </td>
                                <td>
                                  <EditableInput
                                    type="text"
                                    value={procedure.gstRate}
                                    onChange={(e) => handleGstRateChange(index, e.target.value)}
                                    placeholder="Enter GST rate"
                                  />
                                </td>
                                <td>{gst}</td>
                                <td>
                                  <EditableInput
                                    type="text"
                                    value={total}
                                    onChange={(e) => handleTotalChange(index, e.target.value)}
                                    placeholder="Enter total"
                                  />
                                </td>
                                <td>-</td>
                              </tr>
                            )
                          })
                        })}

                      {/* Additional procedures with editable totals */}
                      {additionalProcedures.map((procedure) => {
                        const key = `additional-${procedure.id}`
                        const calculatedTotal = calculateTotal(procedure.price, procedure.gst)
                        const displayTotal = editableTotals[key] || calculatedTotal

                        return (
                          <tr key={procedure.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={procedure.selected}
                                onChange={(e) =>
                                  handleAdditionalProcedureChange(procedure.id, "selected", e.target.checked)
                                }
                              />
                            </td>
                            <td>
                              <ProcedureSelect
                                value={procedure.selectedProcedureId || ""}
                                onChange={(e) => handleProcedureSelect(procedure.id, e.target.value)}
                              >
                                <option value="">Select Procedure...</option>
                                {proceduresList.map((proc) => (
                                  <option key={proc.id} value={proc.id}>
                                    {proc.procedure}
                                  </option>
                                ))}
                              </ProcedureSelect>
                            </td>
                            <td>
                              <input
                                type="date"
                                value={procedure.procedureDate}
                                onChange={(e) =>
                                  handleAdditionalProcedureChange(procedure.id, "procedureDate", e.target.value)
                                }
                                className="form-control"
                              />
                            </td>
                            <td>
                              <EditableInput
                                type="text"
                                value={procedure.price}
                                onChange={(e) => handleAdditionalProcedureChange(procedure.id, "price", e.target.value)}
                                placeholder="Enter price"
                              />
                            </td>
                            <td>
                              <EditableInput
                                type="number"
                                value={procedure.gstRate}
                                onChange={(e) =>
                                  handleAdditionalProcedureChange(procedure.id, "gstRate", e.target.value)
                                }
                                placeholder="GST rate"
                              />
                            </td>
                            <td>{procedure.gst}</td>
                            <td>
                              <EditableInput
                                type="text"
                                value={displayTotal}
                                onChange={(e) => handleAdditionalTotalChange(procedure.id, e.target.value)}
                                placeholder="Enter total"
                              />
                            </td>
                            <td>
                              <FaTrash
                                style={{
                                  cursor: procedure.isSaved ? "not-allowed" : "pointer",
                                  color: procedure.isSaved ? "#ccc" : "#dc3545",
                                }}
                                onClick={() => handleDeleteProcedureRow(procedure.id)}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </TableContainer>

                {/* Consultation Fee Section */}
                <ConsultationSection>
                  <h5>Consultation Fee</h5>
                  <ConsultationRow>
                    <ConsultationLabel>Consultation Fee:</ConsultationLabel>
                    <ConsultationInput
                      type="text"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number.parseFloat(e.target.value) || 0)}
                      placeholder="Enter consultation fee"
                    />
                  </ConsultationRow>
                </ConsultationSection>

                <br />
                <ProcedureNetContainer>
                  <ProcedureNetLabel htmlFor="Net">Net Amount:</ProcedureNetLabel>
                  <ProcedureNetInput
                    type="text"
                    id="Net"
                    value={procedureNetAmount}
                    onChange={(e) => setProcedureNetAmount(e.target.value)}
                  />
                </ProcedureNetContainer>

                {/* Consumer section with conditional rendering */}
                <SectionHeader>
                  <SectionTitle>Consumable Bill</SectionTitle>
                  {!showConsumerTable ? (
                    <AddRowButton onClick={handleShowConsumerTable}>
                      <FaPlus /> Add Consumer Items
                    </AddRowButton>
                  ) : (
                    <AddRowButton onClick={addConsumerRow}>
                      <FaPlus /> Add Row
                    </AddRowButton>
                  )}
                </SectionHeader>

                {/* Only show consumer table if showConsumerTable is true */}
                {showConsumerTable && (
                  <>
                    <TableContainer>
                      <table>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consumerRecords.map((record, index) => (
                            <tr key={index}>
                    <td>
      <CreatableSelect
        options={consumerOptions}
        isClearable
        isSearchable
        onChange={(selectedOption) => handleSelectChange(selectedOption, index)}
        value={
          record?.item
            ? consumerOptions.find((option) => option.value === record.item) || {
                value: record.item,
                label: record.item,
              }
            : null
        }
        placeholder="Select or enter item"
      />
    </td>
                              <td>
                                <input
                                  type="text"
                                  value={record.qty}
                                  onChange={(e) => handleConsumerChange(index, "qty", e.target.value)}
                                  className="form-control"
                                  placeholder="Enter quantity"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={record.price}
                                  onChange={(e) => handleConsumerChange(index, "price", e.target.value)}
                                  className="form-control"
                                  placeholder="Enter price"
                                />
                              </td>
                              <td>{record.total}</td>
                              <td>
                                <FaTrash
                                  onClick={() => {
                                    setConsumerRecords((prevRecords) => prevRecords.filter((_, i) => i !== index))
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableContainer>
                    <br />
                    <ConsumerNetContainer>
                      <ConsumerNetLabel htmlFor="Net">Net Amount:</ConsumerNetLabel>
                      <ConsumerNetInput
                        type="text"
                        id="Net"
                        value={consumerNetAmount}
                        onChange={(e) => setConsumerNetAmount(e.target.value)}
                      />
                    </ConsumerNetContainer>
                  </>
                )}

                <FlexRow>
                  <ProcedureNetLabel htmlFor="Total">Total Amount:</ProcedureNetLabel>
                  <ProcedureNetInput type="text" id="Total" value={totalAmount} readOnly />
                </FlexRow>

                <PaymentTypeContainer>
                  <PaymentTypeLabel>Payment Type : </PaymentTypeLabel>
                  <PaymentTypeInput value={PaymentType} onChange={handlePaymentTypeChange}>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </PaymentTypeInput>
                </PaymentTypeContainer>
                <div className="d-flex flex-column align-items-center mt-4">
                  <Row className="g-3">
                    <Col xs="auto">
                      <button onClick={handleSave}>Save</button>
                    </Col>
                    <Col xs="auto">
                      <button onClick={handleDownload}>Download as PDF</button>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <center>
            <br />
            <DatePickerWrapper>
              <FaCalendarAlt className="calendar-icon" onClick={() => datePickerRef.current.setFocus()} />
              <div className="date-display" onClick={() => datePickerRef.current.setFocus()}>
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Select a date"}
              </div>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="form-control"
                ref={datePickerRef}
              />
            </DatePickerWrapper>
          </center>
          <br />
          <PatientProcedureContainer>
            {isLoading ? (
              <LoadingSpinner>
                <div className="spinner"></div>
                <p>Loading procedure data...</p>
              </LoadingSpinner>
            ) : patients.length > 0 ? (
              patients.map((patient, index) => (
                <PatientContainer key={index}>
                  <PatientCard dataSource={patient.dataSource} onClick={() => handleViewClick(patient)}>
                    <div className="card-title">{patient.patientName}</div>
                    <div className="card-subtitle">{patient.patientUID}</div>
                    <button style={{ fontSize: "0.9rem" }}>View Procedure</button>
                  </PatientCard>
                  <br />
                </PatientContainer>
              ))
            ) : (
              <NoDataMessage>
                {!hasData ? "No procedure data available for the selected date" : "Loading..."}
              </NoDataMessage>
            )}
          </PatientProcedureContainer>
        </div>
      )}
    </Container>
  )
}

export default ProcedureComponent
