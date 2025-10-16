"use client";

import React, { useState, useEffect } from "react";
import { MapPin, User, LogOut, FileText, AlertCircle, Clock, CheckCircle, XCircle, Menu, X, Home, Map, Settings, Bell } from "lucide-react";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
// import { ArrowLeft } from "lucide-react";
const API_BASE = "http://localhost:3001/admindash";

export default function CityCareAdminDashboard() {
  const [activeTab, setActiveTab] = useState("all-reports");
  const [reports, setReports] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAllReports();
  }, []);

  const fetchWithAuth = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (response.status === 401) {
      window.location.href = "admin/signin";
      throw new Error("Not authenticated");
    }
    return response;
  };

  const fetchProfile = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/profile`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE}/reports`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchWithAuth(`${API_BASE}/logout`, { method: "POST" });
      window.location.href = "/admin/signin";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport) return;
    try {
      setStatusUpdating(true);
      const res = await fetchWithAuth(`${API_BASE}/reports/${selectedReport.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedReport(null);
        fetchAllReports();
        setError("");
      } else {
        setError(data.message || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const ReportCard = ({ report }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* {report.image_url && (
        <div className="relative overflow-hidden h-48">
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )} */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-black line-clamp-2 flex-1">{report.title}</h3>
          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getPriorityColor(report.priority)}`}>
            {report.priority}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{report.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate text-xs">{report.address || "Location not specified"}</span>
        </div>

        <div className="flex items-center justify-between mb-4 ">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
           {/* <button
            onClick={() => handleReportClick(report)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all text-sm"
          >
            View Details
          </button> */}
          <button
            onClick={() => {
              handleReportClick(report);
            }}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all text-sm"
          >
            Change Status
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-green-50 transition-all duration-300 z-40 shadow-2xl ${sidebarOpen ? "w-72" : "w-20"}`}>
        <div className="flex flex-col h-full bg-gray-100">
          <div className="p-6 border-white border-b-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-13 bg-gradient-to-br to-black rounded-xl flex items-center justify-center shadow-lg">
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

          <nav className="flex-1 p-4 space-y-2 mt-4 text-black">
            <button
              onClick={() => setActiveTab("all-reports")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "all-reports"
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "text-indigo-100 hover:bg-indigo-800"
              }`}
            >
              <Home className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">All Reports</span>}
            </button>
          </nav>

          {profile && (
            <div className="p-6 border-b-3 border-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br bg-black rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden">
                    <h2 className="font-bold text-lg truncate text-black/90">{profile.name}</h2>
                    <p className="text-xs text-black/80 truncate">{profile.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 border-t">
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
      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-30 border-b border-gray-200">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r bg-black bg-clip-text text-transparent">
                {activeTab === "all-reports" ? "All Reports" : ""}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track community issues</p>
            </div>
          </div>
        </header>

        <div className="p-8 bg-gradient-to-r from-green-50 via-green-100 to-white min-h-screen">
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
          ) : reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No reports found</p>
            </div>
          )}

          {/* Report Detail Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-2xl">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-600 hover:text-gray-900 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto p-6 space-y-6">
                  {/* Image */}
                  {selectedReport.image_url && (
                    <div className="relative rounded-lg overflow-hidden h-72">
                      <img
                        src={selectedReport.image_url}
                        alt={selectedReport.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedReport.description}</p>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Location</p>
                      <p className="text-gray-900">{selectedReport.address || "No address provided"}</p>
                    </div>
                  </div>
                    
                  {/* Map */}
                 {selectedReport.latitude && selectedReport.longitude && (
                          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                            <MapContainer
                              center={[
                                parseFloat(selectedReport.latitude),
                                parseFloat(selectedReport.longitude),
                              ]}
                              zoom={14}
                              style={{ height: "100%", width: "100%" }}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker
                                position={[
                                  parseFloat(selectedReport.latitude),
                                  parseFloat(selectedReport.longitude),
                                ]}
                                icon={L.icon({
                                  iconUrl:
                                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                                  iconSize: [25, 41],
                                  iconAnchor: [12, 41],
                                })}
                              />
                            </MapContainer>
                          </div>
                        )}


                            
                  {/* Status and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-2">Priority</p>
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getPriorityColor(selectedReport.priority)}`}>
                        {selectedReport.priority.charAt(0).toUpperCase() + selectedReport.priority.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-2">Current Status</p>
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Created Date</p>
                    <p className="text-gray-900">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>

                  {/* Status Update Section */}
                  <div className="bg-blue-50 text-black/90 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all mb-4"
                    >
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>


                            

                {/* Modal Footer */}
                <div className="flex gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl sticky bottom-0">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusUpdating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>

  );
}