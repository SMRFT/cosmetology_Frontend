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
import PDFMain from "./images/PDF_Main_branch1.jpeg"

const BillingProcedureReport = () => {
  const [billingData, setBillingData] = useState(null)
  const [selectedInterval, setSelectedInterval] = useState("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [activeTab, setActiveTab] = useState("procedure")
  const [branchCode, setBranchCode] = useState("")

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
    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from cookies:", code)
    } else {
      console.warn("Branch code not found in cookies")
    }

    if (selectedInterval === "week" && !selectedWeek) {
      setSelectedWeek(startOfWeek(selectedDate, { weekStartsOn: 1 }))
    }
    fetchData(selectedInterval)
  }, [selectedInterval, selectedDate, selectedWeek])

  const fetchData = async (interval) => {
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
      const response = await axios.get(
        `http://127.0.0.1:8000/procedurebilling/${interval}/?appointmentDate=${dateParam}`,
        {
          headers: {
            "X-Branch-Code": branchCode,
          },
          withCredentials: true,
        },
      )
      setBillingData(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
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
    if (!billingData) return

    const headers = [
      "Patient Name",
      "Patient UID",
      "Consumer Billnumber",
      "Appointment Date",
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

    rows.push(["", "", "", "", "", "", "", "", "Grand Total", totalSum.toFixed(2), ""])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `Procedure_${getReportHeading(selectedInterval)}_${branchCode}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadConsumerCSV = () => {
    if (!billingData) return

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
    link.setAttribute("download", `Consumer_${getReportHeading(selectedInterval)}_${branchCode}.csv`)
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

    convertToBase64(PDFMain, (mainImage) => {
      // Add background image
      doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)

      let startY = 85 // Start position after background image

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
      doc.text(`Date: ${patientData.appointmentDate}`, 140, startY + 8)
      doc.text(`Branch: ${branchCode}`, 140, startY + 16)

      startY += 30

      // Procedure Table
      const procedureTable = patientData.procedures.map((proc) => [
        proc.procedure,
        proc.procedureDate,
        `₹${proc.price}`,
        `${proc.gstRate}%`,
        `₹${proc.gst}`,
        `₹${proc.total}`,
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
      doc.text(`Total Amount: ₹${total.toFixed(2)}`, 14, doc.previousAutoTable.finalY + 15)

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

    convertToBase64(PDFMain, (mainImage) => {
      // Add background image
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
      const consumerTable = patientData.consumer.map((con) => [con.item, con.qty, `₹${con.total}`])

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
      doc.text(`Total Amount: ₹${total.toFixed(2)}`, 14, doc.previousAutoTable.finalY + 15)

      // Open in new window instead of auto-print
      const pdfBlob = doc.output("blob")
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, "_blank")
    })
  }

  const deleteRecord = async (patientUID, billType, billNumber) => {
    try {
      const response = await axios.delete("http://127.0.0.1:8000/delete_procedure_data/", {
        data: {
          patientUID: patientUID,
          consumerBillNumber: billType === "consumer" ? billNumber : undefined,
          procedureBillNumber: billType === "procedure" ? billNumber : undefined,
          branch_code: branchCode,
        },
        headers: {
          "X-Branch-Code": branchCode,
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
      toast.error("Error deleting record.")
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
      <button
        title="Delete Record"
        className="btn btn-danger"
        onClick={() => {
          deleteRecord(patientUID, billType, billNumber)
        }}
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </button>
    </ActionButtonsContainer>
  )

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header>
        <h3 className="text-center mb-2">Billing Report</h3>
        {branchCode && <small className="text-center d-block mb-2">Branch: {branchCode}</small>}
        {!branchCode && <div className="alert alert-warning mb-3">Branch code not found. Please login again.</div>}
      </Header>
      <IntervalSelector>
        <ButtonGroup>
          <IntervalButton
            title="Daily Report"
            onClick={() => handleIntervalChange("day")}
            className={selectedInterval === "day" ? "active" : ""}
            active={selectedInterval === "day"}
          >
            <FontAwesomeIcon icon={faCalendarDay} />
          </IntervalButton>
          <IntervalButton
            title="Weekly Report"
            onClick={() => handleIntervalChange("week")}
            className={selectedInterval === "week" ? "active" : ""}
            active={selectedInterval === "week"}
          >
            <FontAwesomeIcon icon={faCalendarWeek} />
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
          {selectedInterval === "week" && (
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM"
              showMonthYearPicker
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

      {selectedInterval === "week" && (
        <WeekButtons>
          {getWeeksInMonth(selectedDate).map((weekStart, index) => (
            <WeekButton
              key={index}
              onClick={() => handleWeekChange(weekStart)}
              className={
                selectedWeek && format(selectedWeek, "yyyy-MM-dd") === format(weekStart, "yyyy-MM-dd") ? "active" : ""
              }
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
        {billingData && billingData.length > 0 ? (
          <BillingContainer>
            {activeTab === "procedure" && (
              <Billing>
                <Header>
                  <h5 className="text-center">Procedure Bill - {getReportHeading(selectedInterval)}</h5>
                  <button title="Download Procedure CSV" onClick={downloadProcedureCSV}>
                    <FaDownload />
                  </button>
                </Header>
                <table align="middle" className="mt-2">
                  <MDBTableHead align="middle">
                    <tr>
                      <th>Patient Name</th>
                      <th>Patient UID</th>
                      <th>Procedure Billnumber</th>
                      <th>Appointment Date</th>
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
                  <button title="Download Consumer CSV" onClick={downloadConsumerCSV}>
                    <FaDownload />
                  </button>
                </Header>
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
          <Message>No data available</Message>
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
