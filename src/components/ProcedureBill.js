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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

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

const ProcedureComponent = () => {
  const [patients, setPatients] = useState([])
  const [detailedRecords, setDetailedRecords] = useState([])
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
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  // New states for procedure management
  const [proceduresList, setProceduresList] = useState([])
  const [additionalProcedures, setAdditionalProcedures] = useState([])
  const [consultationFee, setConsultationFee] = useState(0)

  // New state to control consumer table visibility
  const [showConsumerTable, setShowConsumerTable] = useState(false)

  const datePickerRef = useRef(null)

  // Fetch procedures list
  useEffect(() => {
    axios
      .get(`${Cosmetologybaseurl}Procedure/`)
      .then((response) => {
        const formattedProceduresList = response.data.map((procedure, index) => ({
          id: procedure.id || `proc_${index}`,
          procedure: procedure.procedure || "",
        }))
        setProceduresList(formattedProceduresList)
        console.log("Fetched procedures:", formattedProceduresList)
      })
      .catch((error) => {
        console.error("Error fetching procedures data:", error)
        toast.error("Error fetching procedures data")
      })
  }, [])

    useEffect(() => {
      const code = localStorage.getItem("selectedBranch")
      if (code) {
        setBranchCode(code)
        console.log("Branch code retrieved from localStorage:", code)
  
      } else {
        console.warn("Branch code not found in localStorage")
      }
    const initialDate = new Date()
    setSelectedDate(initialDate,branchCode)
    fetchProcedures(initialDate,branchCode)
    }, [branchCode])
  

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value)
  }

  const fetchProcedures = async (date) => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const response = await axios.get(
        `${Cosmetologybaseurl}get_procedures_bill/?appointmentDate=${formattedDate}&branch_code=${branchCode}`,
      )
      if (Array.isArray(response.data.detailedRecords)) {
        setPatients(response.data.detailedRecords)
        if (!selectedPatient) {
          setDetailedRecords([])
        }
      } else {
        console.error("Expected an array for detailedRecords, but received:", response.data.detailedRecords)
        setPatients([])
        setDetailedRecords([])
      }
    } catch (error) {
      console.error("Error fetching procedure list", error)
      setPatients([])
      setDetailedRecords([])
    }
  }

  useEffect(() => {
    if (selectedPatient) {
      const selectedPatientProcedures = patients.filter((record) => record.patientUID === selectedPatient.patientUID)
      setDetailedRecords(selectedPatientProcedures)
      // Reset consumer records to empty array instead of initializing with one empty item
      setConsumerRecords([])
      // Hide consumer table when selecting a new patient
      setShowConsumerTable(false)
    } else {
      setDetailedRecords([])
      setConsumerRecords([])
      setAdditionalProcedures([])
      setConsultationFee(0)
      setShowConsumerTable(false)
    }
  }, [selectedPatient, patients])

  const handleDateChange = (date) => {
    setSelectedDate(date)
    fetchProcedures(date)
  }

  const handleViewClick = (patient) => {
    setSelectedPatient(patient)
    setViewDetails(true)
  }

  const handleBackClick = () => {
    setSelectedPatient(null)
    setViewDetails(false)
    setAdditionalProcedures([])
    setConsultationFee(0)
    setShowConsumerTable(false)
  }

  // Add new procedure row functionality
  const handleAddProcedureRow = () => {
    const newRowId = `additional-procedure-${Date.now()}`
    setAdditionalProcedures((prev) => [
      ...prev,
      {
        id: newRowId,
        procedure: "",
        selectedProcedureId: "", // Add this to track selected procedure ID
        procedureDate: format(new Date(), "yyyy-MM-dd"),
        price: "",
        gstRate: 18,
        gst: "",
        selected: false,
      },
    ])
  }

  // Delete procedure row functionality
  const handleDeleteProcedureRow = (rowId) => {
    setAdditionalProcedures((prev) => prev.filter((row) => row.id !== rowId))
  }

  // Handle procedure selection from dropdown
  const handleProcedureSelect = (rowId, selectedValue) => {
    console.log("Procedure selected:", selectedValue, "for row:", rowId)

    if (!selectedValue) {
      // Clear selection
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
    console.log("Found procedure:", selectedProcedure)

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

  // Update additional procedure data
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

  const handleTotalChange = (index, newTotal) => {
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

  const consumerOptions = consumerItems.map((item) => ({ value: item, label: item }))

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

  // Show consumer table and add first row when button is clicked
  const handleShowConsumerTable = () => {
    setShowConsumerTable(true)
    // Only add a new row if there are no rows yet
    if (consumerRecords.length === 0) {
      setConsumerRecords([{ item: "", qty: "", price: "", total: "" }])
    }
  }

  const addConsumerRow = () => {
    setConsumerRecords((prevRecords) => [...prevRecords, { item: "", qty: "", price: "", total: "" }])
  }

  const calculateProcedureTotal = () => {
    // Calculate total from existing procedures
    const existingTotal = detailedRecords.reduce((acc, record) => {
      return (
        acc +
        record.procedures.reduce((sum, procedure) => {
          const price = Number.parseFloat(procedure.price) || 0
          const gst = Number.parseFloat(procedure.gst) || 0
          return sum + price + gst
        }, 0)
      )
    }, 0)

    // Calculate total from additional procedures
    const additionalTotal = additionalProcedures.reduce((acc, procedure) => {
      if (procedure.selected) {
        const price = Number.parseFloat(procedure.price) || 0
        const gst = Number.parseFloat(procedure.gst) || 0
        return acc + price + gst
      }
      return acc
    }, 0)

    // Add consultation fee
    const consultationAmount = Number.parseFloat(consultationFee) || 0

    const total = existingTotal + additionalTotal + consultationAmount
    setProcedureNetAmount(total.toFixed(2))
  }

  useEffect(() => {
    calculateProcedureTotal()
  }, [detailedRecords, additionalProcedures, consultationFee])

  useEffect(() => {
    const procedureAmount = Number.parseFloat(procedureNetAmount) || 0
    const consumerAmount = Number.parseFloat(consumerNetAmount) || 0
    setTotalAmount((procedureAmount + consumerAmount).toFixed(2))
  }, [procedureNetAmount, consumerNetAmount])

  const calculateConsumerTotal = () => {
    const total = consumerRecords.reduce((acc, record) => {
      const itemTotal = Number.parseFloat(record.total) || 0
      return acc + itemTotal
    }, 0)

    setConsumerNetAmount(total.toFixed(2))
  }

  useEffect(() => {
    calculateConsumerTotal()
  }, [consumerRecords])

  const handleSave = async () => {
    if (selectedPatient) {
      const appointmentDate = detailedRecords[0]?.appointmentDate

      const proceduresWithoutPatientInfo = detailedRecords.flatMap(({ procedures }) => {
        return procedures.map((procedure) => {
          const price = Number.parseFloat(procedure.price) || 0
          const gst = Number.parseFloat(procedure.gst) || 0
          const total = price + gst
          return {
            ...procedure,
            total: total.toFixed(2),
          }
        })
      })

      // Add additional procedures to the payload
      const additionalProceduresData = additionalProcedures
        .filter((procedure) => procedure.selected)
        .map((procedure) => {
          const price = Number.parseFloat(procedure.price) || 0
          const gst = Number.parseFloat(procedure.gst) || 0
          const total = price + gst
          return {
            procedure: procedure.procedure,
            procedureDate: procedure.procedureDate,
            price: price.toString(),
            gstRate: procedure.gstRate,
            gst: gst.toString(),
            total: total.toFixed(2),
          }
        })

      const allProcedures = [...proceduresWithoutPatientInfo, ...additionalProceduresData]

      // Add consultation fee as a procedure if present
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
      }

      try {
        const response = await axios.post(`${Cosmetologybaseurl}Post_Procedure_Bill/`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
        toast.success(`Procedure bill generated successfully for ${selectedPatient.patientName}`)
      } catch (error) {
        toast.error("Error generating procedure bill")
      }
    } else {
      toast.error("No patient selected")
    }
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

    // Select PDF background based on branch code without directly using branch names
    const backgroundImageMap = {
      SCC001: PDFMain1,
      SCC002: PDFMain2,
    }
    const PDFMain = backgroundImageMap[branchCode] || PDFMain1

    convertToBase64(PDFMain, (mainImage) => {
      doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
      const startY = 85

      // Enhanced patient name styling
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.setTextColor(40, 40, 40)
      doc.text(`Patient: ${selectedPatient.patientName.toUpperCase()}`, 16, startY)

      // Patient details with improved formatting
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.text(`Patient UID: ${selectedPatient.patientUID}`, 16, startY + 10)

      let yOffset = startY + 20

      // Add procedure details table with enhanced styling
      if (detailedRecords.length > 0 || additionalProcedures.some((p) => p.selected)) {
        const existingProcedureTable = detailedRecords.flatMap((record) =>
          record.procedures.map((procedure) => [
            procedure.procedure,
            procedure.procedureDate,
            `${procedure.price}`,
            `${procedure.gstRate}%`,
            `${calculateGST(procedure.price, procedure.gstRate)}`,
            `${calculateTotal(procedure.price, calculateGST(procedure.price, procedure.gstRate))}`,
          ]),
        )

        const additionalProcedureTable = additionalProcedures
          .filter((procedure) => procedure.selected)
          .map((procedure) => [
            procedure.procedure,
            procedure.procedureDate,
            `${procedure.price}`,
            `${procedure.gstRate}%`,
            `${procedure.gst}`,
            `${calculateTotal(procedure.price, procedure.gst)}`,
          ])

        const allProcedureTable = [...existingProcedureTable, ...additionalProcedureTable]

        // Add consultation fee to PDF if present
        if (consultationFee > 0) {
          allProcedureTable.push([
            "Consultation Fee",
            format(new Date(), "yyyy-MM-dd"),
            consultationFee.toString(),
            "0%",
            "0",
            consultationFee.toFixed(2),
          ])
        }

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

      // Add consumer records table with enhanced styling
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

      // Enhanced total amount styling
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(0, 100, 0)
      doc.text(`Total Amount: ${totalAmount}`, 14, yOffset)

      // Save the PDF
      doc.save(`${selectedPatient.patientName}_procedure_bill.pdf`)
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
                  <h4 style={{ fontWeight: "600" }}>Procedures</h4>
                  <AddRowButton onClick={handleAddProcedureRow}>
                    <FaPlus /> Add Procedure
                  </AddRowButton>
                </div>
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
                    {/* Existing procedures */}
                    {detailedRecords.map((record, recordIndex) => {
                      return record.procedures.map((procedure, index) => {
                        const gst = calculateGST(procedure.price, procedure.gstRate)
                        const total = calculateTotal(procedure.price, gst)

                        return (
                          <tr key={`${recordIndex}-${index}`}>
                            <td>
                              <input type="checkbox" checked disabled />
                            </td>
                            <td>{procedure.procedure}</td>
                            <td>{procedure.procedureDate}</td>
                            <td>
                              <input
                                type="text"
                                value={procedure.price}
                                onChange={(e) => handlePriceChange(index, e.target.value)}
                                className="form-control"
                                placeholder="Enter price"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={procedure.gstRate}
                                onChange={(e) => handleGstRateChange(index, e.target.value)}
                                className="form-control"
                                placeholder="Enter GST rate"
                              />
                            </td>
                            <td>{gst}</td>
                            <td>
                              <input
                                type="text"
                                value={total}
                                onChange={(e) => handleTotalChange(index, e.target.value)}
                                className="form-control"
                                placeholder="Enter total"
                              />
                            </td>
                            <td>-</td>
                          </tr>
                        )
                      })
                    })}

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
                          <input
                            type="text"
                            value={procedure.price}
                            onChange={(e) => handleAdditionalProcedureChange(procedure.id, "price", e.target.value)}
                            className="form-control"
                            placeholder="Enter price"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={procedure.gstRate}
                            onChange={(e) => handleAdditionalProcedureChange(procedure.id, "gstRate", e.target.value)}
                            className="form-control"
                            placeholder="GST rate"
                          />
                        </td>
                        <td>{procedure.gst}</td>
                        <td>{calculateTotal(procedure.price, procedure.gst)}</td>
                        <td>
                          <FaTrash
                            style={{ cursor: "pointer", color: "#dc3545" }}
                            onClick={() => handleDeleteProcedureRow(procedure.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
                                  consumerOptions.find((option) => option.value === record.item) || {
                                    value: record.item,
                                    label: record.item,
                                  }
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
                      <button onClick={handleSave}>
                        Save
                      </button>
                    </Col>
                    <Col xs="auto">
                      <button onClick={handleDownload}>
                        Download as PDF
                      </button>
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
            {patients.length > 0 ? (
              patients.map((patient, index) => (
                <PatientContainer key={index}>
                  <PatientCard>
                    <div className="card-title">{patient.patientName}</div>
                    <div className="card-subtitle">{patient.patientUID}</div>
                    <button style={{ fontSize: "0.9rem" }} onClick={() => handleViewClick(patient)}>
                      View Procedure
                    </button>
                  </PatientCard>
                  <br />
                </PatientContainer>
              ))
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "300px" }}>
                <p style={{ fontSize: "18px", color: "#666", fontWeight: "500" }}>No procedures found for this date.</p>
              </div>
            )}
          </PatientProcedureContainer>
        </div>
      )}
    </Container>
  )
}

export default ProcedureComponent
