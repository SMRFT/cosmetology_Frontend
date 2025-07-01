import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { MDBTableHead, MDBTableBody } from "mdb-react-ui-kit"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { startOfWeek, startOfMonth, addWeeks, format, getDay } from "date-fns" // Added getDay for weekStartsOn
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDay, faCalendarWeek, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"
import { FaDownload, FaFilePdf } from "react-icons/fa"
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import "jspdf-autotable"
import PDFMain1 from "./images/PDF_Main_branch1.jpeg"
import PDFMain2 from "./images/PDF_Main_branch2.jpeg"

const BillingProcedureReport = () => {
 const [billingData, setBillingData] = useState(null)
 const [selectedInterval, setSelectedInterval] = useState("day")
 const [selectedDate, setSelectedDate] = useState(new Date())
 const [selectedWeek, setSelectedWeek] = useState(null)
 const [activeTab, setActiveTab] = useState("procedure")
 const [branchCode, setBranchCode] = useState("")
 const [userRole, setUserRole] = useState("")
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState(null)
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

 const getReportHeading = (interval) => {
 switch (interval) {
 case "day":
 return "Daily Report"
 case "week":
 return "Weekly Report"
 case "month":
 return "Monthly Report"
 default:
 return "Billing Report"
 }
 }

 // Effect to get branch_code and userRole from localStorage/sessionStorage
 useEffect(() => {
 const code = localStorage.getItem("selectedBranch") // Get from localStorage as requested
 const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

 if (code) {
 setBranchCode(code)
 } else {
 console.warn("Branch code not found in localStorage")
 setError("Branch code not found. Please ensure you are logged in.")
 }

 if (role) {
 setUserRole(role)
 } else {
 console.warn("User role not found")
 }

 // Initialize selectedWeek if interval is 'week' on first load
 // This runs once when component mounts
 if (selectedInterval === "week" && !selectedWeek) {
 setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 })) // Start week on Monday
 }
 }, []) // Empty dependency array means this runs only once on component mount

 // Effect to fetch data whenever relevant dependencies change
 useEffect(() => {
 if (branchCode) { // Ensure branchCode is available before fetching
 fetchData(selectedInterval)
 }
 }, [selectedInterval, selectedDate, selectedWeek, branchCode]) // Dependencies for re-fetching

 const fetchData = async (interval) => {
 if (!branchCode) {
 console.warn("Branch code not available, skipping API call.")
 setBillingData(null); // Clear data if branch code is missing
 setLoading(false);
 return;
 }

 setLoading(true)
 setError(null)

 let dateParam = ""
 let currentSelectedDateForParam = selectedDate; // Use selectedDate for day and month

 // For week interval, if selectedWeek is null (e.g., on initial load or interval change),
 // calculate it from selectedDate, defaulting to Monday of that week.
 if (interval === "week" && !selectedWeek) {
 currentSelectedDateForParam = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Ensure Monday
 } else if (interval === "week" && selectedWeek) {
 currentSelectedDateForParam = selectedWeek; // Use the explicitly selected week's start
 }

 if (interval === "day") {
 dateParam = format(currentSelectedDateForParam, "yyyy-MM-dd")
 } else if (interval === "week") {
 dateParam = format(currentSelectedDateForParam, "yyyy-MM-dd")
 } else if (interval === "month") {
 dateParam = format(startOfMonth(currentSelectedDateForParam), "yyyy-MM-dd")
 }

 try {
 const response = await axios.get(`${Cosmetologybaseurl}procedurebilling/${interval}/`, {
 params: {
 appointmentDate: dateParam,
 branch_code: branchCode, // Sending branch_code in params as requested
 },
 withCredentials: true,
 })
 setBillingData(response.data)
 if (response.data.length === 0) {
 toast.info("No data found for the selected criteria.");
 }
 } catch (error) {
 console.error("Error fetching procedure billing data:", error)
 setError("Failed to fetch procedure billing data. Please try again.")
 toast.error("Failed to fetch data.");
 } finally {
 setLoading(false)
 }
 }

 const handleIntervalChange = (interval) => {
 setSelectedInterval(interval)
 // Reset selectedDate to today's date for 'day' and 'month' intervals
 // Reset selectedWeek to the start of the current week for 'week' interval
 if (interval === "week") {
 setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 })) // Start week on Monday
 } else {
 setSelectedDate(new Date()) // Reset to today for day/month
 setSelectedWeek(null) // Clear selectedWeek when not in week mode
 }
 }

 const handleDateChange = (date) => {
 setSelectedDate(date)
 if (selectedInterval === "week") {
 setSelectedWeek(startOfWeek(date, { weekStartsOn: 1 })) // Update week start when month/year changes in weekly mode
 }
 }

 const handleWeekChange = (weekStart) => {
 setSelectedWeek(weekStart)
 setSelectedDate(weekStart); // Also update selectedDate to reflect the chosen week's start
 }

 const getWeeksInMonth = (date) => {
 const startOfMonthDate = startOfMonth(date)
 const weeks = []
 // Loop up to 6 times to cover all possible weeks in a month
 for (let i = 0; i < 6; i++) {
 const weekStart = startOfWeek(addWeeks(startOfMonthDate, i), { weekStartsOn: 1 }); // Start week on Monday
 // Only add the week if it falls within the same month or if it's the start of the next month
 // that includes days from the current month
 if (weekStart.getMonth() === date.getMonth() || (i > 0 && startOfWeek(addWeeks(startOfMonthDate, i -1), { weekStartsOn: 1 }).getMonth() === date.getMonth() && weekStart.getMonth() !== date.getMonth())) {
 weeks.push(weekStart)
 } else if (weeks.length > 0) {
 // If we've already added weeks and current week is entirely in next month, stop
 break;
 }
 }
 // Filter out duplicate week starts if any
 const uniqueWeeks = weeks.filter((week, index, self) =>
 index === self.findIndex((t) => format(t, 'yyyy-MM-dd') === format(week, 'yyyy-MM-dd'))
 );
 return uniqueWeeks;
 }

