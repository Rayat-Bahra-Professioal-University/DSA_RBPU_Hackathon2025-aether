"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
// dynamically load client-only map (prevent leaflet from being required during SSR)
const ClientMap = dynamic(() => import("../../UiLib/ClientMap"), { ssr: false });





import React, { useState, useEffect } from 'react';
import { MapPin, Plus, User, LogOut, FileText, AlertCircle, Clock, CheckCircle, XCircle, Menu, X, Home, Map, Settings, Bell, Navigation } from 'lucide-react';

const API_BASE = 'http://localhost:3001/userdash';

export default function CityCareUserDashboard() {
  const [activeTab, setActiveTab] = useState('all-reports');
  const [reports, setReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    longitude: '',
    latitude: '',
    address: '',
    image: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchAllReports();
  }, []);

  const fetchWithAuth = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      window.location.href = '/user/signin';
      throw new Error('Not authenticated');
    }
    
    return response;
  };

  const fetchProfile = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profile`);
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE}/reports`);
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE}/my-reports`);
      const data = await response.json();
      setMyReports(data);
    } catch (err) {
      setError('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.longitude || !formData.latitude) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchWithAuth(`${API_BASE}/reports`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          longitude: '',
          latitude: '',
          address: '',
          image: ''
        });
        fetchAllReports();
        if (activeTab === 'my-reports') {
          fetchMyReports();
        }
      } else {
        setError(data.message || 'Failed to create report');
      }
    } catch (err) {
      setError('Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchWithAuth(`${API_BASE}/logout`, { method: 'POST' });
      window.location.href = '/user/signin';
      
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          setError('Failed to get location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  // const getPriorityColor = (priority) => {
  //   switch (priority) {
  //     case 'high': return 'bg-red-100 text-red-700';
  //     case 'medium': return 'bg-yellow-100 text-yellow-700';
  //     case 'low': return 'bg-green-100 text-green-700';
  //     default: return 'bg-gray-100 text-gray-700';
  //   }
  // };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

 

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700 border border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "low":
      return "bg-green-100 text-green-700 border border-green-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

const ReportCard = ({ report }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/userdash/report/${report.id}`)}
      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
    >
      {/* Image Section */}
      {report.image_url && (
        <div className="relative h-56 overflow-hidden">
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute top-3 right-3 backdrop-blur-md bg-white/20 px-3 py-1 rounded-full text-white text-xs font-semibold">
            {report.priority}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-black/50 transition-colors">
            {report.title}
          </h3>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {report.description}
        </p>

        {/* Address */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="truncate">
            {report.address || "Location not specified"}
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${getPriorityColor(
              report.priority
            )}`}
          >
            {report.priority || "Normal"}
          </span>

          <div className="flex items-center text-xs text-gray-500 gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Subtle glow border on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none " />
    </div>
  );
};



  return (
    <div className="min-h-screen bg-gradient-to-br  from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b bg-green-50 text-white transition-all duration-300 z-40 shadow-2xl ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="flex flex-col h-full bg-gray-100">
          {/* Logo */}
          <div className="p-6 border-b-3  border-white ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 mt-1  bg-gradient-to-br to-black rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                {sidebarOpen && (
                  <div>
                    <h1 className="text-2xl text-black font-sans font-bold">CityCare</h1>
                    <p className="text-xs text-black/70">Manage Community Issues</p>
                  </div>
                )}
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

         

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 mt-4">
            <button
              onClick={() => {
                setActiveTab('all-reports');
                fetchAllReports();
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'all-reports'
                  ? 'bg-white text-green-800 shadow-lg'
                  : 'text-indigo-600 hover:bg-green-30000'
              }`}
            >
              <Home className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-black">All Reports</span>}
            </button>

            <button
              onClick={() => {
                setActiveTab('my-reports');
                fetchMyReports();
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'my-reports'
                  ? 'bg-white text-green-800 shadow-lg'
                  : 'text-indigo-600 hover:bg-green-300'
              }`}
            >
              <FileText className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-black">My Reports</span>}
            </button>

            {/* <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-indigo-100 hover:bg-indigo-800 transition-all duration-200">
              <Map className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Map View</span>}
            </button> */}

            
          </nav>

           {/* Profile Section */}
          {profile && (
            <div className="p-6  border-white border-b-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br bg-black rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden">
                    <h2 className="font-bold text-lg text-black truncate">{profile.name}</h2>
                    <p className="text-xs  text-black/90 truncate">{profile.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="p-4 ">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-700 hover:bg-red-900/30 transition-all duration-200"
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-30 border-b border-gray-200">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r text-black bg-clip-text ">
                {activeTab === 'all-reports' ? 'All Reports' : 'My Reports'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track community issues</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-br cursor-po from-black to-black/60 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Report
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8  bg-gradient-to-br from-zinc-100 to-green-200 rounded-3xl shadow-lg    ">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'all-reports' ? reports : myReports).map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}

          {!loading && (activeTab === 'all-reports' ? reports : myReports).length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first report!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Report
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0  text-black bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky  top-0 bg-gradient-to-r from-black to-black/90 text-white p-6 rounded-t-2xl z-30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Create New Report</h2>
                  <p className="text-white mt-1">Report an issue in your community</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Brief title of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Detailed description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="30.7333"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="76.7794"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="mt-3 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Use my current location
                </button>
                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Location set: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                  </p>
                )}
              </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                     Select Location on Map *
                     </label>
                     <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                       <ClientMap center={[30.7333, 76.7794]} formData={formData} setFormData={setFormData} />
                     </div>
                     {formData.latitude && formData.longitude && (
                      <p className="text-sm text-gray-500 mt-1">
                        Selected: {formData.latitude}, {formData.longitude}
                      </p>
                    )}
                  </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Street address or landmark"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {formData.image && (
                  <div className="relative mt-4 rounded-xl overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateReport}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Creating...' : 'Create Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}