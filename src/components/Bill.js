"use client"
import { useState, useEffect, forwardRef } from "react"
import styled from "styled-components"
import { Row, Col } from "react-bootstrap"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FaCalendarAlt, FaPlus, FaTrash } from "react-icons/fa"
import { format } from "date-fns"
import { IoMdArrowRoundBack } from "react-icons/io"
import jsPDF from "jspdf"
import "jspdf-autotable"
import Kumarapalayam from "./images/KumarapalayamBill.jpg"
import Salem from "./images/Salembill.jpg"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import Select from "react-select"

const StyledContainer = styled.div`
  padding: 10px;
  max-width: 90%;
  margin: 20px auto;
  border-collapse: collapse;
`

const Container = styled.div`
  margin-top: 65px;
`

const TableContainer = styled.div`
  overflow-y: auto;
  scrollbar-width: thin;
`

const Patientcardcontainer = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 500px;
  height: auto;
  padding: 10px;
`

const PatientCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #BCAEC7;
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  flex-grow: 1;
  flex-shrink: 1;
  width: 50%;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #a89bb5;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .patient-name {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: capitalize;
  }

  .patient-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .patient-contact {
    font-size: 14px;
    font-weight: 400;
    opacity: 0.9;
  }

  .data-source {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.8;
    margin-top: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: ${(props) => (props.dataSource === "billing" ? "#28a745" : "#007bff")};
  }
`

const DatePickerWrapper = styled.div`
  display: flex;
  align-items: center;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .custom-date-input {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0.25rem;
    padding: 0.375rem 0.75rem;
    width: 200px;
    background-color: #fff;
    cursor: pointer;
    margin-right: 10px;
  }

  .calendar-icon {
    margin-right: 8px;
    color: #C85C8E;
  }
`

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 90%;
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

const MedicineSelect = styled.select`
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
    background-color: #218838;
  }
`

const SelectAllButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  margin-left: 10px;

  &:hover {
    background-color: #5a6268;
  }
`

const DeleteRowButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
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

const DiscountContainer = styled.div`
  display: flex;
  align-items: center;
`

const DiscountLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
`

const DiscountInput = styled.input`
  padding: 4px;
  font-size: 16px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

const NetContainer = styled.div`
  display: flex;
  align-items: center;
`

const NetLabel = styled.label`
  margin-right: 10px;
  font-size: 16px;
  font-weight: 500;
`

const NetInput = styled.input`
  padding: 8px;
  font-size: 16px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
`

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`

const NoDataMessage = styled.div`
  text-align: center;
  font-size: 18px;
  color: #888;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const EditableInput = styled.input`
  width: 80px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
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

const DataSourceBadge = styled.span`
  background-color: ${(props) => (props.children === "Billed" ? "#28a745" : "#007bff")};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
`

const ActionButton = styled.button`
  background-color: rgb(183, 129, 208);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgb(161, 54, 197);
  }

  &:disabled {
    background-color: rgb(166, 149, 184);
    cursor: not-allowed;
  }
`

const StockWarning = styled.span`
  color: #dc3545;
  font-size: 12px;
  font-weight: bold;
  margin-left: 5px;
`

