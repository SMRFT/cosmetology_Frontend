"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { MDBTableHead, MDBTableBody } from "mdb-react-ui-kit"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { startOfWeek, startOfMonth, addWeeks, format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendarDay, faCalendarWeek, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"
import { FaDownload, FaFilePdf } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Cookies from "js-cookie"
import jsPDF from "jspdf"
import "jspdf-autotable"
import PDFMain1 from "./images/PDF_Main_branch1.jpeg"
import PDFMain2 from "./images/PDF_Main_branch2.jpeg"

// Utility function to format text
const formatText = (text) => {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const BillingReport = () => {
  const [billingData, setBillingData] = useState(null)
  const [selectedInterval, setSelectedInterval] = useState("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableData, setEditableData] = useState({})
  const [medicineOptions, setMedicineOptions] = useState([])
  const [branchCode, setBranchCode] = useState("")
  const [userRole, setUserRole] = useState("")
  const navigate = useNavigate()

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
        `http://127.0.0.1:8000/billing/${interval}/?appointmentDate=${dateParam}&branch_code=${branchCode}`,
        {
          headers: {
            "X-Branch-Code": branchCode,
          },
          withCredentials: true,
        },
      )
      setBillingData(response.data.billing_data)
      const initialEditableData = response.data.billing_data.reduce((acc, item) => {
        acc[item.patientUID] = item.table_data
        return acc
      }, {})
      setEditableData(initialEditableData)
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

  const downloadCSV = () => {
    if (!billingData) return

    const headers = [
      "Patient Name",
      "Particulars",
      "bill Number",
      "Bill Date",
      "Doctor Name",
      "Quantity",
      "Price",
      "CGST Percentage",
      "CGST Value",
      "SGST Percentage",
      "SGST Value",
      "Total",
    ]
    const rows = billingData.flatMap((item) =>
      item.table_data.map((data, index) => [
        index === 0 ? item.patientName : "",
        data.particulars,
        item.billNumber,
        item.appointmentDate,
        item.patient_handledby,
        data.qty,
        data.price,
        data.CGST_percentage,
        data.CGST_value,
        data.SGST_percentage,
        data.SGST_value,
        data.total,
      ]),
    )

    rows.push(["", "", "", "", "", "", "", "Grand Total", grandTotal.toFixed(2)])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${getReportHeading(selectedInterval)}_${branchCode}.csv`)
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

  const generatePharmacyPDF = (patientUID, billNumber) => {
    const patientData = billingData.find((item) => item.patientUID === patientUID && item.billNumber === billNumber)
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
      doc.text(`Bill Number: ${patientData.billNumber}`, 16, startY + 16)

      startY += 30

      // Medicine Table
      const medicineTable = patientData.table_data.map((data) => [
        data.particulars,
        data.qty,
        `${data.price}`,
        `${data.CGST_percentage}%`,
        `${data.CGST_value}`,
        `${data.SGST_percentage}%`,
        `${data.SGST_value}`,
        `${data.total}`,
      ])

      doc.autoTable({
        head: [["Particulars", "Qty", "Price", "CGST %", "CGST Value", "SGST %", "SGST Value", "Total"]],
        body: medicineTable,
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
      const total = patientData.table_data.reduce((sum, data) => sum + Number.parseFloat(data.total || 0), 0)
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

  const handleDelete = async (patientUID, billNumber) => {
    try {
      await axios.delete("http://127.0.0.1:8000/delete/billing/data/", {
        data: { patientUID, billNumber, branch_code: branchCode },
        headers: {
          "X-Branch-Code": branchCode,
        },
        withCredentials: true,
      })
      fetchData(selectedInterval)
      toast.success("Data deleted successfully")
    } catch (error) {
      console.error("Error deleting data:", error)
      toast.error("Error deleting data.")
    }
  }

  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  const handleDataChange = async (patientUID, index, field, value) => {
    const newEditableData = [...editableData[patientUID]]

    if (field === "particulars") {
      const price = await fetchMedicinePrice(value)
      newEditableData[index] = {
        ...newEditableData[index],
        [field]: value,
        price: price,
        total: price * newEditableData[index].qty,
      }
    } else if (field === "qty") {
      const price = newEditableData[index].price
      newEditableData[index] = { ...newEditableData[index], [field]: value, total: value * price }
    } else {
      newEditableData[index] = { ...newEditableData[index], [field]: value }
    }

    setEditableData((prevData) => ({ ...prevData, [patientUID]: newEditableData }))
  }

  const fetchMedicineData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/pharmacy/data/?branch_code=${branchCode}`, {
        headers: {
          "X-Branch-Code": branchCode,
        },
        withCredentials: true,
      })
      setMedicineOptions(response.data)
    } catch (error) {
      console.error("Error fetching medicine data:", error)
    }
  }

  useEffect(() => {
    fetchMedicineData()
  }, [branchCode])

  const fetchMedicinePrice = async (medicine_name) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/pharmacy/medicine/${medicine_name}/price/?branch_code=${branchCode}`,
        {
          headers: {
            "X-Branch-Code": branchCode,
          },
          withCredentials: true,
        },
      )
      return response.data.price
    } catch (error) {
      console.error("Error fetching medicine price:", error)
      return 0
    }
  }

  const updateTotal = (patientUID, dataIndex, newQty, price) => {
    const newTotal = newQty * price
    setEditableData((prevData) => {
      const newData = [...prevData[patientUID]]
      newData[dataIndex] = { ...newData[dataIndex], qty: newQty, total: newTotal }
      return { ...prevData, [patientUID]: newData }
    })
  }

  const saveChanges = async (patientUID, appointmentDate) => {
    try {
      await axios.put(
        "http://127.0.0.1:8000/update/billing/data/",
        {
          patientUID: patientUID,
          appointmentDate: appointmentDate,
          table_data: editableData[patientUID],
          branch_code: branchCode,
        },
        {
          headers: {
            "X-Branch-Code": branchCode,
          },
          withCredentials: true,
        },
      )
      fetchData(selectedInterval)
      toast.success("Data updated successfully")
      toggleEditMode()
    } catch (error) {
      console.error("Error updating data:", error)
      toast.error("Error updating data.")
    }
  }

  const grandTotal = (billingData || []).reduce((sum, item) => {
    return (
      sum +
      (item.table_data || []).reduce((innerSum, data) => {
        const total = Number.parseFloat(data.total || 0)
        return innerSum + (isNaN(total) ? 0 : total)
      }, 0)
    )
  }, 0)

  const renderActionButtons = (patientUID, billNumber) => (
    <ActionButtonsContainer>
      <button
        title="Generate PDF"
        className="btn btn-primary me-2"
        onClick={() => generatePharmacyPDF(patientUID, billNumber)}
      >
        <FaFilePdf />
      </button>
      {userRole !== "Manager" && userRole !== "manager" && (
        <button className="btn btn-danger" onClick={() => handleDelete(patientUID, billNumber)}>
          Delete
        </button>
      )}
    </ActionButtonsContainer>
  )

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header>
        <h3 className="text-center mb-2">Billing Report</h3>
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
        {billingData && billingData.length > 0 ? (
          <Billing>
            <h5 className="text-center">{getReportHeading(selectedInterval)}</h5>
            <table align="middle">
              <MDBTableHead align="middle">
                <tr>
                  <th>Patient Name</th>
                  <th>Bill Number</th>
                  <th>Bill Date</th>
                  <th>Doctor Name</th>
                  <th>Particulars</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>CGST_percentage</th>
                  <th>CGST_value</th>
                  <th>SGST_percentage</th>
                  <th>SGST_value</th>
                  <th>Total</th>
                  <th>action</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {billingData && billingData.length > 0 ? (
                  billingData.map((item, index) => (
                    <React.Fragment key={item.patientUID}>
                      {item.table_data && item.table_data.length > 0 ? (
                        item.table_data.map((data, dataIndex) => (
                          <tr key={`${item.patientUID}-${dataIndex}`}>
                            {dataIndex === 0 && (
                              <td rowSpan={item.table_data.length}>{formatText(item.patientName)}</td>
                            )}
                            <td>{item.billNumber}</td>
                            <td>{item.appointmentDate}</td>
                            <td>{item.patient_handledby}</td>
                            <td>{data.particulars}</td>
                            <td>{data.qty}</td>
                            <td>{data.price}</td>
                            <td>{data.CGST_percentage}</td>
                            <td>{data.CGST_value}</td>
                            <td>{data.SGST_percentage}</td>
                            <td>{data.SGST_value}</td>
                            <td>{Number.parseFloat(data.total).toFixed(2)}</td>
                            {dataIndex === 0 && (
                              <td rowSpan={item.table_data.length}>
                                {renderActionButtons(item.patientUID, item.billNumber)}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" className="text-center">
                            No table data available
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </MDBTableBody>

              <tfoot>
                <tr>
                  <td colSpan="10" className="text-right">
                    <strong>Grand Total</strong>
                  </td>
                  <td>
                    <strong>{grandTotal.toFixed(2)}</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </Billing>
        ) : (
          <Message>No data available for the selected interval.</Message>
        )}
      </Content>
    </Container>
  )
}

export default BillingReport

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

  svg {
    cursor: inherit;
  }

  &:hover {
    background-color: ${({ active }) => (active ? "#C85C8E" : "#f0f0f0")};
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
    background-color: #007bff;
    color: white;
  }
`

const Billing = styled.div`
  flex: 1;
  overflow-x: auto;
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

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`
