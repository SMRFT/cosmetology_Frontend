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
 text-align: center;
 border-bottom: 1px solid #ddd;
 overflow: visible;
 }

 th {
 background-color: #9b85a8;
 color: white;
 font-weight: 600;
 }

 tr {
 overflow: visible;
 }

 tr:hover {
 background-color: #f5f5f5;
 }
 }
`

const DataSourceBadge = styled.span`
 background-color: ${(props) => (props.dataSource === "Billed" ? "#28a745" : "#007bff")};
 color: white;
 padding: 4px 8px;
 border-radius: 4px;
 font-size: 12px;
 font-weight: 500;
 margin-left: 10px;
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

const BackButton = styled.button`
 background-color: #9b85a8;
 color: white;
 border: none;
 padding: 10px 15px;
 border-radius: 8px;
 cursor: pointer;
 display: flex;
 align-items: center;
 gap: 8px;
 margin-bottom: 20px;
 font-size: 16px;
 transition: all 0.2s ease;

 &:hover {
 background-color: #8a7497;
 transform: translateY(-1px);
 }
`

const ActionButton = styled.button`
 background-color:rgb(183, 129, 208);
 color: white;
 border: none;
 padding: 8px 16px;
 border-radius: 4px;
 cursor: pointer;
 margin: 0 5px;
 transition: all 0.2s ease;

 &:hover {
 background-color:rgb(161, 54, 197);
 }

 &:disabled {
 background-color:rgb(166, 149, 184);
 cursor: not-allowed;
 }
`