const Bill = () => {
  const [startDate, setStartDate] = useState(new Date())
  const [patientData, setPatientData] = useState([])
  const [billingData, setBillingData] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [medicineDetails, setMedicineDetails] = useState({})
  const [selectedPrescriptions, setSelectedPrescriptions] = useState({})
  const [isBillingDisplayed, setIsBillingDisplayed] = useState(false)
  const [quantity, setQuantity] = useState({})
  const [discount, setDiscount] = useState(0)
  const [netAmount, setNetAmount] = useState("")
  const [hasData, setHasData] = useState(true)
  const [paymentType, setPaymentType] = useState("Card")
  const [section, setSection] = useState("Pharmacy")
  const [editablePrices, setEditablePrices] = useState({})
  const [editableTotals, setEditableTotals] = useState({})
  const [branchCode, setBranchCode] = useState("")
  const [medicineErrors, setMedicineErrors] = useState({})
  const [isDataFromStored, setIsDataFromStored] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tempDiscount, setTempDiscount] = useState(0)
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [medicineOptions, setMedicineOptions] = useState([])
  const [additionalRows, setAdditionalRows] = useState([])
  const [consultationFee, setConsultationFee] = useState(0)
  const [savedBillingData, setSavedBillingData] = useState([])
  const [stockErrors, setStockErrors] = useState({})
  const [selectAll, setSelectAll] = useState(false)

  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  // Initialize branch code and fetch current date data
  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")
    if (code) {
      setBranchCode(code)
    } else {
      console.warn("Branch code not found in localStorage")
    }
  }, [])

  // Fetch current date data when component mounts and branch code is available
  useEffect(() => {
    if (branchCode) {
      const currentDate = new Date()
      setStartDate(currentDate)
      fetchInitialPatientData(currentDate)
    }
  }, [branchCode])

  // Helper function to check if prescription data is present and valid
  const hasPrescriptionData = (prescription) => {
    if (!prescription) return false
    if (typeof prescription === "string") {
      const cleanPrescription = prescription.trim().toLowerCase()
      return cleanPrescription !== "" && cleanPrescription !== "n/a" && cleanPrescription !== "null"
    }
    if (Array.isArray(prescription)) {
      return (
        prescription.length > 0 &&
        prescription.some(
          (item) => item && typeof item === "object" && item.particulars && item.particulars.trim() !== "",
        )
      )
    }
    return false
  }

  // Fetch initial patient data from summary API - only patients with prescription data
  const fetchInitialPatientData = async (date) => {
    if (!branchCode || !date) return
    setIsLoading(true)
    const formattedDate = format(date, "yyyy-MM-dd")
    try {
      const response = await fetch(
        `${Cosmetologybaseurl}summary/post/?appointmentDate=${formattedDate}&branch_code=${branchCode}`,
      )
      if (response.ok) {
        const summaryData = await response.json()
        if (summaryData && Array.isArray(summaryData) && summaryData.length > 0) {
          const patientsWithPrescriptions = summaryData.filter((patient) => hasPrescriptionData(patient.prescription))
          if (patientsWithPrescriptions.length > 0) {
            const transformedPatients = patientsWithPrescriptions.map((patient) => ({
              ...patient,
              dataSource: "summary",
            }))
            setPatientData(transformedPatients)
            setHasData(true)
          } else {
            setPatientData([])
            setHasData(false)
            toast.info("No patients with prescription data found for the selected date")
          }
        } else {
          setPatientData([])
          setHasData(false)
          toast.info("No patient data found for the selected date")
        }
      } else {
        throw new Error("Failed to fetch summary data")
      }
    } catch (error) {
      console.error("Error fetching initial patient data:", error)
      setPatientData([])
      setHasData(false)
      toast.error("Error fetching patient data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch patient billing data from unified API
  const fetchPatientBillingData = async (patient) => {
    if (!branchCode || !startDate) return
    setIsLoading(true)
    const formattedDate = format(startDate, "yyyy-MM-dd")
    try {
      const response = await fetch(
        `${Cosmetologybaseurl}get_patientbilling_data/?patientUID=${patient.patientUID}&appointmentDate=${formattedDate}&branch_code=${branchCode}`,
      )
      if (response.ok) {
        const result = await response.json()
        if (result.source === "billing") {
          setIsDataFromStored(true)
          loadStoredBillingData(result.data)
        } else if (result.source === "summary") {
          if (hasPrescriptionData(result.data.prescription)) {
            setIsDataFromStored(false)
            loadSummaryBillingData(result.data)
          } else {
            setIsDataFromStored(false)
            setBillingData([])
            setAdditionalRows([])
            toast.info("No prescription data found for this patient")
          }
        }
      } else if (response.status === 204) {
        setIsDataFromStored(false)
        setBillingData([])
        setAdditionalRows([])
        toast.info("No billing data found for this patient")
      } else {
        throw new Error("Failed to fetch billing data")
      }
    } catch (error) {
      console.error("Error fetching patient billing data:", error)
      toast.error("Error fetching billing data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Load stored billing data
  const loadStoredBillingData = (storedData) => {
    const discountValue = Number.parseFloat(storedData.discount?.replace("%", "")) || 0
    setDiscount(discountValue)
    setTempDiscount(discountValue)
    setAppliedDiscount(discountValue)
    setPaymentType(storedData.paymentType || "Card")
    setNetAmount(storedData.netAmount || "0.00")

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

    const consultationItem = tableData.find((item) => item.particulars === "Consultation Fee")
    if (consultationItem) {
      setConsultationFee(Number.parseFloat(consultationItem.price) || 0)
    }

    const savedRows = tableData
      .filter((item) => item.particulars !== "Consultation Fee")
      .map((item, index) => ({
        id: `saved-${index}`,
        particulars: item.particulars,
        quantity: item.qty,
        price: item.price,
        CGST_percentage: item.CGST_percentage !== "N/A" ? item.CGST_percentage : 0,
        CGST_value: item.CGST_value !== "N/A" ? item.CGST_value : 0,
        SGST_percentage: item.SGST_percentage !== "N/A" ? item.SGST_percentage : 0,
        SGST_value: item.SGST_value !== "N/A" ? item.SGST_value : 0,
        batch_number: item.batch_number !== "N/A" ? item.batch_number : "",
        selected: true,
        total: item.total || (Number.parseFloat(item.price) * Number.parseFloat(item.qty)).toFixed(2),
        isSaved: true,
      }))

    setAdditionalRows(savedRows)
    setBillingData([])
    setSelectedPrescriptions({})
    setQuantity({})
  }

  // Load summary billing data
  const loadSummaryBillingData = (summaryData) => {
    setBillingData([summaryData])
    setAdditionalRows([])
    setConsultationFee(0)
    setDiscount(0)
    setNetAmount("")
    setSelectedPrescriptions({})
    setQuantity({})

    // Auto-select all prescriptions when loading summary data
    setTimeout(() => {
      handleSelectAll()
    }, 100)
  }

  // Fetch medicine options for dropdown
  useEffect(() => {
    if (!branchCode) return
    axios
      .get(`${Cosmetologybaseurl}get_medicine_price/`, {
        params: { branch_code: branchCode },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          const medicineData = response.data.map((medicine) => {
            const normalizeValue = (value, defaultValue = 0) => {
              if (value === null || value === undefined || value === "") return defaultValue
              if (typeof value === "string") {
                const parsed = Number.parseFloat(value)
                return isNaN(parsed) ? defaultValue : parsed
              }
              return typeof value === "number" ? value : defaultValue
            }

            const normalizeString = (value, defaultValue = "Unknown") => {
              if (value === null || value === undefined || value === "") return defaultValue
              return String(value)
            }

            return {
              id: medicine.medicine_name + "_" + medicine.batch_number,
              label: normalizeString(medicine.medicine_name, "Unknown Medicine"),
              price: normalizeValue(medicine.price, 0),
              stock: normalizeValue(medicine.stock, 0),
              CGST_percentage: normalizeValue(medicine.CGST_percentage, 0),
              CGST_value: normalizeValue(medicine.CGST_value, 0),
              SGST_percentage: normalizeValue(medicine.SGST_percentage, 0),
              SGST_value: normalizeValue(medicine.SGST_value, 0),
              batch_number: normalizeString(medicine.batch_number, "N/A"),
              company_name: normalizeString(medicine.company_name, "N/A"),
              expiry_date: normalizeString(medicine.expiry_date, "N/A"),
              received_date: normalizeString(medicine.received_date, "N/A"),
              fullData: medicine,
            }
          })
          setMedicineOptions(medicineData)
        } else {
          console.warn("No medicine data received or invalid format")
          setMedicineOptions([])
          toast.warning("No medicines available for this branch")
        }
      })
      .catch((error) => {
        console.error("Error fetching medicine names:", error)
        setMedicineOptions([])
      })
  }, [branchCode])

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value)
  }

  useEffect(() => {
    if (selectedPatient) {
      calculateNetAmount()
    }
  }, [billingData, quantity, selectedPrescriptions, medicineDetails, additionalRows, consultationFee, editableTotals])

  // Auto-calculate CGST and SGST values based on percentages
  const calculateGSTValues = (price, cgstPercentage, sgstPercentage) => {
    const priceNum = Number.parseFloat(price) || 0
    const cgstValue = (priceNum * (Number.parseFloat(cgstPercentage) || 0)) / 100
    const sgstValue = (priceNum * (Number.parseFloat(sgstPercentage) || 0)) / 100
    return {
      cgstValue: cgstValue.toFixed(2),
      sgstValue: sgstValue.toFixed(2),
    }
  }

  // Handle CGST percentage change and auto-calculate value
  const handleCGSTPercentageChange = (rowId, percentage) => {
    setAdditionalRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const { cgstValue } = calculateGSTValues(row.price, percentage, row.SGST_percentage)
          return {
            ...row,
            CGST_percentage: percentage,
            CGST_value: cgstValue,
          }
        }
        return row
      }),
    )
  }

  // Handle SGST percentage change and auto-calculate value
  const handleSGSTPercentageChange = (rowId, percentage) => {
    setAdditionalRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const { sgstValue } = calculateGSTValues(row.price, row.CGST_percentage, percentage)
          return {
            ...row,
            SGST_percentage: percentage,
            SGST_value: sgstValue,
          }
        }
        return row
      }),
    )
  }

  // Handle total change - make total editable
  const handleTotalChange = (rowId, newTotal) => {
    setEditableTotals((prev) => ({
      ...prev,
      [rowId]: newTotal,
    }))
  }

  // Fetch medicine details using get_medicine_price endpoint
  const fetchMedicineDetails = async (medicine_name, batch_number = null) => {
    try {
      let url = `${Cosmetologybaseurl}get_medicine_price/?medicine_name=${encodeURIComponent(medicine_name)}&branch_code=${branchCode}`
      if (batch_number && batch_number !== "N/A") {
        url += `&batch_number=${encodeURIComponent(batch_number)}`
      }
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        const medicineData = data[0]
        setMedicineErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[medicine_name]
          return newErrors
        })

        const normalizeValue = (value, defaultValue = 0) => {
          if (value === null || value === undefined || value === "") return defaultValue
          if (typeof value === "string") {
            const parsed = Number.parseFloat(value)
            return isNaN(parsed) ? defaultValue : parsed
          }
          return typeof value === "number" ? value : defaultValue
        }

        const normalizeString = (value, defaultValue = "N/A") => {
          if (value === null || value === undefined || value === "") return defaultValue
          return String(value)
        }

        return {
          price: normalizeValue(medicineData.price, 0),
          CGST_percentage: normalizeValue(medicineData.CGST_percentage, 0),
          CGST_value: normalizeValue(medicineData.CGST_value, 0),
          SGST_percentage: normalizeValue(medicineData.SGST_percentage, 0),
          SGST_value: normalizeValue(medicineData.SGST_value, 0),
          batch_number: normalizeString(medicineData.batch_number, "N/A"),
          stock: normalizeValue(medicineData.stock, 0),
          company_name: normalizeString(medicineData.company_name, "N/A"),
          medicine_name: normalizeString(medicineData.medicine_name, medicine_name),
          expiry_date: normalizeString(medicineData.expiry_date, "N/A"),
          received_date: normalizeString(medicineData.received_date, "N/A"),
        }
      } else {
        console.warn(`Medicine not found: ${medicine_name}`)
        setMedicineErrors((prev) => ({
          ...prev,
          [medicine_name]: "Medicine not found or out of stock",
        }))
        return {
          price: 0,
          CGST_percentage: 0,
          CGST_value: 0,
          SGST_percentage: 0,
          SGST_value: 0,
          batch_number: "N/A",
          stock: 0,
          company_name: "N/A",
          medicine_name: medicine_name,
          expiry_date: "N/A",
          received_date: "N/A",
        }
      }
    } catch (error) {
      console.error("Error fetching medicine details:", error)
      setMedicineErrors((prev) => ({
        ...prev,
        [medicine_name]: "Failed to fetch medicine details",
      }))
      return {
        price: 0,
        CGST_percentage: 0,
        CGST_value: 0,
        SGST_percentage: 0,
        SGST_value: 0,
        batch_number: "N/A",
        stock: 0,
        company_name: "N/A",
        medicine_name: medicine_name,
        expiry_date: "N/A",
        received_date: "N/A",
      }
    }
  }

  const handleDateChange = (date) => {
    setStartDate(date)
    setSelectedPatient(null)
    fetchInitialPatientData(date)
  }

  // Add new row functionality
  const handleAddRow = () => {
    const newRowId = `additional-${Date.now()}`
    setAdditionalRows((prev) => [
      ...prev,
      {
        id: newRowId,
        particulars: "",
        quantity: 1,
        price: 0,
        CGST_percentage: 0,
        CGST_value: 0,
        SGST_percentage: 0,
        SGST_value: 0,
        batch_number: "",
        selected: true, // Default selected
        total: 0,
        isSaved: false,
      },
    ])
  }

  // Delete row functionality
  const handleDeleteRow = (rowId) => {
    const rowToDelete = additionalRows.find((row) => row.id === rowId)
    if (rowToDelete && !rowToDelete.isSaved) {
      setAdditionalRows((prev) => prev.filter((row) => row.id !== rowId))
    } else {
      toast.warning("Cannot delete saved billing data. Please remove it from the database first.")
    }
  }

  // Handle medicine selection from dropdown
  const handleMedicineSelect = (rowId, medicineId) => {
    const selectedMedicine = medicineOptions.find((med) => med.id === medicineId)
    if (selectedMedicine) {
      const { cgstValue, sgstValue } = calculateGSTValues(
        selectedMedicine.price,
        selectedMedicine.CGST_percentage,
        selectedMedicine.SGST_percentage,
      )
      setAdditionalRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? {
                ...row,
                particulars: selectedMedicine.label,
                price: selectedMedicine.price || 0,
                CGST_percentage: selectedMedicine.CGST_percentage || 0,
                CGST_value: cgstValue,
                SGST_percentage: selectedMedicine.SGST_percentage || 0,
                SGST_value: sgstValue,
                batch_number: selectedMedicine.batch_number || "",
                stock: selectedMedicine.stock || 0,
                company_name: selectedMedicine.company_name || "",
                expiry_date: selectedMedicine.expiry_date || "",
              }
            : row,
        ),
      )
    }
  }

  const handleAdditionalRowChange = (rowId, field, value) => {
    setAdditionalRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value }
          if (field === "price") {
            const { cgstValue, sgstValue } = calculateGSTValues(value, row.CGST_percentage, row.SGST_percentage)
            updatedRow.CGST_value = cgstValue
            updatedRow.SGST_value = sgstValue
          }
          return updatedRow
        }
        return row
      }),
    )
  }

  // Enhanced prescription extraction to handle various formats
  const extractPrescriptionDetails = (prescription) => {
    if (typeof prescription === "string") {
      if (prescription.trim().toUpperCase() === "N/A" || prescription.trim() === "") {
        return []
      }
      const cleanPrescription = prescription
        .replace(/\\+/g, "\n")
        .replace(/\\\\/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\n+/g, "\n")
        .trim()

      const prescriptions = cleanPrescription
        .split(/Prescription:|prescription:/i)
        .filter(Boolean)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      return prescriptions
        .map((prescriptionItem) => {
          const dosageIndex = prescriptionItem.search(/dosage:/i)
          const totalDosageIndex = prescriptionItem.search(/total dosage:/i)
          let totalDosage = "N/A"
          if (totalDosageIndex !== -1) {
            const totalDosageSubstring = prescriptionItem.substring(totalDosageIndex + "Total Dosage:".length).trim()
            totalDosage = totalDosageSubstring.split(/\s+/)[0] || "N/A"
          }
          let particulars = dosageIndex !== -1 ? prescriptionItem.substring(0, dosageIndex).trim() : prescriptionItem
          if (particulars.endsWith("-")) {
            particulars = particulars.slice(0, -1).trim()
          }
          return {
            particulars: particulars || "N/A",
            totalDosage,
          }
        })
        .filter((item) => item.particulars !== "N/A" && item.totalDosage !== "N/A")
    } else if (Array.isArray(prescription)) {
      return prescription
        .map((item) => ({
          particulars: item.particulars || "N/A",
          totalDosage: item.totalDosage || "N/A",
          CGST_value: item.CGST_value || "N/A",
          SGST_value: item.SGST_value || "N/A",
          batch_number: item.batch_number || "N/A",
        }))
        .filter((item) => item.particulars !== "N/A" && item.totalDosage !== "N/A")
    } else {
      console.error("Expected a string or array but received:", prescription)
      return []
    }
  }

  // Handle Select All functionality
  const handleSelectAll = () => {
    if (!selectedPatient) return

    const patientBillingData = billingData.filter((item) => item.patientUID === selectedPatient.patientUID)
    const newSelectedPrescriptions = {}

    patientBillingData.forEach((item, itemIndex) => {
      const prescriptions = extractPrescriptionDetails(item.prescription)
      prescriptions.forEach((prescription, prescriptionIndex) => {
        const key = `${itemIndex}-${prescriptionIndex}`
        newSelectedPrescriptions[key] = !selectAll
      })
    })

    setSelectedPrescriptions(newSelectedPrescriptions)
    setSelectAll(!selectAll)
  }

  // Reset discount states when selecting new patient in handlePatientCardClick
  const handlePatientCardClick = async (patient) => {
    setSelectedPatient(patient)
    setIsBillingDisplayed(true)
    setAdditionalRows([])
    setConsultationFee(0)
    setDiscount(0)
    setTempDiscount(0)
    setAppliedDiscount(0)
    setNetAmount("")
    setSelectedPrescriptions({})
    setQuantity({})
    setEditablePrices({})
    setEditableTotals({})
    setStockErrors({})
    setSelectAll(false)
    await fetchPatientBillingData(patient)
  }

  // Reset discount states in handleBackClick
  const handleBackClick = () => {
    setSelectedPatient(null)
    setIsBillingDisplayed(false)
    setAdditionalRows([])
    setConsultationFee(0)
    setSavedBillingData([])
    setDiscount(0)
    setTempDiscount(0)
    setAppliedDiscount(0)
    setNetAmount("")
    setSelectedPrescriptions({})
    setQuantity({})
    setEditablePrices({})
    setEditableTotals({})
    setStockErrors({})
    setSelectAll(false)
  }

  useEffect(() => {
    const fetchMedicineDetailsForPrescriptions = async () => {
      const details = {}
      for (const item of billingData) {
        const prescriptions = Array.isArray(item.prescription)
          ? item.prescription
          : extractPrescriptionDetails(item.prescription)
        for (const prescription of prescriptions) {
          const { particulars, batch_number } = prescription
          if (!details[particulars]) {
            details[particulars] = await fetchMedicineDetails(particulars, batch_number)
          }
        }
      }
      setMedicineDetails(details)
    }

    if (billingData.length > 0 && branchCode) {
      fetchMedicineDetailsForPrescriptions()
    }
  }, [billingData, branchCode])

  const handleQuantityChange = (itemIndex, prescriptionIndex, value) => {
    setQuantity((prevState) => ({
      ...prevState,
      [`${itemIndex}-${prescriptionIndex}`]: value,
    }))
    calculateNetAmount()
  }

  const handlePriceChange = (itemIndex, prescriptionIndex, value) => {
    setEditablePrices((prevState) => ({
      ...prevState,
      [`${itemIndex}-${prescriptionIndex}`]: value,
    }))
  }

  const calculateTotal = (price, qty, rowId = null) => {
    if (rowId && editableTotals[rowId]) {
      return editableTotals[rowId]
    }
    qty = Number.parseFloat(qty)
    if (isNaN(Number.parseFloat(price)) || price === "Loading..." || price === "N/A") {
      console.error("Invalid price:", price)
      return 0
    }
    const total = (Number.parseFloat(price) * qty).toFixed(2)
    return total
  }

  const handleDiscountChange = (e) => {
    const value = e.target.value
    if (value === "" || (!isNaN(value) && !isNaN(Number.parseFloat(value)))) {
      setTempDiscount(value === "" ? 0 : Number.parseFloat(value))
    }
  }

  const handleApplyDiscount = () => {
    const discountValue = Number.parseFloat(tempDiscount) || 0
    setAppliedDiscount(discountValue)
    setDiscount(discountValue)
    calculateNetAmount(discountValue)
  }

  const applyDiscountToTotal = (total, discountValue) => {
    const discount = Number.parseFloat(discountValue) || 0
    const discountAmount = (total * discount) / 100
    return total - discountAmount
  }

  const calculateNetAmount = (customDiscount = null) => {
    if (!selectedPatient) {
      console.error("No patient selected")
      return
    }
    let total = 0
    const patientBillingData = billingData.filter((item) => item.patientUID === selectedPatient.patientUID)

    patientBillingData.forEach((item, itemIndex) => {
      const prescriptions = extractPrescriptionDetails(item.prescription)
      prescriptions.forEach((prescription, prescriptionIndex) => {
        const key = `${itemIndex}-${prescriptionIndex}`
        if (selectedPrescriptions[key]) {
          const { particulars } = prescription
          const qty =
            quantity[key] !== undefined ? Number.parseFloat(quantity[key]) : Number.parseFloat(prescription.totalDosage)
          if (isNaN(qty) || qty <= 0) {
            console.warn("Invalid quantity:", qty)
            return
          }
          const medicineDetail = medicineDetails[particulars] || {}
          let price = editablePrices[key] || medicineDetail.price
          if (price === "N/A" || isNaN(Number.parseFloat(price))) {
            console.warn(`Price is not available or invalid for medicine: ${particulars}`)
            return
          }
          price = Number.parseFloat(price)
          const totalForMedicine = calculateTotal(price, qty, key)
          total += Number.parseFloat(totalForMedicine) || 0
        }
      })
    })

    additionalRows.forEach((row) => {
      if (row.selected) {
        const rowTotal = editableTotals[row.id] || Number.parseFloat(row.price) * Number.parseFloat(row.quantity)
        total += rowTotal || 0
      }
    })

    total += Number.parseFloat(consultationFee) || 0

    if (isNaN(total) || total <= 0) {
      console.error("Total amount is invalid:", total)
      setNetAmount("0.00")
      return
    }

    const discountToApply = customDiscount !== null ? customDiscount : Number.parseFloat(appliedDiscount)
    const finalAmount = applyDiscountToTotal(total, discountToApply)
    if (!isNaN(finalAmount) && typeof finalAmount === "number") {
      setNetAmount(finalAmount.toFixed(2))
    } else {
      console.error("Final amount is not valid:", finalAmount)
      setNetAmount("0.00")
    }
  }

  // Check if any medicine is selected
  const hasSelectedMedicines = () => {
    const hasSelectedPrescriptions = Object.values(selectedPrescriptions).some((selected) => selected)
    const hasSelectedAdditionalRows = additionalRows.some((row) => row.selected)
    return hasSelectedPrescriptions || hasSelectedAdditionalRows || consultationFee > 0
  }

  // Validate stock before saving
  const validateStock = () => {
    const stockErrors = {}
    let hasStockIssues = false

    // Check prescription medicines
    const patientBillingData = billingData.filter((item) => item.patientUID === selectedPatient.patientUID)
    patientBillingData.forEach((item, itemIndex) => {
      const prescriptions = extractPrescriptionDetails(item.prescription)
      prescriptions.forEach((prescription, prescriptionIndex) => {
        const key = `${itemIndex}-${prescriptionIndex}`
        if (selectedPrescriptions[key]) {
          const { particulars } = prescription
          const qty =
            quantity[key] !== undefined ? Number.parseFloat(quantity[key]) : Number.parseFloat(prescription.totalDosage)
          const medicineDetail = medicineDetails[particulars] || {}

          if (medicineDetail.stock !== undefined && medicineDetail.stock < qty) {
            stockErrors[particulars] = `Low Stock: Available ${medicineDetail.stock}, Required ${qty}`
            hasStockIssues = true
          }
        }
      })
    })

    // Check additional rows
    additionalRows.forEach((row) => {
      if (row.selected && row.stock !== undefined && row.stock < Number.parseFloat(row.quantity)) {
        stockErrors[row.particulars] = `Low Stock: Available ${row.stock}, Required ${row.quantity}`
        hasStockIssues = true
      }
    })

    setStockErrors(stockErrors)
    return !hasStockIssues
  }

  const handleSaveData = async () => {
    // Check if any medicines are selected
    if (!hasSelectedMedicines()) {
      toast.error("Please select at least one medicine or add consultation fee before saving.")
      return
    }

    // Validate stock
    if (!validateStock()) {
      toast.error("Cannot save billing due to low stock issues. Please check the highlighted medicines.")
      return
    }

    const errorMessages = []
    const table_data = []

    // Process billing data with correct prescription indices
    billingData
      .filter((item) => item.patientUID === selectedPatient.patientUID)
      .forEach((item, itemIndex) => {
        const prescriptions = extractPrescriptionDetails(item.prescription)
        prescriptions.forEach((prescription, originalPrescriptionIndex) => {
          const key = `${itemIndex}-${originalPrescriptionIndex}`

          // Only process selected prescriptions
          if (selectedPrescriptions[key]) {
            const qty = quantity[key] !== undefined ? quantity[key] : prescription.totalDosage
            const medicineName = prescription.particulars

            // Validate quantity
            if (qty === "" || qty === null || qty === undefined) {
              errorMessages.push(`The quantity for medicine "${medicineName}" is empty.`)
              return
            }

            if (Number.parseFloat(qty) <= 0) {
              errorMessages.push(`The quantity for medicine "${medicineName}" must be greater than zero.`)
              return
            }

            const { particulars } = prescription
            const medicineDetail = medicineDetails[particulars] || {}
            const price = editablePrices[key] || medicineDetail.price || "0.00"
            const total = editableTotals[key] || calculateTotal(price, qty)

            table_data.push({
              particulars,
              qty,
              price,
              total,
              CGST_percentage: medicineDetail.CGST_percentage || "N/A",
              CGST_value: medicineDetail.CGST_value || "N/A",
              SGST_percentage: medicineDetail.SGST_percentage || "N/A",
              SGST_value: medicineDetail.SGST_value || "N/A",
              batch_number: medicineDetail.batch_number || "N/A",
            })
          }
        })
      })

    // Add additional rows to table_data (only selected ones)
    const additionalRowsData = additionalRows
      .filter((row) => row.selected && !row.isSaved)
      .map((row) => {
        if (Number.parseFloat(row.quantity) <= 0) {
          errorMessages.push(`The quantity for medicine "${row.particulars}" must be greater than zero.`)
          return null
        }
        return {
          particulars: row.particulars,
          qty: row.quantity,
          price: row.price,
          total: editableTotals[row.id] || (Number.parseFloat(row.price) * Number.parseFloat(row.quantity)).toFixed(2),
          CGST_percentage: row.CGST_percentage,
          CGST_value: row.CGST_value,
          SGST_percentage: row.SGST_percentage,
          SGST_value: row.SGST_value,
          batch_number: row.batch_number,
        }
      })
      .filter(Boolean)

    // Add saved billing data to table_data (only selected ones)
    const savedRowsData = additionalRows
      .filter((row) => row.selected && row.isSaved)
      .map((row) => ({
        particulars: row.particulars,
        qty: row.quantity,
        price: row.price,
        total: editableTotals[row.id] || row.total,
        CGST_percentage: row.CGST_percentage,
        CGST_value: row.CGST_value,
        SGST_percentage: row.SGST_percentage,
        SGST_value: row.SGST_value,
        batch_number: row.batch_number,
      }))

    const allTableData = [...table_data, ...additionalRowsData, ...savedRowsData]

    // Add consultation fee if present
    if (consultationFee > 0) {
      allTableData.push({
        particulars: "Consultation Fee",
        qty: 1,
        price: consultationFee,
        total: consultationFee.toFixed(2),
        CGST_percentage: "N/A",
        CGST_value: "N/A",
        SGST_percentage: "N/A",
        SGST_value: "N/A",
        batch_number: "N/A",
      })
    }

    if (errorMessages.length > 0) {
      toast.error(errorMessages.join(" "))
      return
    }

    let calculatedNetAmount = 0
    allTableData.forEach((item) => {
      calculatedNetAmount += Number.parseFloat(item.total) || 0
    })

    const discountAmount = (calculatedNetAmount * discount) / 100
    const discountedNetAmount = calculatedNetAmount - discountAmount
    setNetAmount(discountedNetAmount.toFixed(2))

    const dataToSubmit = {
      patientName: selectedPatient.patientName,
      patientUID: selectedPatient.patientUID,
      patient_handledby: selectedPatient.patient_handledby || "N/A",
      appointmentDate: format(startDate, "yyyy-MM-dd"),
      table_data: allTableData,
      paymentType,
      section,
      netAmount: discountedNetAmount.toFixed(2),
      discount: `${discount}%`,
      consultationFee: consultationFee,
      branch_code: branchCode,
    }

    try {
      const response = await fetch(`${Cosmetologybaseurl}save/billing/data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })
      if (!response.ok) {
        throw new Error("Failed to submit data")
      }
      const data = await response.json()
      toast.success(`Billing was generated successfully for ${selectedPatient.patientName}`)
      
      // After successful save, make fields non-editable by setting isDataFromStored to true
      setIsDataFromStored(true)
      
      const stockUpdated = await updateStock()
      if (!stockUpdated) {
        console.error("Stock update failed.")
      }
      setTimeout(() => {
        handleBackClick()
      }, 2000)
    } catch (error) {
      console.error("Error submitting data:", error)
      toast.error("Error saving billing data. Please try again.")
    }
  }

  const updateStock = async () => {
    const stockUpdates = []

    // Process billing data with correct prescription indices
    billingData
      .filter((item) => item.patientUID === selectedPatient.patientUID)
      .forEach((item, itemIndex) => {
        const prescriptions = extractPrescriptionDetails(item.prescription)
        prescriptions.forEach((prescription, originalPrescriptionIndex) => {
          const key = `${itemIndex}-${originalPrescriptionIndex}`

          if (selectedPrescriptions[key]) {
            const { particulars } = prescription
            const qty = quantity[key] !== undefined ? quantity[key] : prescription.totalDosage
            const medicineDetail = medicineDetails[particulars] || {}
            const actualBatchNumber = medicineDetail.batch_number || "N/A"

            stockUpdates.push({
              medicine_name: particulars,
              qty,
              branch_code: branchCode,
              batch_number: actualBatchNumber,
            })
          }
        })
      })

    const additionalStockUpdates = additionalRows
      .filter((row) => row.selected)
      .map((row) => ({
        medicine_name: row.particulars,
        qty: row.quantity,
        branch_code: branchCode,
        batch_number: row.batch_number,
      }))

    const allStockUpdates = [...stockUpdates, ...additionalStockUpdates]

    let allStockUpdated = true
    for (const stockUpdate of allStockUpdates) {
      try {
        const response = await fetch(`${Cosmetologybaseurl}update_stock/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockUpdate),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update stock")
        }
        const data = await response.json()
        toast.success("Stock updated successfully!")
      } catch (error) {
        console.error("Error updating stock:", error)
        allStockUpdated = false
        break
      }
    }
    return allStockUpdated
  }

  const handleDownload = () => {
    // Check if any medicines are selected
    if (!hasSelectedMedicines()) {
      toast.error("Please select at least one medicine or add consultation fee before downloading PDF.")
      return
    }

    if (!selectedPatient || (!billingData.length && !additionalRows.length)) {
      console.error("No patient selected or billing data is empty")
      return
    }

    const patientBillingData = billingData.filter((item) => item.patientUID === selectedPatient.patientUID)
    const procedureTable = patientBillingData.flatMap((item, itemIndex) => {
      const prescriptions = extractPrescriptionDetails(item.prescription)
      return prescriptions
        .map((prescription, prescriptionIndex) => {
          const key = `${itemIndex}-${prescriptionIndex}`
          if (!selectedPrescriptions[key]) return null
          const qty = quantity[key] !== undefined ? quantity[key] : prescription.totalDosage
          const medicineDetail = medicineDetails[prescription.particulars] || {}
          const { CGST_percentage, CGST_value, SGST_percentage, SGST_value, batch_number } = medicineDetail
          const price = editablePrices[key] || medicineDetail.price || "0.00"
          const total = editableTotals[key] || calculateTotal(price, qty)
          return [
            prescription.particulars || "N/A",
            qty || "N/A",
            price,
            CGST_percentage || "N/A",
            CGST_value || "N/A",
            SGST_percentage || "N/A",
            SGST_value || "N/A",
            batch_number || "N/A",
            total,
          ]
        })
        .filter(Boolean)
    })

    const additionalRowsForPDF = additionalRows
      .filter((row) => row.selected)
      .map((row) => {
        const total =
          editableTotals[row.id] ||
          (Number.parseFloat(row.price || 0) * Number.parseFloat(row.quantity || 0)).toFixed(2)
        return [
          row.particulars || "N/A",
          row.quantity || "N/A",
          row.price || "0.00",
          row.CGST_percentage || "N/A",
          row.CGST_value || "N/A",
          row.SGST_percentage || "N/A",
          row.SGST_value || "N/A",
          row.batch_number || "N/A",
          total,
        ]
      })

    const allPDFRows = [...procedureTable, ...additionalRowsForPDF]

    if (allPDFRows.length === 0 && consultationFee <= 0) {
      alert("Please select a prescription to download the bill.")
      return
    }

    const totalSum = allPDFRows.reduce((sum, row) => {
      const total = Number.parseFloat(row[8])
      return sum + (isNaN(total) ? 0 : total)
    }, 0)

    const discountedTotal = discount > 0 ? totalSum * ((100 - discount) / 100) : totalSum
    const netAmount = discountedTotal + (consultationFee || 0)

    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 14
    const branchCode = localStorage.getItem("selectedBranch") || "SCC001"
    const PDFMain = branchCode === "SCC002" ? Kumarapalayam : Salem

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

    convertToBase64(PDFMain, (mainImage) => {
      doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
      let startY = 90
      doc.setFont("times", "bold")
      doc.setFontSize(12)
      doc.setTextColor(30, 30, 30)
      doc.text("Patient Name:", 16, startY)
      doc.setFont("times", "normal")
      doc.setFontSize(10)
      doc.text(`${selectedPatient.patientName.toUpperCase()}`, 50, startY)
      doc.setFont("times", "bold")
      doc.setFontSize(12)
      doc.text("Patient UID:", 16, startY + 8)
      doc.setFont("times", "normal")
      doc.setFontSize(10)
      doc.text(`${selectedPatient.patientUID}`, 50, startY + 8)
      doc.setFont("times", "bold")
      doc.setFontSize(12)
      doc.text("Date:", 140, startY)
      doc.setFont("times", "normal")
      doc.setFontSize(10)
      doc.text(`${selectedPatient.appointmentDate}`, 170, startY)
      startY += 20

      if (allPDFRows.length > 0) {
        doc.autoTable({
          head: [
            ["Particulars", "Qty", "Price", "CGST (%)", "CGST Value", "SGST (%)", "SGST Value", "Batch No.", "Total"],
          ],
          body: allPDFRows,
          startY: startY,
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
        startY = doc.lastAutoTable.finalY
      }

      let finalY = startY
      if (discount > 0) {
        finalY += 8
        doc.setFont("times", "bold")
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)
        doc.text("Discount %", 130, finalY)
        doc.setFont("times", "normal")
        doc.setFontSize(10)
        doc.text(`${discount}`, 170, finalY)
      }

      if (consultationFee > 0) {
        finalY += 10
        doc.setFont("times", "bold")
        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)
        doc.text("Consultation Fee", 130, finalY)
        doc.setFont("times", "normal")
        doc.setFontSize(10)
        doc.text(`Rs. ${consultationFee.toFixed(2)}`, 170, finalY)
      }

      finalY += 10
      doc.setDrawColor(150)
      doc.setLineWidth(0.5)
      doc.line(14, finalY, pageWidth - 14, finalY)
      finalY += 6
      doc.setFont("times", "bold")
      doc.setFontSize(14)
      doc.setTextColor(0, 100, 0)
      doc.text("Net Amount: ", 130, finalY)
      doc.setFont("times", "normal")
      doc.setFontSize(10)
      doc.text(`Rs. ${netAmount.toFixed(2)}`, 170, finalY)
      doc.save(`${selectedPatient.patientName}_Bill.pdf`)
    })
  }

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <h3 className="text-center mb-4">Billing</h3>
      {selectedPatient && (
        <button style={{ marginLeft: "80px" }} onClick={handleBackClick}>
          <IoMdArrowRoundBack />
        </button>
      )}
      {!isBillingDisplayed && (
        <center>
          <DatePickerWrapper>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              customInput={<CustomInput />}
            />
          </DatePickerWrapper>
        </center>
      )}

      <center>
        {!selectedPatient && (
          <Patientcardcontainer className="mt-4">
            {isLoading ? (
              <LoadingSpinner>
                <div className="spinner"></div>
                <p>Loading patient data...</p>
              </LoadingSpinner>
            ) : (
              <ul>
                {patientData.map((patient, index) => (
                  <PatientCard
                    key={index}
                    onClick={() => handlePatientCardClick(patient)}
                    dataSource={patient.dataSource}
                  >
                    <div className="patient-details">
                      <div className="patient-name">{patient.patientName}</div>
                      <div className="patient-uid">{patient.patientUID}</div>
                    </div>
                  </PatientCard>
                ))}
              </ul>
            )}
            {!hasData && !isLoading && (
              <NoDataMessage>No patients with prescription data available for the selected date</NoDataMessage>
            )}
          </Patientcardcontainer>
        )}
      </center>

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
                <div>
                  <DataSourceBadge>{isDataFromStored ? "Billed" : "Summary"}</DataSourceBadge>
                </div>
              </DoctorInfo>
            </InfoText>
          </InfoContainer>
        ) : null}
      </div>

      <StyledContainer>
        {selectedPatient && (
          <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <AddRowButton onClick={handleAddRow}>
                <FaPlus /> Add Row
              </AddRowButton>
              {!isDataFromStored && (
                <SelectAllButton onClick={handleSelectAll}>{selectAll ? "Deselect All" : "Select All"}</SelectAllButton>
              )}
            </div>
            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>Select</th>
                    <th style={{ textAlign: "center" }}>Particulars</th>
                    <th style={{ textAlign: "center" }}>Quantity</th>
                    <th style={{ textAlign: "center" }}>Price</th>
                    <th style={{ textAlign: "center" }}>CGST %</th>
                    <th style={{ textAlign: "center" }}>CGST Value</th>
                    <th style={{ textAlign: "center" }}>SGST %</th>
                    <th style={{ textAlign: "center" }}>SGST Value</th>
                    <th style={{ textAlign: "center" }}>Batch Number</th>
                    <th style={{ textAlign: "center" }}>Total</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Existing prescription rows - only show if NOT using stored data */}
                  {!isDataFromStored &&
                    billingData
                      .filter((item) => item.patientUID === selectedPatient.patientUID)
                      .map((item, itemIndex) => {
                        const prescriptions = extractPrescriptionDetails(item.prescription)
                        return prescriptions.map((prescription, prescriptionIndex) => {
                          const { particulars } = prescription
                          const qty =
                            quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined
                              ? quantity[`${itemIndex}-${prescriptionIndex}`]
                              : prescription.totalDosage
                          const medicineDetail = medicineDetails[particulars] || {}
                          const { price, CGST_percentage, CGST_value, SGST_percentage, SGST_value, batch_number } =
                            medicineDetail || {}
                          const editablePrice = editablePrices[`${itemIndex}-${prescriptionIndex}`] || price
                          const key = `${itemIndex}-${prescriptionIndex}`
                          const hasStockError = stockErrors[particulars]

                          return (
                            <tr key={key} style={{ backgroundColor: hasStockError ? "#ffe6e6" : "transparent" }}>
                              <td style={{ textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={selectedPrescriptions[key] || false}
                                  onChange={(e) =>
                                    setSelectedPrescriptions((prevState) => ({
                                      ...prevState,
                                      [key]: e.target.checked,
                                    }))
                                  }
                                  disabled={isDataFromStored}
                                />
                              </td>
                              <td>
                                {particulars}
                                {hasStockError && <StockWarning>{hasStockError}</StockWarning>}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <input
                                  style={{ width: "60px" }}
                                  type="text"
                                  value={qty}
                                  onChange={(e) => handleQuantityChange(itemIndex, prescriptionIndex, e.target.value)}
                                  readOnly={isDataFromStored}
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <input
                                  style={{ width: "80px" }}
                                  type="text"
                                  value={editablePrice}
                                  onChange={(e) => handlePriceChange(itemIndex, prescriptionIndex, e.target.value)}
                                  readOnly={isDataFromStored}
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>{CGST_percentage || "N/A"}</td>
                              <td style={{ textAlign: "center" }}>{CGST_value || "N/A"}</td>
                              <td style={{ textAlign: "center" }}>{SGST_percentage || "N/A"}</td>
                              <td style={{ textAlign: "center" }}>{SGST_value || "N/A"}</td>
                              <td style={{ textAlign: "center" }}>{batch_number || "N/A"}</td>
                              <td style={{ textAlign: "center" }}>
                                <EditableInput
                                  type="text"
                                  value={editableTotals[key] || calculateTotal(editablePrice, qty)}
                                  onChange={(e) => handleTotalChange(key, e.target.value)}
                                  readOnly={isDataFromStored}
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>-</td>
                            </tr>
                          )
                        })
                      })}

                  {/* Additional rows */}
                  {additionalRows.map((row) => {
                    const hasStockError = stockErrors[row.particulars]
                    return (
                      <tr key={row.id} style={{ backgroundColor: hasStockError ? "#ffe6e6" : "transparent" }}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) => handleAdditionalRowChange(row.id, "selected", e.target.checked)}
                            disabled={isDataFromStored}
                          />
                        </td>
                        <td>
                          <Select
                            value={
                              row.particulars
                                ? medicineOptions.find((med) => med.label === row.particulars)
                                  ? {
                                      value: medicineOptions.find((med) => med.label === row.particulars).id,
                                      label: row.particulars,
                                    }
                                  : null
                                : null
                            }
                            onChange={(selectedOption) => handleMedicineSelect(row.id, selectedOption?.value || "")}
                            options={medicineOptions.map((medicine) => {
                              const stockStatus =
                                medicine.stock === 0
                                  ? " - OUT OF STOCK"
                                  : medicine.stock < 10
                                    ? ` - LOW STOCK (${medicine.stock})`
                                    : ` - Stock: ${medicine.stock}`
                              return {
                                value: medicine.id,
                                label: `${medicine.label}${stockStatus}`,
                                isDisabled: medicine.stock === 0,
                              }
                            })}
                            placeholder="Search and select medicine..."
                            isClearable
                            isSearchable
                            isDisabled={isDataFromStored}
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              menu: (base) => ({ ...base, zIndex: 9999 }),
                              control: (base) => ({ ...base, minHeight: "38px" }),
                              option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isDisabled ? "#f8f9fa" : base.backgroundColor,
                                color: state.isDisabled ? "#6c757d" : base.color,
                              }),
                            }}
                          />
                          {hasStockError && <StockWarning>{hasStockError}</StockWarning>}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            style={{ width: "60px" }}
                            type="text"
                            value={row.quantity}
                            onChange={(e) => handleAdditionalRowChange(row.id, "quantity", e.target.value)}
                            readOnly={isDataFromStored}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            style={{ width: "80px" }}
                            type="text"
                            value={row.price}
                            onChange={(e) => handleAdditionalRowChange(row.id, "price", e.target.value)}
                            readOnly={isDataFromStored}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            style={{ width: "60px" }}
                            type="text"
                            value={row.CGST_percentage}
                            onChange={(e) => handleCGSTPercentageChange(row.id, e.target.value)}
                            readOnly={isDataFromStored}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>{row.CGST_value}</td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            style={{ width: "60px" }}
                            type="text"
                            value={row.SGST_percentage}
                            onChange={(e) => handleSGSTPercentageChange(row.id, e.target.value)}
                            readOnly={isDataFromStored}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>{row.SGST_value}</td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            style={{ width: "80px" }}
                            type="text"
                            value={row.batch_number}
                            onChange={(e) => handleAdditionalRowChange(row.id, "batch_number", e.target.value)}
                            readOnly={isDataFromStored}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <EditableInput
                            type="text"
                            value={
                              editableTotals[row.id] ||
                              (Number.parseFloat(row.price) * Number.parseFloat(row.quantity)).toFixed(2)
                            }
                            onChange={(e) => handleTotalChange(row.id, e.target.value)}
                            readOnly={isDataFromStored}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {!isDataFromStored && (
                            <DeleteRowButton onClick={() => handleDeleteRow(row.id)}>
                              <FaTrash />
                            </DeleteRowButton>
                          )}
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
                  readOnly={isDataFromStored}
                />
              </ConsultationRow>
            </ConsultationSection>
          </>
        )}

        {selectedPatient && (
          <FlexRow>
            <DiscountContainer>
              <DiscountLabel htmlFor="discount">Discount % : </DiscountLabel>
              <DiscountInput
                type="text"
                id="discount"
                value={tempDiscount}
                placeholder="Discount %"
                onChange={handleDiscountChange}
                readOnly={isDataFromStored}
              />
              {!isDataFromStored && <button onClick={handleApplyDiscount}>Apply</button>}
            </DiscountContainer>
            <PaymentTypeContainer>
              <PaymentTypeLabel>Payment Type : </PaymentTypeLabel>
              <PaymentTypeInput 
                value={paymentType} 
                onChange={handlePaymentTypeChange}
                disabled={isDataFromStored}
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </PaymentTypeInput>
            </PaymentTypeContainer>
            <NetContainer>
              <NetLabel htmlFor="Net">Net Amount:</NetLabel>
              <NetInput type="text" id="Net" value={netAmount} onChange={(e) => setNetAmount(e.target.value)} readOnly />
            </NetContainer>
          </FlexRow>
        )}
      </StyledContainer>
      <br />
      {selectedPatient && (
        <center>
          <div className="d-flex flex-column align-items-center mt-4">
            <Row className="g-3">
              <Col xs="auto">
                <ActionButton onClick={handleSaveData} disabled={isDataFromStored}>
                  Save
                </ActionButton>
              </Col>
              <Col xs="auto">
                <ActionButton onClick={handleDownload}>Download PDF</ActionButton>
              </Col>
            </Row>
          </div>
        </center>
      )}
    </Container>
  )
}

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <div className="custom-date-input" onClick={onClick} ref={ref}>
    <FaCalendarAlt className="calendar-icon" />
    <span>{value || "Select a date"}</span>
  </div>
))

export default Bill
