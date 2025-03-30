import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import SubjectsChart from './charts/SubjectsChart';
import SessionsChart from './charts/SessionsChart';
import LocationChart from './charts/LocationChart';
import UserGrowthChart from './charts/UserGrowthChart';

const ReportingDashboard = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    popularSubjects: [],
    sessionCompletionRates: [],
    usersByCity: [],
    userGrowth: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [activeReport, setActiveReport] = useState('subjects');

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&type=${activeReport}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }

        const data = await response.json();
        setReportData((prevData) => ({
          ...prevData,
          [activeReport === 'subjects'
            ? 'popularSubjects'
            : activeReport === 'sessions'
            ? 'sessionCompletionRates'
            : activeReport === 'locations'
            ? 'usersByCity'
            : 'userGrowth']: data.data,
        }));
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.token) {
      fetchReportData();
    }
  }, [currentUser, dateRange, activeReport]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExport = (format) => {
    // In a real application, this would make an API call to download the report
    // For now, we'll just show an alert
    alert(`Exporting ${activeReport} report in ${format} format`);

    // Example API call would look like:
    // window.location.href = `http://localhost:5000/api/admin/reports/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&type=${activeReport}&format=${format}`;
  };

  const renderActiveChart = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading report data...</p>
        </div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (activeReport) {
      case 'subjects':
        return <SubjectsChart data={reportData.popularSubjects} />;
      case 'sessions':
        return <SessionsChart data={reportData.sessionCompletionRates} />;
      case 'locations':
        return <LocationChart data={reportData.usersByCity} />;
      case 'growth':
        return <UserGrowthChart data={reportData.userGrowth} />;
      default:
        return <SubjectsChart data={reportData.popularSubjects} />;
    }
  };

  return (
    <div className="admin-section reporting-section">
      <div className="report-controls">
        <div className="date-filters">
          <div className="filter-group">
            <label htmlFor="startDate">From:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="date-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="endDate">To:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="date-input"
            />
          </div>
        </div>
        <div className="report-types">
          <button
            className={`report-type-btn ${
              activeReport === 'subjects' ? 'active' : ''
            }`}
            onClick={() => setActiveReport('subjects')}
          >
            Popular Subjects
          </button>
          <button
            className={`report-type-btn ${
              activeReport === 'sessions' ? 'active' : ''
            }`}
            onClick={() => setActiveReport('sessions')}
          >
            Session Completion
          </button>
          <button
            className={`report-type-btn ${
              activeReport === 'locations' ? 'active' : ''
            }`}
            onClick={() => setActiveReport('locations')}
          >
            User Locations
          </button>
          <button
            className={`report-type-btn ${
              activeReport === 'growth' ? 'active' : ''
            }`}
            onClick={() => setActiveReport('growth')}
          >
            User Growth
          </button>
        </div>
      </div>

      <div className="report-container">{renderActiveChart()}</div>

      <div className="export-controls">
        <div className="export-label">Export Report:</div>
        <button className="export-btn" onClick={() => handleExport('csv')}>
          CSV
        </button>
        <button className="export-btn" onClick={() => handleExport('pdf')}>
          PDF
        </button>
        <button className="export-btn" onClick={() => handleExport('excel')}>
          Excel
        </button>
      </div>
    </div>
  );
};

export default ReportingDashboard;
