import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, AlertTriangle, Users, Phone, LogOut } from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API Service Functions
const apiService = {
  // Slots endpoints
  getSlots: async () => {
    const response = await fetch(`${API_BASE_URL}/api/slots`);
    return response.json();
  },
  
  addSlot: async (slotData) => {
    const response = await fetch(`${API_BASE_URL}/api/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slotData),
    });
    return response.json();
  },
  
  updateSlot: async (id, slotData) => {
    const response = await fetch(`${API_BASE_URL}/api/slots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slotData),
    });
    return response.json();
  },
  
  deleteSlot: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/slots/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  // Appointments endpoints
  getAppointments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/appointments`);
    return response.json();
  },
  
  getTodayAppointments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/appointments/today`);
    return response.json();
  },
  
  // Alerts endpoints
  sendAlert: async (alertData) => {
    const response = await fetch(`${API_BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });
    return response.json();
  },
  
  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/api/alerts`);
    return response.json();
  },
  
  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};

const MediReachDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for data from backend
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [pastAlerts, setPastAlerts] = useState([]);

  // Form states
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [alertForm, setAlertForm] = useState({
    type: 'General',
    message: '',
    targetArea: 'All Areas'
  });

  const timeOptions = [
    '09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
    '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const alertTypes = ['General', 'Cholera', 'Pregnancy', 'Malaria'];

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [slotsResponse, appointmentsResponse, alertsResponse] = await Promise.all([
        apiService.getSlots(),
        apiService.getTodayAppointments(),
        apiService.getAlerts()
      ]);
      
      if (slotsResponse.success) {
        setAvailableSlots(slotsResponse.data);
      }
      
      if (appointmentsResponse.success) {
        setAppointments(appointmentsResponse.data);
      }
      
      if (alertsResponse.success) {
        setPastAlerts(alertsResponse.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data. Please check your connection.');
      console.error('Load dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = async () => {
    if (!newSlot.date || !newSlot.time) {
      setError('Please select both date and time');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Format date to match backend format (DD MMM)
      const formattedDate = new Date(newSlot.date).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      const response = await apiService.addSlot({
        date: formattedDate,
        time: newSlot.time
      });
      
      if (response.success) {
        setAvailableSlots([...availableSlots, response.data]);
        setNewSlot({ date: '', time: '' });
        // Show success message
        alert('Slot added successfully!');
      } else {
        setError(response.error || 'Failed to add slot');
      }
    } catch (err) {
      setError('Failed to add slot. Please try again.');
      console.error('Add slot error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
    if (!alertForm.message.trim()) {
      setError('Please enter an alert message');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.sendAlert({
        type: alertForm.type,
        message: alertForm.message,
        targetArea: alertForm.targetArea
      });
      
      if (response.success) {
        alert('Alert sent successfully!');
        setAlertForm({ type: 'General', message: '', targetArea: 'All Areas' });
        setShowAlertModal(false);
        // Reload alerts to show the new one
        const alertsResponse = await apiService.getAlerts();
        if (alertsResponse.success) {
          setPastAlerts(alertsResponse.data);
        }
      } else {
        setError(response.error || 'Failed to send alert');
      }
    } catch (err) {
      setError('Failed to send alert. Please try again.');
      console.error('Send alert error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.deleteSlot(slotId);
      
      if (response.success) {
        setAvailableSlots(availableSlots.filter(slot => slot.id !== slotId));
        alert('Slot deleted successfully!');
      } else {
        setError(response.error || 'Failed to delete slot');
      }
    } catch (err) {
      setError('Failed to delete slot. Please try again.');
      console.error('Delete slot error:', err);
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-xl font-bold text-gray-900">MediReach</h1>
        </div>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">LafiyaCare Clinic</h2>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAlertModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            disabled={loading}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Send Alert
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );

  const ErrorMessage = () => (
    error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button 
          onClick={() => setError('')}
          className="float-right font-bold text-red-700 hover:text-red-900"
        >
          ×
        </button>
      </div>
    )
  );

  const LoadingSpinner = () => (
    loading && (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  );

  const DashboardView = () => (
    <div className="space-y-8">
      <ErrorMessage />
      <LoadingSpinner />
      
      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            📅 Today's Appointments
          </h3>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments for today</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{appointment.id}</td>
                    <td className="py-3 px-4">{appointment.date}</td>
                    <td className="py-3 px-4">{appointment.time}</td>
                    <td className="py-3 px-4 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {appointment.phone}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Available Slots */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            🕑 Available Slots
          </h3>
          <button
            onClick={() => setCurrentView('addSlot')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </button>
        </div>
        
        {availableSlots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No slots available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {availableSlots.map((slot) => (
                  <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{slot.date}</td>
                    <td className="py-3 px-4">{slot.time}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        slot.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slot.status === 'available' ? '✅ Available' : '⛔ Booked'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {slot.phone_number || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const AddSlotView = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          ← Back to Dashboard
        </button>
        <h3 className="text-2xl font-bold text-gray-800">➕ Add Available Slot</h3>
      </div>

      <ErrorMessage />
      <LoadingSpinner />

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <select
              value={newSlot.time}
              onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select time...</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={addSlot}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Slot'}
            </button>
            <button
              type="button"
              onClick={() => setNewSlot({ date: '', time: '' })}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Existing Slots Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Existing Slots</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availableSlots.map((slot) => (
                <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{slot.date}</td>
                  <td className="py-3 px-4">{slot.time}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      slot.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.status === 'available' ? '✅ Available' : '⛔ Booked'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AlertModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">⚠️ Send Emergency Alert</h3>
            <button
              onClick={() => setShowAlertModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <ErrorMessage />
          <LoadingSpinner />
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
              <select
                value={alertForm.type}
                onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {alertTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your emergency alert message..."
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Area</label>
              <select
                value={alertForm.targetArea}
                onChange={(e) => setAlertForm({ ...alertForm, targetArea: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="All Areas">All Areas</option>
                <option value="Brigade">Brigade</option>
                <option value="Badawa">Badawa</option>
                <option value="Jaba">Jaba</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={sendAlert}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send SMS Alert'}
            </button>
          </div>
          
          {/* Past Alerts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-bold text-gray-800 mb-3">Recent Alerts</h4>
            <div className="space-y-2">
              {pastAlerts.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent alerts</p>
              ) : (
                pastAlerts.map((alert) => (
                  <div key={alert.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          {new Date(alert.sent_at).toLocaleDateString()}
                        </span>
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {alert.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'addSlot' && <AddSlotView />}
      </main>
      
      {showAlertModal && <AlertModal />}
    </div>
  );
};

export default MediReachDashboard;