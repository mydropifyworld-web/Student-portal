// src/components/servicepages/Challan.js
import React from 'react';
import '../../styles/Challan.css';

const Challan = ({ formData, courseFee }) => {
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  const generateVoucherNo = () => {
    return `ICR${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const getAmountInWords = (amount) => {
    // Simple implementation - you might want to use a library for more robust conversion
    const words = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
      'Eighteen', 'Nineteen', 'Twenty'
    ];
    
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (amount === 0) return 'Zero Only';
    
    let result = '';
    
    // Handle thousands
    if (amount >= 1000) {
      result += words[Math.floor(amount / 1000)] + ' Thousand ';
      amount %= 1000;
    }
    
    // Handle hundreds
    if (amount >= 100) {
      result += words[Math.floor(amount / 100)] + ' Hundred ';
      amount %= 100;
    }
    
    // Handle tens and units
    if (amount > 0) {
      if (amount < 20) {
        result += words[amount];
      } else {
        result += tens[Math.floor(amount / 10)];
        if (amount % 10 > 0) {
          result += ' ' + words[amount % 10];
        }
      }
    }
    
    return result + ' Only';
  };

  const registrationFee = 0;
  const totalAmount = courseFee + registrationFee;

  return (
    <div className="challan-container" id="challan-container">
      <div className="header">
        <h1 className="institute-name">IT Center Rahim Yar Khan</h1>
        <p className="institute-address">Rahim Yar Khan, Punjab, Pakistan</p>
        <div className="challan-title">FEE PAYMENT CHALLAN</div>
      </div>
      
      <div className="challan-copies">
        {/* Bank Copy */}
        <div className="challan bank-copy">
          <div className="copy-header"><div className="copy-label">Bank Copy</div></div>
          <div className="details-grid">
            <span className="detail-label">Date:</span><span className="detail-value">{getCurrentDate()}</span>
            <span className="detail-label">Voucher No:</span><span className="detail-value">{generateVoucherNo()}</span>
            <span className="detail-label">Program:</span><span className="detail-value">{formData.courseDetails.courseName}</span>
            <span className="detail-label">Student:</span><span className="detail-value">{formData.personalDetails.studentName}</span>
            <span className="detail-label">Father's Name:</span><span className="detail-value">{formData.personalDetails.fatherName}</span>
            <span className="detail-label">Due Date:</span><span className="detail-value">15 days from issuance</span>
          </div>
          <table>
            <thead><tr><th>S#</th><th>Description</th><th>Amount (PKR)</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>Course Fee</td><td>{courseFee.toLocaleString()}</td></tr>
              <tr><td>2</td><td>Registration Fee</td><td>{registrationFee.toLocaleString()}</td></tr>
              <tr className="total-row"><td colSpan="2">Total Payable</td><td>{totalAmount.toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div className="amount-words"><span className="amount-label">Amount in Words:</span> {getAmountInWords(totalAmount)}</div>
          <div className="note"><strong>Note:</strong> This challan is valid only if deposited in authorized banks.</div>
        </div>
        
        {/* Student Copy */}
        <div className="challan student-copy">
          <div className="copy-header"><div className="copy-label">Student Copy</div></div>
          <div className="details-grid">
            <span className="detail-label">Date:</span><span className="detail-value">{getCurrentDate()}</span>
            <span className="detail-label">Voucher No:</span><span className="detail-value">{generateVoucherNo()}</span>
            <span className="detail-label">Program:</span><span className="detail-value">{formData.courseDetails.courseName}</span>
            <span className="detail-label">Student:</span><span className="detail-value">{formData.personalDetails.studentName}</span>
            <span className="detail-label">Father's Name:</span><span className="detail-value">{formData.personalDetails.fatherName}</span>
            <span className="detail-label">Due Date:</span><span className="detail-value">15 days from issuance</span>
          </div>
          <table>
            <thead><tr><th>S#</th><th>Description</th><th>Amount (PKR)</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>Course Fee</td><td>{courseFee.toLocaleString()}</td></tr>
              <tr><td>2</td><td>Registration Fee</td><td>{registrationFee.toLocaleString()}</td></tr>
              <tr className="total-row"><td colSpan="2">Total Payable</td><td>{totalAmount.toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div className="amount-words"><span className="amount-label">Amount in Words:</span> {getAmountInWords(totalAmount)}</div>
          <div className="note"><strong>Note:</strong> Keep this copy for your record.</div>
        </div>
        
        {/* Institute Copy */}
        <div className="challan institute-copy">
          <div className="copy-header"><div className="copy-label">Institute Copy</div></div>
          <div className="details-grid">
            <span className="detail-label">Date:</span><span className="detail-value">{getCurrentDate()}</span>
            <span className="detail-label">Voucher No:</span><span className="detail-value">{generateVoucherNo()}</span>
            <span className="detail-label">Program:</span><span className="detail-value">{formData.courseDetails.courseName}</span>
            <span className="detail-label">Student:</span><span className="detail-value">{formData.personalDetails.studentName}</span>
            <span className="detail-label">Father's Name:</span><span className="detail-value">{formData.personalDetails.fatherName}</span>
            <span className="detail-label">Due Date:</span><span className="detail-value">15 days from issuance</span>
          </div>
          <table>
            <thead><tr><th>S#</th><th>Description</th><th>Amount (PKR)</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>Course Fee</td><td>{courseFee.toLocaleString()}</td></tr>
              <tr><td>2</td><td>Registration Fee</td><td>{registrationFee.toLocaleString()}</td></tr>
              <tr className="total-row"><td colSpan="2">Total Payable</td><td>{totalAmount.toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div className="amount-words"><span className="amount-label">Amount in Words:</span> {getAmountInWords(totalAmount)}</div>
          <div className="note"><strong>Note:</strong> Submit this copy to the Accounts Department.</div>
        </div>
      </div>
      
      <div className="footer">
        <p>Generated on: {getCurrentDate()} | For inquiries contact: accounts@icr.edu.pk</p>
      </div>
    </div>
  );
};

export default Challan;