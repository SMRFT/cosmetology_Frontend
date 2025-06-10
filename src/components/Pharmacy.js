"use client"

import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { FaDownload, FaArrowAltCircleRight, FaSave, FaPlus, FaEdit, FaSearch, FaTimes } from "react-icons/fa"
import { RiDeleteBin5Line } from "react-icons/ri"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Cookies from "js-cookie"

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
      oldStock: "",
      totalStock: "",
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
  const [activeView, setActiveView] = useState("all") // "all", "low", "expired"
  const [isCompactView, setIsCompactView] = useState(false)
  const tableRef = useRef(null)

  useEffect(() => {
    // Get branch_code from cookies when component mounts
    const code = Cookies.get("branch_code")
    if (code) {
      setBranchCode(code)
      console.log("Branch code retrieved from cookies:", code)
    } else {
      console.warn("Branch code not found in cookies")
    }
    fetchPharmacyData(code)

    // Check screen size and set compact view accordingly
    const handleResize = () => {
      setIsCompactView(window.innerWidth < 1200)
    }

    handleResize() // Initial check
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const fetchPharmacyData = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`http://127.0.0.1:8000/pharmacy/data/?branch_code=${code || ""}`)
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
            oldStock: "",
            totalStock: "",
            receivedDate: "",
            expiryDate: "",
            batchNumber: "",
          },
        ])
      } else {
        setFormData(
          data.map((item) => {
            const newStock = item.new_stock || 0
            const oldStock = item.old_stock || 0
            const totalStock = newStock + oldStock

            return {
              _id: item._id,
              medicineName: item.medicine_name || "",
              medicineCategory: item.medicine_category || "",
              companyName: item.company_name || "",
              price: item.price || "",
              CGSTPercentage: item.CGST_percentage || "",
              CGSTValue: item.CGST_value || "",
              SGSTPercentage: item.SGST_percentage || "",
              SGSTValue: item.SGST_value || "",
              newStock: newStock > 0 ? newStock.toString() : "", // Show existing new stock from DB
              oldStock: oldStock.toString(),
              totalStock: totalStock.toString(),
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

    // Mark this row as edited
    setEditedRows({
      ...editedRows,
      [originalIndex]: true,
    })

    // Auto-calculate tax values
    if (field === "price" || field === "CGSTPercentage") {
      newFormData[originalIndex].CGSTValue = calculateTaxValues(
        field === "price" ? value : newFormData[originalIndex].price,
        field === "CGSTPercentage" ? value : newFormData[originalIndex].CGSTPercentage
      )
    }

    if (field === "price" || field === "SGSTPercentage") {
      newFormData[originalIndex].SGSTValue = calculateTaxValues(
        field === "price" ? value : newFormData[originalIndex].price,
        field === "SGSTPercentage" ? value : newFormData[originalIndex].SGSTPercentage
      )
    }

    // Update total stock when new stock changes
    if (field === "newStock") {
      const newStockValue = Number.parseInt(value, 10) || 0
      const oldStockValue = Number.parseInt(newFormData[originalIndex].oldStock, 10) || 0
      newFormData[originalIndex].totalStock = (newStockValue + oldStockValue).toString()
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

    // Calculate new total stock immediately
    const currentOldStock = Number.parseInt(item.oldStock, 10) || 0
    const updatedOldStock = currentOldStock + newStockValue
    const updatedTotalStock = updatedOldStock

    // Immediately update UI with new stock values
    const newFormData = [...formData]
    newFormData[originalIndex].oldStock = updatedOldStock.toString()
    newFormData[originalIndex].totalStock = updatedTotalStock.toString()
    newFormData[originalIndex].newStock = "" // Clear new stock input after adding
    setFormData(newFormData)

    // Track this update as pending
    const updateKey = `${item.medicineName}-${item.batchNumber}`
    setPendingStockUpdates({
      ...pendingStockUpdates,
      [updateKey]: true,
    })

    // Show optimistic UI update
    toast.info("Updating stock...", { autoClose: 2000 })

    try {
      const updateData = {
        medicine_name: item.medicineName.toLowerCase(),
        batch_number: item.batchNumber,
        new_stock: newStockValue,
        branch_code: branchCode,
      }

      const response = await fetch("http://127.0.0.1:8000/pharmacy/data/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Branch-Code": branchCode,
        },
        withCredentials: true,
        body: JSON.stringify([updateData]),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.length > 0) {
          // Update was successful, remove from pending updates
          const newPendingUpdates = { ...pendingStockUpdates }
          delete newPendingUpdates[updateKey]
          setPendingStockUpdates(newPendingUpdates)

          // Update with server response
          const serverNewStock = result[0].new_stock || 0
          const serverOldStock = result[0].old_stock || 0
          const serverTotalStock = serverNewStock + serverOldStock

          const updatedFormData = [...formData]
          updatedFormData[originalIndex].oldStock = serverOldStock.toString()
          updatedFormData[originalIndex].totalStock = serverTotalStock.toString()
          setFormData(updatedFormData)

          toast.success("Stock updated successfully!")
        }
      } else {
        // If update failed, revert the optimistic update
        const revertedFormData = [...formData]
        revertedFormData[originalIndex].oldStock = currentOldStock.toString()
        revertedFormData[originalIndex].totalStock = currentOldStock.toString()
        revertedFormData[originalIndex].newStock = newStockValue.toString()
        setFormData(revertedFormData)

        // Remove from pending updates
        const newPendingUpdates = { ...pendingStockUpdates }
        delete newPendingUpdates[updateKey]
        setPendingStockUpdates(newPendingUpdates)

        toast.error("Failed to update stock")
      }
    } catch (error) {
      console.error("Error updating stock:", error)

      // If update failed, revert the optimistic update
      const revertedFormData = [...formData]
      revertedFormData[originalIndex].oldStock = currentOldStock.toString()
      revertedFormData[originalIndex].totalStock = currentOldStock.toString()
      revertedFormData[originalIndex].newStock = newStockValue.toString()
      setFormData(revertedFormData)

      // Remove from pending updates
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
        if (!item.medicineName.trim()) return

        const formattedItem = {
          medicine_name: item.medicineName.toLowerCase(),
          medicine_category: item.medicineCategory,
          company_name: item.companyName,
          price: Number.parseFloat(item.price) || 0,
          CGST_percentage: Number.parseFloat(item.CGSTPercentage) || 0,
          CGST_value: Number.parseFloat(item.CGSTValue) || 0,
          SGST_percentage: Number.parseFloat(item.SGSTPercentage) || 0,
          SGST_value: Number.parseFloat(item.SGSTValue) || 0,
          new_stock: Number.parseInt(item.newStock, 10) || 0,
          old_stock: Number.parseInt(item.oldStock, 10) || 0,
          received_date: item.receivedDate,
          expiry_date: item.expiryDate,
          batch_number: item.batchNumber,
          branch_code: branchCode,
        }

        if (!item._id) {
          newEntries.push(formattedItem)
        } else if (editedRows[index]) {
          updatedEntries.push({ ...formattedItem, _id: item._id })
        }
      })

      // Handle new entries
      if (newEntries.length > 0) {
        const response = await fetch("http://127.0.0.1:8000/pharmacy/data/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Branch-Code": branchCode,
          },
          withCredentials: true,
          body: JSON.stringify(newEntries),
        })

        if (response.ok) {
          toast.success("New entries saved successfully!")
        } else {
          toast.error("Error saving new entries!")
        }
      }

      // Handle updates
      if (updatedEntries.length > 0) {
        const response = await fetch("http://127.0.0.1:8000/pharmacy/data/", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Branch-Code": branchCode,
          },
          withCredentials: true,
          body: JSON.stringify(updatedEntries),
        })

        if (response.ok) {
          toast.success("Updates saved successfully!")
          setEditedRows({})
        } else {
          toast.error("Error updating entries!")
        }
      }

      if (newEntries.length === 0 && updatedEntries.length === 0) {
        toast.info("No changes to save.")
      }

      // Refresh data
      await fetchPharmacyData(branchCode)
    } catch (error) {
      console.error("Error submitting data:", error)
      toast.error("Error submitting data!")
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
      oldStock: "",
      totalStock: "",
      receivedDate: "",
      expiryDate: "",
      batchNumber: "",
    }

    setFormData((prevData) => [...prevData, newRow])

    // Scroll to the bottom of the table to show the new row
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollTop = tableRef.current.scrollHeight
      }
    }, 100)
  }

  const removeRow = async (originalIndex) => {
    const itemToRemove = formData[originalIndex]

    if (itemToRemove._id && itemToRemove.medicineName && itemToRemove.batchNumber) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/pharmacy/data/?medicine_name=${encodeURIComponent(itemToRemove.medicineName)}&batch_number=${encodeURIComponent(itemToRemove.batchNumber)}&branch_code=${branchCode}`,
          {
            method: "DELETE",
            headers: {
              "X-Branch-Code": branchCode,
            },
            withCredentials: true,
          },
        )

        if (response.ok) {
          toast.success("Record deleted successfully.")
          const newFormData = [...formData]
          newFormData.splice(originalIndex, 1)
          setFormData(newFormData)

          const newEditedRows = { ...editedRows }
          delete newEditedRows[originalIndex]
          setEditedRows(newEditedRows)
        } else {
          toast.error("Failed to delete record from database.")
        }
      } catch (error) {
        console.error("Error deleting record:", error)
        toast.error("Failed to delete record from database.")
      }
    } else {
      const newFormData = [...formData]
      newFormData.splice(originalIndex, 1)
      setFormData(newFormData)

      const newEditedRows = { ...editedRows }
      delete newEditedRows[originalIndex]
      setEditedRows(newEditedRows)

      toast.info("Row removed.")
    }
  }

  const downloadExcel = () => {
    // Format data for Excel export
    const excelData = formData
      .filter((item) => item.medicineName.trim() !== "")
      .map((item) => ({
        "Medicine Name": item.medicineName,
        "Medicine Category": item.medicineCategory,
        "Company Name": item.companyName,
        Price: item.price,
        "CGST %": item.CGSTPercentage,
        "CGST Value": item.CGSTValue,
        "SGST %": item.SGSTPercentage,
        "SGST Value": item.SGSTValue,
        "New Stock": item.newStock,
        "Old Stock": item.oldStock,
        "Total Stock": item.totalStock,
        "Received Date": item.receivedDate,
        "Expiry Date": item.expiryDate,
        "Batch Number": item.batchNumber,
        "Branch Code": branchCode,
      }))

    // Simple CSV download implementation
    const csvContent = [
      Object.keys(excelData[0] || {}).join(","),
      ...excelData.map((row) => Object.values(row).join(",")),
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

    toast.success("CSV file downloaded successfully!")
  }

  // Function to check if a row has a pending stock update
  const hasPendingUpdate = (item) => {
    if (!item.medicineName || !item.batchNumber) return false
    const updateKey = `${item.medicineName}-${item.batchNumber}`
    return pendingStockUpdates[updateKey] === true
  }

  // Filter data based on search term and active view with original indices
  const getFilteredDataWithIndices = () => {
    return formData
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        // Search filter
        const matchesSearch =
          searchTerm === "" ||
          item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.companyName.toLowerCase().includes(searchTerm.toLowerCase())

        // View filter
        if (activeView === "all") return matchesSearch
        if (activeView === "low") {
          const totalStock = Number.parseInt(item.totalStock) || 0
          return matchesSearch && totalStock < 10 && totalStock > 0
        }
        if (activeView === "expired") {
          if (!item.expiryDate) return false
          const expiryDate = new Date(item.expiryDate)
          const today = new Date()
          return matchesSearch && expiryDate < today
        }

        return matchesSearch
      })
  }

  const filteredDataWithIndices = getFilteredDataWithIndices()

  return (
    <StyledContainer>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header>
        <Title>Pharmacy Stock Management</Title>
      </Header>

      <ControlPanel>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm("")}>
              <FaTimes />
            </ClearButton>
          )}
        </SearchContainer>
        <ActionButtonsContainer>
          <ActionButton onClick={downloadExcel} title="Download CSV">
            <FaDownload />
          </ActionButton>
        </ActionButtonsContainer>
      </ControlPanel>

      <Form onSubmit={handleSubmit}>
        <TableScrollContainer>
          <TableContainer ref={tableRef}>
            <StyledTable $isCompact={isCompactView}>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Category</th>
                  <th>Company</th>
                  <th>Price</th>
                  {!isCompactView && (
                    <>
                      <th>CGST %</th>
                      <th>CGST Value</th>
                      <th>SGST %</th>
                      <th>SGST Value</th>
                    </>
                  )}
                  <th>New Stock</th>
                  <th>Old Stock</th>
                  <th>Total Stock</th>
                  {!isCompactView && (
                    <>
                      <th>Received Date</th>
                      <th>Expiry Date</th>
                    </>
                  )}
                  <th>Batch Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDataWithIndices.map(({ item: data, originalIndex }) => (
                  <TableRow key={originalIndex} $isEdited={editedRows[originalIndex]}>
                    <td>
                      <StyledInput
                        type="text"
                        placeholder="Enter medicine name"
                        value={data.medicineName}
                        onChange={(e) => handleChange(originalIndex, "medicineName", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                    </td>
                    <td>
                      <StyledSelect
                        value={data.medicineCategory}
                        onChange={(e) => handleChange(originalIndex, "medicineCategory", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      >
                        <option value="">Select Category</option>
                        <option value="Tablets">Tablets</option>
                        <option value="Topicals">Topicals</option>
                      </StyledSelect>
                    </td>
                    <td>
                      <StyledInput
                        type="text"
                        placeholder="Company name"
                        value={data.companyName}
                        onChange={(e) => handleChange(originalIndex, "companyName", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                    </td>
                    <td>
                      <StyledInput
                        type="text"
                        placeholder="Price"
                        value={data.price}
                        onChange={(e) => handleChange(originalIndex, "price", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                    </td>
                    {!isCompactView && (
                      <>
                        <td>
                          <StyledInput
                            type="number"
                            placeholder="CGST %"
                            value={data.CGSTPercentage}
                            onChange={(e) => handleChange(originalIndex, "CGSTPercentage", e.target.value)}
                            onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                          />
                        </td>
                        <td>
                          <StyledInput type="number" value={data.CGSTValue} readOnly />
                        </td>
                        <td>
                          <StyledInput
                            type="number"
                            placeholder="SGST %"
                            value={data.SGSTPercentage}
                            onChange={(e) => handleChange(originalIndex, "SGSTPercentage", e.target.value)}
                            onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                          />
                        </td>
                        <td>
                          <StyledInput type="number" value={data.SGSTValue} readOnly />
                        </td>
                      </>
                    )}
                    <td>
                      <StockInputContainer>
                        <StyledInput
                          type="number"
                          placeholder="Add new stock"
                          value={data.newStock}
                          onChange={(e) => handleChange(originalIndex, "newStock", e.target.value)}
                          onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                        />
                        <IconButton
                          type="button"
                          onClick={() => handleStockUpdate(originalIndex)}
                          disabled={!data.newStock || Number.parseInt(data.newStock) <= 0}
                          title="Add to old stock"
                        >
                          <FaArrowAltCircleRight />
                        </IconButton>
                      </StockInputContainer>
                    </td>
                    <td>
                      <StockDisplay $isPending={hasPendingUpdate(data)}>
                        {data.oldStock || "0"}
                        {hasPendingUpdate(data) && <SyncIndicator title="Syncing with server...">⟳</SyncIndicator>}
                      </StockDisplay>
                    </td>
                    <td>
                      <TotalStockDisplay>{data.totalStock || "0"}</TotalStockDisplay>
                    </td>
                    {!isCompactView && (
                      <>
                        <td>
                          <StyledInput
                            type="date"
                            value={data.receivedDate}
                            onChange={(e) => handleChange(originalIndex, "receivedDate", e.target.value)}
                            onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                          />
                        </td>
                        <td>
                          <StyledInput
                            type="date"
                            value={data.expiryDate}
                            onChange={(e) => handleChange(originalIndex, "expiryDate", e.target.value)}
                            onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                          />
                        </td>
                      </>
                    )}
                    <td>
                      <StyledInput
                        type="text"
                        placeholder="Batch number"
                        value={data.batchNumber}
                        onChange={(e) => handleChange(originalIndex, "batchNumber", e.target.value)}
                        onKeyPress={(e) => handleKeyPress(originalIndex, e)}
                      />
                    </td>
                    <td>
                      <ActionButtonsCell>
                        <RemoveButton onClick={() => removeRow(originalIndex)} title="Delete Row">
                          <RiDeleteBin5Line />
                        </RemoveButton>
                      </ActionButtonsCell>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
        </TableScrollContainer>

        <ButtonContainer>
          <ActionButton onClick={addNewRow} type="button" title="Add new row">
            <FaPlus /> Add Row
          </ActionButton>
          <SubmitButton type="submit" disabled={loading}>
            <FaSave /> {loading ? "Saving..." : "Save Changes"}
          </SubmitButton>
        </ButtonContainer>
      </Form>

      {loading && (
        <LoadingOverlay>
          <LoadingSpinner>Loading...</LoadingSpinner>
        </LoadingOverlay>
      )}
    </StyledContainer>
  )
}

// Container and Layout
const StyledContainer = styled.div`
  padding: 10px;
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
`

const Title = styled.h2`
  color: #6b4a8f;
  margin: 0;
  font-weight: 600;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
`

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const TableScrollContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
`

const TableContainer = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #6b4a8f;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #5a3d7a;
  }
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: ${(props) => (props.$isCompact ? "1000px" : "1500px")};

  th {
    background-color: #6b4a8f;
    color: white;
    padding: 8px 6px;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 10;
    font-weight: 600;
    border: 1px solid #5a3d7a;
    white-space: nowrap;
    font-size: 0.9rem;
  }

  td {
    padding: 4px;
    border: 1px solid #ddd;
    text-align: center;
    vertical-align: middle;
    font-size: 0.9rem;
  }
