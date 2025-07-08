"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { MDBTableHead, MDBTableBody } from "mdb-react-ui-kit"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { startOfMonth, format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDay, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"
import { FaDownload, FaFilePdf } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import "jspdf-autotable"
import Admin from "./images/SVKprescription.jpg"
import Doctor from "./images/AllDoctorsprescription.jpg"
import "./DatePicker.css"

const SummaryReport = () => {
  const [summaryData, setSummaryData] = useState(null)
  const [selectedInterval, setSelectedInterval] = useState("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [branchCode, setBranchCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  const getReportHeading = (interval) => {
    switch (interval) {
      case "day":
        return "Daily Report"
      case "month":
        return "Monthly Report"
      default:
        return "Summary Report"
    }
  }

  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")

    if (code) {
      setBranchCode(code)
    } else {
      console.warn("Branch code not found in localStorage")
      setError("Branch code not found. Please ensure you are logged in.")
      toast.error("Branch code not found. Please log in again.")
    }
  }, [])

  useEffect(() => {
    if (branchCode) {
      fetchData(selectedInterval)
    }
  }, [branchCode, selectedInterval, selectedDate])

  const fetchData = async (interval) => {
    if (!branchCode) {
      console.warn("Branch code is not available, skipping data fetch.")
      setSummaryData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let dateParam = ""
    if (interval === "day") {
      dateParam = format(selectedDate, "yyyy-MM-dd")
    } else if (interval === "month") {
      const startOfMonthDate = startOfMonth(selectedDate)
      dateParam = format(startOfMonthDate, "yyyy-MM-dd")
    }

    try {
      const response = await axios.get(`${Cosmetologybaseurl}summary/${interval}/`, {
        params: {
          appointmentDate: dateParam,
          branch_code: branchCode,
        },
        withCredentials: true,
      })
      setSummaryData(response.data.summary_data)

      if (!response.data.summary_data || Object.keys(response.data.summary_data).length === 0) {
        toast.info("No data found for the selected criteria.")
      }
    } catch (error) {
      console.error("Error fetching data:", error.response ? error.response.data : error.message)
      setError("Failed to fetch summary data. Please try again.")
      setSummaryData(null)
      toast.error("Failed to fetch data.")
    } finally {
      setLoading(false)
    }
  }

  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval)
    if (interval === "day" || interval === "month") {
      setSelectedDate(new Date())
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

// Enhanced Multi-Page PDF Export Function for Individual Patient
const exportPatientToPDF = (patientData) => {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - 120 // Reserve more space for header, footer, and signature
  const signatureSpace = 60 // Space reserved for doctor signature
  const minSignatureY = pageHeight - signatureSpace // Minimum Y position for signature

  // Data sanitization helpers
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

  // Helper function to add doctor signature with proper spacing
  const addDoctorSignature = (doc, pageNumber = 1) => {
    const doctorName = patientData?.patient_handledby || "Doctor"
    
    // Add signature line
    const signatureLineY = pageHeight - 55
    const signatureLineStartX = pageWidth - margin - 80
    const signatureLineEndX = pageWidth - margin - 10
    
    // Add doctor name below signature line
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text(`Dr. ${doctorName}`, signatureLineStartX + 40, signatureLineY )
  }

  // Select PDF background based on patient_handledby
  const PDFMain = patientData.patient_handledby === "Vijayakannan" ? Admin : Doctor

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
    // Add background to first page
    doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)

    let currentY = 80

    // Header information
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)

    const patientName = patientData?.patientName || "Unknown Patient"
    const patientUID = patientData?.patientUID || "Unknown UID"
    const appointmentDate = patientData?.appointmentDate || new Date().toISOString().split("T")[0]

    doc.text(`Patient: ${patientName}`, margin, currentY)
    doc.text(`Patient UID: ${patientUID}`, margin, currentY + 8)
    doc.text(`Date: ${appointmentDate}`, pageWidth - margin - 50, currentY)

    currentY += 20

    const createSubTableRows = (label, entries) => {
      if (!entries || entries.length === 0) return []
      return entries.map((entry, index) => [index === 0 ? label : "", entry])
    }

    let data = []

    // Handle diagnosis
    if (patientData.diagnosis && patientData.diagnosis.trim() !== "") {
      data = data.concat(createSubTableRows("Diagnosis", [patientData.diagnosis]))
    }

    // Handle complaints with proper JSON parsing
    if (patientData.complaints && patientData.complaints.trim() !== "" && patientData.complaints !== "[]") {
      try {
        const parsed = safeParseJSON(patientData.complaints)
        if (Array.isArray(parsed)) {
          const complaintsFormatted = parsed
            .map((complaint) => {
              let formatted = complaint.complaints || complaint.complaint || ""
              if (complaint.duration && complaint.durationUnit) {
                formatted += ` - Duration: ${complaint.duration} ${complaint.durationUnit}`
              }
              return formatted
            })
            .filter((item) => item !== "")

          if (complaintsFormatted.length > 0) {
            data = data.concat(createSubTableRows("Complaints", complaintsFormatted))
          }
        }
      } catch (error) {
        console.warn("Error parsing complaints:", error)
        data = data.concat(createSubTableRows("Complaints", [patientData.complaints]))
      }
    }

    // Handle findings
    if (patientData.findings && patientData.findings.trim() !== "") {
      data = data.concat(createSubTableRows("Findings", [patientData.findings]))
    }

    // Handle procedures with proper parsing
    if (patientData.proceduresList && patientData.proceduresList.trim() !== "") {
      try {
        const procedures = patientData.proceduresList.split("\n").filter((line) => line.trim() !== "")
        if (procedures.length > 0) {
          data = data.concat(createSubTableRows("Procedures", procedures))
        }
      } catch (error) {
        console.warn("Error parsing procedures:", error)
        data = data.concat(createSubTableRows("Procedures", [patientData.proceduresList]))
      }
    }

    // Handle plans
    if (patientData.plans && patientData.plans.trim() !== "") {
      try {
        const plans = patientData.plans
          .split("\n")
          .map((plan) => plan.replace(/Plan\d+:\s*/g, "").trim())
          .filter((plan) => plan !== "")

        if (plans.length > 0) {
          data = data.concat(createSubTableRows("Plans", plans))
        }
      } catch (error) {
        console.warn("Error parsing plans:", error)
        data = data.concat(createSubTableRows("Plans", [patientData.plans]))
      }
    }

    // Handle tests
    if (patientData.tests && patientData.tests.trim() !== "") {
      data = data.concat(createSubTableRows("Tests", [patientData.tests]))
    }

    // Handle next visit date
    if (patientData.nextVisit) {
      const nextVisitDate = new Date(patientData.nextVisit).toLocaleDateString()
      data.push(["Next Visit Date", nextVisitDate])
    }

    // Handle vitals
    if (patientData.vital && patientData.vital.trim() !== "" && patientData.vital !== "{}") {
      try {
        const vitals = safeParseJSON(patientData.vital)
        if (vitals && typeof vitals === "object") {
          const vitalEntries = Object.entries(vitals)
            .filter(([key, value]) => value && value.trim() !== "")
            .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)

          if (vitalEntries.length > 0) {
            data = data.concat(createSubTableRows("Vitals", vitalEntries))
          }
        }
      } catch (error) {
        console.warn("Error parsing vitals:", error)
        data = data.concat(createSubTableRows("Vitals", [patientData.vital]))
      }
    }

    // Generate main table for all sections except prescription with multi-page support
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
          minCellHeight: 10,
          overflow: "linebreak",
          tableWidth: "auto",
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: usableWidth - 60 },
        },
        margin: { left: margin, right: margin, top: 20, bottom: signatureSpace },
        pageBreak: "auto",
        showHead: "everyPage",
        didDrawPage: function (data) {
          // Add background image to new pages
          if (data.pageNumber > 1) {
            doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
          }
          
          // Add doctor signature on every page
          addDoctorSignature(doc, data.pageNumber)
        }
      })

      currentY = doc.lastAutoTable.finalY + 20
    }

    // Enhanced prescription parsing for multi-page support
    const formatPrescriptionForTable = (prescriptionData) => {
      try {
        if (!prescriptionData || prescriptionData.trim() === "") return []

        let prescriptions = []

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

    // Handle prescription section with multi-page support
    if (patientData.prescription && patientData.prescription.trim() !== "") {
      const prescriptionTableData = formatPrescriptionForTable(patientData.prescription)

      if (prescriptionTableData.length > 0) {
        // Check if we need a new page for prescription section
        // Consider both current position and space needed for signature
        const estimatedTableHeight = (prescriptionTableData.length * 15) + 40 // Rough estimate
        const spaceNeeded = estimatedTableHeight + signatureSpace + 30 // Extra buffer
        
        if (currentY + spaceNeeded > pageHeight) {
          doc.addPage()
          doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
          currentY = 80
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(40, 40, 40)
        doc.text("Prescription", margin, currentY)

        currentY += 10

        doc.autoTable({
          startY: currentY,
          head: [["#", "Medication", "Dosage", "Frequency", "Duration"]],
          body: prescriptionTableData,
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
            minCellHeight: 8,
            overflow: "linebreak",
            tableWidth: "auto",
          },
          columnStyles: {
            0: { cellWidth: 15, halign: "center" },
            1: { cellWidth: (usableWidth - 15) * 0.4 },
            2: { cellWidth: (usableWidth - 15) * 0.2 },
            3: { cellWidth: (usableWidth - 15) * 0.2 },
            4: { cellWidth: (usableWidth - 15) * 0.2 },
          },
          margin: { left: margin, right: margin, top: 10, bottom: signatureSpace },
          pageBreak: "auto",
          showHead: "everyPage",
          didDrawPage: function (data) {
            // Add background image to new pages
            if (data.pageNumber > 1) {
              doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
            }
            
            // Add doctor signature on every page
            addDoctorSignature(doc, data.pageNumber)
          }
        })
      
      }
    }

    // Generate filename
    const safeBranchCode = sanitizeFilename(patientData.branch_code || "Branch")
    const safePatientName = sanitizeFilename(patientName)
    const safePatientUID = sanitizeFilename(patientUID)
    const safeAppointmentDate = sanitizeFilename(appointmentDate.replace(/[-/]/g, "_"))

    const filename = `${safeBranchCode}_${safePatientName}_${safePatientUID}_${safeAppointmentDate}.pdf`
    const finalFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`

    try {
      doc.save(finalFilename)
      if (typeof toast !== "undefined") {
        toast.success(`PDF downloaded for ${patientName}`)
      }
    } catch (error) {
      console.error("Error saving PDF:", error)
      if (typeof toast !== "undefined") {
        toast.error("Failed to download PDF")
      }
    }
  })
}


  const downloadCSV = () => {
    if (!summaryData || summaryData.length === 0) return

    const headers = [
      "Patient Name",
      "Date",
      "Diagnosis",
      "Complaints",
      "Findings",
      "Prescription",
      "Plans",
      "Tests",
      "Procedures",
    ]

    const formatComplaints = (complaintsData) => {
      try {
        if (!complaintsData || complaintsData === "[]" || complaintsData === "{}" || complaintsData === '""') return ""

        let complaints = null

        if (Array.isArray(complaintsData)) {
          complaints = complaintsData
        } else if (typeof complaintsData === "object" && complaintsData !== null) {
          complaints = [complaintsData]
        } else if (typeof complaintsData === "string") {
          let cleanedStr = complaintsData.trim()

          while (cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) {
            cleanedStr = cleanedStr.slice(1, -1)
            cleanedStr = cleanedStr.replace(/\\"/g, '"')
          }

          cleanedStr = cleanedStr.replace(/\\\\/g, "\\")

          if (cleanedStr.startsWith("[") || cleanedStr.startsWith("{")) {
            complaints = JSON.parse(cleanedStr)
          }
        }

        if (!Array.isArray(complaints)) {
          if (complaints && typeof complaints === "object") {
            complaints = [complaints]
          } else {
            return ""
          }
        }

        if (complaints.length === 0) return ""

        return complaints
          .map((complaint) => {
            if (!complaint || typeof complaint !== "object" || !complaint.complaints) return ""

            let formatted = `Complaint: ${complaint.complaints}`
            if (complaint.duration && complaint.durationUnit) {
              formatted += `\nDuration: ${complaint.duration} ${complaint.durationUnit}`
            }
            return formatted
          })
          .filter((item) => item !== "")
          .join("\n\n")
      } catch (e) {
        console.log("Error parsing complaints:", e, "Original:", complaintsData)

        if (typeof complaintsData === "object" || complaintsData === "[object Object]") {
          return ""
        }
        return String(complaintsData)
      }
    }

    const formatPlans = (plansStr) => {
      if (!plansStr) return ""

      const plans = plansStr.split(/Plan\d+:\s*/).filter((plan) => plan.trim())

      return plans.map((plan) => plan.replace(/,\s*$/, "").trim()).join("\n")
    }

    const formatProcedures = (proceduresStr) => {
      if (!proceduresStr) return ""

      if (typeof proceduresStr === "string" && !proceduresStr.startsWith("[")) {
        const procedures = proceduresStr.split(/Procedure:\s*/).filter((proc) => proc.trim())
        return procedures.map((proc) => proc.replace(/\s*-\s*Date:\s*/, " on ").trim()).join("\n")
      }

      try {
        const procedures = JSON.parse(proceduresStr)
        return procedures
          .map((proc) => {
            if (typeof proc === "object") {
              return `${proc.procedure || proc.name || ""} on ${proc.date || ""}`.trim()
            }
            return proc
          })
          .join("; ")
      } catch (e) {
        return proceduresStr
      }
    }

    const rows = summaryData.map((item) => [
      item.patientName || "",
      item.appointmentDate || "",
      item.diagnosis || "",
      formatComplaints(item.complaints),
      item.findings || "",
      item.prescription || "",
      formatPlans(item.plans),
      item.tests || "",
      formatProcedures(item.proceduresList),
    ])

    const escapeCsvField = (field) => {
      const str = String(field || "")
      if (str.includes(",") || str.includes("\n") || str.includes('"') || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.map(escapeCsvField).join(","))].join("\r\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "summary_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderComplaints = (complaintsStr) => {
    try {
      const complaints = typeof complaintsStr === "string" ? JSON.parse(complaintsStr) : complaintsStr
      if (Array.isArray(complaints)) {
        return complaints.map((complaint, index) => (
          <div key={index}>
            <p>Complaint: {complaint.complaints}</p>
            <p>
              Duration: {complaint.duration} {complaint.durationUnit}
            </p>
          </div>
        ))
      } else {
        return <p>No valid complaints available</p>
      }
    } catch (error) {
      console.error("Error parsing complaints:", error)
      return <p>Invalid complaints data</p>
    }
  }

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header>
        <h3 className="text-center mb-2">Summary Report</h3>
        <button title="Download Excel" onClick={downloadCSV}>
          <FaDownload />
        </button>
      </Header>
      <IntervalSelector>
        <ButtonGroup>
          <IntervalButton
            title="Daily Report"
            onClick={() => handleIntervalChange("day")}
            className={selectedInterval === "day" ? "active" : ""}
            active={selectedInterval === "day"}
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={faCalendarDay} />
          </IntervalButton>

          <IntervalButton
            title="Monthly Report"
            onClick={() => handleIntervalChange("month")}
            className={selectedInterval === "month" ? "active" : ""}
            active={selectedInterval === "month"}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
          </IntervalButton>
        </ButtonGroup>
        <DatePickerWrapper>
          {selectedInterval === "day" && (
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              showPopperArrow={false}
              customInput={<CustomDateInput />}
            />
          )}

          {selectedInterval === "month" && (
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM"
              showMonthYearPicker
              showPopperArrow={false}
              customInput={<CustomDateInput />}
            />
          )}
        </DatePickerWrapper>
      </IntervalSelector>
      <br />
      <Content>
        {summaryData && summaryData.length > 0 ? (
          <Summary>
            <h5 className="text-center">{getReportHeading(selectedInterval)}</h5>
            <table>
              <MDBTableHead align="middle">
                <tr>
                  <th>Patient Name</th>
                  <th>Date</th>
                  <th>Doctor Name</th>
                  <th>Diagnosis</th>
                  <th>Complaints</th>
                  <th>Findings</th>
                  <th>Prescription</th>
                  <th>Plans</th>
                  <th>Tests</th>
                  <th>Procedure</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {summaryData.map((item) => (
                  <StyledRow key={item.id}>
                    <td>{item.patientName}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{item.appointmentDate}</td>
                    <td>{item.patient_handledby}</td>
                    <td>{item.diagnosis}</td>
                    <td>{renderComplaints(item.complaints)}</td>
                    <td>{item.findings}</td>
                    <td>{item.prescription}</td>
                    <td>{item.plans}</td>
                    <td>{item.tests}</td>
                    <td>{item.proceduresList}</td>
                    <td>
                      <button
                        title="Generate PDF"
                        className="btn btn-primary me-2"
                        onClick={() => exportPatientToPDF(item)}
                      >
                        <FaFilePdf />
                      </button>
                    </td>
                  </StyledRow>
                ))}
              </MDBTableBody>
            </table>
          </Summary>
        ) : (
          console.log("No Data available")
        )}
      </Content>
    </Container>
  )
}

export default SummaryReport

const Summary = styled.div`
  flex: 1;
  overflow-x: auto;
`

const StyledRow = styled.tr`
  &:nth-child(even) {
    background-color: #FFFFFF;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-top: 65px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const IntervalSelector = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: -30px;
  margin-bottom: 20px;
  gap: 20px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  font-weight: bold;
  cursor: pointer;
`

const IntervalButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: ${({ active }) => (active ? "#C85C8E" : "white")};
  color: ${({ active }) => (active ? "white" : "#C85C8E")};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  width: 100%;
  height: 50px;
  min-height: 40px;
  box-sizing: border-box;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  svg {
    cursor: inherit;
  }

  &:hover {
    background-color: ${({ active }) => (active ? "#C85C8E" : "#f0f0f0")};
    transform: translateY(-2px);
    transition: all 0.2s ease-in-out;
  }
`

const DatePickerWrapper = styled.div`
  color: #C85C8E;
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container {
    display: block;
  }
`

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <StyledCustomDateInput onClick={onClick} ref={ref} value={value} readOnly />
))

const StyledCustomDateInput = styled.input`
  border: none;
  padding: 8px;
  color: #C85C8E;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  background-color: white;
  font-weight: bold;
  text-align: center;
  width: auto;
  min-width: 120px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  &:hover {
    border-color: #C85C8E;
  }
`
