import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Notification from './Notification';
import Logo from './images/salem-cosmetic-logo.png';
import SignOut from './SignOut';
import Cookies from 'js-cookie';

const Header = ({ userRole }) => {
  const [branchName, setBranchName] = useState('');

  useEffect(() => {
    // Only get branch info for Admin and Doctor roles
    if (userRole === 'Admin' || userRole === 'Doctor') {
      const branchCode = Cookies.get('branch_code');
      if (branchCode) {
        fetchBranchName(branchCode);
      } else {
        // If cookie not found, try from localStorage as fallback
        const branches = localStorage.getItem('availableBranches');
        if (branches) {
          try {
            const parsedBranches = JSON.parse(branches);
            if (Array.isArray(parsedBranches) && parsedBranches.length > 0) {
              fetchBranchName(parsedBranches[0]);
            }
          } catch (error) {
            console.error('Error parsing branch data:', error);
          }
        }
      }
    }
  }, [userRole]);

  const fetchBranchName = async (branchCode) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/branches/");
      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }

      const data = await response.json();
      console.log("Fetched branches from API:", data);

      if (Array.isArray(data)) {
        const branch = data.find(b => b.branch_code === branchCode);
        if (branch) {
          setBranchName(branch.branch_name);
        } else {
          setBranchName(branchCode); // Fallback to code if not found
        }
      } else {
        console.error("Expected branches to be an array");
        setBranchName(branchCode); // Fallback to code
      }
    } catch (error) {
      console.error("Error fetching branch name:", error);
      setBranchName(branchCode); // Fallback to code on error
    }
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case 'Admin':
        return [
          { to: '/Admin/Appointment', label: 'Book Appointments' },
          { to: '/Admin/BookedAppointments', label: 'Appointments' },
          { to: '/Admin/PatientDetails', label: 'Patient Details' },
          { to: '/Admin/Bill', label: 'Bill' },
          { to: '/Admin/ProcedureBill', label: 'Procedure Bill' },
          { to: '/Admin/Report', label: 'Report' },
          { to: '/Admin/Pharmacy', label: 'Pharmacy' },
          { to: '/Admin/Register', label: 'User Rights' }
        ];
      case 'Doctor':
        return [
          { to: '/Doctor/BookedAppointments', label: 'Appointments' },
          { to: '/Doctor/PatientDetails', label: 'Patient Details' }
        ];
      case 'Receptionist':
        return [
          { to: '/Reception/Appointment', label: 'Book Appointments' },
          { to: '/Reception/PatientDetails', label: 'Patient Details' },
          { to: '/Reception/Bill', label: 'Bill' },
          { to: '/Reception/ProcedureBill', label: 'Procedure Bill' }
        ];
      case 'Pharmacist':
        return [];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();
  const showBranch = userRole === 'Admin' || userRole === 'Doctor';
  const showNavigation = navigationItems.length > 0;

  return (
    <>
      <TopContainer showBranch={showBranch}>
        {showBranch && (
          <BranchDisplay>
            {branchName && <span>Salem Cosmetic Clinic - {branchName}</span>}
          </BranchDisplay>
        )}
        <HeaderRight>
          <Notification />
          <SignOut />
        </HeaderRight>
      </TopContainer>
      <HeaderContainer>
        <HeaderLeft>
          <LogoContainer>
            <img src={Logo} alt="Logo" />
          </LogoContainer>
          {showNavigation && (
            <Navigation gap={userRole === 'Admin' ? '10px' : '20px'}>
              {navigationItems.map((item, index) => (
                <NavItem key={index}>
                  <StyledNavLink 
                    to={item.to} 
                    userRole={userRole}
                  >
                    {item.label}
                  </StyledNavLink>
                </NavItem>
              ))}
            </Navigation>
          )}
        </HeaderLeft>
      </HeaderContainer>
    </>
  );
};

const TopContainer = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: ${props => props.showBranch ? 'space-between' : 'flex-end'};
  align-items: center;
  background: radial-gradient(circle, #A07BC6 0%, #7F54A9 100%);
  z-index: 1001;
  padding: 0 15px;
`;

const BranchDisplay = styled.div`
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  margin-left: 20px;
  max-width: 800px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderContainer = styled.header`
  position: fixed;
  top: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 15px;
  z-index: 1000;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const LogoContainer = styled.div`
  img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    max-width: 150px;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: ${props => props.gap || '20px'};
  margin-left: 60px;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    justify-content: space-around;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const NavItem = styled.div`
  font-size: 1.5rem;

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: ${props => {
    switch (props.userRole) {
      case 'Admin':
      case 'Doctor':
        return '#6D4194';
      case 'Receptionist':
        return '#766087';
      default:
        return '#6D4194';
    }
  }};
  font-size: ${props => {
    switch (props.userRole) {
      case 'Admin':
        return '1.15rem';
      case 'Doctor':
      case 'Receptionist':
        return '1.3rem';
      default:
        return '1.15rem';
    }
  }};
  margin: 0 15px;
  display: inline-block;
  transition: color 0.3s, transform 0.3s;
  font-family: initial;

  &.active {
    font-size: 1.4rem;
    font-weight: bold;
    color: ${props => {
      switch (props.userRole) {
        case 'Admin':
        case 'Doctor':
          return '#7A1CAC';
        case 'Receptionist':
          return '#9a85aa';
        default:
          return '#7A1CAC';
      }
    }};
  }

  &:hover {
    transform: scale(1.1);
    color: ${props => {
      switch (props.userRole) {
        case 'Admin':
        case 'Doctor':
          return '#7A1CAC';
        case 'Receptionist':
          return '#9a85aa';
        default:
          return '#7A1CAC';
      }
    }};
  }

  @media (max-width: 480px) {
    margin: 0;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }
`;

export default Header;