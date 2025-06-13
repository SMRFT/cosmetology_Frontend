"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import Notification from "./Notification"
import Logo from "./images/salem-cosmetic-logo.png"
import SignOut from "./SignOut"
import Cookies from "js-cookie"

const Header = ({ userRole }) => {
  const [branchName, setBranchName] = useState("")
  const [expandedGroups, setExpandedGroups] = useState({})
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
      console.log("Fetched branches from API:", data)

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
            items: [{ to: "/Reception/PatientDetails", label: "Patient Details" }],
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

  // Function to close all dropdowns when a navigation item is clicked
  const handleNavItemClick = () => {
    setExpandedGroups({})
  }

  const navigationGroups = getNavigationGroups()
  const showBranch =
    userRole === "Admin" || userRole === "Doctor" || userRole === "Receptionist" || userRole === "Manager"
  const showNavigation = navigationGroups.length > 0

  return (
    <>
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
            <Navigation userRole={userRole}>
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
`

const BranchDisplay = styled.div`
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  margin-left: 20px;
  max-width: 800px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: center;
  }
`

const LogoContainer = styled.div`
  img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    max-width: 150px;
  }
`

const Navigation = styled.nav`
  display: flex;
  gap: 15px;
  margin-left: 40px;
  align-items: center;

  @media (max-width: 1200px) {
    margin-left: 0;
    margin-top: 15px;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`

const DropdownButton = styled.button`
  background: ${(props) =>
    props.isExpanded
      ? `linear-gradient(135deg, ${
          props.userRole === "Admin" || props.userRole === "Doctor" ? "#F3E5F5" : "#F5F1F6"
        } 0%, ${props.userRole === "Admin" || props.userRole === "Doctor" ? "#E1BEE7" : "#E8DCE9"} 100%)`
      : "white"};};
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  box-shadow: ${(props) => (props.isExpanded ? "0 4px 12px rgba(122, 28, 172, 0.15)" : "0 2px 4px rgba(0, 0, 0, 0.1)")};

  @media (max-width: 768px) {
    min-width: 160px;
    padding: 10px 14px;
  }
`

const DropdownButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const GroupIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 8px;
`

const GroupTitle = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #6D4194;
  flex: 1;
  text-align: left;
`

const ChevronIcon = styled.span`
  color: #9A7BB8;
  transition: transform 0.3s ease;
  transform: ${(props) => (props.isExpanded ? "rotate(0deg)" : "rotate(0deg)")};
  font-size: 0.6rem;
  margin-left: 5px;
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
`

const DropdownContent = styled.div`
  padding: 8px 0;
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
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;

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
    border-left-color: ${(props) => {
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
 
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }
`

export default Header