const ProcedureComponent = () => {
 // State declarations
 const [patients, setPatients] = useState([])
 const [selectedDate, setSelectedDate] = useState(null)
 const [selectedPatient, setSelectedPatient] = useState(null)
 const [viewDetails, setViewDetails] = useState(false)
 const [procedureData, setProcedureData] = useState([])
 const [consumerData, setConsumerData] = useState([])
 const [procedureNetAmount, setProcedureNetAmount] = useState("0")
 const [consumerNetAmount, setConsumerNetAmount] = useState("0")
 const [totalAmount, setTotalAmount] = useState("0")
 const [PaymentType, setPaymentType] = useState("Card")
 const [branchCode, setBranchCode] = useState("")
 const [dataSource, setDataSource] = useState("")
 const [isLoading, setIsLoading] = useState(false)
 const [hasData, setHasData] = useState(true)
 const [proceduresList, setProceduresList] = useState([])
 const [additionalProcedures, setAdditionalProcedures] = useState([])
 const [consultationFee, setConsultationFee] = useState(0)
 const [showConsumerTable, setShowConsumerTable] = useState(false)

 const datePickerRef = useRef(null)
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

 // Initialize branch code from localStorage
 useEffect(() => {
 const code = localStorage.getItem("selectedBranch")
 if (code) {
 setBranchCode(code)
 } else {
 console.warn("Branch code not found in localStorage")
 toast.error("Branch code not found. Please select a branch.")
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
 fetchPatientList(currentDate)
 }
 }, [branchCode])

 // Calculate totals when data changes
 useEffect(() => {
 calculateTotals()
 }, [procedureData, additionalProcedures, consumerData, consultationFee])

 // Enhanced function to check if proceduresList data is present and valid
 const hasProceduresListData = (proceduresList) => {
 if (!proceduresList) return false

 // Handle string data
 if (typeof proceduresList === "string") {
 const cleanProceduresList = proceduresList.trim().toLowerCase()
 // Check for empty, null, undefined, or N/A values
 if (
 cleanProceduresList === "" ||
 cleanProceduresList === "n/a" ||
 cleanProceduresList === "null" ||
 cleanProceduresList === "undefined" ||
 cleanProceduresList === "[]" ||
 cleanProceduresList === "{}"
 ) {
 return false
 }

 // Check if it contains actual procedure data
 return cleanProceduresList.includes("procedure:") || cleanProceduresList.length > 5 // Basic content check
 }

 // Handle array data
 if (Array.isArray(proceduresList)) {
 return (
 proceduresList.length > 0 &&
 proceduresList.some(
 (item) => item && typeof item === "object" && item.procedure && item.procedure.trim() !== "",
 )
 )
 }

 // Handle object data
 if (typeof proceduresList === "object" && proceduresList !== null) {
 return Object.keys(proceduresList).length > 0
 }

 return false
 }

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

 // Fetch patient list from summary API - only patients with proceduresList data
 const fetchPatientList = async (date) => {
 if (!branchCode || !date) return

 setIsLoading(true)
 const formattedDate = format(date, "yyyy-MM-dd")

 try {
 const response = await axios.get(`${Cosmetologybaseurl}summary/post/`, {
 params: {
 appointmentDate: formattedDate,
 branch_code: branchCode,
 },
 })

 if (response.data && Array.isArray(response.data) && response.data.length > 0) {
 // Filter patients to only include those with proceduresList data
 const patientsWithProcedures = response.data.filter((patient) => hasProceduresListData(patient.proceduresList))

 if (patientsWithProcedures.length > 0) {
 setPatients(patientsWithProcedures)
 setHasData(true)
 console.log("Found patients with procedures data:", patientsWithProcedures.length, "patients")
 toast.success(`Found ${patientsWithProcedures.length} patients with procedure data`)
 } else {
 setPatients([])
 setHasData(false)
 toast.info("No patients with procedures data found for the selected date")
 }
 } else {
 setPatients([])
 setHasData(false)
 toast.info("No patient data found for the selected date")
 }
 } catch (error) {
 console.error("Error fetching patient list:", error)
 setPatients([])
 setHasData(false)
 toast.error("Error fetching patient data. Please try again.")
 } finally {
 setIsLoading(false)
 }
 }

 // Enhanced fetch procedure data function
 const fetchPatientProcedureData = async (patient) => {
 if (!patient || !branchCode) return

 setIsLoading(true)
 const formattedDate = format(selectedDate, "yyyy-MM-dd")

 try {
 const response = await axios.get(`${Cosmetologybaseurl}get_patient_procedurebill_data/`, {
 params: {
 patientUID: patient.patientUID,
 appointmentDate: formattedDate,
 branch_code: branchCode,
 },
 })

 console.log("Full API Response:", response.data)

 if (response.data) {
 // Check if it's stored procedure bill data (has procedures array directly)
 if (response.data.procedures && Array.isArray(response.data.procedures)) {
 console.log("Found stored procedure data")
 handleStoredProcedureData(response.data)
 setDataSource("Billed")
 toast.success("Loaded stored procedure data")
 }
 // Check if it has detailedRecords with procedures
 else if (response.data.detailedRecords && Array.isArray(response.data.detailedRecords)) {
 console.log("Found detailedRecords data:", response.data.detailedRecords)
 handleDetailedRecordsData(response.data)
 setDataSource("Summary")
 toast.success("Loaded procedure data from detailed records")
 }
 // Check if it has proceduresList string data
 else if (response.data.proceduresList && hasProceduresListData(response.data.proceduresList)) {
 console.log("Found proceduresList data")
 handleSummaryProcedureData(response.data)
 setDataSource("Summary")
 toast.info("Using procedure data from summary")
 }
 // Fallback to patient's original proceduresList
 else {
 console.log("No specific procedure data found, using patient summary data")
 handleSummaryProcedureData(patient)
 setDataSource("Summary")
 toast.info("Using procedure data from patient summary")
 }
 } else {
 // Fallback to summary data
 handleSummaryProcedureData(patient)
 setDataSource("Summary")
 toast.info("Using procedure data from summary")
 }
 } catch (error) {
 console.error("Error fetching procedure data:", error)
 // Fallback to summary data on error
 handleSummaryProcedureData(patient)
 setDataSource("Summary")
 toast.warning("Using summary data due to API error")
 } finally {
 setIsLoading(false)
 }
 }

 // NEW: Handle detailedRecords data structure
 const handleDetailedRecordsData = (data) => {
 try {
 console.log("Processing detailedRecords:", data.detailedRecords)
 const allProcedures = []

 // Process each detailed record
 data.detailedRecords.forEach((record, recordIndex) => {
 console.log(`Processing record ${recordIndex}:`, record)

 if (record.procedures && Array.isArray(record.procedures)) {
 record.procedures.forEach((procedure, procedureIndex) => {
 console.log(`Processing procedure ${procedureIndex}:`, procedure)

 // Convert date from DD/MM/YYYY to YYYY-MM-DD if needed
 let formattedDate = procedure.procedureDate || format(new Date(), "yyyy-MM-dd")
 if (formattedDate && formattedDate.includes("/")) {
 const [day, month, year] = formattedDate.split("/")
 if (day && month && year) {
 formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
 }
 }

 allProcedures.push({
 id: `detailed-proc-${recordIndex}-${procedureIndex}`,
 procedure: procedure.procedure || "Unknown Procedure",
 procedureDate: formattedDate,
 price: "0", // Will be filled by user
 gstRate: "18", // Default GST rate
 gst: "0",
 total: "0",
 selected: true, // Auto-select for detailed records
 isStored: false,
 })
 })
 }
 })
 if (consultationFee > 0) {
 allProcedures.push({
 particulars: "Consultation Fee",
 qty: 1,
 price: consultationFee,
 total: consultationFee.toFixed(2),
 gstRate: "18",
 gst: "0",
 })
 }
 console.log("Final procedures from detailedRecords:", allProcedures)

 setProcedureData(allProcedures)
 setConsumerData([])
 setProcedureNetAmount("0")
 setConsumerNetAmount("0")
 setTotalAmount("0")
 setPaymentType("Card")
 setConsultationFee(0)
 setShowConsumerTable(false)

 if (allProcedures.length > 0) {
 toast.success(`Loaded ${allProcedures.length} procedures from detailed records`)
 } else {
 toast.warning("No procedures found in detailed records")
 }
 } catch (error) {
 console.error("Error parsing detailed records data:", error)
 toast.error("Error parsing detailed records data")
 }
 }

 // Handle stored procedure bill data
 const handleStoredProcedureData = (data) => {
 try {
 // Parse procedures if it's a string
 let parsedProcedures = []
 if (typeof data.procedures === "string") {
 parsedProcedures = JSON.parse(data.procedures)
 } else if (Array.isArray(data.procedures)) {
 parsedProcedures = data.procedures
 }

 // Parse consumer data if it's a string
 let parsedConsumer = []
 if (data.consumer) {
 if (typeof data.consumer === "string") {
 parsedConsumer = JSON.parse(data.consumer)
 } else if (Array.isArray(data.consumer)) {
 parsedConsumer = data.consumer
 }
 }

 // Format procedure data for table
 const formattedProcedureData = parsedProcedures.map((procedure, index) => {
 // Convert date from DD/MM/YYYY to YYYY-MM-DD if needed
 let formattedDate = procedure.procedureDate
 if (formattedDate && formattedDate.includes("/")) {
 const [day, month, year] = formattedDate.split("/")
 formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
 }

 return {
 id: `stored-proc-${index}`,
 procedure: procedure.procedure,
 procedureDate: formattedDate || format(new Date(), "yyyy-MM-dd"),
 price: procedure.price || "0",
 gstRate: procedure.gstRate || "18",
 gst: procedure.gst || "0",
 total: procedure.total || "0",
 selected: true,
 isStored: true,
 }
 })

 // Format consumer data for table
 const formattedConsumerData = parsedConsumer.map((consumer, index) => ({
 id: `stored-cons-${index}`,
 item: consumer.item,
 qty: consumer.qty,
 price: consumer.price,
 total: consumer.total,
 selected: true,
 isStored: true,
 }))

 setProcedureData(formattedProcedureData)
 setConsumerData(formattedConsumerData)
 setProcedureNetAmount(data.procedureNetAmount || "0")
 setConsumerNetAmount(data.consumerNetAmount || "0")
 setTotalAmount(data.totalAmount || "0")
 setPaymentType(data.PaymentType || "Card")
 setConsultationFee(Number.parseFloat(data.consultationFee) || 0)
 setShowConsumerTable(formattedConsumerData.length > 0)
 } catch (error) {
 console.error("Error parsing stored procedure data:", error)
 toast.error("Error parsing stored procedure data")
 }
 }

 // Enhanced handle summary procedure data
 const handleSummaryProcedureData = (patient) => {
 try {
 console.log("Processing summary data for patient:", patient.patientName)
 console.log("Patient proceduresList:", patient.proceduresList)

 const allProcedures = []

 // Extract procedures from proceduresList string
 if (patient.proceduresList && typeof patient.proceduresList === "string") {
 const proceduresFromList = extractProceduresFromList(patient.proceduresList)
 console.log("Extracted procedures:", proceduresFromList)

 proceduresFromList.forEach((procedure, index) => {
 allProcedures.push({
 id: `summary-list-${index}`,
 procedure: procedure.procedure,
 procedureDate: procedure.procedureDate,
 price: "0", // Will be filled by user
 gstRate: "18", // Default GST rate
 gst: "0",
 total: "0",
 selected: true, // Auto-select for summary data
 isStored: false,
 })
 })
 }

 console.log("Final procedures array:", allProcedures)

 setProcedureData(allProcedures)
 setConsumerData([])
 setProcedureNetAmount("0")
 setConsumerNetAmount("0")
 setTotalAmount("0")
 setPaymentType("Card")
 setConsultationFee(0)
 setShowConsumerTable(false)

 if (allProcedures.length > 0) {
 toast.success(`Loaded ${allProcedures.length} procedures from summary data`)
 } else {
 toast.warning("No procedures found in summary data")
 }
 } catch (error) {
 console.error("Error parsing summary procedure data:", error)
 toast.error("Error parsing summary procedure data")
 }
 }

 // Enhanced extract procedures from proceduresList string
 const extractProceduresFromList = (proceduresList) => {
 console.log("Extracting procedures from:", proceduresList)

 if (typeof proceduresList === "string") {
 const cleanList = proceduresList.trim()

 // Handle empty or N/A cases
 if (cleanList.toUpperCase() === "N/A" || cleanList === "" || cleanList === "null") {
 return []
 }

 // Split by "Procedure:" and process each item
 const procedureItems = cleanList
 .split(/Procedure\s*:/i)
 .filter(Boolean)
 .map((item) => item.trim())
 .filter((item) => item.length > 0)

 console.log("Split procedure items:", procedureItems)

 return procedureItems
 .map((procedureItem, index) => {
 let procedureName = procedureItem
 let procedureDate = format(new Date(), "yyyy-MM-dd")

 // Look for date pattern
 const dateMatch = procedureItem.match(/Date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)
 if (dateMatch) {
 const datePart = dateMatch[1]
 procedureName = procedureItem.replace(/\s*-?\s*Date\s*:\s*\d{1,2}\/\d{1,2}\/\d{4}/i, "").trim()

 // Convert DD/MM/YYYY to YYYY-MM-DD
 const [day, month, year] = datePart.split("/")
 if (day && month && year) {
 procedureDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
 }
 }

 // Clean up procedure name
 procedureName = procedureName.replace(/^-+|−+/, "").trim()
 procedureName = procedureName.replace(/-+$/, "").trim()

 console.log(`Extracted procedure ${index + 1}:`, { procedure: procedureName, procedureDate })

 return {
 procedure: procedureName || `Procedure ${index + 1}`,
 procedureDate,
 }
 })
 .filter((item) => item.procedure && item.procedure !== "")
 }
 return []
 }

 // Handle date change
 const handleDateChange = (date) => {
 setSelectedDate(date)
 setSelectedPatient(null)
 setViewDetails(false)
 setProcedureData([])
 setConsumerData([])
 setAdditionalProcedures([])
 setDataSource("")
 setShowConsumerTable(false)
 fetchPatientList(date)
 }

 // Handle view patient details
 const handleViewClick = (patient) => {
 console.log("Viewing patient:", patient)
 setSelectedPatient(patient)
 setViewDetails(true)
 fetchPatientProcedureData(patient)
 }

 // Handle back button
 const handleBackClick = () => {
 setSelectedPatient(null)
 setViewDetails(false)
 setProcedureData([])
 setConsumerData([])
 setAdditionalProcedures([])
 setDataSource("")
 setShowConsumerTable(false)
 }

 // Handle payment type change
 const handlePaymentTypeChange = (e) => {
 setPaymentType(e.target.value)
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
 total: "",
 selected: true,
 isStored: false,
 },
 ])
 }

 // Delete procedure row functionality
 const handleDeleteProcedureRow = (rowId) => {
 setAdditionalProcedures((prev) => prev.filter((row) => row.id !== rowId))
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
// Enhanced handleAdditionalProcedureChange function with bidirectional price/total editing
const handleAdditionalProcedureChange = (rowId, field, value) => {
  setAdditionalProcedures((prev) =>
    prev.map((row) => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value }

        // Handle price change - calculate GST and total
        if (field === "price") {
          const price = parseFloat(value) || 0
          const gstRate = parseFloat(row.gstRate) || 0
          updatedRow.gst = calculateGST(price, gstRate)
          updatedRow.total = calculateTotal(price, updatedRow.gst)
        }
        
        // Handle total change - calculate price based on total
        else if (field === "total") {
          const total = parseFloat(value) || 0
          const gstRate = parseFloat(row.gstRate) || 0
          // Calculate price from total: price = total / (1 + gstRate/100)
          const calculatedPrice = gstRate > 0 ? total / (1 + gstRate / 100) : total
          updatedRow.price = calculatedPrice.toFixed(2)
          updatedRow.gst = calculateGST(calculatedPrice, gstRate)
        }
        
        // Handle GST rate change - recalculate GST and total based on existing price
        else if (field === "gstRate") {
          const price = parseFloat(row.price) || 0
          const gstRate = parseFloat(value) || 0
          updatedRow.gst = calculateGST(price, gstRate)
          updatedRow.total = calculateTotal(price, updatedRow.gst)
        }

        return updatedRow
      }
      return row
    })
  )
}


 // Handle procedure data changes
