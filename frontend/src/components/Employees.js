/**
 * @module Frontend/Employees
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Employee Component
 * 
 * A component that manages a list of employees. It provides functionality to add, edit, and terminate employees 
 * based on their status. It also includes filtering options and displays a success or error message based on 
 * actions performed. Employees can be listed, and their details can be viewed or updated through modals.
 * 
 * @component
 * @memberof module:Frontend/Employees
 * @returns {JSX.Element} The rendered employee management component with filtered employee list and modals.
 */
const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    role: employee?.role || "employee",
    active_status: employee?.active_status ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          {employee ? "Update" : "Add"} Employee
        </button>
      </div>
    </form>
  );
};

/**
 * Modal Component
 *
 * A reusable modal for displaying content in a pop-up. It supports rendering child components.
 *
 * @component
 * @param {Object} props - The props for the Modal component.
 * @param {boolean} props.isOpen - Determines if the modal is visible.
 * @param {Function} props.onClose - Callback for closing the modal.
 * @param {string} props.title - The title displayed at the top of the modal.
 * @param {React.ReactNode} props.children - The content to render inside the modal.
 * @memberof module:Frontend/Employees
 * @returns {JSX.Element|null} The rendered Modal component or null if not open.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

/**
 * Employee Component
 *
 * A comprehensive component for managing employees in the system. Provides functionality for:
 * - Listing employees.
 * - Filtering by roles and statuses (e.g., 'Active', 'Managers').
 * - Adding, editing, or terminating employees.
 * - Success and error notifications.
 * - Modal-based interactions for employee actions.
 *
 * @component
 * @memberof module:Frontend/Employees
 * @returns {JSX.Element} The rendered employee management interface.
 */
const Employee = () => {
  const [employees, setEmployees] = useState([]);

  const [currentFilter, setCurrentFilter] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const navigate = useNavigate();

  const filters = ["Cashiers", "Managers", "Active", "Inactive", "Terminated"];

  const handleReturn = () => {
    navigate("/manager");
  };

  const handleFilterClick = (filter) => {
    setCurrentFilter(filter);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const fetchEmployees = useCallback(async () => {
    try {

      const response = await fetch('https://pandabackend-six.vercel.app/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');

      }

      const data = await response.json();
      let filteredData = data;

      // Filter out employees named "Kiosk"
      filteredData = filteredData.filter(emp => emp.name.toLowerCase() !== 'kiosk');

      switch (currentFilter) {

        case 'Cashiers':
          filteredData = filteredData.filter(emp => emp.role.toLowerCase() === 'employee' && emp.active_status !== null);
          break;
        case 'Managers':
          filteredData = filteredData.filter(emp => emp.role.toLowerCase() === 'manager' && emp.active_status !== null);
          break;
        case 'Active':
          filteredData = filteredData.filter(emp => emp.active_status === true);
          break;
        case 'Inactive':
          filteredData = filteredData.filter(emp => emp.active_status === false);
          break;
        case 'Terminated':
          filteredData = filteredData.filter(emp => emp.active_status === null);

          break;
        default:
          // Exclude terminated employees from all other filters
          filteredData = filteredData.filter(emp => emp.active_status !== null);
          break;
      }


      // Remove Z_Report from the list
      filteredData = filteredData.filter(emp => emp.name.toLowerCase() !== 'z_report');
      filteredData = filteredData.filter(emp => emp.name.toLowerCase() !== 'help');

      setEmployees(filteredData);
    } catch (err) {
      setError(err.message);
    }
  }, [currentFilter]);

  const handleAddEmployee = async (formData) => {
    try {
      const response = await fetch(
        "https://pandabackend-six.vercel.app/api/employees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add employee");
      }

      setIsAddModalOpen(false);
      showSuccess("Employee added successfully!");
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditEmployee = async (formData) => {
    try {
      const response = await fetch(
        `https://pandabackend-six.vercel.app/api/employees/${editingEmployee.employee_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update employee");
      }

      setEditingEmployee(null);
      showSuccess("Employee updated successfully!");
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTerminate = async (employeeId) => {
    if (!window.confirm("Are you sure you want to terminate this employee?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://pandabackend-six.vercel.app/api/employees/${employeeId}/terminate`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to terminate employee");
      }

      showSuccess("Employee terminated successfully!");
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchEmployees();
  }, [currentFilter, fetchEmployees]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-700 to-red-500">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-r from-red-700 to-red-500 p-6">
      {/* Left Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-md mr-6 p-4">
        <button
          onClick={handleReturn}
          className="w-full mb-4 bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
        >
          Return to Manager Screen
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">FILTERS</h2>
          <div className="flex flex-col gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`w-full px-4 py-2 text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${
                  currentFilter === filter ? "bg-red-100 border-red-500" : ""
                }`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-red-500 px-6 py-2 rounded-lg shadow hover:bg-gray-50 transition-colors duration-200"
          >
            Add Employee
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search Employees..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredEmployees.map((employee) => (
            <div key={employee.employee_id} className="bg-white rounded-lg shadow-md p-6 flex">

              {/* Image Section */}
              <div className="mr-4">
                <img
                  src={(() => {
                    // try to load the specific employee image
                    try {
                      return require(`../assets/${employee.name.replace(
                        /\s+/g,
                        ""
                      )}.jpeg`);
                    } catch (error) {
                      // if there's an error, return the default image
                      return require(`../assets/employees.png`);
                    }
                  })()}
                  alt={`${employee.name}`}
                  className="w-24 h-24 object-cover rounded-md"
                  onError={(e) => {
                    // set default image if error occurs
                    e.target.src = require(`../assets/employees.png`);
                  }}
                />
              </div>

              {/* Employee Details */}
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {employee.name}
                    </h3>
                    <p className="text-gray-600">
                      Role:{" "}
                      {employee.role.charAt(0).toUpperCase() +
                        employee.role.slice(1)}
                    </p>
                    <p className="text-gray-600">
                      Status:{" "}
                      {employee.active_status === true
                        ? "Active"
                        : employee.active_status === false
                        ? "Inactive"
                        : "Terminated"}
                    </p>
                  </div>
                  {employee.active_status !== null &&
                    localStorage.getItem("role") === "admin" && (
                      <button
                        onClick={() => handleTerminate(employee.employee_id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Terminate
                      </button>
                    )}
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Clock In:{" "}
                    {employee.clock_in
                      ? new Date(employee.clock_in).toLocaleString()
                      : "Not clocked in"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Clock Out:{" "}
                    {employee.clock_out
                      ? new Date(employee.clock_out).toLocaleString()
                      : "Not clocked out"}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setEditingEmployee(employee)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
      >
        <EmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee"
      >
        {editingEmployee && (
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={handleEditEmployee}
            onCancel={() => setEditingEmployee(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Employee;
