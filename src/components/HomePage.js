"use client"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import mainImage from "../components/images/main-image.png"

const HomePage = () => {
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate("/login")
  }

  return (
    <HomepageContainer>
      <BackgroundImage />
      <LogoContainer>
        <h1>Salem Cosmetic Clinic</h1>
        <p>Excellence in Healthcare</p>
        <LoginButton onClick={handleLoginClick}>Login</LoginButton>
      </LogoContainer>
    </HomepageContainer>
  )
}

// Styled Components
const HomepageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
`

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(${mainImage}) right center/cover no-repeat;
  filter: brightness(0.9);
  z-index: 1;
  background-size: cover;
  background-position: right center;
  background-repeat: no-repeat;
`

const LogoContainer = styled.div`
  position: absolute;
  top: 250px;
  left: 60px;
  z-index: 2;
  text-align: left;
  max-width: 600px;

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.3rem;
    color: #7F54A9;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
    margin: 0 0 0.3rem 0;

    @media (max-width: 768px) {
      font-size: 2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.5rem;
    }

    @media (max-width: 360px) {
      font-size: 1.3rem;
    }
  }

  p {
    font-size: 1.2rem;
    font-weight: 400;
    color: #766087;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    margin: 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1rem;
    }

    @media (max-width: 480px) {
      font-size: 0.9rem;
    }

    @media (max-width: 360px) {
      font-size: 0.8rem;
    }
  }
`

const LoginButton = styled.button`
  color: #7F54A9;
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(193, 177, 221, 0.3);
  margin-top: 10px;

  &:hover {
    background:rgb(103, 60, 145);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(193, 177, 221, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    padding: 14px 28px;
    font-size: 1rem;
  }

  @media (max-width: 360px) {
    padding: 12px 24px;
    font-size: 0.9rem;
  }
`

export default HomePage