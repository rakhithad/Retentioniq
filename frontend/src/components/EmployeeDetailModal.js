import React from 'react';

const EmployeeDetailModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: '20%', left: '40%', background: 'white', padding: '20px', border: '1px solid black' }}>
      <h2>Modal Placeholder</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default EmployeeDetailModal;