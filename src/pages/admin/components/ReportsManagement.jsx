import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './ReportsManagement.css';

const ReportsManagement = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, investigating, resolved, dismissed, all
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    investigating: 0,
    resolved: 0,
    dismissed: 0,
    total: 0,
  });

  // Review form state
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Add new state for creating reports
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReport, setNewReport] = useState({
    category: 'session-issue',
    reportedUser: '',
    description: '',
    status: 'pending',
  });
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Build query string based on filters
        let queryParams = '';
        if (filter !== 'all') {
          queryParams += `?status=${filter}`;
        }
        if (categoryFilter && filter !== 'all') {
          queryParams += `&category=${categoryFilter}`;
        } else if (categoryFilter) {
          queryParams += `?category=${categoryFilter}`;
        }

        const response = await fetch(
          `http://localhost:5000/api/reports${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        setReports(data.data || []);

        // Calculate statistics from the data
        const pendingCount = (data.data || []).filter(
          (rep) => rep.status === 'pending'
        ).length;
        const investigatingCount = (data.data || []).filter(
          (rep) => rep.status === 'investigating'
        ).length;
        const resolvedCount = (data.data || []).filter(
          (rep) => rep.status === 'resolved'
        ).length;
        const dismissedCount = (data.data || []).filter(
          (rep) => rep.status === 'dismissed'
        ).length;

        setStats({
          pending: pendingCount,
          investigating: investigatingCount,
          resolved: resolvedCount,
          dismissed: dismissedCount,
          total: (data.data || []).length,
        });
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.token) {
      fetchReports();
    }
  }, [currentUser, filter, categoryFilter]);

  // Add effect to fetch users when creating a new report
  useEffect(() => {
    const fetchUsers = async () => {
      if (!showCreateForm) return;

      setUsersLoading(true);
      try {
        const response = await fetch(
          'http://localhost:5000/api/users?role=all',
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsersList(data.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    if (showCreateForm && currentUser?.token) {
      fetchUsers();
    }
  }, [showCreateForm, currentUser]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedReport(null);
    setAdminNotes('');
    setActionSuccess(null);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setSelectedReport(null);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setActionSuccess(null);
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedReport) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${selectedReport._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({
            status,
            adminNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update report status`);
      }

      const data = await response.json();

      // Update the selected report with new data
      setSelectedReport(data.data);

      // Update reports list
      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === selectedReport._id ? data.data : report
        )
      );

      // Update stats
      setStats((prevStats) => {
        const oldStatus = selectedReport.status;
        return {
          ...prevStats,
          [oldStatus]: Math.max(0, prevStats[oldStatus] - 1),
          [status]: prevStats[status] + 1,
        };
      });

      setActionSuccess(`Report status updated to ${status} successfully`);

      // Clear success message after a delay
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error(`Error updating report status:`, err);
      setError(err.message || `Failed to update status. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Add handlers for creating new reports
  const handleCreateReport = () => {
    setShowCreateForm(true);
    setSelectedReport(null);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    setNewReport({
      category: 'session-issue',
      reportedUser: '',
      description: '',
      status: 'pending',
    });
  };

  const handleNewReportChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitNewReport = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/reports/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          ...newReport,
          createdBy: 'admin',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      const data = await response.json();

      // Update reports list
      setReports((prev) => [data.data, ...prev]);

      // Update stats
      setStats((prev) => ({
        ...prev,
        pending: prev.pending + 1,
        total: prev.total + 1,
      }));

      setActionSuccess('Report created successfully');
      setShowCreateForm(false);

      // Reset form
      setNewReport({
        category: 'session-issue',
        reportedUser: '',
        description: '',
        status: 'pending',
      });

      // Clear success message after a delay
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error creating report:', err);
      setError(err.message || 'Failed to create report. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderReportDetails = () => {
    if (showCreateForm) {
      return (
        <div className="create-report-form">
          {actionSuccess && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>{actionSuccess}</p>
            </div>
          )}

          <h3>Create New Report</h3>

          <form onSubmit={handleSubmitNewReport}>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={newReport.category}
                onChange={handleNewReportChange}
                required
              >
                <option value="inappropriate-behavior">
                  Inappropriate Behavior
                </option>
                <option value="session-issue">Session Issue</option>
                <option value="payment-dispute">Payment Dispute</option>
                <option value="technical-problem">Technical Problem</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reportedUser">User</label>
              {usersLoading ? (
                <div className="mini-loader">Loading users...</div>
              ) : (
                <select
                  id="reportedUser"
                  name="reportedUser"
                  value={newReport.reportedUser}
                  onChange={handleNewReportChange}
                  required
                >
                  <option value="">Select a user</option>
                  {usersList.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newReport.description}
                onChange={handleNewReportChange}
                rows={4}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCloseCreateForm}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-create"
                disabled={actionLoading}
              >
                {actionLoading ? 'Creating...' : 'Create Report'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (!selectedReport) {
      return (
        <div className="details-placeholder">
          <p>Select a report to view details or create a new one</p>
          <button className="btn-create-report" onClick={handleCreateReport}>
            Create New Report
          </button>
        </div>
      );
    }

    const reportDate = new Date(selectedReport.createdAt).toLocaleString();
    const resolvedDate = selectedReport.resolvedAt
      ? new Date(selectedReport.resolvedAt).toLocaleString()
      : null;

    return (
      <div className="report-details">
        {actionSuccess && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{actionSuccess}</p>
          </div>
        )}

        <h3>Report Details</h3>

        <div className="report-actions-header">
          <div className="report-id">ID: {selectedReport._id}</div>
          <div className="header-actions">
            <div className={`status-badge ${selectedReport.status}`}>
              {selectedReport.status}
            </div>
            <button
              className="btn-create-report small"
              onClick={handleCreateReport}
            >
              Create New Report
            </button>
          </div>
        </div>

        <div className="report-section">
          <h4>Category</h4>
          <div className="report-category">{selectedReport.category}</div>
        </div>

        <div className="report-section">
          <h4>Reporter</h4>
          <div className="user-info">
            <strong>{selectedReport.reporter?.name || 'Unknown'}</strong>
            <div>{selectedReport.reporter?.email}</div>
          </div>
        </div>

        <div className="report-section">
          <h4>Reported User</h4>
          <div className="user-info">
            <strong>{selectedReport.reportedUser?.name || 'Unknown'}</strong>
            <div>{selectedReport.reportedUser?.email}</div>
            <div className="user-role">
              {selectedReport.reportedUser?.role || 'Unknown role'}
            </div>
          </div>
        </div>

        {selectedReport.relatedSession && (
          <div className="report-section">
            <h4>Related Session</h4>
            <div className="session-info">
              <div>
                Date:{' '}
                {new Date(
                  selectedReport.relatedSession.date
                ).toLocaleDateString()}
              </div>
              <div>
                Time: {selectedReport.relatedSession.startTime} -{' '}
                {selectedReport.relatedSession.endTime}
              </div>
            </div>
          </div>
        )}

        <div className="report-section">
          <h4>Description</h4>
          <div className="report-description">{selectedReport.description}</div>
        </div>

        <div className="report-section">
          <h4>Submitted</h4>
          <div>{reportDate}</div>
        </div>

        {resolvedDate && (
          <div className="report-section">
            <h4>Resolved Date</h4>
            <div>{resolvedDate}</div>
          </div>
        )}

        {selectedReport.status !== 'resolved' &&
          selectedReport.status !== 'dismissed' && (
            <div className="admin-actions">
              <div className="comment-section">
                <h4>Admin Notes</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report (optional)"
                  rows={3}
                />
              </div>

              <div className="action-buttons">
                {selectedReport.status === 'pending' && (
                  <button
                    className="btn-investigating"
                    onClick={() => handleStatusUpdate('investigating')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Mark As Investigating'}
                  </button>
                )}
                <button
                  className="btn-resolve"
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Resolve Report'}
                </button>
                <button
                  className="btn-dismiss"
                  onClick={() => handleStatusUpdate('dismissed')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Dismiss Report'}
                </button>
              </div>
            </div>
          )}

        {selectedReport.adminNotes && (
          <div className="report-section">
            <h4>Admin Notes</h4>
            <div className="admin-notes">{selectedReport.adminNotes}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="reports-management-container">
      <div className="reports-stats">
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card investigating">
          <div className="stat-value">{stats.investigating}</div>
          <div className="stat-label">Investigating</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card dismissed">
          <div className="stat-value">{stats.dismissed}</div>
          <div className="stat-label">Dismissed</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      <div className="reports-content">
        <div className="reports-list-container">
          <div className="filters-header">
            <h3>Admin Reports</h3>
            <div className="filter-controls">
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${
                    filter === 'pending' ? 'active' : ''
                  }`}
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending
                </button>
                <button
                  className={`filter-btn ${
                    filter === 'investigating' ? 'active' : ''
                  }`}
                  onClick={() => handleFilterChange('investigating')}
                >
                  Investigating
                </button>
                <button
                  className={`filter-btn ${
                    filter === 'resolved' ? 'active' : ''
                  }`}
                  onClick={() => handleFilterChange('resolved')}
                >
                  Resolved
                </button>
                <button
                  className={`filter-btn ${
                    filter === 'dismissed' ? 'active' : ''
                  }`}
                  onClick={() => handleFilterChange('dismissed')}
                >
                  Dismissed
                </button>
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
              </div>

              <div className="category-filter">
                <select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="inappropriate-behavior">
                    Inappropriate Behavior
                  </option>
                  <option value="session-issue">Session Issue</option>
                  <option value="payment-dispute">Payment Dispute</option>
                  <option value="technical-problem">Technical Problem</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="reports-list">
            {isLoading ? (
              <div className="loading-indicator">
                <div className="loader"></div>
                <p>Loading reports...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : reports.length === 0 ? (
              <div className="empty-state">
                <p>No {filter !== 'all' ? filter : ''} reports found.</p>
                <button
                  className="btn-create-report"
                  onClick={handleCreateReport}
                >
                  Create New Report
                </button>
              </div>
            ) : (
              <ul className="reports-items">
                {reports.map((report) => (
                  <li
                    key={report._id}
                    className={`report-item ${
                      selectedReport && selectedReport._id === report._id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleReportSelect(report)}
                  >
                    <div className="report-item-header">
                      <div className="report-category-badge">
                        {report.category}
                      </div>
                      <span className={`status-badge ${report.status}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="report-item-info">
                      <h4>
                        {report.reportedUser?.name
                          ? `Report against ${report.reportedUser.name}`
                          : 'Report'}
                      </h4>
                      <p className="report-date">
                        Created:{' '}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="report-details-container">{renderReportDetails()}</div>
      </div>
    </div>
  );
};

export default ReportsManagement;
