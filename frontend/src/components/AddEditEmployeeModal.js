import React, { useState } from 'react';

/**
 * A modal component for adding or editing employee details.
 * 
 * @component
 * @param {Object} props - The props for the component.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.onSubmit - Callback function to handle form submission. Receives the updated employee data as a parameter.
 * @param {Object} [props.employee={}] - The initial employee data for editing. Defaults to an empty object for adding a new employee.
 * @param {string} [props.employee.name] - The name of the employee (if editing).
 * @param {string} [props.employee.role] - The role of the employee (if editing).
 * @param {boolean} [props.employee.active_status=true] - The active status of the employee (if editing).
 * @param {string} props.title - The title displayed at the top of the modal.
 * @memberof module:Frontend/Employee
 * @returns {JSX.Element} The rendered modal component for adding or editing an employee.
 */
const AddEditEmployeeModal = ({ onClose, onSubmit, employee = {}, title }) => {
  const [name, setName] = useState(employee.name || '');
  const [role, setRole] = useState(employee.role || '');
  const [activeStatus, setActiveStatus] = useState(employee.active_status !== undefined ? employee.active_status : true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeData = {
      ...employee,
      name,
      role,
      active_status: activeStatus,
    };
    onSubmit(employeeData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
        <h2 className="text-2xl mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role:</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Active Status:</label>
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value === 'true')}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditEmployeeModal; 
