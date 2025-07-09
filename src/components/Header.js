"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import Notification from "./Notification"
import Logo from "./images/salem-cosmetic-logo.png"
import SignOut from "./SignOut"

const Header = ({ userRole }) => {
  const [branchName, setBranchName] = useState("")
  const [expandedGroups, setExpandedGroups] = useState({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  useEffect(() => {
    // Only get branch info for Admin and Doctor roles
    if (userRole === "Admin" || userRole === "Doctor" || userRole === "Receptionist" || userRole === "Manager") {
      const branchCode = localStorage.getItem("selectedBranch")
      if (branchCode) {
        fetchBranchName(branchCode)
      } else {
        // If cookie not found, try from localStorage as fallback
        const branches = localStorage.getItem("availableBranches")
        if (branches) {
          try {
            const parsedBranches = JSON.parse(branches)
            if (Array.isArray(parsedBranches) && parsedBranches.length > 0) {
              fetchBranchName(parsedBranches[0])
            }
          } catch (error) {
            console.error("Error parsing branch data:", error)
          }
        }
      }
    }
  }, [userRole])

  const fetchBranchName = async (branchCode) => {
    try {
      const response = await fetch(`${Cosmetologybaseurl}branches/`)
      if (!response.ok) {
        throw new Error("Failed to fetch branches")
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        const branch = data.find((b) => b.branch_code === branchCode)
        if (branch) {
          setBranchName(branch.branch_name)
        } else {
          setBranchName(branchCode) // Fallback to code if not found
        }
      } else {
        console.error("Expected branches to be an array")
        setBranchName(branchCode) // Fallback to code
      }
    } catch (error) {
      console.error("Error fetching branch name:", error)
      setBranchName(branchCode) // Fallback to code on error
    }
  }

  const getNavigationGroups = () => {
    switch (userRole) {
      case "Admin":
        return [
          {
            id: "appointments",
            title: "Appointments",
            icon: "📅",
            items: [
              { to: "/Admin/Appointment", label: "Book Appointments" },
              { to: "/Admin/BookedAppointments", label: "Appointments" },
            ],
          },
          {
            id: "patient-services",
            title: "Patient & Services",
            icon: "👥",
            items: [
              { to: "/Admin/PatientDetails", label: "Patient Details" },
              { to: "/Admin/Report", label: "Report" },
            ],
          },
          {
            id: "billing",
            title: "Billing",
            icon: "💰",
            items: [
              { to: "/Admin/Bill", label: "Bill" },
              { to: "/Admin/ProcedureBill", label: "Procedure Bill" },
            ],
          },
          {
            id: "pharmacy",
            title: "Pharmacy",
            icon: "💊",
            items: [{ to: "/Admin/Pharmacy", label: "Pharmacy" }],
          },
          {
            id: "administration",
            title: "Administration",
            icon: "⚙️",
            items: [
              { to: "/Admin/Register", label: "User Rights" },
              { to: "/Admin/UserManagement", label: "User Management" },
            ],
          },
        ]
      case "Doctor":
        return [
          {
            id: "appointments",
            title: "Appointments",
            icon: "📅",
            items: [{ to: "/Doctor/BookedAppointments", label: "Appointments" }],
          },
          {
            id: "patient-care",
            title: "Patient Care",
            icon: "🩺",
            items: [{ to: "/Doctor/PatientDetails", label: "Patient Details" }],
          },
        ]
      case "Manager":
        return [
          {
            id: "patient-services",
            title: "Patient & Services",
            icon: "👥",
            items: [{ to: "/Manager/Report", label: "Report" }],
          },
        ]
      case "Receptionist":
        return [
          {
            id: "appointments",
            title: "Appointments",
            icon: "📅",
            items: [{ to: "/Reception/Appointment", label: "Book Appointments" }],
          },
          {
            id: "patient-services",
            title: "Patient & Services",
            icon: "👥",
            items: [
              { to: "/Reception/PatientDetails", label: "Patient Details" },
              { to: "/Reception/Report", label: "Report" },
            ],
          },
          {
            id: "billing",
            title: "Billing",
            icon: "💰",
            items: [
              { to: "/Reception/Bill", label: "Bill" },
              { to: "/Reception/ProcedureBill", label: "Procedure Bill" },
            ],
          },
          {
            id: "pharmacy",
            title: "Pharmacy",
            icon: "💊",
            items: [{ to: "/Reception/Pharmacy", label: "Pharmacy" }],
          },
        ]
      default:
        return []
    }
  }


  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => {
      // If the clicked group is already expanded, close it
      if (prev[groupId]) {
        return {
          ...prev,
          [groupId]: false,
        }
      } else {
        // Close all groups and open only the clicked one
        const newExpandedGroups = {}
        Object.keys(prev).forEach((key) => {
          newExpandedGroups[key] = false
        })
        newExpandedGroups[groupId] = true
        return newExpandedGroups
      }
    })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setExpandedGroups({})
  }

  // Function to close all dropdowns when a navigation item is clicked
  const handleNavItemClick = () => {
    setExpandedGroups({})
    closeMobileMenu()
  }

  const navigationGroups = getNavigationGroups()
  const showBranch =
    userRole === "Admin" || userRole === "Doctor" || userRole === "Receptionist" || userRole === "Manager"
  const showNavigation = navigationGroups.length > 0

  return (
    <>
      <MobileOverlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
      <TopContainer showBranch={showBranch}>
        {showBranch && <BranchDisplay>{branchName && <span>Salem Cosmetic Clinic - {branchName}</span>}</BranchDisplay>}
        <HeaderRight>
          <Notification />
          <SignOut />
        </HeaderRight>
      </TopContainer>
      <HeaderContainer>
        <HeaderLeft>
          <LogoContainer>
            <img src={Logo || "/placeholder.svg"} alt="Logo" />
          </LogoContainer>
          {showNavigation && (
            <MobileToggleButton onClick={toggleMobileMenu}>
              <span></span>
              <span></span>
              <span></span>
            </MobileToggleButton>
          )}
          {showNavigation && (
            <Navigation userRole={userRole} isMobileMenuOpen={isMobileMenuOpen}>
              {navigationGroups.map((group) => (
                <DropdownContainer key={group.id}>
                  <DropdownButton
                    onClick={() => toggleGroup(group.id)}
                    userRole={userRole}
                    isExpanded={expandedGroups[group.id]}
                  >
                    <DropdownButtonContent>
                      <GroupIcon>{group.icon}</GroupIcon>
                      <GroupTitle>{group.title}</GroupTitle>
                      <ChevronIcon isExpanded={expandedGroups[group.id]}>
                        <FontAwesomeIcon icon={expandedGroups[group.id] ? faChevronUp : faChevronDown} />
                      </ChevronIcon>
                    </DropdownButtonContent>
                  </DropdownButton>

                  <DropdownMenu isExpanded={expandedGroups[group.id]} itemCount={group.items.length}>
                    <DropdownContent>
                      {group.items.map((item, itemIndex) => (
                        <DropdownItem key={itemIndex}>
                          <StyledNavLink to={item.to} userRole={userRole} onClick={handleNavItemClick}>
                            {item.label}
                          </StyledNavLink>
                        </DropdownItem>
                      ))}
                    </DropdownContent>
                  </DropdownMenu>
                </DropdownContainer>
              ))}
            </Navigation>
          )}
        </HeaderLeft>
      </HeaderContainer>
    </>
  )
}

