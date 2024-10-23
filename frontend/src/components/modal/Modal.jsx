import React from 'react';
import './modal.scss';

const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Success</h2>
        <p>{message}</p>
        <button className='modalButton' onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Modal;