`

const TableRow = styled.tr`
  background-color: ${(props) => (props.$isEdited ? "rgba(255, 245, 157, 0.3)" : "white")};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$isEdited ? "rgba(255, 245, 157, 0.5)" : "#f8f9fa")};
  }

  &:nth-child(even) {
    background-color: ${(props) => (props.$isEdited ? "rgba(255, 245, 157, 0.3)" : "#f9f9f9")};
  }
`

// Form Elements
const StyledInput = styled.input`
  width: 100%;
  min-width: 80px;
  padding: 4px 6px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.85rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #6b4a8f;
    outline: none;
    box-shadow: 0 0 0 2px rgba(107, 74, 143, 0.2);
  }

  &:read-only {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
    font-size: 0.8rem;
  }
`

const StyledSelect = styled.select`
  width: 100%;
  min-width: 100px;
  padding: 4px 6px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #6b4a8f;
    outline: none;
    box-shadow: 0 0 0 2px rgba(107, 74, 143, 0.2);
  }

  &:hover {
    border-color: #adb5bd;
  }
`

const StockInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`

const StockDisplay = styled.div`
  padding: 4px 6px;
  background-color: ${(props) => (props.$isPending ? "#fff8e1" : "#e9ecef")};
  border-radius: 4px;
  font-weight: 700;
  color: #495057;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(170, 170, 170);
  font-size: 0.9rem;
`