const TopContainer = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: ${(props) => (props.showBranch ? "space-between" : "flex-end")};
  align-items: center;
  background: radial-gradient(circle, #A07BC6 0%, #7F54A9 100%);
  z-index: 1001;
  padding: 0 15px;

  @media (max-width: 480px) {
    height: 45px;
    padding: 0 10px;
  }
`

const BranchDisplay = styled.div`
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin-left: 20px;
  max-width: 800px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 1440px) {
    font-size: 1.1rem;
    margin-left: 18px;
    max-width: 700px;
  }

  @media (max-width: 1024px) {
    font-size: 1rem;
    margin-left: 15px;
    max-width: 500px;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-left: 10px;
    max-width: 300px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-left: 5px;
    max-width: 200px;
  }

  @media (max-width: 320px) {
    font-size: 0.75rem;
    max-width: 150px;
  }
`

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

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }

  @media (max-width: 480px) {
    top: 45px;
    padding: 8px;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  @media (max-width: 1024px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`

const LogoContainer = styled.div`
  img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 1024px) {
    max-width: 180px;
  }

  @media (max-width: 768px) {
    max-width: 150px;
  }

  @media (max-width: 480px) {
    max-width: 130px;
  }

  @media (max-width: 320px) {
    max-width: 110px;
  }
`

