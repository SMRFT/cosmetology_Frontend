import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscAccount } from "react-icons/vsc";
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

const SignOut = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    setUserName(storedUserName || 'User');
    setUserRole(storedUserRole || 'user@example.com');
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userContact');
    navigate('/'); // Redirect to HomePage after logout
  };

  const handleIconClick = () => {
    setShowSignOut(!showSignOut);
  };

  return (
    <SignOutIcon>
      <VscAccount
        data-tooltip-id="accountTooltip"
        onClick={handleIconClick}
      /><SignOutIcon/>
      
      <StyledTooltip id="accountTooltip" place="bottom" effect="solid">
        <div>
          <b>{userName}</b>
          <div className="role">{userRole}</div>
        </div>
      </StyledTooltip>
      {showSignOut && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '0px',
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            padding: '10px',
            zIndex: 1,
            borderRadius: '5px',
          }}
        >
          <div style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>Hi, {userName}!</div>
          <button style={{ width: "100%", whiteSpace: 'nowrap', fontSize: '1rem' }} onClick={handleSignOut}>Sign Out</button>
        </div>
      )}
    </SignOutIcon>
  );
};


const SignOutIcon = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  font-weight: bold;
  cursor: pointer;

   svg {
    font-size: 2rem;
    color: white;
    font-weight: bold;
  }

  &:hover {
    svg {
      color: white;
    }
  }

`;

const StyledTooltip = styled(Tooltip)`
  background-color: #1f2937 !important;  /* Tailwind slate-800 */
  color: #f8fafc;                        /* Tailwind slate-50 */
  padding: 12px 16px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  max-width: 240px;
  text-align: left;

  b {
    font-size: 1rem;
    display: block;
    margin-bottom: 4px;
  }

  .role {
    font-size: 0.875rem;
    color: #cbd5e1; /* Tailwind slate-300 */
  }
`;

export default SignOut;
