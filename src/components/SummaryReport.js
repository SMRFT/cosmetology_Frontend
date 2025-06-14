import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfMonth, format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek, faCalendarAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FaDownload, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import './DatePicker.css';

const SummaryReport = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [branchCode, setBranchCode] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;

  const getReportHeading = (interval) => {
    switch (interval) {
      case "day":
        return "Daily Report";
      case "month":
        return "Monthly Report";
      default:
        return "Summary Report";
    }
  };

  // Effect to get branch_code from localStorage
  useEffect(() => {
    const code = localStorage.getItem("selectedBranch");

    if (code) {
      setBranchCode(code);
      console.log("Branch code retrieved from localStorage:", code);
    } else {
      console.warn("Branch code not found in localStorage");
      setError("Branch code not found. Please ensure you are logged in."); // Set error if branch code is missing
      toast.error("Branch code not found. Please log in again."); // Toast for missing branch code
    }
  }, []); // Run only once on component mount

  // Effect to fetch data whenever relevant dependencies change
  useEffect(() => {
    if (branchCode) {
      fetchData(selectedInterval);
    }
  }, [branchCode, selectedInterval, selectedDate]); // Dependencies for re-fetching

  const fetchData = async (interval) => {
    if (!branchCode) {
      console.warn("Branch code is not available, skipping data fetch.");
      setSummaryData(null); // Clear data if branch code is missing
      setLoading(false); // Ensure loading is false
      return;
    }

    setLoading(true); // Set loading to true before API call
    setError(null); // Clear previous errors

    let dateParam = "";
    if (interval === "day") {
      dateParam = format(selectedDate, "yyyy-MM-dd");
    } else if (interval === "month") {
      const startOfMonthDate = startOfMonth(selectedDate);
      dateParam = format(startOfMonthDate, "yyyy-MM-dd");
    }

    try {
      console.log("Making summary API call with params:", {
        interval,
        appointmentDate: dateParam,
        branch_code: branchCode,
      });

      const response = await axios.get(
        `${Cosmetologybaseurl}summary/${interval}/`,
        {
          params: {
            appointmentDate: dateParam,
            branch_code: branchCode,
          },
          withCredentials: true,
        }
      );

      console.log("Summary API response:", response.data);
      setSummaryData(response.data.summary_data);

      // --- ADDED TOAST NOTIFICATION FOR NO DATA ---
      // Check if summary_data is null/undefined or an empty object
      if (!response.data.summary_data || Object.keys(response.data.summary_data).length === 0) {
        toast.info("No data found for the selected criteria.");
      }
      // --- END ADDED TOAST NOTIFICATION ---

    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      setError("Failed to fetch summary data. Please try again."); // Set error message
      setSummaryData(null); // Clear data on error
      toast.error("Failed to fetch data."); // Show error toast
    } finally {
      setLoading(false); // Set loading to false after API call
    }
  };

  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval)
    if (interval === "day" || interval === "month") {
      setSelectedDate(new Date());
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const downloadCSV = () => {
    if (!summaryData || summaryData.length === 0) return;
    const headers = [
      'Patient Name',
      'Date',
      'Diagnosis',
      'Complaints',
      'Findings',
      'Prescription',
      'Plans',
      'Tests',
      'Procedure'
    ];
    const rows = summaryData.map(item => [
      item.patientName,
      item.appointmentDate,
      item.diagnosis,
      // Handle JSON fields for CSV export
      JSON.stringify(item.complaints), // Stringify complex objects for CSV
      item.findings,
      item.prescription,
      item.plans,
      item.tests,
      JSON.stringify(item.proceduresList) // Stringify complex objects for CSV
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,'
      + [headers.join(','), ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n'); // Added CSV escaping
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'summary_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderComplaints = (complaintsStr) => {
    try {
      const complaints = typeof complaintsStr === 'string' ? JSON.parse(complaintsStr) : complaintsStr;
      if (Array.isArray(complaints)) {
        return complaints.map((complaint, index) => (
          <div key={index}>
            <p>Complaint: {complaint.complaints}</p>
            <p>Duration: {complaint.duration} {complaint.durationUnit}</p>
          </div>
        ));
      } else {
        return <p>No valid complaints available</p>;
      }
    } catch (error) {
      console.error('Error parsing complaints:', error);
      return <p>Invalid complaints data</p>;
    }
  };

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header>
        <h3 className='text-center mb-2'>Summary Report</h3>
        <button title='Download Excel' onClick={downloadCSV}>
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
            <h5 className='text-center'>{getReportHeading(selectedInterval)}</h5>
            <table>
              <MDBTableHead align='middle'>
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
  );
};

export default SummaryReport;

const Summary = styled.div`
  flex: 1;
  overflow-x: auto;
`;
const StyledRow = styled.tr`
  &:nth-child(even) {
    background-color: #FFFFFF;
  }
`;
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

