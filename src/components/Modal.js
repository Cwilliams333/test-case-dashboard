import React, { useEffect, useRef, useState } from 'react';

const Modal = ({ children, title, onClose, darkMode, onSave, isEditable = false }) => {
  const modalRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Handle ESC key to close
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Handle save button click
  const handleSave = () => {
    console.log("Save button clicked");
    if (onSave) {
      onSave();
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    console.log("Toggling edit mode from", isEditing, "to", !isEditing);
    setIsEditing(!isEditing);
  };

  // Clone child component with proper props
  const childWithProps = React.Children.map(children, child => {
    // Check if it's a valid React element before cloning
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isEditing });
    }
    return child;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" style={{ overflowY: 'auto' }}>
      <div 
        ref={modalRef}
        className={`w-full max-w-4xl max-h-[90vh] ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg overflow-hidden transition-colors duration-200 flex flex-col`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b sticky top-0 z-10`}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {isEditable && (
              <button
                onClick={toggleEditMode}
                className={`px-3 py-1 rounded text-sm ${
                  darkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } transition-colors duration-150`}
              >
                {isEditing ? 'View Mode' : 'Edit Mode'}
              </button>
            )}
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-150`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-4 overflow-auto flex-grow">
          {childWithProps}
        </div>
        
        {/* Modal Footer */}
        <div className={`flex justify-end p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-t sticky bottom-0 z-10`}>
          {isEditing && (
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded mr-2 ${
                darkMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              } transition-colors duration-200`}
            >
              Save Changes
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;