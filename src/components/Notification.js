import React, { useState, useEffect } from 'react';
import apiRequest from './apiRequest';
import { IoMdClose } from "react-icons/io";
import { FaRegBell } from "react-icons/fa";
import { Alert } from 'react-bootstrap';
import styled from 'styled-components';

const Notification = () => {
  const [lowQuantityMedicines, setLowQuantityMedicines] = useState([]);
  const [nearExpiryMedicines, setNearExpiryMedicines] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [panelVisible, setPanelVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'expiry', 'visits'
  const [branchCode, setBranchCode] = useState('');

  const userRole = localStorage.getItem('userRole');
  const loggedInAs = localStorage.getItem('loggedInAs');
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;

  useEffect(() => {
    const code = localStorage.getItem('selected_branch');
    if (code) {
      setBranchCode(code);
    } else {
      console.warn('Branch code not found in localStorage');
    }

    // Fetch medicine status if user is Doctor, Receptionist, or Admin
    if (userRole === 'Doctor' || userRole === 'Receptionist' || userRole === 'Admin') {
      const fetchMedicineStatus = async () => {
        const response = await apiRequest(`${Cosmetologybaseurl}check_medicine_status/`, "GET")

        if (response.success) {
          setLowQuantityMedicines(response.data.low_quantity_medicines || []);
          setNearExpiryMedicines(response.data.near_expiry_medicines || []);
        } else {
          console.error('There was an error fetching the medicine status:', response.error);
        }
      };
      // Only fetch if branchCode is available
      if (code) {
        fetchMedicineStatus();
      }
    }

    // Fetch upcoming visits if user is Doctor, Receptionist, or Admin
    if (userRole === 'Doctor' || userRole === 'Receptionist' || userRole === 'Admin') {
      const fetchUpcomingVisits = async () => {
        const response = await apiRequest(`${Cosmetologybaseurl}check_upcoming_visits/`, "GET")

        if (response.success) {
          setUpcomingVisits(response.data.upcoming_visits || []);
        } else {
          console.error('There was an error fetching the upcoming visits:', response.error);
        }
      };
      // Only fetch if branchCode is available
      if (code) {
        fetchUpcomingVisits();
      }
    }
  }, [userRole, loggedInAs, branchCode, Cosmetologybaseurl]); // Added Cosmetologybaseurl to dependencies

  const togglePanel = () => {
    setPanelVisible(prevVisible => !prevVisible);
  };

  const hasNotifications = lowQuantityMedicines.length > 0 || nearExpiryMedicines.length > 0 || upcomingVisits.length > 0;

  return (
    <div>
      <NotificationIcon onClick={togglePanel}>
        <FaRegBell />
        {hasNotifications && <RedDot />}
      </NotificationIcon>
      <NotificationPanel visible={panelVisible}>
        <CloseIcon onClick={togglePanel}><IoMdClose /></CloseIcon>
        <h4 className="mb-4" style={{ color: '#472563', fontWeight: 'bold' }}>Notifications</h4>
        
        <TabContainer>
          <TabButton 
            active={activeTab === 'stock'} 
            onClick={() => setActiveTab('stock')}
          >
            Stock {lowQuantityMedicines.length > 0 && `(${lowQuantityMedicines.length})`}
          </TabButton>
          <TabButton 
            active={activeTab === 'expiry'} 
            onClick={() => setActiveTab('expiry')}
          >
            Expiry {nearExpiryMedicines.length > 0 && `(${nearExpiryMedicines.length})`}
          </TabButton>
          <TabButton 
            active={activeTab === 'visits'} 
            onClick={() => setActiveTab('visits')}
          >
            Visits {upcomingVisits.length > 0 && `(${upcomingVisits.length})`}
          </TabButton>
        </TabContainer>

        <NotificationContent>
        {/* Receptionist, Doctor (ReceptionistLogin), Doctor (DoctorLogin), or Admin - Medicine notifications */}

        {(userRole === 'Receptionist' || (userRole === 'Doctor' && loggedInAs === 'ReceptionistLogin') || (userRole === 'Doctor' && loggedInAs === 'DoctorLogin') || userRole === 'Admin') && (
          <>
            {activeTab === 'stock' && (
              <>
                {lowQuantityMedicines.length > 0 ? (
                  <Alert style={{ backgroundColor: "#F1F1F1", border: "1px solid #C85C8E" }} className="mb-3">
                    <center><Alert.Heading style={{ color: "#C85C8E", fontSize: "1.1rem" }}>Low Stock Medicines</Alert.Heading></center>
                    <ul style={{ fontSize: "0.9rem", color: "#333", paddingLeft: "15px" }}>
                      {lowQuantityMedicines.map((medicine, index) => (
                        <li key={index} className="mb-2">
                          <strong>{medicine.medicine_name}</strong>
                          <div style={{ color: "red", fontSize: "0.8rem" }}>Stock: {medicine.stock}</div>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <EmptyState>No low stock medicines</EmptyState>
                )}
              </>
            )}

            {activeTab === 'expiry' && (
              <>
                {nearExpiryMedicines.length > 0 ? (
                  <Alert style={{ backgroundColor: "#F1F1F1", border: "1px solid #C85C8E" }}>
                    <center><Alert.Heading style={{ color: "#C85C8E", fontSize: "1.1rem" }}>Near Expiry Medicines</Alert.Heading></center>
                    <ul style={{ fontSize: "0.9rem", color: "#333", paddingLeft: "15px" }}>
                      {nearExpiryMedicines.map((medicine, index) => (
                        <li key={index} className="mb-2">
                          <strong>{medicine.medicine_name}</strong>
                          <div style={{ color: "orange", fontSize: "0.8rem" }}>Stock: {medicine.stock} | Expiry: {medicine.expiry_date}</div>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <EmptyState>No medicines near expiry</EmptyState>
                )}
              </>
            )}
          </>
        )}

        {/* Receptionist, Doctor (ReceptionistLogin), Doctor (DoctorLogin), or Admin - Upcoming visit notifications */}
        {(userRole === 'Receptionist' || (userRole === 'Doctor' && loggedInAs === 'ReceptionistLogin') || (userRole === 'Doctor' && loggedInAs === 'DoctorLogin') || userRole === 'Admin') && (
          <>
            {activeTab === 'visits' && (
              <>
                {upcomingVisits.length > 0 ? (
                  <Alert style={{ backgroundColor: "#F1F1F1", border: "1px solid #C85C8E" }}>
                    <center><Alert.Heading style={{ color: "#C85C8E", fontSize: "1.1rem" }}>Upcoming Visits</Alert.Heading></center>
                    <ul style={{ fontSize: "0.9rem", color: "#333", paddingLeft: "15px" }}>
                      {upcomingVisits.map((visit, index) => (
                        <li key={index} className="mb-2">
                          <strong>{visit.patientName}</strong>
                          <div style={{ color: "#666", fontSize: "0.8rem" }}>Next Visit: {visit.nextVisit}</div>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <EmptyState>No upcoming visits</EmptyState>
                )}
              </>
            )}
          </>
        )}
        </NotificationContent>

      </NotificationPanel>
      <br />
    </div>
  );
};

const NotificationIcon = styled.div`
  position: fixed;
  top: 10px;
  right: 60px;
  cursor: pointer;
  z-index: 1100;
  svg {
    font-size: 2rem;
    color: white;
  }
  &:hover {
    svg {
      color: white;
    }
  }
`;

const RedDot = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: red;
  border-radius: 50%;
  border: 2px solid white;
`;

const NotificationPanel = styled.div`
  position: fixed;
  right: 0;
  top: 100px;
  width: 400px;
  height: 80%;
  background-color: white;
  box-shadow: -1px 0px 7px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  transform: translateX(${props => (props.visible ? '0' : '100%')});
  z-index: 1000;
  padding: 20px;
  overflow-y: auto; /* Make the panel scrollable */
  border-radius: 10px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  gap: 10px;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px 5px;
  border: none;
  background: none;
  font-size: 0.85rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? '#C85C8E' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#C85C8E' : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #C85C8E;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 10px;
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
`;

const CloseIcon = styled.div`

  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  svg {
    font-size: 1.5rem;
    color: black;
  }
  &:hover {
    svg {
      color: gray;
    }
  }
`;

export default Notification;