const Navigation = styled.nav`
  display: flex;
  gap: 15px;
  margin-left: 40px;
  align-items: center;

  @media (max-width: 1440px) {
    gap: 12px;
    margin-left: 30px;
  }

  @media (max-width: 1024px) {
    position: fixed;
    top: 110px;
    left: 0;
    width: 320px;
    height: calc(100vh - 110px);
    background: white;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    margin: 0;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transform: ${(props) => (props.isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    width: 280px;
    padding: 15px;
  }

  @media (max-width: 480px) {
    top: 105px;
    width: 260px;
    padding: 12px;
  }

  @media (max-width: 320px) {
    width: 240px;
    padding: 10px;
  }
`

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;

  @media (max-width: 1024px) {
    width: 100%;
  }
`

const DropdownButton = styled.button`
  background: ${(props) =>
    props.isExpanded
      ? `linear-gradient(135deg, ${
          props.userRole === "Admin" || props.userRole === "Doctor" ? "#F3E5F5" : "#F5F1F6"
        } 0%, ${props.userRole === "Admin" || props.userRole === "Doctor" ? "#E1BEE7" : "#E8DCE9"} 100%)`
      : "white"};
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  border: none;
  border-radius: 8px;

  &:hover {
    background: ${(props) =>
      props.isExpanded
        ? `linear-gradient(135deg, ${
            props.userRole === "Admin" || props.userRole === "Doctor" ? "#F3E5F5" : "#F5F1F6"
          } 0%, ${props.userRole === "Admin" || props.userRole === "Doctor" ? "#E1BEE7" : "#E8DCE9"} 100%)`
        : "#F8F9FA"};
  }

  @media (max-width: 1440px) {
    min-width: 160px;
    padding: 11px 14px;
  }

  @media (max-width: 1024px) {
    width: 100%;
    min-width: unset;
    padding: 14px 16px;
    margin-bottom: 5px;
  }

  @media (max-width: 768px) {
    padding: 12px 14px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }

  @media (max-width: 320px) {
    padding: 8px 10px;
  }
`

const DropdownButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const GroupIcon = styled.span`
  font-size: 1.3rem;
  margin-right: 10px;

  @media (max-width: 1440px) {
    font-size: 1.2rem;
    margin-right: 8px;
  }

  @media (max-width: 1024px) {
    font-size: 1.4rem;
    margin-right: 12px;
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-right: 10px;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-right: 8px;
  }

  @media (max-width: 320px) {
    font-size: 1.1rem;
    margin-right: 6px;
  }
`

const GroupTitle = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #6D4194;
  flex: 1;
  text-align: left;

  @media (max-width: 1440px) {
    font-size: 0.95rem;
  }

  @media (max-width: 1024px) {
    font-size: 1.05rem;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }

  @media (max-width: 320px) {
    font-size: 0.85rem;
  }
`

