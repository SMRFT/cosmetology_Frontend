"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { MDBTableHead, MDBTableBody } from "mdb-react-ui-kit"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { startOfWeek, startOfMonth, addWeeks, format } from "date-fns"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDay, faCalendarWeek, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"
import { FaDownload, FaFilePdf } from "react-icons/fa"
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Cookies from "js-cookie"
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

  useEffect(() => {
    const code = Cookies.get("branch_code")
    const role = Cookies.get("userRole") || localStorage.getItem("userRole") || sessionStorage.getItem("userRole")

    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from cookies:", code)
    } else {
      console.warn("Branch code not found in cookies")
      setError("Branch code not found. Please login again.")
    }

    if (role) {
      setUserRole(role)
      console.log("User role retrieved:", role)
    } else {
      console.warn("User role not found")
    }

    if (selectedInterval === "week" && !selectedWeek) {
      setSelectedWeek(startOfWeek(selectedDate, { weekStartsOn: 1 }))
    }
  }, [])

  useEffect(() => {
    if (branchCode) {
      fetchData(selectedInterval)
    }
  }, [selectedInterval, selectedDate, selectedWeek, branchCode])

  const fetchData = async (interval) => {
    if (!branchCode) {
      console.warn("Branch code not available, skipping API call")
      return
    }

    setLoading(true)
    setError(null)

    let dateParam = ""
    if (interval === "day") {
      dateParam = format(selectedDate, "yyyy-MM-dd")
    } else if (interval === "week" && selectedWeek) {
      dateParam = format(selectedWeek, "yyyy-MM-dd")
    } else if (interval === "month") {
      const startOfMonthDate = startOfMonth(selectedDate)
      dateParam = format(startOfMonthDate, "yyyy-MM-dd")
    }

    try {
      console.log("Making procedure billing API call with params:", {
        interval,
        appointmentDate: dateParam,
        branch_code: branchCode,
      })

      const response = await axios.get(`${Cosmetologybaseurl}procedurebilling/${interval}/`, {
        params: {
          appointmentDate: dateParam,
          branch_code: branchCode,
        },
        headers: {
          "X-Branch-Code": branchCode,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })

      console.log("Procedure billing API response:", response.data)
      setBillingData(response.data)
    } catch (error) {
      console.error("Error fetching procedure billing data:", error)
      setError("Failed to fetch procedure billing data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval)
    setSelectedWeek(null)
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const handleWeekChange = (weekStart) => {
    setSelectedWeek(weekStart)
  }

  const getWeeksInMonth = (date) => {
    const startOfMonthDate = startOfMonth(date)
    const weeks = []
    for (let i = 0; i < 5; i++) {
      const weekStart = addWeeks(startOfMonthDate, i)
      if (weekStart.getMonth() === date.getMonth()) {
        weeks.push(weekStart)
      }
    }
    return weeks
  }

  const downloadProcedureCSV = () => {
    if (!billingData || billingData.length === 0) {
      toast.warning("No procedure data available to download")
      return
    }

    const headers = [
      "Patient Name",
      "Patient UID",
      "Consumer Billnumber",
      "Appointment Date",
      "Doctor Name",
      "Procedure",
      "Procedure Date",
      "Price",
      "GST",
      "GST Rate",
      "Total",
      "Branch Code",
    ]
    let totalSum = 0
    const rows = billingData.flatMap((item) => {
      const procedures = typeof item.procedures === "string" ? JSON.parse(item.procedures) : item.procedures
      return procedures.map((proc) => {
        totalSum += Number.parseFloat(proc.total || 0)
        return [
          item.patientName,
          item.patientUID,
          item.consumerBillNumber,
          item.appointmentDate,
          item.patient_handledby,
          proc.procedure,
          proc.procedureDate,
          proc.price,
          proc.gst,
          proc.gstRate,
          proc.total,
          branchCode,
        ]
      })
    })

    rows.push(["", "", "", "", "", "", "", "", "Grand Total", totalSum.toFixed(2), "", ""])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `Procedure_${getReportHeading(selectedInterval)}_${branchCode}_${format(selectedDate, "yyyy-MM-dd")}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadConsumerCSV = () => {
    if (!billingData || billingData.length === 0) {
      toast.warning("No consumer data available to download")
      return
    }

    const headers = ["Patient Name", "Patient UID", "Appointment Date", "Item", "Quantity", "Total", "Branch Code"]
    let totalSum = 0
    const rows = billingData.flatMap((item) => {
      const consumer = typeof item.consumer === "string" ? JSON.parse(item.consumer) : item.consumer
      return consumer.map((con) => {
        totalSum += Number.parseFloat(con.total || 0)
        return [item.patientName, item.patientUID, item.appointmentDate, con.item, con.qty, con.total, branchCode]
      })
    })

    rows.push(["", "", "", "", "Grand Total", totalSum.toFixed(2), ""])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `Consumer_${getReportHeading(selectedInterval)}_${branchCode}_${format(selectedDate, "yyyy-MM-dd")}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

    // Select PDF background based on branch code without directly using branch names
    const backgroundImageMap = {
      SCC001: PDFMain1,
      SCC002: PDFMain2,
    }
    const PDFMain = backgroundImageMap[branchCode] || PDFMain1

    convertToBase64(PDFMain, (mainImage) => {
      doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
      let startY = 85

      // Set font style for patient name - make it more prominent
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text(`Patient: ${patientData.patientName.toUpperCase()}`, 16, startY)

      // Patient details with better formatting
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.text(`Patient UID: ${patientData.patientUID}`, 16, startY + 8)
      doc.text(`Bill Number: ${patientData.procedureBillNumber}`, 16, startY + 16)
      doc.text(`Branch: ${branchCode}`, 140, startY + 8)

      startY += 30

      // Procedure Table
      const procedureTable = patientData.procedures.map((proc) => [
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

      // Total with better styling
      const total = patientData.procedures.reduce((sum, proc) => sum + Number.parseFloat(proc.total || 0), 0)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(0, 100, 0)
      doc.text(`Total Amount: ${total.toFixed(2)}`, 14, doc.previousAutoTable.finalY + 15)

      // Open in new window instead of auto-print
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
      let startY = 85

      // Set font style for patient name - make it more prominent
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text(`Patient: ${patientData.patientName.toUpperCase()}`, 16, startY)

      // Patient details with better formatting
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.text(`Patient UID: ${patientData.patientUID}`, 16, startY + 8)
      doc.text(`Bill Number: ${patientData.consumerBillNumber}`, 16, startY + 16)
      doc.text(`Date: ${patientData.appointmentDate}`, 140, startY + 8)
      doc.text(`Branch: ${branchCode}`, 140, startY + 16)

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
      doc.text(`Total Amount: ${total.toFixed(2)}`, 14, doc.previousAutoTable.finalY + 15)

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
        headers: {
          "X-Branch-Code": branchCode,
          "Content-Type": "application/json",
        },
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
      {userRole !== "Manager" && userRole !== "manager" && (
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
              selected={selectedDate}
              onChange={handleDateChange}
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
              key={index}
              onClick={() => handleWeekChange(weekStart)}
              className={
                selectedWeek && format(selectedWeek, "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd") ? "active" : ""
              }
              disabled={loading}
            >
              {`${index + 1} Week`}
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

        {loading && <LoadingMessage>Loading procedure billing data...</LoadingMessage>}

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
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {billingData.map((item) => (
                      <React.Fragment key={item.patientUID}>
                        {item.procedures.map((proc, index) => (
                          <tr key={index}>
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
                            <td>{proc.total}</td>
                            {index === 0 && (
                              <td rowSpan={item.procedures.length}>
                                {renderActionButtons(item.patientUID, "procedure", item.procedureBillNumber)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </MDBTableBody>
                  <tfoot>
                    <tr>
                      <td colSpan="8" className="text-right">
                        <strong>Grand Total</strong>
                      </td>
                      <td colSpan="2">
                        <strong>
                          {billingData
                            .reduce((sum, item) => {
                              return (
                                sum +
                                item.procedures.reduce(
                                  (procSum, proc) => procSum + Number.parseFloat(proc.total || 0),
                                  0,
                                )
                              )
                            }, 0)
                            .toFixed(2)}
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
                      <React.Fragment key={item.patientUID}>
                        {item.consumer.map((con, index) => (
                          <tr key={index}>
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
                        ))}
                      </React.Fragment>
                    ))}
                  </MDBTableBody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="text-right">
                        <strong>Grand Total</strong>
                      </td>
                      <td colSpan="3">
                        <strong>
                          {billingData
                            .reduce((sum, item) => {
                              return (
                                sum +
                                item.consumer.reduce((conSum, con) => conSum + Number.parseFloat(con.total || 0), 0)
                              )
                            }, 0)
                            .toFixed(2)}
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
            <Message>
              {branchCode ? "No data available" : "Please ensure you are logged in with a valid branch code."}
            </Message>
          )
        )}
      </Content>
    </Container>
  )
}

export default BillingProcedureReport

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

const BranchInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin-top: 5px;
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
  margin-top: -30px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  font-weight: bold;
`

const IntervalButton = styled.button`
  padding: 5px 10px;
  border: none;
  background-color: ${({ active }) => (active ? "#C85C8E" : "white")};
  color: ${({ active }) => (active ? "white" : "#C85C8E")};
  font-size: 1.5rem;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const DatePickerWrapper = styled.div`
  color: #C85C8E;
`

const WeekButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`

const WeekButton = styled.button`
  margin: 5px;
  &.active {
    background-color: #C85C8E;
    color: white;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Billing = styled.div`
  flex: 1;
  overflow-x: auto;
`

const BillingContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
`

const Message = styled.div`
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`

const CustomDateInput = styled.input`
  border: none;
  padding: 8px;
  color: #C85C8E;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  background-color: white;
  font-weight: bold;
  text-align: center;
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

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`
