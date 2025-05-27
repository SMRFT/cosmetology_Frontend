import React, { useState, useEffect } from 'react';
import { Form, Container, Table, Button, Alert } from 'react-bootstrap';
import { FaDownload, FaArrowAltCircleRight, FaSave, FaPlus } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import styled from 'styled-components';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const Pharmacy = () => {
  const [formData, setFormData] = useState([{
    medicineName: '',
    medicineCategory: '',
    companyName: '',
    price: '',
    CGSTPercentage: '',
    CGSTValue: '',
    SGSTPercentage: '',
    SGSTValue: '',
    newStock: '',
    oldStock: '',
    receivedDate: '',
    expiryDate: '',
    batchNumber: ''
  }]);
  const [branchCode, setBranchCode] = useState('');
  const [editedRows, setEditedRows] = useState({}); // Track which rows have been edited

  useEffect(() => {
    // Get branch_code from cookies when component mounts
    const code = Cookies.get('branch_code');
    if (code) {
      setBranchCode(code);
      console.log('Branch code retrieved from cookies:', code);
    } else {
      console.warn('Branch code not found in cookies');
    }

    fetchPharmacyData(code);
  }, []);

  const fetchPharmacyData = (code) => {
    // Update API endpoint to include branch_code
    axios.get(`http://127.0.0.1:8000/pharmacy/data/?branch_code=${code || ''}`)
      .then((response) => {
        if (response.data.length === 0) {
          setFormData([{
            medicineName: '',
            medicineCategory: '',
            companyName: '',
            price: '',
            CGSTPercentage: '',
            CGSTValue: '',
            SGSTPercentage: '',
            SGSTValue: '',
            newStock: '',
            oldStock: '',
            receivedDate: '',
            expiryDate: '',
            batchNumber: ''
          }]);
        } else {
          setFormData(response.data.map(item => ({
            medicineName: item.medicine_name ? capitalizeFirstLetter(item.medicine_name.toLowerCase()) : '',
            medicineCategory: item.medicine_category || '',
            companyName: item.company_name,
            price: item.price,
            CGSTPercentage: item.CGST_percentage,
            CGSTValue: item.CGST_value,
            SGSTPercentage: item.SGST_percentage,
            SGSTValue: item.SGST_value,
            newStock: '',
            oldStock: item.old_stock ? item.old_stock.toString() : '',
            receivedDate: formatDate(item.received_date),
            expiryDate: formatDate(item.expiry_date),
            batchNumber: item.batch_number
          })));
        }
        // Reset edited rows tracking
        setEditedRows({});
      })
      .catch((error) => {
        console.error('Error fetching data!', error);
        toast.error('Failed to load pharmacy data!');
      });
  };

  const calculateTaxValues = (price, percentage, type) => {
    const priceValue = parseFloat(price) || 0;
    const percentageValue = parseFloat(percentage) || 0;
    const value = (priceValue * percentageValue) / 100;
    return { [type]: value.toFixed(2) };
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newFormData = [...formData];
    newFormData[index][name] = value;

    // Mark this row as edited
    setEditedRows({
      ...editedRows,
      [index]: true
    });

    if (name === 'price' || name === 'CGSTPercentage') {
      const { CGSTValue } = calculateTaxValues(
        newFormData[index].price,
        newFormData[index].CGSTPercentage,
        'CGSTValue'
      );
      newFormData[index].CGSTValue = CGSTValue;
    }

    if (name === 'price' || name === 'SGSTPercentage') {
      const { SGSTValue } = calculateTaxValues(
        newFormData[index].price,
        newFormData[index].SGSTPercentage,
        'SGSTValue'
      );
      newFormData[index].SGSTValue = SGSTValue;
    }

    setFormData(newFormData);
  };

  const handleKeyPress = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewRow();
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const newEntries = [];
  const updatedEntries = [];

  formData.forEach((item, index) => {
    if (!item.medicineName.trim()) return;

    const formattedItem = {
      medicine_name: item.medicineName,
      medicine_category: item.medicineCategory,
      company_name: item.companyName,
      price: item.price,
      CGST_percentage: item.CGSTPercentage,
      CGST_value: item.CGSTValue,
      SGST_percentage: item.SGSTPercentage,
      SGST_value: item.SGSTValue,
      new_stock: item.newStock ? parseInt(item.newStock, 10) : 0,
      received_date: formatDate(item.receivedDate),
      expiry_date: formatDate(item.expiryDate),
      batch_number: item.batchNumber,
      old_stock: parseInt(item.oldStock, 10) || 0,
      branch_code: branchCode
    };

    if (item.oldStock === '' && !item.oldStock) {
      newEntries.push(formattedItem);
    } else if (editedRows[index]) {
      updatedEntries.push(formattedItem);
    }
  });

  let postPromise = Promise.resolve();
  let patchPromise = Promise.resolve();

  if (newEntries.length > 0) {
    postPromise = axios.post('http://127.0.0.1:8000/pharmacy/data/', newEntries, {
      headers: {
        'Content-Type': 'application/json',
        'X-Branch-Code': branchCode
      },
      withCredentials: true
    })
    .then(() => {
      toast.success('New entries saved successfully!');
    })
    .catch((error) => {
      console.error('Error submitting new entries:', error);
      toast.error('Error saving new entries!');
    });
  }

  if (updatedEntries.length > 0) {
    patchPromise = axios.patch('http://127.0.0.1:8000/pharmacy/data/', updatedEntries, {
      headers: {
        'Content-Type': 'application/json',
        'X-Branch-Code': branchCode
      },
      withCredentials: true
    })
    .then(() => {
      toast.success('Updates saved successfully!');
      setEditedRows({});
    })
    .catch((error) => {
      console.error('Error updating entries:', error);
      toast.error('Error updating entries!');
    });
  }

  if (newEntries.length === 0 && updatedEntries.length === 0) {
    toast.info('No changes to save.');
  }

  // Refresh data after both POST and PATCH complete
  Promise.all([postPromise, patchPromise]).then(() => {
    fetchPharmacyData(branchCode);
  });
};


  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Check if the date string is in ISO format
      if (dateString.includes('T')) {
        dateString = dateString.split('T')[0];
        return dateString;
      }
      
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const formattedYear = date.getFullYear();
      const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
      const formattedDay = String(date.getDate()).padStart(2, '0');
      return `${formattedYear}-${formattedMonth}-${formattedDay}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Return the original string if there's an error
    }
  };

  const addNewRow = () => {
    setFormData([
      ...formData,
      {
        medicineName: '',
        medicineCategory: '',
        companyName: '',
        price: '',
        CGSTPercentage: '',
        CGSTValue: '',
        SGSTPercentage: '',
        SGSTValue: '',
        newStock: '',
        oldStock: '',
        receivedDate: '',
        expiryDate: '',
        batchNumber: ''
      }
    ]);
  };

  const removeRow = (index) => {
    const itemToRemove = formData[index];
    
    // If it's an existing record (has medicine name and batch number), delete it from database
    if (itemToRemove.medicineName && itemToRemove.batchNumber) {
        axios.delete(`http://127.0.0.1:8000/pharmacy/data/${encodeURIComponent(itemToRemove.medicineName)}/`, {
          params: { branch_code: branchCode },
          headers: { 'X-Branch-Code': branchCode },
          withCredentials: true
        })
        .then(() => {
          toast.success('Record deleted successfully.');
          
          // Remove from local state
          const newFormData = [...formData];
          newFormData.splice(index, 1);
          setFormData(newFormData);
          
          // Remove from edited rows tracking
          const newEditedRows = {...editedRows};
          delete newEditedRows[index];
          setEditedRows(newEditedRows);
        })
        .catch((error) => {
          console.error('Error deleting record:', error);
          toast.error('Failed to delete record from database.');
        });
    } else {
      // Just remove from local state if it's a new unsaved row
      const newFormData = [...formData];
      newFormData.splice(index, 1);
      setFormData(newFormData);
      
      // Remove from edited rows tracking
      const newEditedRows = {...editedRows};
      delete newEditedRows[index];
      setEditedRows(newEditedRows);
      
      toast.info('Row removed.');
    }
  };

  const handleStockUpdate = (index) => {
    const newFormData = [...formData];
    const newStockValue = parseInt(newFormData[index].newStock, 10) || 0;
    const oldStockValue = parseInt(newFormData[index].oldStock, 10) || 0;
    newFormData[index].oldStock = (oldStockValue + newStockValue).toString();
    newFormData[index].newStock = ''; // Reset new stock after adding
    setFormData(newFormData);
    
    // Mark this row as edited
    setEditedRows({
      ...editedRows,
      [index]: true
    });
  };
  
  const downloadExcel = () => {
    // Format data for Excel export
    const excelData = formData.filter(item => item.medicineName.trim() !== '').map(item => ({
      'Medicine Name': item.medicineName,
      'Medicine Category': item.medicineCategory,
      'Company Name': item.companyName,
      'Price': item.price,
      'CGST %': item.CGSTPercentage,
      'CGST Value': item.CGSTValue,
      'SGST %': item.SGSTPercentage,
      'SGST Value': item.SGSTValue,
      'Stock': item.oldStock,
      'Received Date': item.receivedDate,
      'Expiry Date': item.expiryDate,
      'Batch Number': item.batchNumber,
      'Branch Code': branchCode
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pharmacy Data");
    XLSX.writeFile(workbook, `PharmacyData_${branchCode}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded successfully!');
  };

  return (
    <StyledContainer>
      <ToastContainer position="top-right" autoClose={5000} />
      <h3 className="text-center mb-4">Pharmacy Stock</h3>
      {branchCode ? (
        <small className="text-center d-block mb-2">Branch: {branchCode}</small>
      ) : (
        <Alert variant="warning" className="mb-3">Branch code not found. Please login again.</Alert>
      )}
      <ActionButtonsContainer>
        <ActionButton title='Download Excel' onClick={downloadExcel}>
          <FaDownload />
        </ActionButton>
      </ActionButtonsContainer>
      <Form onSubmit={handleSubmit}>
        <TableContainer>
          <Table striped bordered hover>
            <thead>
              <tr style={{whiteSpace:"nowrap"}}>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Company Name</th>
                <th>Price</th>
                <th>CGST %</th>
                <th>CGST</th>
                <th>SGST %</th>
                <th>SGST</th>
                <th>New Stock</th>
                <th>Old Stock</th>
                <th>Received Date</th>
                <th>Expiry Date</th>
                <th>Batch Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((data, index) => (
                <tr key={index} className={editedRows[index] ? 'edited-row' : ''}>
                  <td>
                    <StyledFormControl
                      style={{width:'200px'}}
                      type="text"
                      placeholder="Enter medicine name"
                      name="medicineName"
                      value={data.medicineName}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td>
                    <StyledSelect
                      name="medicineCategory"
                      value={data.medicineCategory}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    >
                      <option value="">Select Category</option>
                      <option value="Tablets">Tablets</option>
                      <option value="Topicals">Topicals</option>
                    </StyledSelect>
                  </td>
                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter company name"
                      name="companyName"
                      value={data.companyName}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter price"
                      name="price"
                      value={data.price}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter CGST %"
                      name="CGSTPercentage"
                      value={data.CGSTPercentage}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter CGST Value"
                      name="CGSTValue"
                      value={data.CGSTValue}
                      readOnly
                    />
                  </td>
                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter SGST %"
                      name="SGSTPercentage"
                      value={data.SGSTPercentage}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter SGST Value"
                      name="SGSTValue"
                      value={data.SGSTValue}
                      readOnly
                    />
                  </td>

                  <td>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <StyledFormControl
                        type="text"
                        placeholder="Enter new stock"
                        name="newStock"
                        value={data.newStock}
                        onChange={(e) => handleChange(index, e)}
                        onKeyPress={(e) => handleKeyPress(index, e)}
                      />
                      <IconButton type='button' onClick={() => handleStockUpdate(index)}>
                        <FaArrowAltCircleRight />
                      </IconButton>
                    </div>
                  </td>
                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter old stock"
                      name="oldStock"
                      value={data.oldStock}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td>
                    <StyledFormControl
                      type="date"
                      placeholder="Enter received date"
                      name="receivedDate"
                      value={data.receivedDate}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td>
                    <StyledFormControl
                      type="date"
                      placeholder="Enter expiry date"
                      name="expiryDate"
                      value={data.expiryDate}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>

                  <td>
                    <StyledFormControl
                      type="text"
                      placeholder="Enter batch number"
                      name="batchNumber"
                      value={data.batchNumber}
                      onChange={(e) => handleChange(index, e)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                    />
                  </td>
                  <td style={{textAlign:"center"}}>
                    <RemoveIcon onClick={() => removeRow(index)} title='Delete Row'>
                      <RiDeleteBin5Line />
                    </RemoveIcon>
                  </td> 
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
        <ButtonContainer>
          <ActionButton onClick={addNewRow} type="button" title="Add new row">
            <FaPlus />
          </ActionButton>
          <SubmitButton type="submit">
            <FaSave style={{marginRight: '5px'}} /> Save Changes
          </SubmitButton>
        </ButtonContainer>
      </Form>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 5px;
  margin-top: 65px;
`;

const TableContainer = styled.div`
  max-height: 430px;
  overflow-y: auto;
  scrollbar-width: thin;
  
  .edited-row {
    background-color: rgba(255, 245, 157, 0.2) !important;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 8px;
    border: 1px solid #ddd;
  }
  
  th {
    background-color: #6B4A8F;
    color: white;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }
`;

const StyledFormControl = styled(Form.Control)`
  min-width: 70px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6B4A8F;

  svg {
    font-size: 1.2rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
`;

const RemoveIcon = styled.div`
  color: #6B4A8F;
  cursor: pointer;

  svg {
    font-size: 1.3rem;
  }

  &:hover {
    color: darkred;
  }
`;

const ActionButtonsContainer = styled.div`
  position: absolute;
  top: 70px;
  right: 20px;
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6B4A8F;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 1.5rem;
  }
  
  &:hover {
    color: #4a3263;
  }
`;

const SubmitButton = styled.button`
  background-color: #6B4A8F;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #4a3263;
  }
`;

const StyledSelect = styled.select`
  min-width: 120px;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  color: #495057;
  
  &:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  &:hover {
    border-color: #adb5bd;
  }
`;

export default Pharmacy;