const ChevronIcon = styled.span`
  color: #9A7BB8;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.isExpanded ? "rotate(0deg)" : "rotate(0deg)")};
  font-size: 0.7rem;
  margin-left: 8px;

  @media (max-width: 1440px) {
    font-size: 0.65rem;
    margin-left: 6px;
  }

  @media (max-width: 1024px) {
    font-size: 0.8rem;
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-left: 6px;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    margin-left: 5px;
  }

  @media (max-width: 320px) {
    font-size: 0.65rem;
    margin-left: 4px;
  }
`

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #E8D5F2;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  max-height: ${(props) => (props.isExpanded ? `${props.itemCount * 50}px` : "0px")};
  opacity: ${(props) => (props.isExpanded ? "1" : "0")};
  transition: all 0.3s ease;
  transform: ${(props) => (props.isExpanded ? "translateY(0)" : "translateY(-10px)")};

  @media (max-width: 1024px) {
    position: static;
    border: none;
    box-shadow: none;
    background: #F8F9FA;
    border-radius: 0;
    margin-top: 0;
    max-height: ${(props) => (props.isExpanded ? `${props.itemCount * 55}px` : "0px")};
  }

  @media (max-width: 768px) {
    max-height: ${(props) => (props.isExpanded ? `${props.itemCount * 50}px` : "0px")};
  }

  @media (max-width: 480px) {
    max-height: ${(props) => (props.isExpanded ? `${props.itemCount * 45}px` : "0px")};
  }

  @media (max-width: 320px) {
    max-height: ${(props) => (props.isExpanded ? `${props.itemCount * 40}px` : "0px")};
  }
`

const DropdownContent = styled.div`
  padding: 8px 0;

  @media (max-width: 1024px) {
    padding: 5px 0;
  }

  @media (max-width: 480px) {
    padding: 3px 0;
  }
`

const DropdownItem = styled.div`
  padding: 0;
`

const StyledNavLink = styled(NavLink)`
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: ${(props) => {
    switch (props.userRole) {
      case "Admin":
      case "Doctor":
        return "#6D4194"
      case "Receptionist":
        return "#766087"
      default:
        return "#6D4194"
    }
  }};
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => {
      switch (props.userRole) {
        case "Admin":
        case "Doctor":
          return "#F3E5F5"
        case "Receptionist":
          return "#F5F1F6"
        default:
          return "#F3E5F5"
      }
    }};
  }

  &.active {
    background: linear-gradient(90deg, 
      ${(props) => {
        switch (props.userRole) {
          case "Admin":
          case "Doctor":
            return "#F3E5F5"
          case "Receptionist":
            return "#F5F1F6"
          default:
            return "#F3E5F5"
        }
      }} 0%, 
      white 100%
    );
    color: ${(props) => {
      switch (props.userRole) {
        case "Admin":
        case "Doctor":
          return "#7A1CAC"
        case "Receptionist":
          return "#9a85aa"
        default:
          return "#7A1CAC"
      }
    }};
    border-left: 4px solid ${(props) => {
      switch (props.userRole) {
        case "Admin":
        case "Doctor":
          return "#7A1CAC"
        case "Receptionist":
          return "#9a85aa"
        default:
          return "#7A1CAC"
      }
    }};
    font-weight: 600;
  }

  @media (max-width: 1440px) {
    font-size: 0.9rem;
    padding: 11px 14px;
  }

  @media (max-width: 1024px) {
    padding: 14px 20px;
    font-size: 1rem;
    
    &.active {
      background: ${(props) => {
        switch (props.userRole) {
          case "Admin":
          case "Doctor":
            return "#E8D5F2"
          case "Receptionist":
            return "#F0E6F3"
          default:
            return "#E8D5F2"
        }
      }};
    }
  }

  @media (max-width: 768px) {
    padding: 12px 18px;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  @media (max-width: 320px) {
    padding: 8px 14px;
    font-size: 0.85rem;
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 1024px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }

  @media (max-width: 320px) {
    gap: 4px;
  }
`

const MobileToggleButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;

  span {
    width: 28px;
    height: 3px;
    background: #6D4194;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
  }

  @media (max-width: 1024px) {
    display: flex;
  }

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
    
    span {
      width: 25px;
      height: 2.5px;
    }
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    
    span {
      width: 23px;
      height: 2.5px;
    }
  }

  @media (max-width: 320px) {
    width: 26px;
    height: 26px;
    
    span {
      width: 20px;
      height: 2px;
    }
  }
`

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: 1024px) {
    display: ${(props) => (props.isOpen ? "block" : "none")};
  }
`

export default Header