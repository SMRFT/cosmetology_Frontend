"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { FaPlus, FaTrash, FaCalendarAlt, FaDownload } from "react-icons/fa"
import { format } from "date-fns"
import { IoMdArrowRoundBack } from "react-icons/io"
import jsPDF from "jspdf"
import "jspdf-autotable"
import PDFMain1 from "./images/PDF_Main_branch1.jpeg"
import PDFMain2 from "./images/PDF_Main_branch2.jpeg"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { useNavigate } from "react-router-dom"

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
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  padding: 15px 25px;
  border-radius: 8px;
  margin-bottom: 20px;
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

const NewBill = () => {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [medicineOptions, setMedicineOptions] = useState([])
  const [additionalRows, setAdditionalRows] = useState([])
  const [consultationFee, setConsultationFee] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [netAmount, setNetAmount] = useState("0.00")
  const [paymentType, setPaymentType] = useState("Card")
  const [section, setSection] = useState("Pharmacy")
  const [branchCode, setBranchCode] = useState("")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [existingBills, setExistingBills] = useState([])
  const [isLoadingBills, setIsLoadingBills] = useState(false)
  const [viewMode, setViewMode] = useState("existing") // "existing" or "create"

  const navigate = useNavigate()
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

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
      fetchExistingBills()
    }
  }, [selectedPatient, branchCode, selectedDate])

  useEffect(() => {
    if (!branchCode) return

    axios
      .get(`${Cosmetologybaseurl}pharmacy/data/`, {
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
      })
      .catch((error) => {
        console.error("Error fetching medicine names:", error)
        toast.error("Failed to fetch medicine data")
      })
  }, [branchCode])

  const fetchExistingBills = async () => {
    if (!selectedPatient || !branchCode || !selectedDate) return

    setIsLoadingBills(true)
    try {
      const response = await axios.get(`${Cosmetologybaseurl}getnewbill/`, {
        params: {
          patientUID: selectedPatient.patientUID,
          appointmentDate: selectedDate,
          branch_code: branchCode,
        },
      })

      if (response.data && response.data.billingData) {
        setExistingBills(response.data.billingData)
        if (response.data.billingData.length > 0) {
          setViewMode("existing")
        } else {
          setViewMode("create")
        }
      } else {
        setExistingBills([])
        setViewMode("create")
      }
    } catch (error) {
      console.error("Error fetching existing bills:", error)
      setExistingBills([])
      setViewMode("create")
    } finally {
      setIsLoadingBills(false)
    }
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const handleAddRow = () => {
    const newRowId = `additional-${Date.now()}`
    setAdditionalRows((prev) => [
      ...prev,
      {
        id: newRowId,
        particulars: "",
        quantity: 1,
        price: 0,
        total: 0,
        CGST_percentage: 0,
        CGST_value: 0,
        SGST_percentage: 0,
        SGST_value: 0,
        batch_number: "",
        selected: true,
      },
    ])
  }

  const handleDeleteRow = (rowId) => {
    setAdditionalRows((prev) => prev.filter((row) => row.id !== rowId))
  }

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
                total: selectedMedicine.price * row.quantity || 0,
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

  const handleAdditionalRowChange = (rowId, field, value) => {
    setAdditionalRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value }

          // Recalculate total when quantity or price changes
          if (field === "quantity" || field === "price") {
            const quantity = field === "quantity" ? Number.parseFloat(value) || 0 : Number.parseFloat(row.quantity) || 0
            const price = field === "price" ? Number.parseFloat(value) || 0 : Number.parseFloat(row.price) || 0
            updatedRow.total = quantity * price
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  const calculateNetAmount = () => {
    let total = 0

    additionalRows.forEach((row) => {
      if (row.selected) {
        total += Number.parseFloat(row.total) || 0
      }
    })

    total += Number.parseFloat(consultationFee) || 0

    if (isNaN(total) || total <= 0) {
      setNetAmount("0.00")
      return
    }

    const discountAmount = (total * discount) / 100
    const finalAmount = total - discountAmount
    setNetAmount(finalAmount.toFixed(2))
  }

  useEffect(() => {
    calculateNetAmount()
  }, [additionalRows, consultationFee, discount])

  const handleSaveData = async () => {
    const errorMessages = []

    const additionalRowsData = additionalRows
      .filter((row) => row.selected)
      .map((row) => {
        if (!row.particulars || !row.quantity || !row.price) {
          errorMessages.push(`Please fill all fields for medicine: ${row.particulars || "Unknown"}`)
          return null
        }
        return {
          particulars: row.particulars,
          qty: row.quantity,
          price: row.price,
          total: Number.parseFloat(row.total).toFixed(2),
          CGST_percentage: row.CGST_percentage,
          CGST_value: row.CGST_value,
          SGST_percentage: row.SGST_percentage,
          SGST_value: row.SGST_value,
          batch_number: row.batch_number,
        }
      })
      .filter(Boolean)

    if (consultationFee > 0) {
      additionalRowsData.push({
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

    const dataToSubmit = {
      patientName: selectedPatient.patientName,
      patientUID: selectedPatient.patientUID,
      patient_handledby: selectedPatient.patient_handledby || "N/A",
      appointmentDate: selectedDate,
      table_data: additionalRowsData,
      paymentType,
      section,
      netAmount: netAmount,
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

      toast.success(`Billing was generated successfully for ${selectedPatient.patientName}`)
      fetchExistingBills()
    // Navigate back to patient list after successful save
    setTimeout(() => {
      handleBackClick()
    }, 3000) // Wait 2 seconds to show success message
    } catch (error) {
      console.error("Error submitting data:", error)
      toast.error("Error submitting data.")
    }
  }

const handleDownloadExisting = (bill) => {
  // Parse table_data if it's a string
  let tableData = [];
  let consultationFee = 0;
  
  try {
    tableData = typeof bill.table_data === "string" ? JSON.parse(bill.table_data) : bill.table_data || [];
    
    // Extract consultation fee from table_data and remove it from the array
    const consultationIndex = tableData.findIndex(item => 
      item.particulars && item.particulars.toLowerCase().includes('consultation fee')
    );
    
    if (consultationIndex !== -1) {
      consultationFee = parseFloat(tableData[consultationIndex].total) || 0;
      tableData.splice(consultationIndex, 1); // Remove consultation fee from table data
    }
  } catch (e) {
    console.error("Error parsing table data:", e);
  }

  const billData = {
    patientName: bill.patientName,
    patientUID: bill.patientUID,
    table_data: tableData, // Table data without consultation fee
    consultationFee: consultationFee, // Extracted consultation fee
    netAmount: bill.netAmount,
    discount: bill.discount || '0%',
    paymentType: bill.paymentType,
  }
  
  generatePDF(billData, true)
}

const handleDownloadNew = () => {
  const billData = {
    patientName: selectedPatient.patientName,
    patientUID: selectedPatient.patientUID,
    table_data: additionalRows
      .filter((row) => row.selected)
      .map((row) => ({
        particulars: row.particulars,
        qty: row.quantity,
        price: row.price,
        total: row.total.toFixed(2),
        CGST_percentage: row.CGST_percentage,
        CGST_value: row.CGST_value,
        SGST_percentage: row.SGST_percentage,
        SGST_value: row.SGST_value,
        batch_number: row.batch_number,
      })),
    consultationFee: consultationFee,
    netAmount: netAmount,
    discount: `${discount}%`,
    paymentType: paymentType,
  }
  generatePDF(billData, false)
}

const generatePDF = (billData, isExisting) => {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const backgroundImageMap = {
    SCC001: PDFMain1,
    SCC002: PDFMain2,
  }
  const PDFMain = backgroundImageMap[branchCode] || PDFMain1

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

    // ======= Patient Details (Minimal) =======
      let startY = 110
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(30, 30, 30)
      doc.text(`Patient Name:`, 16, startY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${selectedPatient.patientName.toUpperCase()}`, 50, startY)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(`Patient UID:`, 16, startY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${selectedPatient.patientUID}`, 50, startY + 8)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(`Date:`, 140, startY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${selectedDate}`, 170, startY)

    startY += 25

    // ======= ONLY TABLE DATA - No other items in table =======
    const tableData = billData.table_data.map((item) => [
      item.particulars,
      item.qty,
      item.price,
      item.CGST_percentage || "N/A",
      item.CGST_value || "N/A",
      item.SGST_percentage || "N/A",
      item.SGST_value || "N/A",
      item.batch_number || "N/A",
      item.total,
    ])

    doc.autoTable({
      head: [
        ["Particulars", "Qty", "Price", "CGST (%)", "CGST Value", "SGST (%)", "SGST Value", "Batch No.", "Total"],
      ],
      body: tableData,
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

    let finalY = doc.lastAutoTable.finalY + 15

    // ======= Consultation Fee - Displayed Separately =======
    if (billData.consultationFee > 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text("Consultation Fee:", 130, finalY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.text(`Rs. ${billData.consultationFee.toFixed(2)}`, 170, finalY)
      finalY += 10
    }


    if (discount > 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text("Discount %", 130, finalY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.text(`${discount}`, 170, finalY)
      finalY += 8
    }
    // ======= Net Amount - Displayed Separately =======
    // Add separator line
    doc.setDrawColor(150)
    doc.setLineWidth(0.5)
    doc.line(14, finalY, pageWidth - 14, finalY)
    finalY += 6

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(0, 100, 0)
    doc.text("Net Amount:", 130, finalY)
    doc.text(`Rs. ${billData.netAmount || "N/A"}`, 170, finalY)

    doc.save(`${billData.patientName}_Bill_${selectedDate}.pdf`)
  })
}
  const handleBackClick = () => {
    navigate("/Reception/PatientDetails")
  }

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <h3 className="text-center mb-4">New Billing</h3>

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
        <>
          {existingBills.length > 0 ? (
            <TableContainer style={{width:"90%",  margin: '0 auto', marginTop:"20px"}}>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Patient Name</th>
                    <th>Particulars</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>CGST %</th>
                    <th>CGST Value</th>
                    <th>SGST %</th>
                    <th>SGST Value</th>
                    <th>Batch No.</th>
                    <th>Total</th>
                    <th>Net Amount</th>
                    <th>Payment Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {existingBills.map(
                    (bill, billIndex) =>
                      bill.table_data &&
                      bill.table_data.map((item, itemIndex) => (
                        <tr key={`${billIndex}-${itemIndex}`}>
                          {itemIndex === 0 && (
                            <>
                              <td rowSpan={bill.table_data.length}>{bill.billNumber}</td>
                              <td rowSpan={bill.table_data.length}>{bill.patientName}</td>
                            </>
                          )}
                          <td>{item.particulars}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price}</td>
                          <td>{item.CGST_percentage}</td>
                          <td>{item.CGST_value}</td>
                          <td>{item.SGST_percentage}</td>
                          <td>{item.SGST_value}</td>
                          <td>{item.batch_number}</td>
                          <td>₹{item.total}</td>
                          {itemIndex === 0 && (
                            <>
                              <td rowSpan={bill.table_data.length}>₹{bill.netAmount}</td>
                              <td rowSpan={bill.table_data.length}>{bill.paymentType}</td>
                              <td rowSpan={bill.table_data.length}>
                                <DownloadButton onClick={() => handleDownloadExisting(bill)}>
                                  <FaDownload />
                                </DownloadButton>
                              </td>
                            </>
                          )}
                        </tr>
                      )),
                  )}
                </tbody>
              </StyledTable>
            </TableContainer>
          ) : (
            <NoDataMessage>
              {isLoadingBills ? "Loading bills..." : "No existing bills found for the selected date"}
            </NoDataMessage>
          )}
        </>
      ) : (
        <StyledContainer>
          <AddRowButton onClick={handleAddRow}>
            <FaPlus /> Add Medicine
          </AddRowButton>

          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Particulars</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>CGST %</th>
                  <th>CGST Value</th>
                  <th>SGST %</th>
                  <th>SGST Value</th>
                  <th>Batch Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {additionalRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(e) => handleAdditionalRowChange(row.id, "selected", e.target.checked)}
                      />
                    </td>
                    <td>
                      <select
                        value={
                          row.particulars ? medicineOptions.find((med) => med.label === row.particulars)?.id || "" : ""
                        }
                        onChange={(e) => handleMedicineSelect(row.id, e.target.value)}
                      >
                        <option value="">Select Medicine...</option>
                        {medicineOptions.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => handleAdditionalRowChange(row.id, "quantity", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => handleAdditionalRowChange(row.id, "price", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.total}
                        onChange={(e) => handleAdditionalRowChange(row.id, "total", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.CGST_percentage}
                        onChange={(e) => handleAdditionalRowChange(row.id, "CGST_percentage", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.CGST_value}
                        onChange={(e) => handleAdditionalRowChange(row.id, "CGST_value", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.SGST_percentage}
                        onChange={(e) => handleAdditionalRowChange(row.id, "SGST_percentage", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.SGST_value}
                        onChange={(e) => handleAdditionalRowChange(row.id, "SGST_value", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.batch_number}
                        onChange={(e) => handleAdditionalRowChange(row.id, "batch_number", e.target.value)}
                      />
                    </td>
                    <td>
                      <DeleteRowButton onClick={() => handleDeleteRow(row.id)}>
                        <FaTrash />
                      </DeleteRowButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>

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

          <FlexRow>
            <div>
              <label htmlFor="discount">Discount % : </label>
              <input
                type="number"
                id="discount"
                value={discount}
                placeholder="Discount %"
                onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                style={{ padding: "8px", marginLeft: "10px", width: "100px" }}
              />
            </div>

            <div>
              <label>Payment Type : </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                style={{ padding: "8px", marginLeft: "10px" }}
              >
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label htmlFor="Net">Net Amount:</label>
              <input
                type="text"
                id="Net"
                value={netAmount}
                readOnly
                style={{ padding: "8px", marginLeft: "10px", backgroundColor: "#f8f9fa" }}
              />
            </div>
          </FlexRow>

          <center style={{ marginTop: "20px" }}>
            <div className="d-flex justify-content-center gap-3">
              <button onClick={handleSaveData}>
                Save
              </button>
              <button onClick={handleDownloadNew}>
                Download
              </button>
            </div>
          </center>
        </StyledContainer>
      )}
    </Container>
  )
}

export default NewBill
