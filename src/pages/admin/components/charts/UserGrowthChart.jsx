import React from 'react';

const UserGrowthChart = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3>User Growth Over Time</h3>
        <p className="no-data-message">
          No data available for the selected period.
        </p>
      </div>
    );
  }

  // Find max value to scale the chart
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.students || 0, item.tutors || 0))
  );

  return (
    <div className="chart-container">
      <h3>User Growth Over Time</h3>

      <div className="line-chart-container">
        <div className="line-chart">
          <div className="chart-grid">
            {/* Horizontal grid lines */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid-line horizontal"
                style={{ bottom: `${i * 25}%` }}
              ></div>
            ))}
          </div>

          <div className="chart-lines">
            <svg
              className="line-svg"
              viewBox={`0 0 ${(data.length - 1) * 100 + 20} 100`}
              preserveAspectRatio="none"
            >
              {/* Students line */}
              <polyline
                className="line students-line"
                points={data
                  .map(
                    (item, index) =>
                      `${index * 100}, ${
                        100 - ((item.students || 0) / maxValue) * 100
                      }`
                  )
                  .join(' ')}
              />

              {/* Tutors line */}
              <polyline
                className="line tutors-line"
                points={data
                  .map(
                    (item, index) =>
                      `${index * 100}, ${
                        100 - ((item.tutors || 0) / maxValue) * 100
                      }`
                  )
                  .join(' ')}
              />

              {/* Data points */}
              {data.map((item, index) => (
                <React.Fragment key={index}>
                  {/* Student data point */}
                  <circle
                    className="data-point student-point"
                    cx={index * 100}
                    cy={100 - ((item.students || 0) / maxValue) * 100}
                    r="4"
                  />

                  {/* Tutor data point */}
                  <circle
                    className="data-point tutor-point"
                    cx={index * 100}
                    cy={100 - ((item.tutors || 0) / maxValue) * 100}
                    r="4"
                  />
                </React.Fragment>
              ))}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="x-axis">
            {data.map((item, index) => (
              <div
                key={index}
                className="x-label"
                style={{ left: `${(index / (data.length - 1)) * 100}%` }}
              >
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="y-axis">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="y-label" style={{ bottom: `${i * 25}%` }}>
                {Math.round((maxValue * i) / 4)}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color students"></div>
            <div className="legend-label">Students</div>
          </div>
          <div className="legend-item">
            <div className="legend-color tutors"></div>
            <div className="legend-label">Tutors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;
