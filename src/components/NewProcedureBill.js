"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { format } from "date-fns"
import { FaPlus, FaTrash, FaDownload, FaCalendarAlt } from "react-icons/fa"
import "bootstrap/dist/css/bootstrap.min.css"
import "jspdf-autotable"
import { consumerItems } from "./constant"
import CreatableSelect from "react-select/creatable"
import { IoMdArrowRoundBack } from "react-icons/io"
import { ToastContainer, toast } from "react-toastify"
import PDFMain1 from "./images/PDF_Main_branch1.jpeg"
import PDFMain2 from "./images/PDF_Main_branch2.jpeg"
import "react-toastify/dist/ReactToastify.css"
import { useNavigate } from "react-router-dom"
import jsPDF from "jspdf"

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
  margin-bottom: 20px;
  border-radius: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  th, td {
    border: 1px solid #dee2e6;
    padding: 12px 8px;
    text-align: center;
    font-size: 14px;
  }
  
  th {
    background-color: #9b85a8;
    color: white;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  tr:hover {
    background-color: #e9ecef;
  }
  
  input, select {
    width: 100%;
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
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

const DownloadButton = styled.button`
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #138496;
  }
`

const ConsultationSection = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #dee2e6;
`

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-left: 80px;
  margin-bottom: 20px;
  color: #725F83;
  
  &:hover {
    color: #5a4b69;
  }
`

const DateSelectionContainer = styled.div`
  background-color: #f8f9fa;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  padding: 15px 25px;
  border-radius: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 90%;
  margin: 0 auto;
  justify-content: space-between;
`

const DateLabel = styled.label`
  font-weight: 600;
  margin-right: 15px;
  font-size: 16px;
  color: #495057;
`

const DateInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #9b85a8;
    box-shadow: 0 0 0 2px rgba(155, 133, 168, 0.2);
  }
`

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
`

const NewProcedureComponent = () => {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [consumerRecords, setConsumerRecords] = useState([])
  const [procedureNetAmount, setProcedureNetAmount] = useState("0")
  const [consumerNetAmount, setConsumerNetAmount] = useState("0")
  const [totalAmount, setTotalAmount] = useState("0")
  const [PaymentType, setPaymentType] = useState("Card")
  const [branchCode, setBranchCode] = useState("")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [existingProcedureBills, setExistingProcedureBills] = useState([])
  const [isLoadingProcedureBills, setIsLoadingProcedureBills] = useState(false)
  const [viewMode, setViewMode] = useState("existing")
  const [proceduresList, setProceduresList] = useState([])
  const [additionalProcedures, setAdditionalProcedures] = useState([])
  const [consultationFee, setConsultationFee] = useState(0)
  const [showConsumerTable, setShowConsumerTable] = useState(false)

  const navigate = useNavigate()
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  useEffect(() => {
    axios
      .get(`${Cosmetologybaseurl}Procedure/`)
      .then((response) => {
        const formattedProceduresList = response.data.map((procedure, index) => ({
          id: procedure.id || `proc_${index}`,
          procedure: procedure.procedure || "",
        }))
        setProceduresList(formattedProceduresList)
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
    }

    const patientData = sessionStorage.getItem("selectedPatient")
    if (patientData) {
      setSelectedPatient(JSON.parse(patientData))
    } else {
      setSelectedPatient({
        patientName: "New Patient",
        patientUID: "NEW001",
        patient_handledby: "Dr. DoctorName",
      })
    }
  }, [])

  useEffect(() => {
    if (selectedPatient && branchCode && selectedDate) {
      fetchExistingProcedureBills()
    }
  }, [selectedPatient, branchCode, selectedDate])

  const fetchExistingProcedureBills = async () => {
    if (!selectedPatient || !branchCode || !selectedDate) return

    setIsLoadingProcedureBills(true)
    try {
      const response = await axios.get(`${Cosmetologybaseurl}getnewprocedurebill/`, {
        params: {
          patientUID: selectedPatient.patientUID,
          appointmentDate: selectedDate,
          branch_code: branchCode,
        },
      })

      if (response.data && response.data.procedureBillingData) {
        // Parse JSON strings and flatten the data for table display
        const processedBills = []

        response.data.procedureBillingData.forEach((bill) => {
          // Parse procedures JSON string
          let procedures = []
          try {
            procedures = typeof bill.procedures === "string" ? JSON.parse(bill.procedures) : bill.procedures || []
          } catch (e) {
            console.error("Error parsing procedures:", e)
            procedures = []
          }

          // Parse consumer JSON string
          let consumer = []
          try {
            consumer = typeof bill.consumer === "string" ? JSON.parse(bill.consumer) : bill.consumer || []
          } catch (e) {
            console.error("Error parsing consumer:", e)
            consumer = []
          }

          // Add procedure rows
          procedures.forEach((proc, index) => {
            processedBills.push({
              ...bill,
              type: "procedure",
              procedure: proc.procedure,
              procedureDate: proc.procedureDate,
              price: proc.price,
              gstRate: proc.gstRate,
              gst: proc.gst,
              total: proc.total,
              item: "",
              qty: "",
              isFirstRow: index === 0,
              procedureCount: procedures.length,
              consumerCount: consumer.length,
            })
          })

          // Add consumer rows
          consumer.forEach((cons, index) => {
            processedBills.push({
              ...bill,
              type: "consumer",
              procedure: "",
              procedureDate: "",
              price: cons.price,
              gstRate: "",
              gst: "",
              total: cons.total,
              item: cons.item,
              qty: cons.qty,
              isFirstRow: index === 0 && procedures.length === 0,
              procedureCount: procedures.length,
              consumerCount: consumer.length,
            })
          })
        })

        setExistingProcedureBills(processedBills)
        if (processedBills.length > 0) {
          setViewMode("existing")
        } else {
          setViewMode("create")
        }
      } else {
        setExistingProcedureBills([])
        setViewMode("create")
      }
    } catch (error) {
      console.error("Error fetching existing bills:", error)
      setExistingProcedureBills([])
      setViewMode("create")
    } finally {
      setIsLoadingProcedureBills(false)
    }
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const handleAddProcedureRow = () => {
    const newRowId = `additional-procedure-${Date.now()}`
    setAdditionalProcedures((prev) => [
      ...prev,
      {
        id: newRowId,
        procedure: "",
        selectedProcedureId: "",
        procedureDate: selectedDate,
        price: "",
        gstRate: 18,
        gst: "",
        total: "",
        selected: true,
      },
    ])
  }

  const handleDeleteProcedureRow = (rowId) => {
    setAdditionalProcedures((prev) => prev.filter((row) => row.id !== rowId))
  }

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

  const handleAdditionalProcedureChange = (rowId, field, value) => {
    setAdditionalProcedures((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value }

          if (field === "price" || field === "gstRate") {
            const price = Number.parseFloat(field === "price" ? value : row.price) || 0
            const gstRate = Number.parseFloat(field === "gstRate" ? value : row.gstRate) || 0
            updatedRow.gst = calculateGST(price, gstRate)
            updatedRow.total = (price + Number.parseFloat(updatedRow.gst)).toFixed(2)
          } else if (field === "total") {
            // Allow manual editing of total
            updatedRow.total = value
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  const calculateGST = (price, gstRate) => {
    return price && gstRate ? ((price * gstRate) / 100).toFixed(2) : "0"
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

  const handleConsumerChange = (index, field, value) => {
    setConsumerRecords((prevRecords) => {
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
    const newRecords = [...consumerRecords]
    newRecords[index].item = selectedOption ? selectedOption.value : ""
    setConsumerRecords(newRecords)
  }

  const calculateProcedureTotal = () => {
    const additionalTotal = additionalProcedures.reduce((acc, procedure) => {
      if (procedure.selected) {
        return acc + (Number.parseFloat(procedure.total) || 0)
      }
      return acc
    }, 0)

    const consultationAmount = Number.parseFloat(consultationFee) || 0
    const total = additionalTotal + consultationAmount
    setProcedureNetAmount(total.toFixed(2))
  }

  const calculateConsumerTotal = () => {
    const total = consumerRecords.reduce((acc, record) => {
      const itemTotal = Number.parseFloat(record.total) || 0
      return acc + itemTotal
    }, 0)

    setConsumerNetAmount(total.toFixed(2))
  }

  useEffect(() => {
    calculateProcedureTotal()
  }, [additionalProcedures, consultationFee])

  useEffect(() => {
    calculateConsumerTotal()
  }, [consumerRecords])

  useEffect(() => {
    const procedureAmount = Number.parseFloat(procedureNetAmount) || 0
    const consumerAmount = Number.parseFloat(consumerNetAmount) || 0
    setTotalAmount((procedureAmount + consumerAmount).toFixed(2))
  }, [procedureNetAmount, consumerNetAmount])

  const handleSave = async () => {
    if (selectedPatient) {
      const additionalProceduresData = additionalProcedures
        .filter((procedure) => procedure.selected)
        .map((procedure) => ({
          procedure: procedure.procedure,
          procedureDate: procedure.procedureDate,
          price: procedure.price.toString(),
          gstRate: procedure.gstRate,
          gst: procedure.gst.toString(),
          total: procedure.total,
        }))

      const allProcedures = [...additionalProceduresData]

      if (consultationFee > 0) {
        allProcedures.push({
          procedure: "Consultation Fee",
          procedureDate: selectedDate,
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
        appointmentDate: selectedDate,
        procedureNetAmount: procedureNetAmount,
        consumerNetAmount: consumerNetAmount,
        totalAmount: totalAmount,
        PaymentType,
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
        toast.success(`New procedure bill generated successfully for ${selectedPatient.patientName}`)
        fetchExistingProcedureBills()
      } catch (error) {
        toast.error("Error generating new procedure bill")
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

const handleDownloadExisting = (bill) => {
  // Reconstruct the original bill structure for PDF generation
  let procedures = [];
  let consumer = [];
  let consultationFee = 0;

  // Parse procedures and consumer from the original bill data
  try {
    procedures = typeof bill.procedures === "string" ? JSON.parse(bill.procedures) : bill.procedures || [];
    consumer = typeof bill.consumer === "string" ? JSON.parse(bill.consumer) : bill.consumer || [];

    // Extract consultation fee from procedures and remove it from the array
    const consultationIndex = procedures.findIndex(proc => 
      proc.procedure && proc.procedure.toLowerCase().includes('consultation fee')
    );
    
    if (consultationIndex !== -1) {
      consultationFee = parseFloat(procedures[consultationIndex].total) || 0;
      procedures.splice(consultationIndex, 1); // Remove consultation fee from procedures
    }
  } catch (e) {
    console.error("Error parsing bill data for download:", e);
  }

  const originalBill = {
    patientName: bill.patientName,
    patientUID: bill.patientUID,
    procedures: procedures, // Procedures without consultation fee
    consumer: consumer,
    consultationFee: consultationFee, // Extracted consultation fee
    procedureNetAmount: bill.procedureNetAmount,
    consumerNetAmount: bill.consumerNetAmount,
    totalAmount: (
      Number.parseFloat(bill.procedureNetAmount || 0) + Number.parseFloat(bill.consumerNetAmount || 0)
    ).toFixed(2),
    PaymentType: bill.PaymentType,
  }

  generateProcedurePDF(originalBill, true)
}

const handleDownloadNew = () => {
  const billData = {
    patientName: selectedPatient.patientName,
    patientUID: selectedPatient.patientUID,
    procedures: additionalProcedures.filter((proc) => proc.selected),
    consumer: consumerRecords,
    consultationFee: consultationFee,
    procedureNetAmount: procedureNetAmount,
    consumerNetAmount: consumerNetAmount,
    totalAmount: totalAmount,
    PaymentType: PaymentType,
  }
  generateProcedurePDF(billData, false)
}

const generateProcedurePDF = (billData, isExisting) => {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Select PDF background based on branch code (same as original)
  const backgroundImageMap = {
    SCC001: PDFMain1,
    SCC002: PDFMain2,
  }
  const PDFMain = backgroundImageMap[branchCode] || PDFMain1

  convertToBase64(PDFMain, (mainImage) => {
    // Add background image with letterhead
    doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)

    // ======= Patient Details (Same styling as original) =======
    let startY = 85
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(30, 30, 30)
    doc.text(`Patient Name:`, 16, startY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(13)
    doc.text(`${billData.patientName.toUpperCase()}`, 60, startY)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(`Patient UID:`, 16, startY + 8)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(13)
    doc.text(`${billData.patientUID}`, 60, startY + 8)

    startY += 25

    // ======= Procedures Table =======
    if (billData.procedures && billData.procedures.length > 0) {
      const procedureTableData = billData.procedures.map((proc) => [
        proc.procedure,
        proc.procedureDate || format(new Date(), "yyyy-MM-dd"),
        proc.price,
        `${proc.gstRate || 0}%`,
        proc.gst || 0,
        proc.total || calculateTotal(proc.price, proc.gst || 0),
      ])

      doc.autoTable({
        head: [["Procedure", "Procedure Date", "Price", "GST Rate (%)", "GST", "Total"]],
        body: procedureTableData,
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

      startY = doc.lastAutoTable.finalY + 10
    }

    // ======= Consumer Records Table =======
    if (billData.consumer && billData.consumer.length > 0 && billData.consumer.some((record) => record.item)) {
      const consumerTableData = billData.consumer
        .filter((record) => record.item)
        .map((record) => [record.item, record.qty, record.price, record.total])

      if (consumerTableData.length > 0) {
        doc.autoTable({
          head: [["Item", "Qty", "Price", "Total"]],
          body: consumerTableData,
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

        startY = doc.lastAutoTable.finalY + 10
      }
    }

    let finalY = startY + 5

    // ======= Consultation Fee - Displayed Separately =======
    if (billData.consultationFee > 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text("Consultation Fee:", 16, finalY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.text(`Rs. ${billData.consultationFee.toFixed(2)}`, pageWidth - 16, finalY, { align: "right" })
      finalY += 10
    }

    // ======= Net Amounts - Displayed Separately =======
    // Add separator line
    doc.setDrawColor(150)
    doc.setLineWidth(0.5)
    doc.line(14, finalY, pageWidth - 14, finalY)
    finalY += 8

    // Procedure Net Amount
    if (billData.procedureNetAmount > 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text("Procedure Net Amount:", 16, finalY)
      doc.text(`Rs. ${billData.procedureNetAmount}`, pageWidth - 16, finalY, { align: "right" })
      finalY += 8
    }

    // Consumer Net Amount
    if (billData.consumerNetAmount > 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text("Consumer Net Amount:", 16, finalY)
      doc.text(`Rs. ${billData.consumerNetAmount}`, pageWidth - 16, finalY, { align: "right" })
      finalY += 8
    }

    // Total Amount
    finalY += 3
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(0, 100, 0)
    doc.text("Total Amount:", 16, finalY)
    doc.text(`Rs. ${billData.totalAmount}`, pageWidth - 16, finalY, { align: "right" })

    // Payment Type
    if (billData.PaymentType) {
      finalY += 10
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      doc.text(`Payment Type: ${billData.PaymentType}`, 16, finalY)
    }

    doc.save(`${billData.patientName}_ProcedureBill_${selectedDate}.pdf`)
  })
}

// Helper function for calculating total (if not already defined)
const calculateTotal = (price, gst) => {
  return (parseFloat(price) + parseFloat(gst)).toFixed(2)
}
  const handleBackClick = () => {
    navigate("/Reception/PatientDetails")
  }

  const consumerOptions = consumerItems.map((item) => ({ value: item, label: item }))

  return (
    <Container>
      <h3 className="text-center mb-4">Procedure Billing</h3>

      <BackButton onClick={handleBackClick}>
        <IoMdArrowRoundBack />
      </BackButton>
      <DateSelectionContainer>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaCalendarAlt style={{ marginRight: "10px", color: "#9b85a8" }} />
          <DateLabel htmlFor="appointmentDate">Select Appointment Date:</DateLabel>
          <DateInput type="date" id="appointmentDate" value={selectedDate} onChange={handleDateChange} />
        </div>
      </DateSelectionContainer>

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
          </InfoText>
        </InfoContainer>
      )}

      {viewMode === "existing" ? (
        <StyledContainer>
          {existingProcedureBills.length > 0 ? (
            <TableContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Type</th>
                    <th>Item/Procedure</th>
                    <th>Date</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>GST Rate</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Net Amount</th>
                    <th>Payment Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {existingProcedureBills.map((bill, index) => (
                    <tr key={index}>
                      {bill.isFirstRow && (
                        <>
                          <td rowSpan={bill.procedureCount + bill.consumerCount}>
                            {bill.procedureBillNumber || bill.consumerBillNumber}
                          </td>
                        </>
                      )}
                      <td>{bill.type === "procedure" ? "Procedure" : "Consumer"}</td>
                      <td>{bill.type === "procedure" ? bill.procedure : bill.item}</td>
                      <td>
                        {bill.procedureDate
                          ? new Date(bill.procedureDate).toString() !== "Invalid Date"
                            ? format(new Date(bill.procedureDate), "dd/MM/yyyy")
                            : bill.procedureDate
                          : "-"}
                      </td>
                      <td>{bill.qty || "-"}</td>
                      <td>₹{bill.price}</td>
                      <td>{bill.gstRate ? `${bill.gstRate}%` : "-"}</td>
                      <td>{bill.gst ? `₹${bill.gst}` : "-"}</td>
                      <td>₹{bill.total}</td>
                      {bill.isFirstRow && (
                        <>
                          <td rowSpan={bill.procedureCount + bill.consumerCount}>
                            ₹
                            {(
                              Number.parseFloat(bill.procedureNetAmount || 0) +
                              Number.parseFloat(bill.consumerNetAmount || 0)
                            ).toFixed(2)}
                          </td>
                          <td rowSpan={bill.procedureCount + bill.consumerCount}>{bill.paymentType}</td>
                          <td rowSpan={bill.procedureCount + bill.consumerCount}>
                            <DownloadButton onClick={() => handleDownloadExisting(bill)}>
                              <FaDownload />
                            </DownloadButton>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableContainer>
          ) : (
            <NoDataMessage>
              {isLoadingProcedureBills
                ? "Loading procedure bills..."
                : "No existing procedure bills found for the selected date"}
            </NoDataMessage>
          )}
        </StyledContainer>
      ) : (
        <StyledContainer>
          {/* Procedure Section */}
          <div style={{ marginBottom: "20px" }}>
            <h4>Procedures</h4>
            <AddRowButton onClick={handleAddProcedureRow}>
              <FaPlus />
              Add Procedure
            </AddRowButton>
          </div>

          {additionalProcedures.length > 0 && (
            <TableContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Procedure</th>
                    <th>Price</th>
                    <th>GST Rate (%)</th>
                    <th>GST Amount</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {additionalProcedures.map((procedure) => (
                    <tr key={procedure.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={procedure.selected}
                          onChange={(e) => handleAdditionalProcedureChange(procedure.id, "selected", e.target.checked)}
                        />
                      </td>
                      <td>
                        <select
                          value={procedure.selectedProcedureId}
                          onChange={(e) => handleProcedureSelect(procedure.id, e.target.value)}
                        >
                          <option value="">Select Procedure</option>
                          {proceduresList.map((proc) => (
                            <option key={proc.id} value={proc.id}>
                              {proc.procedure}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={procedure.price}
                          onChange={(e) => handleAdditionalProcedureChange(procedure.id, "price", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={procedure.gstRate}
                          onChange={(e) => handleAdditionalProcedureChange(procedure.id, "gstRate", e.target.value)}
                        />
                      </td>
                      <td>
                        <input type="number" value={procedure.gst} readOnly />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={procedure.total}
                          onChange={(e) => handleAdditionalProcedureChange(procedure.id, "total", e.target.value)}
                        />
                      </td>
                      <td>
                        <DeleteRowButton onClick={() => handleDeleteProcedureRow(procedure.id)}>
                          <FaTrash />
                        </DeleteRowButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableContainer>
          )}

          {/* Consultation Fee Section */}
          <ConsultationSection>
            <h5>Consultation Fee</h5>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label>Consultation Fee:</label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number.parseFloat(e.target.value) || 0)}
                style={{ padding: "8px", width: "120px" }}
              />
            </div>
          </ConsultationSection>

          {/* Consumer Section */}
          <div style={{ marginTop: "30px", marginBottom: "20px" }}>
            <h4>Consumer Items</h4>
            <AddRowButton onClick={handleShowConsumerTable}>
              <FaPlus />
              Add Consumer Item
            </AddRowButton>
          </div>

          {showConsumerTable && (
            <>
              <TableContainer>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumerRecords.map((record, index) => (
                      <tr key={index}>
                        <td>
                          <CreatableSelect
                            options={consumerOptions}
                            value={consumerOptions.find((option) => option.value === record.item)}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, index)}
                            onCreateOption={(newValue) => {
                              const newOption = { value: newValue, label: newValue }
                              consumerOptions.push(newOption)
                              handleSelectChange(newOption, index)
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={record.qty}
                            onChange={(e) => handleConsumerChange(index, "qty", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={record.price}
                            onChange={(e) => handleConsumerChange(index, "price", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={record.total}
                            onChange={(e) => handleConsumerChange(index, "total", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableContainer>
              <AddRowButton onClick={addConsumerRow}>
                <FaPlus />
                Add Item
              </AddRowButton>
            </>
          )}

          {/* Payment and Totals */}
          <FlexRow>
            <div>
              <label>Payment Type:</label>
              <select
                value={PaymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                style={{ padding: "8px", marginLeft: "10px" }}
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <strong>Procedure Net Amount: ₹{procedureNetAmount}</strong>
            </div>

            <div>
              <strong>Consumer Net Amount: ₹{consumerNetAmount}</strong>
            </div>

            <div>
              <strong>Total Amount: ₹{totalAmount}</strong>
            </div>
          </FlexRow>

          {/* Action Buttons */}
          <center style={{ marginTop: "20px" }}>
            <div className="d-flex justify-content-center gap-3">
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save Procedure Bill
              </button>
              <button
                onClick={handleDownloadNew}
                style={{
                  backgroundColor: "#17a2b8",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Download
              </button>
            </div>
          </center>
        </StyledContainer>
      )}

      <ToastContainer />
    </Container>
  )
}

export default NewProcedureComponent
