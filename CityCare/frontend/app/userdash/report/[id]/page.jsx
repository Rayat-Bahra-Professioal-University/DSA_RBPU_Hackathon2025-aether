"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, MapPin } from "lucide-react";

const API_BASE = "http://localhost:3001/userdash";

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading report...</p>
      </div>
    );

  if (error || !report)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <p className="text-lg">{error || "Report not found"}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-indigo-700 hover:text-indigo-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {report.image_url && (
          <div className="h-96 relative">
            <img
              src={report.image_url}
              alt={report.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        )}

        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-500 mt-2">
              {new Date(report.created_at).toLocaleString()}
            </p>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed">{report.description}</p>

          <div className="flex items-center text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
            {report.address || "No address provided"}
          </div>

          {report.latitude && report.longitude && (
            <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={[parseFloat(report.latitude), parseFloat(report.longitude)]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[
                    parseFloat(report.latitude),
                    parseFloat(report.longitude),
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
        </div>
      </div>
    </div>
  );
}
