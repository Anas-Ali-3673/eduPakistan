import React from 'react';

const SessionsChart = ({ data }) => {
  // For a real application, use a proper charting library

  // Calculate totals for the pie chart
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="chart-container">
      <h3>Session Completion Rates</h3>

      {data.length === 0 ? (
        <p className="no-data-message">
          No data available for the selected period.
        </p>
      ) : (
        <div className="sessions-chart">
          <div className="pie-chart-container">
            <div className="pie-chart">
              {data.map((item, index) => {
                const startPercentage = data
                  .slice(0, index)
                  .reduce((sum, curr) => sum + (curr.count / total) * 100, 0);
                const percentage = (item.count / total) * 100;

                return (
                  <div
                    key={index}
                    className="pie-slice"
                    style={{
                      '--start-percentage': `${startPercentage}%`,
                      '--end-percentage': `${startPercentage + percentage}%`,
                      '--color': `hsl(${index * 60}, 70%, 50%)`,
                    }}
                    title={`${item.status}: ${item.count} (${percentage.toFixed(
                      1
                    )}%)`}
                  ></div>
                );
              })}
            </div>
          </div>

          <div className="chart-legend">
            {data.map((item, index) => (
              <div className="legend-item" key={index}>
                <div
                  className="legend-color"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                ></div>
                <div className="legend-label">
                  {item.status}: {item.count} (
                  {((item.count / total) * 100).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsChart;
