"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import BranchManager from "./BranchManager"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showBranchManager, setShowBranchManager] = useState(false)
 const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // This endpoint would need to be created in your Django backend
      const response = await fetch(`${Cosmetologybaseurl}registration/`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error loading users")
    } finally {
      setLoading(false)
    }
  }

  const handleManageBranches = (user) => {
    setSelectedUser(user)
    setShowBranchManager(true)
  }

  const closeBranchManager = () => {
    setShowBranchManager(false)
    setSelectedUser(null)
  }

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading users...</LoadingSpinner>
      </Container>
    )
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Container>
        <Header>
          <h3 className="text-center mb-4">User Management</h3>
          <p>Manage user branch assignments and status</p>
        </Header>

        <UserGrid>
          {users.length === 0 ? (
            <NoUsers>No users found</NoUsers>
          ) : (
            users.map((user, index) => (
              <UserCard key={index}>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserId>ID: {user.id}</UserId>
                  <UserRole>{user.role}</UserRole>
                  <UserContact>{user.contact}</UserContact>
                </UserInfo>

                <BranchInfo>
                  <BranchCount>{user.branch_code ? user.branch_code.length : 0} Branches</BranchCount>
                  <ActiveBranches>
                    {user.branch_code ? user.branch_code.filter((b) => b.isactive).length : 0} Active
                  </ActiveBranches>
                </BranchInfo>

                <ActionButton onClick={() => handleManageBranches(user)}>Manage Branches</ActionButton>
              </UserCard>
            ))
          )}
        </UserGrid>

        {showBranchManager && selectedUser && <BranchManager userId={selectedUser.id} onClose={closeBranchManager} />}
      </Container>
    </>
  )
}

// Styled Components
const Container = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`

const Header = styled.div`
    margin-bottom: 30px;
    text-align: center;
    
    h2 {
        color: #472563;
        margin-bottom: 10px;
    }
    
    p {
        color: #666;
        margin: 0;
    }
`

const UserGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
`

const UserCard = styled.div`
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
`

const UserInfo = styled.div`
    margin-bottom: 15px;
`

const UserName = styled.h3`
    color: #472563;
    margin: 0 0 8px 0;
    font-size: 1.2rem;
`

const UserId = styled.p`
    color: #666;
    margin: 0 0 4px 0;
    font-size: 0.9rem;
`

const UserRole = styled.span`
    background-color: #472563;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
`

const UserContact = styled.p`
    color: #666;
    margin: 8px 0 0 0;
    font-size: 0.9rem;
`

const BranchInfo = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 15px 0;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 8px;
`

const BranchCount = styled.span`
    color: #472563;
    font-weight: 500;
`

const ActiveBranches = styled.span`
    color: #28a745;
    font-weight: 500;
`

const ActionButton = styled.button`
    width: 100%;
    background-color: #472563;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: #5a2d73;
        transform: translateY(-1px);
    }
`

const LoadingSpinner = styled.div`
    text-align: center;
    padding: 40px;
    color: #472563;
    font-size: 1.1rem;
`

const NoUsers = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    font-style: italic;
    grid-column: 1 / -1;
`

export default UserManagement
