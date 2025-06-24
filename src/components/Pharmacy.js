"use client"

import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  FaDownload,
  FaArrowRight,
  FaSave,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaBox,
  FaExclamationTriangle,
  FaBuilding,
  FaPills,
  FaRupeeSign,
  FaSync,
} from "react-icons/fa"

const PharmacyComponent = () => {
  const [formData, setFormData] = useState([
    {
      medicineName: "",
      medicineCategory: "",
      companyName: "",
      price: "",
      CGSTPercentage: "",
      CGSTValue: "",
      SGSTPercentage: "",
      SGSTValue: "",
      newStock: "",
      stock: "",
      receivedDate: "",
      expiryDate: "",
      batchNumber: "",
    },
  ])

  const [branchCode, setBranchCode] = useState("")
  const [editedRows, setEditedRows] = useState({})
  const [loading, setLoading] = useState(false)
  const [pendingStockUpdates, setPendingStockUpdates] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [activeView, setActiveView] = useState("all")
  const [isCompactView, setIsCompactView] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const tableRef = useRef(null)
  const Cosmetologybaseurl = process.env.REACT_APP_BACKEND_COSMETOLOGY_BASE_URL

  useEffect(() => {
    const code = localStorage.getItem("selectedBranch")
    if (code) {
      setBranchCode(code)
    } else {
      console.warn("Branch code not found in localStorage")
    }

    if (code) {
      fetchPharmacyData(code)
    } else {
      toast.error("Branch code not found. Please select a branch.")
    }

    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsCompactView(width < 1200)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const fetchPharmacyData = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${Cosmetologybaseurl}pharmacy/data/?branch_code=${encodeURIComponent(code || "")}`)
      const data = await response.json()

      if (data.length === 0) {
        setFormData([
          {
            medicineName: "",
            medicineCategory: "",
            companyName: "",
            price: "",
            CGSTPercentage: "",
            CGSTValue: "",
            SGSTPercentage: "",
            SGSTValue: "",
            newStock: "",
            stock: "",
            receivedDate: "",
            expiryDate: "",
            batchNumber: "",
          },
        ])
      } else {
        setFormData(
          data.map((item) => {
            const stock = item.stock || 0

            return {
              _id: item._id,
              medicineName: item.medicine_name || "",
              medicineCategory: item.medicine_category || "",
              companyName: item.company_name || "",
              price: item.price ? item.price.toString() : "",
              CGSTPercentage: item.CGST_percentage ? item.CGST_percentage.toString() : "",
              CGSTValue: item.CGST_value ? item.CGST_value.toString() : "",
              SGSTPercentage: item.SGST_percentage ? item.SGST_percentage.toString() : "",
              SGSTValue: item.SGST_value ? item.SGST_value.toString() : "",
              newStock: "",
              stock: stock.toString(),
              receivedDate: formatDate(item.received_date),
              expiryDate: formatDate(item.expiry_date),
              batchNumber: item.batch_number || "",
            }
          }),
        )
      }
      setEditedRows({})
      setPendingStockUpdates({})
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load pharmacy data!")
    } finally {
      setLoading(false)
    }
  }

  const calculateTaxValues = (price, percentage) => {
    const priceValue = Number.parseFloat(price) || 0
    const percentageValue = Number.parseFloat(percentage) || 0
    return ((priceValue * percentageValue) / 100).toFixed(2)
  }

  const handleChange = (originalIndex, field, value) => {
    const newFormData = [...formData]
    newFormData[originalIndex][field] = value

    setEditedRows({
      ...editedRows,
      [originalIndex]: true,
    })

    if (field === "price" || field === "CGSTPercentage") {
      newFormData[originalIndex].CGSTValue = calculateTaxValues(
        field === "price" ? value : newFormData[originalIndex].price,
        field === "CGSTPercentage" ? value : newFormData[originalIndex].CGSTPercentage,
      )
    }

    if (field === "price" || field === "SGSTPercentage") {
      newFormData[originalIndex].SGSTValue = calculateTaxValues(
        field === "price" ? value : newFormData[originalIndex].price,
        field === "SGSTPercentage" ? value : newFormData[originalIndex].SGSTPercentage,
      )
    }

    setFormData(newFormData)
  }

  const handleKeyPress = (originalIndex, e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addNewRow()
    }
  }

  const handleStockUpdate = async (originalIndex) => {
    const item = formData[originalIndex]
    const newStockValue = Number.parseInt(item.newStock, 10) || 0

    if (newStockValue <= 0) {
      toast.warning("Please enter a valid stock quantity")
      return
    }

    if (!item._id) {
      toast.warning("Please save the item first before updating stock")
      return
    }

    const currentStock = Number.parseInt(item.stock, 10) || 0
    const updatedStock = currentStock + newStockValue

    const newFormData = [...formData]
    newFormData[originalIndex].stock = updatedStock.toString()
    newFormData[originalIndex].newStock = ""
    setFormData(newFormData)

    const updateKey = `${item.medicineName}-${item.batchNumber}`
    setPendingStockUpdates({
      ...pendingStockUpdates,
      [updateKey]: true,
    })

    try {
      const updateData = {
        _id: item._id,
        new_stock: newStockValue,
      }

      const response = await fetch(
        `${Cosmetologybaseurl}pharmacy/data/?branch_code=${encodeURIComponent(branchCode)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          body: JSON.stringify([updateData]),
        },
      )

      if (response.ok) {
        const result = await response.json()
        if (result.length > 0) {
          const newPendingUpdates = { ...pendingStockUpdates }
          delete newPendingUpdates[updateKey]
          setPendingStockUpdates(newPendingUpdates)

          const serverStock = result[0].stock || 0
          const updatedFormData = [...formData]
          updatedFormData[originalIndex].stock = serverStock.toString()
          setFormData(updatedFormData)

          toast.success("Stock updated successfully!")
        }
      } else {
        const revertedFormData = [...formData]
        revertedFormData[originalIndex].stock = currentStock.toString()
        revertedFormData[originalIndex].newStock = newStockValue.toString()
        setFormData(revertedFormData)

        const newPendingUpdates = { ...pendingStockUpdates }
        delete newPendingUpdates[updateKey]
        setPendingStockUpdates(newPendingUpdates)

        toast.error("Failed to update stock")
      }
    } catch (error) {
      console.error("Error updating stock:", error)

      const revertedFormData = [...formData]
      revertedFormData[originalIndex].stock = currentStock.toString()
      revertedFormData[originalIndex].newStock = newStockValue.toString()
      setFormData(revertedFormData)

      const newPendingUpdates = { ...pendingStockUpdates }
      delete newPendingUpdates[updateKey]
      setPendingStockUpdates(newPendingUpdates)

      toast.error("Error updating stock")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newEntries = []
      const updatedEntries = []

      formData.forEach((item, index) => {
        // Skip empty rows (no medicine name)
        if (!item.medicineName || item.medicineName.toString().trim() === "") return

        const formattedItem = {
          medicine_name: item.medicineName.toString().trim(),
          medicine_category: item.medicineCategory.toString().trim(),
          company_name: item.companyName.toString().trim(),
          price: Number.parseFloat(item.price) || 0,
          CGST_percentage: Number.parseFloat(item.CGSTPercentage) || 0,
          CGST_value: Number.parseFloat(item.CGSTValue) || 0,
          SGST_percentage: Number.parseFloat(item.SGSTPercentage) || 0,
          SGST_value: Number.parseFloat(item.SGSTValue) || 0,
          stock: Number.parseInt(item.stock, 10) || 0,
          received_date: item.receivedDate || "",
          expiry_date: item.expiryDate || "",
          batch_number: item.batchNumber.toString().trim(),
        }

        if (!item._id) {
          newEntries.push(formattedItem)
        } else if (editedRows[index]) {
          updatedEntries.push({ ...formattedItem, _id: item._id })
        }
      })

      if (newEntries.length > 0) {
        const response = await fetch(
          `${Cosmetologybaseurl}pharmacy/data/?branch_code=${encodeURIComponent(branchCode)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
            body: JSON.stringify(newEntries),
          },
        )

        if (response.ok) {
          toast.success(`${newEntries.length} medicine(s) added successfully!`)
        } else {
          toast.error("Error saving new entries")
        }
      }

      if (updatedEntries.length > 0) {
        const response = await fetch(
          `${Cosmetologybaseurl}pharmacy/data/?branch_code=${encodeURIComponent(branchCode)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
            body: JSON.stringify(updatedEntries),
          },
        )

        if (response.ok) {
          toast.success(`${updatedEntries.length} medicine(s) updated successfully!`)
          setEditedRows({})
        } else {
          toast.error("Error updating entries")
        }
      }

      if (newEntries.length === 0 && updatedEntries.length === 0) {
        toast.info("No changes to save")
      }
    } catch (error) {
      console.error("Error submitting data:", error)
      toast.error("Error submitting data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      if (dateString.includes("T")) {
        return dateString.split("T")[0]
      }
      return dateString
    } catch (e) {
      console.error("Error formatting date:", e)
      return dateString
    }
  }

  const addNewRow = () => {
    const newRow = {
      medicineName: "",
      medicineCategory: "",
      companyName: "",
      price: "",
      CGSTPercentage: "",
      CGSTValue: "",
      SGSTPercentage: "",
      SGSTValue: "",
      newStock: "",
      stock: "",
      receivedDate: "",
      expiryDate: "",
      batchNumber: "",
    }

    // Add new row at the top instead of bottom
    setFormData((prevData) => [newRow, ...prevData])

    // Scroll to top to show the new row
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollTop = 0
      }
    }, 100)

    toast.info("New medicine row added at the top")
  }

  const removeRow = async (originalIndex) => {
    const itemToRemove = formData[originalIndex]

    if (itemToRemove._id && itemToRemove.medicineName) {
      try {
        const response = await fetch(`${Cosmetologybaseurl}pharmacy/data/?_id=${itemToRemove._id}`, {
          method: "DELETE",
          withCredentials: true,
        })

        if (response.ok) {
          toast.success("Medicine deleted successfully!")
          const newFormData = [...formData]
          newFormData.splice(originalIndex, 1)
          setFormData(newFormData)

          const newEditedRows = { ...editedRows }
          delete newEditedRows[originalIndex]
          setEditedRows(newEditedRows)
        } else {
          toast.error("Failed to delete medicine from database")
        }
      } catch (error) {
        console.error("Error deleting record:", error)
        toast.error("Failed to delete medicine from database")
      }
    } else {
      const newFormData = [...formData]
      newFormData.splice(originalIndex, 1)
      setFormData(newFormData)

      const newEditedRows = { ...editedRows }
      delete newEditedRows[originalIndex]
      setEditedRows(newEditedRows)

      toast.success("Medicine row removed")
    }
  }

  const downloadExcel = () => {
    const excelData = formData
      .filter((item) => item.medicineName && item.medicineName.toString().trim() !== "")
      .map((item) => ({
        "Medicine Name": item.medicineName,
        "Medicine Category": item.medicineCategory,
        "Company Name": item.companyName,
        "Price (₹)": item.price,
        "CGST %": item.CGSTPercentage,
        "CGST Value (₹)": item.CGSTValue,
        "SGST %": item.SGSTPercentage,
        "SGST Value (₹)": item.SGSTValue,
        Stock: item.stock,
        "Received Date": item.receivedDate,
        "Expiry Date": item.expiryDate,
        "Batch Number": item.batchNumber,
        "Branch Code": branchCode,
      }))

    if (excelData.length === 0) {
      toast.warning("No data to export")
      return
    }

    const csvContent = [
      Object.keys(excelData[0] || {}).join(","),
      ...excelData.map((row) =>
        Object.values(row)
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `PharmacyData_${branchCode}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`CSV file downloaded successfully! (${excelData.length} records)`)
  }

  const hasPendingUpdate = (item) => {
    if (!item.medicineName || !item.batchNumber) return false
    const updateKey = `${item.medicineName}-${item.batchNumber}`
    return pendingStockUpdates[updateKey] === true
  }

  const getFilteredDataWithIndices = () => {
    return formData
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        const matchesSearch =
          searchTerm === "" ||
          (item.medicineName && item.medicineName.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.batchNumber && item.batchNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.companyName && item.companyName.toString().toLowerCase().includes(searchTerm.toLowerCase()))

        if (activeView === "all") return matchesSearch
        if (activeView === "low") {
          const stock = Number.parseInt(item.stock) || 0
          return matchesSearch && stock < 10 && stock > 0
        }
        if (activeView === "expired") {
          if (!item.expiryDate) return false
          const expiryDate = new Date(item.expiryDate)
          const today = new Date()
          expiryDate.setHours(0, 0, 0, 0)
          today.setHours(0, 0, 0, 0)
          return matchesSearch && expiryDate < today
        }

        return matchesSearch
      })
  }

  const filteredDataWithIndices = getFilteredDataWithIndices()

  const getStockStatus = (stock) => {
    const stockNum = Number.parseInt(stock) || 0
    if (stockNum === 0) return { status: "Out of Stock", variant: "destructive" }
    if (stockNum < 10) return { status: "Low Stock", variant: "warning" }
    return { status: "In Stock", variant: "success" }
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    expiry.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    return expiry < today
  }

  return (
    <Container>
      <ContentWrapper $isMobile={isMobile} $isTablet={isTablet}>
        {/* Header */}
        <HeaderCard>
          <HeaderContent>
            <HeaderTitle $isMobile={isMobile}>
              <FaBox />
              Pharmacy Stock Management
            </HeaderTitle>
          </HeaderContent>
        </HeaderCard>

        {/* Save Button - Moved to Top */}


        {/* Controls */}
        <ControlsCard>
          <ControlsContent>
            <ControlsRow $isMobile={isMobile}>
              {/* Search */}
              <SearchContainer $isMobile={isMobile}>
                <SearchIcon>
                  <FaSearch />
                </SearchIcon>
                <SearchInput
                  placeholder="Search medicines, batch numbers, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <ClearButton onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </ClearButton>
                )}
              </SearchContainer>

              {/* Filter Tabs */}
              <TabsContainer $isMobile={isMobile}>
                <TabButton $active={activeView === "all"} onClick={() => setActiveView("all")}>
                  All Stock
                </TabButton>
                <TabButton $active={activeView === "low"} onClick={() => setActiveView("low")}>
                  Low Stock
                </TabButton>
                <TabButton $active={activeView === "expired"} onClick={() => setActiveView("expired")}>
                  Expired
                </TabButton>
              </TabsContainer>


            <SaveButtonContainer>
              <SaveButton onClick={handleSubmit} disabled={loading}>
                <FaSave />
                {loading ? "Saving..." : "Save All Changes"}
              </SaveButton>
            </SaveButtonContainer>
     
   
              {/* Actions */}
              <ActionsContainer $isMobile={isMobile}>
                <OutlineButton onClick={downloadExcel}>
                  <FaDownload />
                  {!isMobile && "Export CSV"}
                </OutlineButton>
                <PrimaryButton onClick={addNewRow}>
                  <FaPlus />
                  {!isMobile && "Add Medicine"}
                </PrimaryButton>
              </ActionsContainer>
            </ControlsRow>
          </ControlsContent>
        </ControlsCard>

        {/* Medicine Cards */}
        <CardsContainer ref={tableRef}>
          {filteredDataWithIndices.map(({ item: data, originalIndex }) => (
            <MedicineCard key={originalIndex} $isEdited={editedRows[originalIndex]} $isMobile={isMobile}>
              <CardContent $isMobile={isMobile}>
                <CardGrid $isCompact={isCompactView} $isMobile={isMobile} $isTablet={isTablet}>
                  {/* Medicine Info */}
                  <MedicineInfoSection>
                    <InputGroup>
                      <InputIcon>
                        <FaPills />
                      </InputIcon>
                      <StyledInput
                        placeholder="Medicine name"
                        value={data.medicineName || ""}
                        onChange={(e) => handleChange(originalIndex, "medicineName", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                        $fontWeight="medium"
                      />
                    </InputGroup>
                    <StyledSelect
                      value={data.medicineCategory || ""}
                      onChange={(e) => handleChange(originalIndex, "medicineCategory", e.target.value)}
                    >
                      <option value="">Select Category</option>
                      <option value="Tablets">Tablets</option>
                      <option value="Topicals">Topicals</option>
                      <option value="Capsules">Capsules</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                    </StyledSelect>
                  </MedicineInfoSection>

                  {/* Company & Price */}
                  <CompanyPriceSection>
                    <InputGroup>
                      <InputIcon>
                        <FaBuilding />
                      </InputIcon>
                      <StyledInput
                        placeholder="Company"
                        value={data.companyName || ""}
                        onChange={(e) => handleChange(originalIndex, "companyName", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputIcon>
                        <FaRupeeSign />
                      </InputIcon>
                      <StyledInput
                        placeholder="Price (₹)"
                        type="number"
                        value={data.price || ""}
                        onChange={(e) => handleChange(originalIndex, "price", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                    </InputGroup>
                  </CompanyPriceSection>

                  {/* Tax Info */}
                  {!isCompactView && (
                    <TaxSection>
                      <TaxRow>
                        <StyledInput
                          placeholder="CGST %"
                          type="number"
                          value={data.CGSTPercentage || ""}
                          onChange={(e) => handleChange(originalIndex, "CGSTPercentage", e.target.value)}
                          onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                        />
                        <StyledInput value={data.CGSTValue || ""} readOnly $readOnly />
                      </TaxRow>
                      <TaxRow>
                        <StyledInput
                          placeholder="SGST %"
                          type="number"
                          value={data.SGSTPercentage || ""}
                          onChange={(e) => handleChange(originalIndex, "SGSTPercentage", e.target.value)}
                          onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                        />
                        <StyledInput value={data.SGSTValue || ""} readOnly $readOnly />
                      </TaxRow>
                    </TaxSection>
                  )}

                  {/* Stock Management */}
                  <StockSection>
                    <StockInputRow>
                      <StyledInput
                        type="number"
                        placeholder={data._id ? "Add stock" : "Initial stock"}
                        value={data._id ? data.newStock || "" : data.stock || ""}
                        onChange={(e) => handleChange(originalIndex, data._id ? "newStock" : "stock", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                      {data._id && (
                        <SmallButton
                          onClick={() => handleStockUpdate(originalIndex)}
                          disabled={!data.newStock || Number.parseInt(data.newStock) <= 0}
                        >
                          <FaArrowRight />
                        </SmallButton>
                      )}
                    </StockInputRow>
                    <StockStatusRow>
                      <StockBadge $variant={getStockStatus(data.stock).variant}>
                        {data.stock || "0"} in stock
                      </StockBadge>
                      {hasPendingUpdate(data) && (
                        <SyncIcon>
                          <FaSync />
                        </SyncIcon>
                      )}
                    </StockStatusRow>
                  </StockSection>

                  {/* Dates - Removed Icons */}
                  {!isCompactView && (
                    <DatesSection>
                      <StyledInput
                        type="date"
                        placeholder="Received Date"
                        value={data.receivedDate || ""}
                        onChange={(e) => handleChange(originalIndex, "receivedDate", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                      <DateInputRow>
                        <StyledInput
                          type="date"
                          placeholder="Expiry Date"
                          value={data.expiryDate || ""}
                          onChange={(e) => handleChange(originalIndex, "expiryDate", e.target.value)}
                          onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                          $isExpired={isExpired(data.expiryDate)}
                        />
                        {isExpired(data.expiryDate) && (
                          <WarningIcon>
                            <FaExclamationTriangle />
                          </WarningIcon>
                        )}
                      </DateInputRow>
                    </DatesSection>
                  )}

                  {/* Batch & Actions */}
                  <BatchActionsSection>
                    <StyledInput
                      placeholder="Batch Number"
                      value={data.batchNumber || ""}
                      onChange={(e) => handleChange(originalIndex, "batchNumber", e.target.value)}
                      onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                    />
                    <DeleteButton onClick={() => removeRow(originalIndex)}>
                      <FaTrash />
                    </DeleteButton>
                  </BatchActionsSection>
                </CardGrid>
              </CardContent>
            </MedicineCard>
          ))}
        </CardsContainer>

        {/* Loading Overlay */}
        {loading && (
          <LoadingOverlay>
            <LoadingCard>
              <LoadingContent>
                <LoadingIcon>
                  <FaSync />
                </LoadingIcon>
                <LoadingText>Loading...</LoadingText>
              </LoadingContent>
            </LoadingCard>
          </LoadingOverlay>
        )}

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            fontSize: "14px",
            borderRadius: "8px",
          }}
        />
      </ContentWrapper>
    </Container>
  )
}

export default PharmacyComponent

// Styled Components with Enhanced Responsiveness
const Container = styled.div`
  min-height: 100vh;
  margin-top: 60px;
  background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%);
  padding: 0.5rem;

  @media (min-width: 768px) {
    padding: 1rem;
  }

  @media (min-width: 1024px) {
    padding: 1.5rem;
  }
`

const ContentWrapper = styled.div`
  max-width: ${(props) => (props.$isMobile ? "100%" : props.$isTablet ? "100%" : "1400px")};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${(props) => (props.$isMobile ? "1rem" : "1.5rem")};
`

// Header
const HeaderCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5d3ff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`

const HeaderContent = styled.div`
  background: linear-gradient(135deg, #6b4a8f 0%, #6b4a8f 100%);
  color: white;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`

const HeaderTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${(props) => (props.$isMobile ? "1.25rem" : "2rem")};
  font-weight: 600;
  margin: 0;

  svg {
    font-size: ${(props) => (props.$isMobile ? "1.25rem" : "2rem")};
  }

  @media (min-width: 768px) {
    font-size: 1.75rem;
    
    svg {
      font-size: 1.75rem;
    }
  }

  @media (min-width: 1024px) {
    font-size: 2rem;
    
    svg {
      font-size: 2rem;
    }
  }
`

// Save Section - Moved to Top
const SaveCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5d3ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const SaveContent = styled.div`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border: none;
  background: #6b4a8f;
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover:not(:disabled) {
    background: #6b4a8f;
  }

  &:disabled {
    background: #6b4a8f;
    cursor: not-allowed;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }

  @media (min-width: 768px) {
    width: auto;
  }
`

// Controls
const ControlsCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5d3ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const ControlsContent = styled.div`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`

const ControlsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: ${(props) => (props.$isMobile ? "100%" : "24rem")};
  display: flex;
  align-items: center;
`

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #a855f7;
  z-index: 1;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #e5d3ff;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6b4a8f;
    box-shadow: 0 0 0 3px rgba(107, 74, 143, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (min-width: 768px) {
    padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  }
`

const ClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const TabsContainer = styled.div`
  display: flex;
  background: #f3e8ff;
  border-radius: 8px;
  padding: 0.25rem;
  gap: 0.25rem;
  width: ${(props) => (props.$isMobile ? "100%" : "auto")};
`

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$active ? "#6b4a8f" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "#6b4a8f")};
  flex: 1;

  &:hover {
    background: ${(props) => (props.$active ? "#5a3d7a" : "rgba(107, 74, 143, 0.1)")};
  }

  @media (min-width: 768px) {
    flex: initial;
  }
`

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  width: ${(props) => (props.$isMobile ? "100%" : "auto")};
`

const OutlineButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e5d3ff;
  background: white;
  color: #6b4a8f;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background: #f3e8ff;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }

  @media (min-width: 768px) {
    flex: initial;
    padding: 0.5rem 1rem;
  }
`

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: #6b4a8f;
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background: #5a3d7a;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }

  @media (min-width: 768px) {
    flex: initial;
    padding: 0.5rem 1rem;
  }
`

// Cards
const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.25rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #6b4a8f;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5a3d7a;
  }

  @media (min-width: 768px) {
    max-height: 65vh;
  }

  @media (min-width: 1024px) {
    max-height: 70vh;
  }
`

const MedicineCard = styled.div`
  background: white;
  border-radius: 12px;
  border-left: 4px solid ${(props) => (props.$isEdited ? "#fbbf24" : "#a855f7")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  ${(props) => props.$isEdited && "background: #fffbeb;"}

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`

const CardContent = styled.div`
  padding: ${(props) => (props.$isMobile ? "1rem" : "1.5rem")};
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;

  @media (min-width: 768px) {
    grid-template-columns: ${(props) => (props.$isTablet ? "1fr 1fr" : "1fr")};
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: ${(props) => (props.$isCompact ? "3fr 2fr 2fr 1fr" : "3fr 2fr 2fr 2fr 2fr 1fr")};
    align-items: center;
  }
`

const MedicineInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const CompanyPriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const TaxSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const TaxRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`

const StockSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const StockInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const StockStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const DatesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const DateInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const BatchActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

// Form Elements
const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #6b4a8f;
  z-index: 1;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  ${(props) => props.$fontWeight === "medium" && "font-weight: 500;"}
  ${(props) => (props.children || props.placeholder?.includes("Medicine")) && "padding-left: 2.5rem;"}
  ${(props) => (props.placeholder?.includes("Company") || props.placeholder?.includes("Price")) && "padding-left: 2.5rem;"}
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  ${(props) => props.$readOnly && "background-color: #f9fafb; color: #6b7280;"}
  ${(props) => props.$isExpired && "border-color: #fca5a5; background-color: #fef2f2;"}

  &:focus {
    outline: none;
    border-color: #6b4a8f;
    box-shadow: 0 0 0 3px rgba(107, 74, 143, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (min-width: 768px) {
    padding: 0.5rem 0.75rem;
    ${(props) => (props.children || props.placeholder?.includes("Medicine")) && "padding-left: 2.5rem;"}
    ${(props) => (props.placeholder?.includes("Company") || props.placeholder?.includes("Price")) && "padding-left: 2.5rem;"}
  }
`

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6b4a8f;
    box-shadow: 0 0 0 3px rgba(107, 74, 143, 0.1);
  }

  @media (min-width: 768px) {
    padding: 0.5rem 0.75rem;
  }
`

const SmallButton = styled.button`
  padding: 0.75rem;
  border: none;
  background: #6b4a8f;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;

  &:hover:not(:disabled) {
    background: #5a3d7a;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }

  @media (min-width: 768px) {
    padding: 0.5rem;
  }
`

const DeleteButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #fca5a5;
  background: white;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fef2f2;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }

  @media (min-width: 768px) {
    padding: 0.5rem;
  }
`

// Badges and Icons
const StockBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  ${(props) => {
    switch (props.$variant) {
      case "destructive":
        return "background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5;"
      case "warning":
        return "background: #fffbeb; color: #d97706; border: 1px solid #fcd34d;"
      default:
        return "background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;"
    }
  }}
`

const SyncIcon = styled.div`
  color: #f59e0b;
  animation: spin 1.5s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const WarningIcon = styled.div`
  color: #dc2626;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

// Loading
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const LoadingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  margin: 1rem;
`

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const LoadingIcon = styled.div`
  color: #6b4a8f;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const LoadingText = styled.span`
  font-size: 1.125rem;
  font-weight: 500;
  color: #374151;
`
