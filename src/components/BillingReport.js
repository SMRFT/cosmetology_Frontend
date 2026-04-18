import React, { useState, useEffect } from "react"
import apiRequest from "./apiRequest"
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
import jsPDF from "jspdf"
import "jspdf-autotable"
import Kumarapalayam from "./images/KumarapalayamBill.jpg"
import Salem from "./images/Salembill.jpg"

// Utility function to format text
const formatText = (text) => {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const BillingReport = () => {
  const [billingData, setBillingData] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [branchCode, setBranchCode] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;

  const getReportHeading = (interval) => {
    switch (interval) {
      case "day":
        return "Daily Report";
      case "week":
        return "Weekly Report";
      case "month":
        return "Monthly Report";
      default:
        return "Billing Report";
    }
  };

  // Initialize branch code and user role
  useEffect(() => {
    const code = localStorage.getItem("selected_branch");
    const role =
      localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

    if (code) {
      setBranchCode(code);
    } else {
      console.warn("Branch code not found in localStorage");
      setError("Branch code not found. Please ensure you are logged in.");
    }

    if (role) {
      setUserRole(role);
    } else {
      console.warn("User role not found");
    }
  }, []);

  // Initialize selectedWeek when interval is 'week'
  useEffect(() => {
    if (selectedInterval === "week" && !selectedWeek) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      setSelectedWeek(weekStart);
    }
  }, [selectedInterval, selectedDate, selectedWeek]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (branchCode) {
      // Add a small delay to ensure state has been updated properly
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [branchCode, selectedInterval, selectedDate, selectedWeek]);

  const fetchData = async () => {
    if (!branchCode) {
      console.warn("Branch code is not available, skipping data fetch.");
      setBillingData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    // Clear previous data immediately when starting new fetch
    setBillingData(null);

    let dateParam = "";
    let currentSelectedDateForParam = selectedDate;

    try {
      // Handle date parameter based on interval
      if (selectedInterval === "week") {
        if (selectedWeek) {
          currentSelectedDateForParam = selectedWeek;
        } else {
          currentSelectedDateForParam = startOfWeek(selectedDate, { weekStartsOn: 1 });
        }
        dateParam = format(currentSelectedDateForParam, "yyyy-MM-dd");
      } else if (selectedInterval === "day") {
        dateParam = format(currentSelectedDateForParam, "yyyy-MM-dd");
      } else if (selectedInterval === "month") {
        dateParam = format(startOfMonth(currentSelectedDateForParam), "yyyy-MM-dd");
      }

      console.log(`Fetching ${selectedInterval} data for date: ${dateParam}, branch: ${branchCode}`);

      const response = await apiRequest(
        `${Cosmetologybaseurl}billing/${selectedInterval}/`,
        "GET",
        null,
        {},
        {
          params: {
            appointmentDate: dateParam,
            },
        }
      );

      if (response.success) {
        setBillingData(response.data.billing_data);
        if (!response.data.billing_data || Object.keys(response.data.billing_data).length === 0) {
          toast.info("No data found for the selected criteria.");
        }
      } else {
        console.error("Error fetching data:", response.error);
        setError("Failed to fetch billing data. Please try again.");
        setBillingData(null);
        toast.error("Failed to fetch data.");
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch billing data. Please try again.");
      setBillingData(null);
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleIntervalChange = (interval) => {
    console.log(`Changing interval to: ${interval}`);
    
    // Clear previous data immediately
    setBillingData(null);
    setLoading(true);
    
    setSelectedInterval(interval);
    
    const today = new Date();
    
    if (interval === "week") {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      setSelectedWeek(weekStart);
      setSelectedDate(weekStart); // Set selectedDate to week start for consistency
    } else {
      setSelectedDate(today);
      setSelectedWeek(null); // Clear selectedWeek when not in week mode
    }
  };

  const handleDateChange = (date) => {
    console.log(`Date changed to: ${date}`);
    setBillingData(null); // Clear data immediately
    setSelectedDate(date);
    
    if (selectedInterval === "week") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      setSelectedWeek(weekStart);
    }
  };

  const handleWeekChange = (weekStart) => {
    console.log(`Week changed to: ${weekStart}`);
    setBillingData(null); // Clear data immediately
    setSelectedWeek(weekStart);
    setSelectedDate(weekStart);
  };

  const getWeeksInMonth = (date) => {
    const startOfMonthDate = startOfMonth(date);
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      const weekStart = startOfWeek(addWeeks(startOfMonthDate, i), { weekStartsOn: 1 });
      if (
        weekStart.getMonth() === date.getMonth() ||
        (i > 0 &&
          startOfWeek(addWeeks(startOfMonthDate, i - 1), { weekStartsOn: 1 })
            .getMonth() === date.getMonth() &&
          weekStart.getMonth() !== date.getMonth())
      ) {
        weeks.push(weekStart);
      } else if (weeks.length > 0) {
        break;
      }
    }
    const uniqueWeeks = weeks.filter(
      (week, index, self) =>
        index === self.findIndex((t) => format(t, "yyyy-MM-dd") === format(week, "yyyy-MM-dd"))
    );
    return uniqueWeeks;
  };

  const downloadCSV = () => {
    if (!billingData || billingData.length === 0) {
      toast.warn("No data to download.");
      return;
    }

const headers = [
  "Patient Name",
  "Particulars",
  "Bill Number",
  "Bill Date",
  "Doctor Name",
  "Quantity",
  "Price",
  "CGST Percentage",
  "CGST Value",
  "SGST Percentage",
  "SGST Value",
  "Total",
  "Net Total" // ✅ Net total added
]


const rows = billingData.flatMap((item) =>
  item.table_data.map((data, index) => [
    index === 0 ? `"${item.patientName}"` : "",
    `"${data.particulars}"`,
    `"${item.billNumber}"`,
    `"${item.appointmentDate}"`,
    `"${item.patient_handledby}"`,
    data.qty,
    data.price,
    data.CGST_percentage,
    data.CGST_value,
    data.SGST_percentage,
    data.SGST_value,
    data.total,
    index === 0 ? item.netAmount : "",  // ✅ Show netAmount only once per patient
  ])
)


  // Append the Grand Total row at the end
  const currentGrandTotal = billingData.reduce((sum, item) => {
    return (
      sum +
      item.table_data.reduce((innerSum, data) => {
        const total = Number.parseFloat(data.total || 0);
        return innerSum + (isNaN(total) ? 0 : total);
      }, 0)
    );
  }, 0);

   rows.push(["", "", "", "", "", "", "", "", "", "", "", "Grand Total", currentGrandTotal.toFixed(2)])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${getReportHeading(selectedInterval).replace(/\s/g, '_')}_${branchCode}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully!");
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
    img.onerror = (error) => {
      console.error("Error converting image to Base64:", error);
      toast.error("Failed to load PDF background image.");
    }
  }

const generatePharmacyPDF = (patientUID, billNumber) => {
  const patientData = billingData.find((item) => item.patientUID === patientUID && item.billNumber === billNumber)
  if (!patientData) {
    toast.error("Patient data not found for PDF generation.")
    return
  }

  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const branchCode = localStorage.getItem("selected_branch") || "SCC001"

  let PDFMain

  if (branchCode === "SCC002") {
    PDFMain = Kumarapalayam
  } else if (branchCode === "SCC001") {
    PDFMain = Salem
  } else {
    PDFMain = Salem // default fallback
  }

  convertToBase64(PDFMain, (mainImage) => {
    doc.addImage(mainImage, "PNG", 0, 0, pageWidth, pageHeight)
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
    doc.text(`Date:`, 140, startY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`${patientData.appointmentDate}`, 170, startY)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`Bill Number:`, 140, startY + 8)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`${patientData.billNumber}`, 170, startY + 8)

    startY += 35

    // Filter out consultation fee from table data
    const medicineData = patientData.table_data.filter(data => 
      !data.particulars.toLowerCase().includes('consultation') && 
      !data.particulars.toLowerCase().includes('consult')
    )
    
    // Find consultation fee
    const consultationFee = patientData.table_data.find(data => 
      data.particulars.toLowerCase().includes('consultation') || 
      data.particulars.toLowerCase().includes('consult')
    )

    // Calculate table total (sum of all medicine items)
    const tableTotal = medicineData.reduce((sum, data) => {
      return sum + (parseFloat(data.total) || 0)
    }, 0)

    const medicineTable = medicineData.map((data) => [
      data.particulars,
      data.qty,
      `${data.price}`,
      `${data.CGST_percentage || 0}%`,
      `${data.CGST_value || 0}`,
      `${data.SGST_percentage || 0}%`,
      `${data.SGST_value || 0}`,
      `${data.total || 0}`,
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
      didDrawPage: function(data) {
      }
    })

    let currentY = doc.previousAutoTable.finalY + 10

    // Display Table Total
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text(`Total : ${tableTotal.toFixed(2)}`, 150, currentY)
    currentY += 12

    // Display consultation fee separately if it exists
    if (consultationFee) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Consultation Fee : ${Number.parseFloat(consultationFee.total || 0).toFixed(2)}`, 150, currentY)
      currentY += 12
    }

    // Display Discount separately if it exists
    if (patientData.discount && patientData.discount !== 0) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Discount % : ${patientData.discount}`, 150, currentY)
      currentY += 12
    }

    // Add spacing before the line
    currentY += 5

    // Draw a line before Net Amount
    doc.setDrawColor(150)
    doc.setLineWidth(0.5)
    doc.line(14, currentY, pageWidth - 14, currentY)

    currentY += 8 // Space after the line

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(0, 100, 0)
    doc.text(`Net Amount : ${patientData.netAmount}`, 150, currentY)

    const pdfBlob = doc.output("blob")
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, "_blank")
    toast.success("PDF generated successfully!")
  })
}

  const handleDelete = async (patientUID, billNumber) => {
    if (!window.confirm(`Are you sure you want to delete bill ${billNumber} for ${patientUID}?`)) {
      return;
    }
    try {
      const response = await apiRequest(`${Cosmetologybaseurl}delete/billing/data/`, "DELETE", {
        patientUID,
        billNumber,
        })
      if (response.success) {
        fetchData() // Refetch data after deletion
        toast.success("Data deleted successfully")
      } else {
        console.error("Error deleting data:", response.error)
        toast.error(`Error: ${response.error || "Error deleting data."}`)
      }
    } catch (error) {
      console.error("Error in delete workflow:", error)
      toast.error("Something went wrong.")
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

  const renderActionButtons = (item) => (
    <ActionButtonsContainer>
      <button
        title="Generate PDF"
        className="btn btn-primary me-2"
        onClick={() => generatePharmacyPDF(item.patientUID, item.billNumber)}
      >
        <FaFilePdf />
      </button>
      {userRole !== "Manager" && userRole !== "Receptionist" && (
        <button
          title="Delete Bill"
          className="btn btn-danger"
          onClick={() => handleDelete(item.patientUID, item.billNumber)}
        >
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
              {`Week ${index + 1}`}
            </WeekButton>
          ))}
        </WeekButtons>
      )}
      
      <br />
      
      <Content>
        {loading && (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p>Loading {selectedInterval} data...</p>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {!loading && !error && billingData && billingData.length > 0 ? (
          <Billing>
            <h5 className="text-center">{getReportHeading(selectedInterval)}</h5>
            <table>
              <MDBTableHead>
                <tr>
                  <th>Patient Name</th>
                  <th>Bill Number</th>
                  <th>Bill Date</th>
                  <th>Doctor Name</th>
                  <th>Particulars</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>CGST %</th>
                  <th>CGST Value</th>
                  <th>SGST %</th>
                  <th>SGST Value</th>
                  <th>Total</th>
                  <th>Discount</th>
                  <th>Net Amount</th>
                  <th>Action</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {billingData.map((item) => (
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
                          <td>{Number.parseFloat(data.total || 0).toFixed(2)}</td>
                          <td>{item.discount || 0}</td>   
                          {dataIndex === 0 && (
                            <td rowSpan={item.table_data.length}>{(item.netAmount)}</td>
                          )}
                          
                          {dataIndex === 0 && (
                            <td rowSpan={item.table_data.length}>
                              {renderActionButtons(item)}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="13" className="text-center">
                          No table data available
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </MDBTableBody>

              <tfoot>
                <tr>
                  <td colSpan="13" className="text-right">
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
        ) : !loading && !error && (
          <div className="text-center">
            <p>No data available for the selected {selectedInterval} interval.</p>
          </div>
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