const TotalStockDisplay = styled.div`
  padding: 4px 6px;
  background-color: #d4edda;
  border-radius: 4px;
  font-weight: 700;
  color: #155724;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #c3e6cb;
  font-size: 0.9rem;
`

// Indicators
const SyncIndicator = styled.span`
  margin-left: 5px;
  color: #ff9800;
  font-size: 0.8rem;
  animation: spin 1.5s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const EditIndicator = styled.div`
  color: #ffc107;
  display: flex;
  align-items: center;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`

// Buttons
const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b4a8f;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(107, 74, 143, 0.1);
    transform: scale(1.1);
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }

  svg {
    font-size: 1rem;
  }
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #dc3545;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
    transform: scale(1.1);
  }

  svg {
    font-size: 1rem;
  }
`

const ActionButtonsCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  flex-shrink: 0;
`

const ActionButton = styled.button`
  background: none;
  border: 2px solid #6b4a8f;
  color: #6b4a8f;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: #6b4a8f;
    color: white;
    transform: translateY(-1px);
  }

  svg {
    font-size: 0.9rem;
  }
`

const SubmitButton = styled.button`
  background-color: #6b4a8f;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover:not(:disabled) {
    background-color: #5a3d7a;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 0.9rem;
  }
`

// Loading
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const LoadingSpinner = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #6b4a8f;
`

// Control Panel (Optional Additions)
const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
`

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
`

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.9rem;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 30px 8px 35px;
  border: 1px solid #ced4da;
  border-radius: 20px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #6b4a8f;
    box-shadow: 0 0 0 2px rgba(107, 74, 143, 0.2);
  }`

const ClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #495057;
  }`

export default PharmacyComponent