// Helper function to calculate procedure grand total consistently
const calculateProcedureGrandTotal = (billingData) => {
  return (billingData || []).reduce((sum, item) => {
    const procedures = typeof item.procedures === "string" ? JSON.parse(item.procedures) : item.procedures;
    return sum + (procedures || []).reduce((innerSum, proc) => {
      const total = Number.parseFloat(proc.total || 0);
      return innerSum + (isNaN(total) ? 0 : total);
    }, 0);
  }, 0);
};

// Helper function to calculate consumer grand total consistently
const calculateConsumerGrandTotal = (billingData) => {
  return (billingData || []).reduce((sum, item) => {
    const consumer = Array.isArray(item.consumer) ? item.consumer : 
                    (typeof item.consumer === "string" ? JSON.parse(item.consumer) : []);
    return sum + consumer.reduce((innerSum, con) => {
      const total = Number.parseFloat(con.total || 0);
      return innerSum + (isNaN(total) ? 0 : total);
    }, 0);
  }, 0);
};

// Fixed downloadProcedureCSV function
const downloadProcedureCSV = () => {
  if (!billingData || billingData.length === 0) {
    toast.warn("No data to download.");
    return;
  }

  const headers = [
    "Patient Name",
    "Patient UID",
    "Procedure Billnumber",
    "Appointment Date",
    "Doctor Name",
    "Procedure",
    "Procedure Date",
    "Price",
    "GST",
    "GST Rate",
    "consultationFee",
    "Total",
  ];

  const rows = billingData.flatMap((item) => {
    const procedures = typeof item.procedures === "string" ? JSON.parse(item.procedures) : item.procedures;
    return procedures.map((proc, index) => [
      index === 0 ? `"${item.patientName}"` : "",
      index === 0 ? `"${item.patientUID}"` : "",
      index === 0 ? `"${item.procedureBillNumber}"` : "",
      index === 0 ? `"${item.appointmentDate}"` : "",
      index === 0 ? `"${item.patient_handledby}"` : "",
      `"${proc.procedure}"`,
      `"${proc.procedureDate}"`,
      proc.price,
      proc.gst,
      proc.gstRate,
      proc.consultationFee,
      proc.total,
    ]);
  });

  // Use the consistent calculation function
  const currentGrandTotal = calculateProcedureGrandTotal(billingData);
  rows.push(["", "", "", "", "", "", "", "", "", "", "Grand Total", currentGrandTotal.toFixed(2)]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Procedure_${getReportHeading(selectedInterval).replace(/\s/g, '_')}_${branchCode}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("CSV downloaded successfully!");
};

// Fixed downloadConsumerCSV function
const downloadConsumerCSV = () => {
  if (!billingData || billingData.length === 0) {
    toast.warning("No consumer data available to download");
    return;
  }

  const headers = ["Patient Name", "Patient UID", "Consumer Billnumber", "Appointment Date", "Item", "Quantity", "Total", "Branch Code"];
  
  const rows = billingData.flatMap((item) => {
    const consumer = typeof item.consumer === "string" ? JSON.parse(item.consumer) : item.consumer;
    return consumer.map((con) => [
      item.patientName, 
      item.patientUID, 
      item.consumerBillNumber, 
      item.appointmentDate, 
      con.item, 
      con.qty, 
      con.total, 
      branchCode
    ]);
  });

  // Use the consistent calculation function
  const totalSum = calculateConsumerGrandTotal(billingData);
  rows.push(["", "", "", "", "", "Grand Total", totalSum.toFixed(2), ""]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `Consumer_${getReportHeading(selectedInterval)}_${branchCode}_${format(selectedDate, "yyyy-MM-dd")}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

 const generateProcedurePDF = (patientUID, billNumber) => {
 const patientData = billingData.find(
 (item) => item.patientUID === patientUID && item.procedureBillNumber === billNumber,
 )
 if (!patientData) {
 toast.error("Patient data not found")
 return
 }

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
 // Header
      let startY = 110
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(30, 30, 30)
      doc.text(`Patient Name:`, 16, startY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.patientName.toUpperCase()}`, 50, startY)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(`Patient UID:`, 16, startY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.patientUID}`, 50, startY + 8)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(`Date:`, 130, startY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.appointmentDate}`, 170, startY)
      
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text(`Bill Number :`, 130, startY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.procedureBillNumber}`, 170, startY + 8)

 startY += 30

 // Filter out consultation fee from procedures
 const procedureData = patientData.procedures.filter(proc => 
 !proc.procedure.toLowerCase().includes('consultation') && 
 !proc.procedure.toLowerCase().includes('consult')
 )

 const procedureTable = procedureData.map((proc) => [
 proc.procedure,
 proc.procedureDate,
 `${proc.price}`,
 `${proc.gstRate}%`,
 `${proc.gst}`,
 `${proc.total}`,
 ])

 doc.autoTable({
 head: [["Procedure", "Date", "Price", "GST Rate", "GST", "Total"]],
 body: procedureTable,
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
 },
 margin: { left: 14, right: 14 },
 })

 let currentY = doc.previousAutoTable.finalY + 15

  // Calculate and display net total
if (patientData.consultationFee > 0) {
 doc.setFont("helvetica", "bold")
 doc.setFontSize(12)
 doc.setTextColor(0, 100, 0)
 doc.text(`Consultation Fee : ${patientData.consultationFee}`, 150, currentY)
}


 // Calculate and display net total
 const netTotal = patientData.procedures.reduce((sum, proc) => sum + Number.parseFloat(proc.total || 0), 0)
 doc.setFont("helvetica", "bold")
 doc.setFontSize(12)
 doc.setTextColor(0, 100, 0)
 doc.text(`Net Amount : ${netTotal.toFixed(2)}`, 150, currentY + 10)

 const pdfBlob = doc.output("blob")
 const pdfUrl = URL.createObjectURL(pdfBlob)
 window.open(pdfUrl, "_blank")
 })
 }

 const generateConsumerPDF = (patientUID, billNumber) => {
 const patientData = billingData.find(
 (item) => item.patientUID === patientUID && item.consumerBillNumber === billNumber,
 )
 if (!patientData) {
 toast.error("Patient data not found")
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

 // Set font style for patient name - make it more prominent
      let startY = 110
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(30, 30, 30)
      doc.text(`Patient Name:`, 16, startY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.patientName.toUpperCase()}`, 50, startY)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(`Patient UID:`, 16, startY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.patientUID}`, 50, startY + 8)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text(`Date:`, 130, startY)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.appointmentDate}`, 170, startY)
      
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text(`Bill Number :`, 130, startY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${patientData.procedureBillNumber}`, 170, startY + 8)

 startY += 30

 // Consumer Table
 const consumerTable = patientData.consumer.map((con) => [con.item, con.qty, `${con.total}`])

 doc.autoTable({
 head: [["Item", "Quantity", "Total"]],
 body: consumerTable,
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
 },
 margin: { left: 14, right: 14 },
 })

 // Total with better styling
 const total = patientData.consumer.reduce((sum, con) => sum + Number.parseFloat(con.total || 0), 0)
 doc.setFont("helvetica", "bold")
 doc.setFontSize(12)
 doc.setTextColor(0, 100, 0)
 doc.text(`Total Amount: ${total.toFixed(2)}`, 150, doc.previousAutoTable.finalY + 15)

 // Open in new window instead of auto-print
 const pdfBlob = doc.output("blob")
 const pdfUrl = URL.createObjectURL(pdfBlob)
 window.open(pdfUrl, "_blank")
 })
 }

 const deleteRecord = async (patientUID, billType, billNumber) => {
 if (!branchCode) {
 toast.error("Branch code not available")
 return
 }

 try {
 const response = await axios.delete(`${Cosmetologybaseurl}delete_procedure_data/`, {
 data: {
 patientUID: patientUID,
 consumerBillNumber: billType === "consumer" ? billNumber : undefined,
 procedureBillNumber: billType === "procedure" ? billNumber : undefined,
 branch_code: branchCode,
 },
 // Removed headers to send branch_code, as requested
 withCredentials: true,
 })

 if (response.status === 200) {
 setBillingData((prevData) =>
 prevData.filter(
 (item) =>
 !(
 item.patientUID === patientUID &&
 (billType === "consumer" ? item.consumerBillNumber : item.procedureBillNumber) === billNumber
 ),
 ),
 )
 toast.success("Record deleted successfully.")
 } else {
 toast.error("Failed to delete the record.")
 }
 } catch (error) {
 console.error("Error deleting record:", error)
 toast.error("Error deleting record.")
 }
 }

 const refreshData = () => {
 if (branchCode) {
 fetchData(selectedInterval)
 }
 }

 const renderActionButtons = (patientUID, billType, billNumber) => (
 <ActionButtonsContainer>
 <button
 title="Generate PDF"
 className="btn btn-primary me-2"
 onClick={() => {
 if (billType === "procedure") {
 generateProcedurePDF(patientUID, billNumber)
 } else {
 generateConsumerPDF(patientUID, billNumber)
 }
 }}
 >
 <FaFilePdf />
 </button>
 {userRole !== "Manager" && userRole !== "Receptionist" && (
 <button
 title="Delete Record"
 className="btn btn-danger"
 onClick={() => {
 deleteRecord(patientUID, billType, billNumber)
 }}
 >
 <FontAwesomeIcon icon={faTrashAlt} />
 </button>
 )}
 </ActionButtonsContainer>
 )

 return (
 <Container>
 <ToastContainer position="top-right" autoClose={5000} />
 <Header>
 <div>
 <h3 className="text-center mb-2">Procedure Billing Report</h3>
 </div>
 <RefreshButton onClick={refreshData} disabled={loading}>
 🔄 Refresh
 </RefreshButton>
 </Header>

 {error && <ErrorMessage>{error}</ErrorMessage>}

 <IntervalSelector>
 <ButtonGroup>
 <IntervalButton
 title="Daily Report"
 onClick={() => handleIntervalChange("day")}
 className={selectedInterval === "day" ? "active" : ""}
 active={selectedInterval === "day"}
 disabled={loading}
 >
 <FontAwesomeIcon icon={faCalendarDay} />
 </IntervalButton>
 <IntervalButton
 title="Weekly Report"
 onClick={() => handleIntervalChange("week")}
 className={selectedInterval === "week" ? "active" : ""}
 active={selectedInterval === "week"}
 disabled={loading}
 >
 <FontAwesomeIcon icon={faCalendarWeek} />
 </IntervalButton>
 <IntervalButton
 title="Monthly Report"
 onClick={() => handleIntervalChange("month")}
 className={selectedInterval === "month" ? "active" : ""}
 active={selectedInterval === "month"}
 disabled={loading}
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
 disabled={loading}
 />
 )}
 {selectedInterval === "week" && (
 <DatePicker
 selected={selectedDate} // Display selectedDate for week, but logic uses selectedWeek
 onChange={handleDateChange} // Still allows changing month/year for week selection
 dateFormat="yyyy-MM"
 showMonthYearPicker
 showPopperArrow={false}
 customInput={<CustomDateInput />}
 disabled={loading}
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
 disabled={loading}
 />
 )}
 </DatePickerWrapper>
 </IntervalSelector>

 {selectedInterval === "week" && (
 <WeekButtons>
 {getWeeksInMonth(selectedDate).map((weekStart, index) => (
 <WeekButton
 key={format(weekStart, "yyyy-MM-dd")} // Use formatted date as key for stability
 onClick={() => handleWeekChange(weekStart)}
 className={
 selectedWeek && format(selectedWeek, "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd") ? "active" : ""
 }
 disabled={loading}
 >
 {`Week ${index + 1}`} {/* Show week number and start date */}
 </WeekButton>
 ))}
 </WeekButtons>
 )}
 <br />
 <Content>
 <TabButtons>
 <TabButton active={activeTab === "procedure"} onClick={() => setActiveTab("procedure")}>
 Procedure Bill
 </TabButton>
 <TabButton active={activeTab === "consumer"} onClick={() => setActiveTab("consumer")}>
 Consumable Bill
 </TabButton>
 </TabButtons>

 {loading && <LoadingMessage>Loading billing data...</LoadingMessage>}

 {!loading && billingData && billingData.length > 0 ? (
 <BillingContainer>
 {activeTab === "procedure" && (
 <Billing>
 <Header>
 <h5 className="text-center">Procedure Bill - {getReportHeading(selectedInterval)}</h5>
 <button title="Download Procedure CSV" onClick={downloadProcedureCSV} disabled={loading}>
 <FaDownload />
 </button>
 </Header>
 <DataCount>Total Records: {billingData.length}</DataCount>
 <table align="middle" className="mt-2">
 <MDBTableHead align="middle">
 <tr>
 <th>Patient Name</th>
 <th>Patient UID</th>
 <th>Procedure Billnumber</th>
 <th>Appointment Date</th>
 <th>Doctor Name</th>
 <th>Procedure</th>
 <th>Procedure Date</th>
 <th>Price</th>
 <th>GST</th>
 <th>GST Rate</th>
 <th>Consultation Fee</th>
 <th>Total</th>
 <th>Procedure net Amount</th>
 <th>Action</th>
 </tr>
 </MDBTableHead>
 <MDBTableBody>
{billingData.map((item) => (
 <React.Fragment key={`${item.patientUID}-${item.procedureBillNumber}`}>
 {item.procedures && item.procedures.length > 0 ? (
 item.procedures.map((proc, index) => (
 <tr key={`${item.patientUID}-${item.procedureBillNumber}-${index}`}>
 {index === 0 && (
 <>
 <td rowSpan={item.procedures.length}>{item.patientName}</td>
 <td rowSpan={item.procedures.length}>{item.patientUID}</td>
 <td rowSpan={item.procedures.length}>{item.procedureBillNumber}</td>
 <td rowSpan={item.procedures.length}>{item.appointmentDate}</td>
 <td rowSpan={item.procedures.length}>{item.patient_handledby}</td>
 </>
 )}
 <td>{proc.procedure}</td>
 <td>{proc.procedureDate}</td>
 <td>{proc.price}</td>
 <td>{proc.gst}</td>
 <td>{proc.gstRate}</td>
 <td>{item.consultationFee}</td>
 <td>{proc.total}</td>
 {index === 0 && (
 <>
 <td rowSpan={item.procedures.length}>{item.procedureNetAmount}</td>
 <td rowSpan={item.procedures.length}>
 {renderActionButtons(item.patientUID, "procedure", item.procedureBillNumber)}
 </td>
 </>
 )}
 </tr>
 ))
 ) : (
 <tr>
 <td>{item.patientName}</td>
 <td>{item.patientUID}</td>
 <td>{item.procedureBillNumber}</td>
 <td>{item.appointmentDate}</td>
 <td>{item.patient_handledby}</td>
 <td colSpan="6">No procedures recorded</td>
 <td>{item.procedureNetAmount}</td>
 <td>{renderActionButtons(item.patientUID, "procedure", item.procedureBillNumber)}</td>
 </tr>
 )}
 </React.Fragment>
))}

 </MDBTableBody>
 <tfoot>
 <tr>
 <td colSpan="8" className="text-right">
 <strong>Grand Total</strong>
 </td>
      <td colSpan="3">
        <strong>
          {calculateProcedureGrandTotal(billingData).toFixed(2)}
        </strong>
      </td>
 <td></td>
 </tr>
 </tfoot>
 </table>
 </Billing>
 )}
 {activeTab === "consumer" && (
 <Billing>
 <Header>
 <h5 className="text-center">Consumable Bill - {getReportHeading(selectedInterval)}</h5>
 <button title="Download Consumer CSV" onClick={downloadConsumerCSV} disabled={loading}>
 <FaDownload />
 </button>
 </Header>
 <DataCount>Total Records: {billingData.length}</DataCount>
 <table align="middle" className="mt-2">
 <MDBTableHead align="middle">
 <tr>
 <th>Patient Name</th>
 <th>Patient UID</th>
 <th>Consumer Billnumber</th>
 <th>Appointment Date</th>
 <th>Item</th>
 <th>Quantity</th>
 <th>Total</th>
 <th>Action</th>
 </tr>
 </MDBTableHead>
 <MDBTableBody>
 {billingData.map((item) => (
 <React.Fragment key={`${item.patientUID}-${item.consumerBillNumber}`}> {/* Improved key */}
 {item.consumer && item.consumer.length > 0 ? ( // Check if consumer items exist
 item.consumer.map((con, index) => (
 <tr key={`${item.patientUID}-${item.consumerBillNumber}-${index}`}> {/* Unique key for each row */}
 {index === 0 && (
 <>
 <td rowSpan={item.consumer.length}>{item.patientName}</td>
 <td rowSpan={item.consumer.length}>{item.patientUID}</td>
 <td rowSpan={item.consumer.length}>{item.consumerBillNumber}</td>
 <td rowSpan={item.consumer.length}>{item.appointmentDate}</td>
 </>
 )}
 <td>{con.item}</td>
 <td>{con.qty}</td>
 <td>{con.total}</td>
 {index === 0 && (
 <td rowSpan={item.consumer.length}>
 {renderActionButtons(item.patientUID, "consumer", item.consumerBillNumber)}
 </td>
 )}
 </tr>
 ))
 ) : (
 // Render a row for items with no consumer items
 <tr>
 <td>{item.patientName}</td>
 <td>{item.patientUID}</td>
 <td>{item.consumerBillNumber}</td>
 <td>{item.appointmentDate}</td>
 <td colSpan="3">No consumable items recorded</td> {/* Spanning columns for empty consumables */}
 <td>{renderActionButtons(item.patientUID, "consumer", item.consumerBillNumber)}</td>
 </tr>
 )}
 </React.Fragment>
 ))}
 </MDBTableBody>
 <tfoot>
 <tr>
 <td colSpan="5" className="text-right">
 <strong>Grand Total</strong>
 </td>
      <td colSpan="2">
        <strong>
          {calculateConsumerGrandTotal(billingData).toFixed(2)}
        </strong>
      </td>
 </tr>
 </tfoot>
 </table>
 </Billing>
 )}
 </BillingContainer>
 ) : (
 !loading && (
 console.log("No Data available")
 )
 )}
 </Content>
 </Container>
 )
}

export default BillingProcedureReport


const RefreshButton = styled.button`
 padding: 8px 12px;
 border: 1px solid #C85C8E;
 background-color: white;
 color: #C85C8E;
 border-radius: 4px;
 cursor: pointer;
 font-size: 0.9rem;

 &:hover:not(:disabled) {
 background-color: #C85C8E;
 color: white;
 }

 &:disabled {
 opacity: 0.6;
 cursor: not-allowed;
 }
`

const ErrorMessage = styled.div`
 background-color: #ffebee;
 color: #c62828;
 padding: 10px;
 border-radius: 4px;
 margin-bottom: 10px;
 text-align: center;
`

const LoadingMessage = styled.div`
 text-align: center;
 font-size: 1.2rem;
 color: #666;
 padding: 20px;
`

const DataCount = styled.div`
 text-align: center;
 font-size: 0.9rem;
 color: #666;
 margin-bottom: 10px;
`

const BillingContainer = styled.div`
 display: flex;
 flex-direction: column; /* Changed to column for better table stacking */
 gap: 20px;
`

const TabButtons = styled.div`
 display: flex;
 justify-content: center;
 margin-bottom: 10px;
`

const TabButton = styled.button`
 padding: 10px 20px;
 border: none;
 background-color: ${({ active }) => (active ? "#C85C8E" : "white")};
 color: ${({ active }) => (active ? "white" : "#C85C8E")};
 font-size: 1rem;
 cursor: pointer;
 margin: 0 5px;
 border-radius: 5px;
 transition: background-color 0.3s, color 0.3s;

 &:hover {
 background-color: #C85C8E;
 color: white;
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
 }
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

const WeekButtons = styled.div`
 display: flex;
 justify-content: center;
 gap: 10px;
 margin-bottom: 20px;
 flex-wrap: wrap;
`

const WeekButton = styled.button`
 margin: 5px;
 padding: 8px 15px;
 border: 1px solid #C85C8E;
 background-color: white;
 color: #C85C8E;
 border-radius: 5px;
 cursor: pointer;
 &:hover {
 background-color: #f0f0f0;
 }
 &.active {
 background-color: #C85C8E;
 color: white;
 border-color: #C85C8E;
 }
`

const Billing = styled.div`
 flex: 1;
 overflow-x: auto;

 .text-right {
 text-align: right;
 }

 .text-center {
 text-align: center;
 }

 input[type="number"], select.form-control {
 width: 100%;
 padding: 6px;
 border: 1px solid #ccc;
 border-radius: 4px;
 box-sizing: border-box;
 }
`

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
 <StyledCustomDateInput onClick={onClick} ref={ref} value={value} readOnly />
));

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
`;

const ActionButtonsContainer = styled.div`
 display: flex;
 gap: 5px;
 align-items: center;
 justify-content: center;

 button {
 padding: 5px 10px;
 font-size: 0.9rem;
 border-radius: 4px;
 border: none;
 cursor: pointer;
 transition: background-color 0.2s ease-in-out;

 &.btn-primary {
 background-color: #007bff;
 color: white;
 &:hover { background-color: #0056b3; }
 }
 &.btn-info { /* This button type is now removed, but keeping the style for completeness if other info buttons exist */
 background-color: #17a2b8;
 color: white;
 &:hover { background-color: #117a8b; }
 }
 &.btn-success { /* This button type is now removed, but keeping the style for completeness if other success buttons exist */
 background-color: #28a745;
 color: white;
 &:hover { background-color: #1e7e34; }
 }
 &.btn-danger {
 background-color: #dc3545;
 color: white;
 &:hover { background-color: #bd2130; }
 }
 }
`;