// Enhanced handleProcedureDataChange function with bidirectional price/total editing
const handleProcedureDataChange = (index, field, value) => {
  setProcedureData((prev) =>
    prev.map((item, idx) => {
      if (idx === index) {
        const updatedItem = { ...item, [field]: value }

        // Handle price change - calculate GST and total
        if (field === "price") {
          const price = parseFloat(value) || 0
          const gstRate = parseFloat(item.gstRate) || 0
          updatedItem.gst = calculateGST(price, gstRate)
          updatedItem.total = calculateTotal(price, updatedItem.gst)
        }
        
        // Handle total change - calculate price based on total
        else if (field === "total") {
          const total = parseFloat(value) || 0
          const gstRate = parseFloat(item.gstRate) || 0
          // Calculate price from total: price = total / (1 + gstRate/100)
          const calculatedPrice = gstRate > 0 ? total / (1 + gstRate / 100) : total
          updatedItem.price = calculatedPrice.toFixed(2)
          updatedItem.gst = calculateGST(calculatedPrice, gstRate)
        }
        
        // Handle GST rate change - recalculate GST and total based on existing price
        else if (field === "gstRate") {
          const price = parseFloat(item.price) || 0
          const gstRate = parseFloat(value) || 0
          updatedItem.gst = calculateGST(price, gstRate)
          updatedItem.total = calculateTotal(price, updatedItem.gst)
        }

        return updatedItem
      }
      return item
    })
  )
}
 // Handle consumer data changes
 const handleConsumerChange = (index, field, value) => {
 setConsumerData((prevRecords) => {
 const updatedRecords = [...prevRecords]
 updatedRecords[index][field] = value

 if (field === "qty" || field === "price") {
 const qty = Number.parseFloat(updatedRecords[index].qty) || 0
 const price = Number.parseFloat(updatedRecords[index].price) || 0
 updatedRecords[index].total = (qty * price).toFixed(2)
 }

 return updatedRecords
 })
 }

 const handleSelectChange = (selectedOption, index) => {
 const newRecords = [...consumerData]
 newRecords[index].item = selectedOption ? selectedOption.value : ""
 setConsumerData(newRecords)
 }

 const handleShowConsumerTable = () => {
 setShowConsumerTable(true)
 if (consumerData.length === 0) {
 setConsumerData([
 { id: `consumer-${Date.now()}`, item: "", qty: "", price: "", total: "", selected: true, isStored: false },
 ])
 }
 }

 const addConsumerRow = () => {
 setConsumerData((prevRecords) => [
 ...prevRecords,
 { id: `consumer-${Date.now()}`, item: "", qty: "", price: "", total: "", selected: true, isStored: false },
 ])
 }

 const calculateGST = (price, gstRate) => {
 return price && gstRate ? ((price * gstRate) / 100).toFixed(2) : "0"
 }

 const calculateTotal = (price, gst) => {
 return price && gst ? (Number.parseFloat(price) + Number.parseFloat(gst)).toFixed(2) : "0"
 }

 // Calculate totals
 const calculateTotals = () => {
 const selectedProcedures = procedureData.filter((item) => item.selected)
 const selectedAdditionalProcedures = additionalProcedures.filter((item) => item.selected)
 const selectedConsumers = consumerData.filter((item) => item.selected)

 const procedureTotal = selectedProcedures.reduce((sum, item) => sum + (Number.parseFloat(item.total) || 0), 0)
 const additionalProcedureTotal = selectedAdditionalProcedures.reduce(
 (sum, item) => sum + (Number.parseFloat(item.total) || 0),
 0,
 )
 const consumerTotal = selectedConsumers.reduce((sum, item) => sum + (Number.parseFloat(item.total) || 0), 0)

 const newProcedureNetAmount = (procedureTotal + additionalProcedureTotal + consultationFee).toFixed(2)
 const newConsumerNetAmount = consumerTotal.toFixed(2)
 const newTotalAmount = (Number.parseFloat(newProcedureNetAmount) + Number.parseFloat(newConsumerNetAmount)).toFixed(
 2,
 )

 setProcedureNetAmount(newProcedureNetAmount)
 setConsumerNetAmount(newConsumerNetAmount)
 setTotalAmount(newTotalAmount)
 }

 const handleSave = async () => {
 if (!selectedPatient) {
 toast.error("No patient selected")
 return
 }

 try {
 // Prepare selected procedures
 const selectedProcedures = [
 ...procedureData.filter((item) => item.selected),
 ...additionalProcedures.filter((item) => item.selected),
 ]

 // Prepare selected consumers
 const selectedConsumers = consumerData.filter((item) => item.selected)

 const payload = {
 patientName: selectedPatient.patientName,
 patientUID: selectedPatient.patientUID,
 patient_handledby: selectedPatient.patient_handledby || "N/A",
 procedures: selectedProcedures,
 consumer: selectedConsumers,
 appointmentDate: format(selectedDate, "yyyy-MM-dd"),
 procedureNetAmount: procedureNetAmount,
 consumerNetAmount: consumerNetAmount,
 totalAmount: totalAmount,
 PaymentType,
 consultationFee: consultationFee,
 branch_code: branchCode,
 }

 console.log("Saving payload:", payload)

 const response = await axios.post(`${Cosmetologybaseurl}Post_Procedure_Bill/`, payload, {
 headers: {
 "Content-Type": "application/json",
 },
 })

 toast.success(`Procedure bill saved successfully for ${selectedPatient.patientName}`)
     // Navigate back to patient list after successful save
    setTimeout(() => {
      handleBackClick()
    }, 2000) // Wait 2 seconds to show success message

 // Refresh data after save
 fetchPatientProcedureData(selectedPatient)
 } catch (error) {
 console.error("Error saving procedure bill:", error)
 toast.error("Error saving procedure bill")
 }
 }

