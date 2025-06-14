import { useState, useEffect } from "react";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BranchManager = ({ userId, onClose }) => {
  const [allBranches, setAllBranches] = useState([]); // State to store all branches from the API
  const [userAssignedBranches, setUserAssignedBranches] = useState([]); // State for branches specifically assigned to the user
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL;

  useEffect(() => {
    fetchAllAndUserBranches();
  }, [userId]);

  const fetchAllAndUserBranches = async () => {
    setLoading(true);
    try {
      // 1. Fetch all available branches
      const allBranchesResponse = await fetch(`${Cosmetologybaseurl}branches/`);
      if (!allBranchesResponse.ok) {
        throw new Error("Failed to fetch all branches");
      }
      const allBranchesData = await allBranchesResponse.json();
      setAllBranches(allBranchesData);

      // 2. Fetch branches specifically assigned to the user
      const userBranchesResponse = await fetch(
        `${Cosmetologybaseurl}user-branches/${userId}/`
      );
      if (!userBranchesResponse.ok) {
        throw new Error("Failed to fetch user branches");
      }
      const userBranchesData = await userBranchesResponse.json();
      setUserAssignedBranches(userBranchesData.branches || []);
      setUserName(userBranchesData.name || "");

    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error(error.message || "Error loading branches");
    } finally {
      setLoading(false);
    }
  };

  // This function combines all available branches with the user's assigned branches
  const getCombinedBranches = () => {
    const userBranchMap = new Map();
    userAssignedBranches.forEach(branch => {
      userBranchMap.set(branch.branch_code, branch.isactive);
    });

    return allBranches.map(branch => ({
      branch_code: branch.branch_code,
      branch_name: branch.branch_name, // Assuming your branches API returns branch_name
      isactive: userBranchMap.has(branch.branch_code) ? userBranchMap.get(branch.branch_code) : false, // Default to inactive if not assigned
      // Add an 'isAssigned' flag if you want to differentiate
      isAssigned: userBranchMap.has(branch.branch_code)
    }));
  };


  const toggleBranchStatus = async (branchCode, currentIsActive, currentIsAssigned) => {
    try {
      const newStatus = !currentIsActive;
      const response = await fetch(`${Cosmetologybaseurl}toggle-branch-status/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          branch_code: branchCode,
          isactive: newStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state for userAssignedBranches to reflect the change
        setUserAssignedBranches(prevBranches => {
          const existingBranchIndex = prevBranches.findIndex(
            (b) => b.branch_code === branchCode
          );

          if (existingBranchIndex > -1) {
            // Branch exists, update its status
            const updated = [...prevBranches];
            updated[existingBranchIndex] = { ...updated[existingBranchIndex], isactive: newStatus };
            return updated;
          } else {
            // Branch was not assigned, now it is being activated
            return [...prevBranches, { branch_code: branchCode, isactive: newStatus }];
          }
        });

        toast.success(
          `Branch ${branchCode} ${newStatus ? "activated" : "deactivated"} successfully`
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update branch status");
      }
    } catch (error) {
      console.error("Error toggling branch status:", error);
      toast.error("Error updating branch status");
    }
  };

  if (loading) {
    return (
      <ModalOverlay>
        <ModalContent>
          <LoadingSpinner>Loading...</LoadingSpinner>
        </ModalContent>
      </ModalOverlay>
    );
  }

  const combinedBranches = getCombinedBranches();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <h3>Manage Branches - {userName}</h3>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </ModalHeader>

          <BranchList>
            {combinedBranches.length === 0 ? (
              <NoBranches>No branches available</NoBranches>
            ) : (
              combinedBranches.map((branch, index) => (
                <BranchItem key={index}>
                  <BranchInfo>
                    <BranchCode>{branch.branch_name || branch.branch_code}</BranchCode> {/* Display branch_name */}
                    {/* Only show badge if it's assigned, otherwise it's implicitly inactive/unassigned */}
                    {branch.isAssigned && <StatusBadge isActive={branch.isactive}>{branch.isactive ? "Active" : "Inactive"}</StatusBadge>}
                  </BranchInfo>
                  <ToggleSwitch>
                    <ToggleInput
                      type="checkbox"
                      // The checkbox should be checked if it's active for the user
                      checked={branch.isactive}
                      onChange={() => toggleBranchStatus(branch.branch_code, branch.isactive, branch.isAssigned)}
                    />
                    <ToggleSlider />
                  </ToggleSwitch>
                </BranchItem>
              ))
            )}
          </BranchList>

          <ModalFooter>
            <ActionButton onClick={onClose}>Close</ActionButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </>
  );
};

// Styled Components remain the same as your original code
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;

  h3 {
    margin: 0;
    color: #472563;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const BranchList = styled.div`
  padding: 20px 24px;
  max-height: 400px;
  overflow-y: auto;
`;

const BranchItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const BranchInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BranchCode = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${(props) => (props.isActive ? "#d4edda" : "#f8d7da")};
  color: ${(props) => (props.isActive ? "#155724" : "#721c24")};
  width: fit-content;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #472563;
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background-color: #472563;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #5a2d73;
    transform: translateY(-1px);
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #472563;
  font-size: 1.1rem;
`;

const NoBranches = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
`;

export default BranchManager;