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
import Cookies from "js-cookie"
import "jspdf-autotable"
import PDFMain1 from "./images/PDF_Main_branch1.jpeg"
import PDFMain2 from "./images/PDF_Main_branch2.jpeg"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"

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
 background-color: #9b85a8 ;
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
 padding: 8px;
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
  const [branchCode, setBranchCode] = useState("")

  // New states for pharmacy dropdown and additional rows
  const [medicineOptions, setMedicineOptions] = useState([])
  const [additionalRows, setAdditionalRows] = useState([])
  const [consultationFee, setConsultationFee] = useState(0)

  // Fetch medicine options for dropdown
  useEffect(() => {
    if (!branchCode) return

    axios
      .get(`http://127.0.0.1:8000/pharmacy/data/`, {
        params: { branch_code: branchCode },
      })
      .then((response) => {
        const medicineData = response.data.map((medicine) => ({
          id: medicine.id || medicine.medicine_name,
          label: medicine.medicine_name || "Unknown Medicine",
          category: medicine.medicine_category || "Uncategorized",
          price: medicine.price || 0,
          stock: medicine.stock || 0,
          CGST_percentage: medicine.CGST_percentage || 0,
          CGST_value: medicine.CGST_value || 0,
          SGST_percentage: medicine.SGST_percentage || 0,
          SGST_value: medicine.SGST_value || 0,
          batch_number: medicine.batch_number || "",
          fullData: medicine,
        }))
        setMedicineOptions(medicineData)
        console.log("Fetched medicines:", medicineData.length)
      })
      .catch((error) => {
        console.error("Error fetching medicine names:", error)
        toast.error("Failed to fetch medicine data")
      })
  }, [branchCode])

  useEffect(() => {
    const code = Cookies.get("branch_code")
    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from cookies:", code)
    } else {
      console.warn("Branch code not found in cookies")
    }

    fetchPatientData(startDate)
    fetchBillingData(startDate)
  }, [startDate])

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value)
  }

  useEffect(() => {
    fetchPatientData(startDate)
    fetchBillingData(startDate)
  }, [startDate])

  useEffect(() => {
    if (selectedPatient) {
      calculateNetAmount()
    }
  }, [billingData, quantity, selectedPrescriptions, medicineDetails, additionalRows, consultationFee])

  const fetchPatientData = async (date) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/summary/post/patient_details/?appointmentDate=${format(date, "yyyy-MM-dd")}&branch_code=${branchCode}`,
      )
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      setPatientData(data)
      setHasData(data.length > 0)
    } catch (error) {
      console.error("Error fetching patient data:", error)
    }
  }

  const fetchBillingData = async (date) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/summary/post/?appointmentDate=${format(date, "yyyy-MM-dd")}&branch_code=${branchCode}`,
      )
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      setBillingData(data)
      setHasData(data.length > 0)
    } catch (error) {
      console.error("Error fetching billing data:", error)
    }
  }

  const fetchMedicineDetails = async (medicine_name) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/medicine_name/data/?medicine_name=${encodeURIComponent(medicine_name)}&branch_code=${branchCode}`,
      )
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching medicine details:", error)
      return null
    }
  }

  const handleDateChange = (date) => {
    setStartDate(date)
    fetchPatientData(date)
    fetchBillingData(date)
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
        selected: false,
      },
    ])
  }

  // Delete row functionality
  const handleDeleteRow = (rowId) => {
    setAdditionalRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  // Handle medicine selection from dropdown
  const handleMedicineSelect = (rowId, medicineId) => {
    const selectedMedicine = medicineOptions.find((med) => med.id === medicineId)

    if (selectedMedicine) {
      setAdditionalRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? {
                ...row,
                particulars: selectedMedicine.label,
                price: selectedMedicine.price || 0,
                CGST_percentage: selectedMedicine.CGST_percentage || 0,
                CGST_value: selectedMedicine.CGST_value || 0,
                SGST_percentage: selectedMedicine.SGST_percentage || 0,
                SGST_value: selectedMedicine.SGST_value || 0,
                batch_number: selectedMedicine.batch_number || "",
              }
            : row,
        ),
      )
    }
  }

  // Update additional row data
  const handleAdditionalRowChange = (rowId, field, value) => {
    setAdditionalRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)))
  }

  const extractPrescriptionDetails = (prescription) => {
    if (typeof prescription === "string") {
      if (prescription.trim().toUpperCase() === "N/A" || prescription.trim() === "") {
        return []
      }

      const prescriptions = prescription
        .split("Prescription:")
        .filter(Boolean)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      return prescriptions
        .map((prescriptionItem) => {
          const index = prescriptionItem.indexOf("Dosage")
          const totalDosageIndex = prescriptionItem.indexOf("Total Dosage:")
          let totalDosage = "N/A"

          if (totalDosageIndex !== -1) {
            const totalDosageSubstring = prescriptionItem.substring(totalDosageIndex + "Total Dosage:".length).trim()
            totalDosage = totalDosageSubstring.split(" ")[0] || "N/A"
          }

          let particulars = index !== -1 ? prescriptionItem.substring(0, index).trim() : prescriptionItem

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

  const handlePatientCardClick = (patient) => {
    setSelectedPatient(patient)
    setIsBillingDisplayed(true)
    calculateNetAmount()
  }

  const handleBackClick = () => {
    setSelectedPatient(null)
    setIsBillingDisplayed(false)
    setAdditionalRows([])
    setConsultationFee(0)
  }

  useEffect(() => {
    const fetchMedicineDetailsForPrescriptions = async () => {
      const details = {}
      for (const item of billingData) {
        const prescriptions = Array.isArray(item.prescription)
          ? item.prescription
          : extractPrescriptionDetails(item.prescription)
        for (const prescription of prescriptions) {
          const { particulars } = prescription
          if (!details[particulars]) {
            details[particulars] = await fetchMedicineDetails(particulars)
          }
        }
      }
      setMedicineDetails(details)
    }

    if (billingData.length > 0) {
      fetchMedicineDetailsForPrescriptions()
    }
  }, [billingData])

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

  const calculateTotal = (price, qty) => {
    qty = Number.parseFloat(qty)

    if (isNaN(Number.parseFloat(price)) || price === "Loading..." || price === "N/A") {
      console.error("Invalid price:", price)
      return 0
    }

    const total = (Number.parseFloat(price) * qty).toFixed(2)
    return total
  }

  const handleDiscountChange = (e) => {
    const discountValue = Number.parseFloat(e.target.value)
    setDiscount(discountValue)
  }

  const handleCGSTValueChange = (itemIndex, prescriptionIndex, value) => {
    setBillingData((prevData) => {
      const updatedData = [...prevData]
      const prescriptions = extractPrescriptionDetails(updatedData[itemIndex].prescription)

      if (typeof prescriptions[prescriptionIndex] === "object") {
        const updatedPrescription = {
          ...prescriptions[prescriptionIndex],
          CGST_value: value,
        }

        updatedData[itemIndex].prescription = prescriptions.map((prescription, index) =>
          index === prescriptionIndex ? updatedPrescription : prescription,
        )

        return updatedData
      } else {
        console.error("Expected an object for prescription:", prescriptions[prescriptionIndex])
        return prevData
      }
    })
  }

  const handleSGSTValueChange = (itemIndex, prescriptionIndex, value) => {
    setBillingData((prevData) => {
      const updatedData = [...prevData]
      const prescriptions = extractPrescriptionDetails(updatedData[itemIndex].prescription)
      const updatedPrescription = {
        ...prescriptions[prescriptionIndex],
        SGST_value: value,
      }

      updatedData[itemIndex].prescription = prescriptions.map((prescription, index) =>
        index === prescriptionIndex ? updatedPrescription : prescription,
      )

      return updatedData
    })
  }

  const handleBatchNumberChange = (itemIndex, prescriptionIndex, value) => {
    setBillingData((prevData) => {
      const updatedData = [...prevData]
      const prescriptions = extractPrescriptionDetails(updatedData[itemIndex].prescription)
      const updatedPrescription = {
        ...prescriptions[prescriptionIndex],
        batch_number: value,
      }

      updatedData[itemIndex].prescription = prescriptions.map((prescription, index) =>
        index === prescriptionIndex ? updatedPrescription : prescription,
      )

      return updatedData
    })
  }

  const calculateNetAmount = () => {
    if (!selectedPatient) {
      console.error("No patient selected")
      return
    }

    let total = 0

    // Calculate total from existing prescriptions
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
          const totalForMedicine = calculateTotal(price, qty)

          total += Number.parseFloat(totalForMedicine) || 0
        }
      })
    })

    // Add total from additional rows
    additionalRows.forEach((row) => {
      if (row.selected) {
        const rowTotal = Number.parseFloat(row.price) * Number.parseFloat(row.quantity)
        total += rowTotal || 0
      }
    })

    // Add consultation fee
    total += Number.parseFloat(consultationFee) || 0

    if (isNaN(total) || total <= 0) {
      console.error("Total amount is invalid:", total)
      setNetAmount("0.00")
      return
    }

    const finalAmount = applyDiscountToTotal(total)
    if (!isNaN(finalAmount) && typeof finalAmount === "number") {
      setNetAmount(finalAmount.toFixed(2))
    } else {
      console.error("Final amount is not valid:", finalAmount)
      setNetAmount("0.00")
    }
  }

  const applyDiscountToTotal = (total) => {
    const discountValue = Number.parseFloat(discount) || 0
    const discountAmount = (total * discountValue) / 100
    const discountedTotal = total - discountAmount
    return discountedTotal
  }

  const applyDiscount = () => {
    if (netAmount !== "") {
      const currentNetAmount = Number.parseFloat(netAmount)
      const discountAmount = (currentNetAmount * discount) / 100
      const newNetAmount = currentNetAmount - discountAmount
      setNetAmount(newNetAmount.toFixed(2))
    }
  }

  const handleSaveData = async () => {
    const errorMessages = []

    const table_data = billingData
      .filter((item) => item.patientUID === selectedPatient.patientUID)
      .flatMap((item, itemIndex) => {
        const prescriptions = extractPrescriptionDetails(item.prescription)

        const validPrescriptions = prescriptions.filter((prescription, prescriptionIndex) => {
          const qty =
            quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined
              ? quantity[`${itemIndex}-${prescriptionIndex}`]
              : prescription.totalDosage
          const medicineName = prescription.particulars

          if (!selectedPrescriptions[`${itemIndex}-${prescriptionIndex}`]) return false

          if (qty === "") {
            errorMessages.push(`The quantity for medicine "${medicineName}" is empty.`)
            return false
          }

          if (qty <= 0) {
            errorMessages.push(`The quantity for medicine "${medicineName}" must be greater than zero.`)
            return false
          }

          return true
        })

        return validPrescriptions.map((prescription, prescriptionIndex) => {
          const { particulars } = prescription
          const qty =
            quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined
              ? quantity[`${itemIndex}-${prescriptionIndex}`]
              : prescription.totalDosage

          const medicineDetail = medicineDetails[particulars] || {}
          const price = editablePrices[`${itemIndex}-${prescriptionIndex}`] || medicineDetail.price || "0.00"
          const total = calculateTotal(price, qty)

          return {
            particulars,
            qty,
            price,
            total,
            CGST_percentage: medicineDetail.CGST_percentage || "N/A",
            CGST_value: medicineDetail.CGST_value || "N/A",
            SGST_percentage: medicineDetail.SGST_percentage || "N/A",
            SGST_value: medicineDetail.SGST_value || "N/A",
            batch_number: medicineDetail.batch_number || "N/A",
          }
        })
      })

    // Add additional rows to table_data
    const additionalRowsData = additionalRows
      .filter((row) => row.selected)
      .map((row) => ({
        particulars: row.particulars,
        qty: row.quantity,
        price: row.price,
        total: (Number.parseFloat(row.price) * Number.parseFloat(row.quantity)).toFixed(2),
        CGST_percentage: row.CGST_percentage,
        CGST_value: row.CGST_value,
        SGST_percentage: row.SGST_percentage,
        SGST_value: row.SGST_value,
        batch_number: row.batch_number,
      }))

    const allTableData = [...table_data, ...additionalRowsData]

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
      const response = await fetch(`http://127.0.0.1:8000/save/billing/data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Branch-Code": branchCode,
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        throw new Error("Failed to submit data")
      }

      const data = await response.json()
      toast.success(`Billing was generated successfully for ${selectedPatient.patientName}`)

      const stockUpdated = await updateStock()
      if (!stockUpdated) {
        toast.error("Stock update failed.")
      }
    } catch (error) {
      console.error("Error submitting data:", error)
      toast.error("Error submitting data.")
    }
  }

  const updateStock = async () => {
    const stockUpdates = billingData
      .filter((item) => item.patientUID === selectedPatient.patientUID)
      .flatMap((item, itemIndex) => {
        const prescriptions = extractPrescriptionDetails(item.prescription)
        return prescriptions
          .map((prescription, prescriptionIndex) => {
            if (!selectedPrescriptions[`${itemIndex}-${prescriptionIndex}`]) return null

            const { particulars } = prescription
            const qty =
              quantity[`${itemIndex}-${prescriptionIndex}`] !== undefined
                ? quantity[`${itemIndex}-${prescriptionIndex}`]
                : prescription.totalDosage

            return { medicine_name: particulars, qty, branch_code: branchCode }
          })
          .filter(Boolean)
      })

    // Add additional rows stock updates
    const additionalStockUpdates = additionalRows
      .filter((row) => row.selected)
      .map((row) => ({
        medicine_name: row.particulars,
        qty: row.quantity,
        branch_code: branchCode,
      }))

    const allStockUpdates = [...stockUpdates, ...additionalStockUpdates]

    let allStockUpdated = true

    for (const stockUpdate of allStockUpdates) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/update_stock/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Branch-Code": branchCode,
          },
          body: JSON.stringify(stockUpdate),
        })

        if (!response.ok) {
          throw new Error("Failed to update stock")
        }

        const data = await response.json()
        toast.success("Stock updated successfully!")
      } catch (error) {
        console.error("Error updating stock:", error)
        toast.error("Insufficient stock.")
        allStockUpdated = false
        break
      }
    }

    return allStockUpdated
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
    if (!selectedPatient || !billingData.length) {
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
          const price = editablePrices[`${itemIndex}-${prescriptionIndex}`] || medicineDetail.price || "0.00"
          const total = calculateTotal(price, qty)

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

    // Add additional rows to PDF
    const additionalRowsForPDF = additionalRows
      .filter((row) => row.selected)
      .map((row) => [
        row.particulars,
        row.quantity,
        row.price,
        row.CGST_percentage || "N/A",
        row.CGST_value || "N/A",
        row.SGST_percentage || "N/A",
        row.SGST_value || "N/A",
        row.batch_number || "N/A",
        (Number.parseFloat(row.price) * Number.parseFloat(row.quantity)).toFixed(2),
      ])

    // Add consultation fee to PDF
    const allPDFRows = [...procedureTable, ...additionalRowsForPDF]
    if (consultationFee > 0) {
      allPDFRows.push([
        "Consultation Fee",
        "1",
        consultationFee,
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        consultationFee.toFixed(2),
      ])
    }

    if (allPDFRows.length === 0) {
      alert("Please select a prescription to download the bill.")
      return
    }

    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Select PDF background based on branch code without directly using branch names
    const backgroundImageMap = {
      SCC001: PDFMain1,
      SCC002: PDFMain2,
    }
    const PDFMain = backgroundImageMap[branchCode] || PDFMain1

    convertToBase64(PDFMain, (mainImage) => {
      doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
      let startY = 85

      // Enhanced patient name styling
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text(`Patient: ${selectedPatient.patientName.toUpperCase()}`, 16, startY)

      // Patient details with improved formatting
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.text(`Patient UID: ${selectedPatient.patientUID}`, 16, startY + 10)

      startY += 15

      // Enhanced table styling
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

      const yOffset = doc.lastAutoTable.finalY + 15
      // Enhanced total styling
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(0, 100, 0)
      doc.text(`Net Amount: ${netAmount || "N/A"}`, 14, yOffset)
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
            <ul>
              {patientData.map((patient, index) => (
                <PatientCard key={index} onClick={() => handlePatientCardClick(patient)}>
                  <div className="patient-details">
                    <div className="patient-name">{patient.patientName}</div>
                    <div className="patient-contact">{patient.mobileNumber}</div>
                  </div>
                </PatientCard>
              ))}
            </ul>
            {!hasData && <NoDataMessage>No data available for the selected date</NoDataMessage>}
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
              </DoctorInfo>
            </InfoText>
          </InfoContainer>
        ) : null}
      </div>

      <StyledContainer>
        {selectedPatient && (
          <>
            <AddRowButton onClick={handleAddRow}>
              <FaPlus /> Add Row
            </AddRowButton>

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
                  {/* Existing prescription rows */}
                  {billingData
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

                        return (
                          <tr key={`${itemIndex}-${prescriptionIndex}`}>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={selectedPrescriptions[`${itemIndex}-${prescriptionIndex}`] || false}
                                onChange={(e) =>
                                  setSelectedPrescriptions((prevState) => ({
                                    ...prevState,
                                    [`${itemIndex}-${prescriptionIndex}`]: e.target.checked,
                                  }))
                                }
                              />
                            </td>
                            <td>{particulars}</td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                style={{ width: "60px" }}
                                type="text"
                                value={qty}
                                onChange={(e) => handleQuantityChange(itemIndex, prescriptionIndex, e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                style={{ width: "80px" }}
                                type="text"
                                value={editablePrice}
                                onChange={(e) => handlePriceChange(itemIndex, prescriptionIndex, e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>{CGST_percentage || "N/A"}</td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="text"
                                style={{ width: "80px" }}
                                value={CGST_value !== undefined ? CGST_value : ""}
                                onChange={(e) => handleCGSTValueChange(itemIndex, prescriptionIndex, e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>{SGST_percentage || "N/A"}</td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                style={{ width: "80px" }}
                                type="text"
                                value={SGST_value !== undefined ? SGST_value : ""}
                                onChange={(e) => handleSGSTValueChange(itemIndex, prescriptionIndex, e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                style={{ width: "80px" }}
                                type="text"
                                value={batch_number !== undefined ? batch_number : ""}
                                onChange={(e) => handleBatchNumberChange(itemIndex, prescriptionIndex, e.target.value)}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>{calculateTotal(editablePrice, qty)}</td>
                            <td style={{ textAlign: "center" }}>-</td>
                          </tr>
                        )
                      })
                    })}

                  {/* Additional rows */}
                  {additionalRows.map((row) => (
                    <tr key={row.id}>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) => handleAdditionalRowChange(row.id, "selected", e.target.checked)}
                        />
                      </td>
                      <td>
                        <MedicineSelect
                          value={
                            row.particulars
                              ? medicineOptions.find((med) => med.label === row.particulars)?.id || ""
                              : ""
                          }
                          onChange={(e) => handleMedicineSelect(row.id, e.target.value)}
                        >
                          <option value="">Select Medicine...</option>
                          {medicineOptions.map((medicine) => (
                            <option key={medicine.id} value={medicine.id}>
                              {medicine.label}
                            </option>
                          ))}
                        </MedicineSelect>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          style={{ width: "60px" }}
                          type="number"
                          value={row.quantity}
                          onChange={(e) => handleAdditionalRowChange(row.id, "quantity", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          style={{ width: "80px" }}
                          type="number"
                          value={row.price}
                          onChange={(e) => handleAdditionalRowChange(row.id, "price", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          style={{ width: "60px" }}
                          type="number"
                          value={row.CGST_percentage}
                          onChange={(e) => handleAdditionalRowChange(row.id, "CGST_percentage", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          style={{ width: "80px" }}
                          type="number"
                          value={row.CGST_value}
                          onChange={(e) => handleAdditionalRowChange(row.id, "CGST_value", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          style={{ width: "60px" }}
                          type="number"
                          value={row.SGST_percentage}
                          onChange={(e) => handleAdditionalRowChange(row.id, "SGST_percentage", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          style={{ width: "80px" }}
                          type="number"
                          value={row.SGST_value}
                          onChange={(e) => handleAdditionalRowChange(row.id, "SGST_value", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          style={{ width: "80px" }}
                          type="text"
                          value={row.batch_number}
                          onChange={(e) => handleAdditionalRowChange(row.id, "batch_number", e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {(Number.parseFloat(row.price) * Number.parseFloat(row.quantity)).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <DeleteRowButton onClick={() => handleDeleteRow(row.id)}>
                          <FaTrash />
                        </DeleteRowButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>

            {/* Consultation Fee Section */}
            <ConsultationSection>
              <h5>Consultation Fee</h5>
              <ConsultationRow>
                <ConsultationLabel>Consultation Fee:</ConsultationLabel>
                <ConsultationInput
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number.parseFloat(e.target.value) || 0)}
                  placeholder="Enter consultation fee"
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
                value={discount}
                placeholder="Discount %"
                onChange={(e) => setDiscount(e.target.value)}
              />
              <button onClick={applyDiscount}>Apply</button>
            </DiscountContainer>

            <PaymentTypeContainer>
              <PaymentTypeLabel>Payment Type : </PaymentTypeLabel>
              <PaymentTypeInput value={paymentType} onChange={handlePaymentTypeChange}>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </PaymentTypeInput>
            </PaymentTypeContainer>

            <NetContainer>
              <NetLabel htmlFor="Net">Net Amount:</NetLabel>
              <NetInput type="text" id="Net" value={netAmount} readOnly />
            </NetContainer>
          </FlexRow>
        )}
      </StyledContainer>
      <br />
      {selectedPatient && (
        <center>
          <div className="d-flex flex-column align-items-center">
            <Row className="g-3">
              <Col xs="auto">
                <button onClick={handleSaveData}>Save</button>
              </Col>
              <Col xs="auto">
                <button onClick={handleDownload}>Download</button>
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
