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
import PDFMain1 from "./images/PDF_Summary_branch1.jpeg"
import PDFMain2 from "./images/PDF_Summary_branch2.jpeg"
import "./DatePicker.css"

const SummaryReport = () => {
  const [summaryData, setSummaryData] = useState(null)
  const [selectedInterval, setSelectedInterval] = useState("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [branchCode, setBranchCode] = useState("")
  const [loading, setLoading] = useState(false) // Add loading state
  const [error, setError] = useState(null) // Add error state
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

  // Effect to get branch_code from localStorage
  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")

    if (code) {
      setBranchCode(code)
    } else {
      console.warn("Branch code not found in localStorage")
      setError("Branch code not found. Please ensure you are logged in.") // Set error if branch code is missing
      toast.error("Branch code not found. Please log in again.") // Toast for missing branch code
    }
  }, []) // Run only once on component mount

  // Effect to fetch data whenever relevant dependencies change
  useEffect(() => {
    if (branchCode) {
      fetchData(selectedInterval)
    }
  }, [branchCode, selectedInterval, selectedDate]) // Dependencies for re-fetching

  const fetchData = async (interval) => {
    if (!branchCode) {
      console.warn("Branch code is not available, skipping data fetch.")
      setSummaryData(null) // Clear data if branch code is missing
      setLoading(false) // Ensure loading is false
      return
    }

    setLoading(true) // Set loading to true before API call
    setError(null) // Clear previous errors

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

      // --- ADDED TOAST NOTIFICATION FOR NO DATA ---
      // Check if summary_data is null/undefined or an empty object
      if (!response.data.summary_data || Object.keys(response.data.summary_data).length === 0) {
        toast.info("No data found for the selected criteria.")
      }
      // --- END ADDED TOAST NOTIFICATION ---
    } catch (error) {
      console.error("Error fetching data:", error.response ? error.response.data : error.message)
      setError("Failed to fetch summary data. Please try again.") // Set error message
      setSummaryData(null) // Clear data on error
      toast.error("Failed to fetch data.") // Show error toast
    } finally {
      setLoading(false) // Set loading to false after API call
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

  // New PDF export function for individual patients
  const exportPatientToPDF = (patientData) => {
    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const backgroundImageMap = {
      SCC001: PDFMain1,
      SCC002: PDFMain2,
    }

    const PDFMain = backgroundImageMap[branchCode] || PDFMain1

    let startY = 50

    if (branchCode === "SCC002") {
      startY = 80
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

    convertToBase64(PDFMain, (mainImage) => {
      pdf.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(16)
      pdf.setTextColor(40, 40, 40)
      pdf.text(`Patient: ${patientData.patientName.toUpperCase()}`, 16, startY)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      pdf.text(`Patient UID: ${patientData.patientUID || "N/A"}`, 16, startY + 10)

      startY += 35

      const createSubTableRows = (label, entries) => {
        if (!entries || entries.length === 0) {
          return []
        }
        return entries.map((entry, index) => [index === 0 ? label : "", entry])
      }

      let data = []

      // Parse and format complaints
      const formatComplaints = (complaintsData) => {
        try {
          if (!complaintsData || complaintsData === "[]" || complaintsData === "{}" || complaintsData === '""')
            return []

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
              return []
            }
          }

          return complaints
            .map((complaint) => {
              if (!complaint || typeof complaint !== "object" || !complaint.complaints) return ""

              let formatted = `${complaint.complaints}`
              if (complaint.duration && complaint.durationUnit) {
                formatted += ` - Duration: ${complaint.duration} ${complaint.durationUnit}`
              }
              return formatted
            })
            .filter((item) => item !== "")
        } catch (e) {
          console.log("Error parsing complaints:", e)
          return []
        }
      }

      // Add data sections
      if (patientData.diagnosis && patientData.diagnosis.trim() !== "") {
        data.push(["Diagnosis", patientData.diagnosis])
      }

      const complaintsFormatted = formatComplaints(patientData.complaints)
      if (complaintsFormatted.length > 0) {
        data = data.concat(createSubTableRows("Complaints", complaintsFormatted))
      }

      if (patientData.findings && patientData.findings.trim() !== "") {
        data.push(["Findings", patientData.findings])
      }

      if (patientData.proceduresList && patientData.proceduresList.trim() !== "") {
        data.push(["Procedures", patientData.proceduresList])
      }

      if (patientData.prescription && patientData.prescription.trim() !== "") {
        data.push(["Prescription", patientData.prescription])
      }

      if (patientData.plans && patientData.plans.trim() !== "") {
        // Format plans by removing "Plan1:", "Plan2:" etc.
        const formattedPlans = patientData.plans.replace(/Plan\d+:\s*/g, "").replace(/,\s*$/, "")
        data.push(["Plans", formattedPlans])
      }

      if (patientData.tests && patientData.tests.trim() !== "") {
        data.push(["Tests", patientData.tests])
      }

      if (data.length > 0) {
        pdf.autoTable({
          startY,
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
            1: { cellWidth: pageWidth - 80 },
          },
          margin: { left: 14, right: 14 },
        })
      }

      let currentY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : startY
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      currentY += 10

      pdf.save(
        `${branchCode}_${patientData.patientName}_${patientData.patientUID || "NoUID"}_${patientData.appointmentDate}`,
      )
      toast.success(`PDF downloaded for ${patientData.patientName}`)
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

        // Handle different data types and formats
        if (Array.isArray(complaintsData)) {
          // Format 3: Already a JavaScript array
          complaints = complaintsData
        } else if (typeof complaintsData === "object" && complaintsData !== null) {
          // Single object, wrap in array
          complaints = [complaintsData]
        } else if (typeof complaintsData === "string") {
          // Handle string formats
          let cleanedStr = complaintsData.trim()

          // Remove multiple levels of escaping
          while (cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) {
            cleanedStr = cleanedStr.slice(1, -1)
            // Unescape quotes at each level
            cleanedStr = cleanedStr.replace(/\\"/g, '"')
          }

          // Additional cleanup for heavily escaped strings
          cleanedStr = cleanedStr.replace(/\\\\/g, "\\")

          // Try to parse the cleaned string
          if (cleanedStr.startsWith("[") || cleanedStr.startsWith("{")) {
            complaints = JSON.parse(cleanedStr)
          }
        }

        // Ensure we have an array
        if (!Array.isArray(complaints)) {
          if (complaints && typeof complaints === "object") {
            complaints = [complaints]
          } else {
            return ""
          }
        }

        // Check if complaints array is empty
        if (complaints.length === 0) return ""

        // Format each complaint with proper labels
        return complaints
          .map((complaint) => {
            // Skip if complaint is empty object or has no complaints field
            if (!complaint || typeof complaint !== "object" || !complaint.complaints) return ""

            let formatted = `Complaint: ${complaint.complaints}`
            if (complaint.duration && complaint.durationUnit) {
              formatted += `\nDuration: ${complaint.duration} ${complaint.durationUnit}`
            }
            return formatted
          })
          .filter((item) => item !== "")
          .join("\n\n") // Use double newline to separate multiple complaints
      } catch (e) {
        console.log("Error parsing complaints:", e, "Original:", complaintsData)

        // Final fallback - if it's an object, return empty; if it's a string, return as-is
        if (typeof complaintsData === "object" || complaintsData === "[object Object]") {
          return ""
        }
        return String(complaintsData)
      }
    }

    const formatPlans = (plansStr) => {
      if (!plansStr) return ""

      // Split by "Plan" and filter out empty strings
      const plans = plansStr.split(/Plan\d+:\s*/).filter((plan) => plan.trim())

      // Join with newlines, removing any trailing commas
      return plans.map((plan) => plan.replace(/,\s*$/, "").trim()).join("\n")
    }

    const formatProcedures = (proceduresStr) => {
      if (!proceduresStr) return ""

      // Handle if it's already a string (not JSON)
      if (typeof proceduresStr === "string" && !proceduresStr.startsWith("[")) {
        // Split by "Procedure:" and format
        const procedures = proceduresStr.split(/Procedure:\s*/).filter((proc) => proc.trim())
        return procedures.map((proc) => proc.replace(/\s*-\s*Date:\s*/, " on ").trim()).join("\n")
      }

      try {
        // If it's JSON, parse and format
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

    // Escape CSV fields properly
    const escapeCsvField = (field) => {
      const str = String(field || "")
      // Always wrap multi-line content and content with commas/quotes in quotes
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
                    <td>{item.diagnosis}</td>
                    <td>{renderComplaints(item.complaints)}</td>
                    <td>{item.findings}</td>
                    <td>{item.prescription}</td>
                    <td>{item.plans}</td>
                    <td>{item.tests}</td>
                    <td>{item.proceduresList}</td>
                    <td>
                      <button title="Generate PDF" className="btn btn-primary me-2" onClick={() => exportPatientToPDF(item)}>
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