const handleDownload = () => {
  if (!selectedPatient) {
    toast.error("No patient selected for download");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const backgroundImageMap = {
    SCC001: PDFMain1,
    SCC002: PDFMain2,
  };
  const PDFMain = backgroundImageMap[branchCode] || PDFMain1;

  const convertToBase64 = (url, callback) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      callback(dataURL);
    };
    img.onerror = (error) =>
      console.error("Error converting image to Base64:", error);
  };

  convertToBase64(PDFMain, (mainImage) => {
    doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight);

    // Header
    let startY = 110;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(`Patient Name:`, 16, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${selectedPatient.patientName.toUpperCase()}`, 50, startY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Patient UID:`, 16, startY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${selectedPatient.patientUID}`, 50, startY + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Date:`, 140, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${selectedPatient.appointmentDate}`, 170, startY);

    let yOffset = startY + 20;

    // Procedure Table
    const selectedProcedures = [
      ...procedureData.filter((item) => item.selected),
      ...additionalProcedures.filter((item) => item.selected),
    ];

    if (selectedProcedures.length > 0) {
      const procedureTable = selectedProcedures.map((procedure) => [
        procedure.procedure,
        procedure.procedureDate,
        `${procedure.price}`,
        `${procedure.gstRate}%`,
        `${procedure.gst}`,
        `${procedure.total}`,
      ]);

      doc.autoTable({
        head: [["Procedure", "Date", "Price", "GST Rate", "GST", "Total"]],
        body: procedureTable,
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
        },
        margin: { left: 14, right: 14 },
      });

      yOffset = doc.lastAutoTable.finalY + 10;
    }

    // Consumer Table
    const selectedConsumers = consumerData.filter(
      (item) => item.selected && item.item
    );
    if (selectedConsumers.length > 0) {
      const consumerTable = selectedConsumers.map((record) => [
        record.item,
        record.qty,
        `${record.price}`,
        `${record.total}`,
      ]);

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
        },
        margin: { left: 14, right: 14 },
      });

      yOffset = doc.lastAutoTable.finalY + 10;
    }

    // Consultation Fee
    if (consultationFee > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Consultation Fee: ${consultationFee.toFixed(2)}`, 150, yOffset);
      yOffset += 10;
    }

    // Net Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text(`Net Total: ${totalAmount}`, 150, yOffset + 5);

    // Save the PDF
    doc.save(`${selectedPatient.patientName}_Final_Bill.pdf`);
    toast.success(`PDF downloaded for ${selectedPatient.patientName}`);
  });
};


 const consumerOptions = consumerItems.map((item) => ({
 value: item,
 label: item,
 }))

 return (
 <Container className="container">
 <ToastContainer position="top-right" autoClose={5000} />
 <h3 className="text-center mb-4">Procedure Bill</h3>

 {viewDetails ? (
 <div>
 <BackButton onClick={handleBackClick}>
 <IoMdArrowRoundBack />
 Back to Patient List
 </BackButton>

 {selectedPatient && (
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
 {dataSource && <DataSourceBadge source={dataSource}>{dataSource}</DataSourceBadge>}
 </div>
 </DoctorInfo>
 </InfoText>
 </InfoContainer>
 )}

 <br />

 {isLoading ? (
 <LoadingSpinner>
 <div className="spinner"></div>
 <p>Loading procedure data...</p>
 </LoadingSpinner>
 ) : (
 <>
 {/* Procedures Section */}
 <div className="d-flex justify-content-between align-items-center">
 <h4 style={{ fontWeight: "600" }}>Procedures</h4>
 <AddRowButton onClick={handleAddProcedureRow}>
 <FaPlus /> Add Procedure
 </AddRowButton>
 </div>

 {(procedureData.length > 0 || additionalProcedures.length > 0) && (
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
 {/* Existing procedures from summary/stored data */}
  {procedureData.map((procedure, index) => (
    <tr key={procedure.id}>
      <td>
        <input
          type="checkbox"
          checked={procedure.selected}
          onChange={(e) => handleProcedureDataChange(index, "selected", e.target.checked)}
        />
      </td>
      <td>{procedure.procedure}</td>
      <td>{procedure.procedureDate}</td>
      <td>
        <EditableInput
          type="text"
          value={procedure.price}
          onChange={(e) => handleProcedureDataChange(index, "price", e.target.value)}
          placeholder="Enter price"
        />
      </td>
      <td>
        <EditableInput
          type="text"
          value={procedure.gstRate}
          onChange={(e) => handleProcedureDataChange(index, "gstRate", e.target.value)}
          placeholder="GST rate"
        />
      </td>
      <td>₹{procedure.gst}</td>
      <td>
        <EditableInput
          type="text"
          value={procedure.total}
          onChange={(e) => handleProcedureDataChange(index, "total", e.target.value)}
          placeholder="Enter total"
        />
      </td>
      <td>-</td>
    </tr>
  ))}
 {/* Additional procedures */}
  {additionalProcedures.map((procedure) => (
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
          type="text"
          value={procedure.gstRate}
          onChange={(e) => handleAdditionalProcedureChange(procedure.id, "gstRate", e.target.value)}
          placeholder="GST rate"
        />
      </td>
      <td>₹{procedure.gst}</td>
      <td>
        <EditableInput
          type="text"
          value={procedure.total}
          onChange={(e) => handleAdditionalProcedureChange(procedure.id, "total", e.target.value)}
          placeholder="Enter total"
        />
      </td>
      <td>
        <FaTrash
          style={{ cursor: "pointer", color: "#dc3545" }}
          onClick={() => handleDeleteProcedureRow(procedure.id)}
        />
      </td>
    </tr>
  ))}
</tbody> </table>
 </TableContainer>
 )}

 {/* Show message if no procedures found */}
 {procedureData.length === 0 && additionalProcedures.length === 0 && (
 <NoDataMessage>No procedures found. Click "Add Procedure" to add new procedures.</NoDataMessage>
 )}

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
 readOnly={dataSource === "Billed"}
 />
 </ConsultationRow>
 </ConsultationSection>

<div style={{ textAlign: "right", marginTop: "20px" }}>
  <label>Procedure Net Amount: </label>
  <input
    type="text"
    value={procedureNetAmount}
    onChange={(e) => setProcedureNetAmount(e.target.value)}
    style={{ width: "120px", padding: "8px", marginLeft: "10px" }}
  />
</div>

 {/* Consumer section */}
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

 {(showConsumerTable || consumerData.length > 0) && (
 <>
 <TableContainer>
 <table>
 <thead>
 <tr>
 <th>Select</th>
 <th>Item</th>
 <th>Qty</th>
 <th>Price</th>
 <th>Total</th>
 <th>Action</th>
 </tr>
 </thead>
 <tbody>
 {consumerData.map((record, index) => (
 <tr key={record.id || index}>
 <td>
 <input
 type="checkbox"
 checked={record.selected}
 disabled={record.isStored}
 onChange={(e) => handleConsumerChange(index, "selected", e.target.checked)}
 />
 </td>
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
 isDisabled={record.isStored}
 menuPortalTarget={document.body}
 styles={{
 menuPortal: (base) => ({ ...base, zIndex: 9999 }),
 menu: (base) => ({ ...base, zIndex: 9999 }),
 }}
 />
 </td>
 <td>
 <input
 type="text"
 value={record.qty}
 onChange={(e) => handleConsumerChange(index, "qty", e.target.value)}
 className="form-control"
 placeholder="Enter quantity"
 readOnly={record.isStored}
 />
 </td>
 <td>
 <input
 type="text"
 value={record.price}
 onChange={(e) => handleConsumerChange(index, "price", e.target.value)}
 className="form-control"
 placeholder="Enter price"
 readOnly={record.isStored}
 />
 </td>
 <td>₹{record.total}</td>
 <td>
 <FaTrash
 style={{
 cursor: record.isStored ? "not-allowed" : "pointer",
 color: record.isStored ? "#ccc" : "#dc3545",
 }}
 onClick={() => {
 if (!record.isStored) {
 setConsumerData((prevRecords) => prevRecords.filter((_, i) => i !== index))
 } else {
 toast.warning("Cannot delete stored consumer data.")
 }
 }}
 />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </TableContainer>

<div style={{ textAlign: "right", marginTop: "10px" }}>
  <label>Consumer Net Amount: </label>
  <input
    type="text"
    value={consumerNetAmount}
    onChange={(e) => setConsumerNetAmount(e.target.value)}
    style={{ width: "120px", padding: "8px", marginLeft: "10px" }}
  />
</div>
 </>
 )}

 <FlexRow>
 <div>
 <label>Total Amount: </label>
 <input
 type="text"
 value={totalAmount}
 readOnly
 style={{ width: "120px", padding: "8px", marginLeft: "10px" }}
 />
 </div>

 <div>
 <label>Payment Type: </label>
 <select
 value={PaymentType}
 onChange={handlePaymentTypeChange}
 disabled={dataSource === "Billed"}
 style={{ padding: "8px", marginLeft: "10px" }}
 >
 <option value="Card">Card</option>
 <option value="Cash">Cash</option>
 </select>
 </div>
 </FlexRow>

 <div className="d-flex flex-column align-items-center mt-4">
 <Row className="g-3">
 <Col xs="auto">
 <ActionButton onClick={handleSave} disabled={dataSource === "Billed"}>
 Save
 </ActionButton>
 </Col>
 <Col xs="auto">
 <ActionButton onClick={handleDownload}>Download PDF</ActionButton>
 </Col>
 </Row>
 </div>
 </>
 )}
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
 <p>Loading patient data...</p>
 </LoadingSpinner>
 ) : patients.length > 0 ? (
 patients.map((patient, index) => (
 <PatientContainer key={index}>
 <PatientCard onClick={() => handleViewClick(patient)}>
 <div className="card-title">{patient.patientName}</div>
 <div className="card-subtitle">{patient.patientUID}</div>
 <button style={{ fontSize: "0.9rem" }}>View Procedure</button>
 </PatientCard>
 <br />
 </PatientContainer>
 ))
 ) : (
 <NoDataMessage>
 {!hasData ? "No patients with procedures data available for the selected date" : "Loading..."}
 </NoDataMessage>
 )}
 </PatientProcedureContainer>
 </div>
 )}
 </Container>
 )
}

export default ProcedureComponent