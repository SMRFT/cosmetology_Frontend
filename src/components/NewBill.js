import { useState, useEffect, forwardRef } from "react"
import styled from "styled-components"
import { Row, Col } from "react-bootstrap"
import { FaPlus, FaTrash } from "react-icons/fa"
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
  const navigate = useNavigate()
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
   useEffect(() => {
    // Get branch_code and user role from localStorage when component mounts
    const code = localStorage.getItem("selectedBranch")

    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from localStorage:", code)
    } else {
      console.warn("Branch code not found in localStorage")
    }
    // Get patient data from sessionStorage or props
    const patientData = sessionStorage.getItem('selectedPatient')
    if (patientData) {
      setSelectedPatient(JSON.parse(patientData))
    } else {
      // Default patient for demo - replace with actual patient selection logic
      setSelectedPatient({
        patientName: "New Patient",
        patientUID: "NEW001",
        patient_handledby: "Dr. DoctorName"
      })
    }
  }, [])


  // Fetch medicine options for dropdown
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
        console.log("Fetched medicines:", medicineData.length)
      })
      .catch((error) => {
        console.error("Error fetching medicine names:", error)
        toast.error("Failed to fetch medicine data")
      })
  }, [branchCode])

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value)
  }

  useEffect(() => {
    calculateNetAmount()
  }, [additionalRows, consultationFee, discount])

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
        selected: true,
      },
    ])
  }

  // Delete row functionality
  const handleDeleteRow = (rowId) => {
    setAdditionalRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  // Handle medicine selection from dropdown
  const handleMedicineSelect = (rowId, medicineId) => {
    const selectedMedicine = medicineOptions.find(med => med.id === medicineId)
    
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

  const calculateNetAmount = () => {
    let total = 0

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

  const handleSaveData = async () => {
    const errorMessages = []

    // Validate additional rows
    const additionalRowsData = additionalRows
      .filter((row) => row.selected)
      .map((row) => {
        if (!row.particulars || !row.quantity || !row.price) {
          errorMessages.push(`Please fill all fields for medicine: ${row.particulars || 'Unknown'}`)
          return null
        }
        return {
          particulars: row.particulars,
          qty: row.quantity,
          price: row.price,
          total: (Number.parseFloat(row.price) * Number.parseFloat(row.quantity)).toFixed(2),
          CGST_percentage: row.CGST_percentage,
          CGST_value: row.CGST_value,
          SGST_percentage: row.SGST_percentage,
          SGST_value: row.SGST_value,
          batch_number: row.batch_number,
        }
      })
      .filter(Boolean)

    // Add consultation fee if present
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

    let calculatedNetAmount = 0
    additionalRowsData.forEach((item) => {
      calculatedNetAmount += Number.parseFloat(item.total) || 0
    })

    const discountAmount = (calculatedNetAmount * discount) / 100
    const discountedNetAmount = calculatedNetAmount - discountAmount

    setNetAmount(discountedNetAmount.toFixed(2))

    const dataToSubmit = {
      patientName: selectedPatient.patientName,
      patientUID: selectedPatient.patientUID,
      patient_handledby: selectedPatient.patient_handledby || "N/A",
      appointmentDate: format(new Date(), "yyyy-MM-dd"),
      table_data: additionalRowsData,
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
    // Additional rows stock updates now include batch_number
    const additionalStockUpdates = additionalRows
        .filter((row) => row.selected)
        .map((row) => ({
            medicine_name: row.particulars,
            qty: row.quantity,
            branch_code: branchCode,
            batch_number: row.batch_number, // Added batch_number
        }));

    let allStockUpdated = true;

    for (const stockUpdate of additionalStockUpdates) {
        try {
            const response = await fetch(`${Cosmetologybaseurl}update_stock/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(stockUpdate),
            });

            if (!response.ok) {
                // Read the error message from the response if available
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update stock");
            }

            const data = await response.json();
            toast.success("Stock updated successfully!");
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error(`Error updating stock: ${error.message}`); // Display specific error from backend
            allStockUpdated = false;
            break;
        }
    }

    return allStockUpdated;
};

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
    if (!selectedPatient || !additionalRows.length) {
      console.error("No patient selected or billing data is empty")
      return
    }

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
    const allPDFRows = [...additionalRowsForPDF]
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
      alert("Please add items to download the bill.")
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
      doc.save(`${selectedPatient.patientName}_NewBill.pdf`)
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
            </InfoText>
          </InfoContainer>
        ) : null}
      </div>

      <StyledContainer>
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
                      value={row.particulars ? medicineOptions.find(med => med.label === row.particulars)?.id || "" : ""}
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

        <FlexRow>
          <DiscountContainer>
            <DiscountLabel htmlFor="discount">Discount % : </DiscountLabel>
            <DiscountInput
              type="text"
              id="discount"
              value={discount}
              placeholder="Discount %"
              onChange={handleDiscountChange}
            />
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
      </StyledContainer>
      <br />
      
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
    </Container>
  )
}

export default NewBill