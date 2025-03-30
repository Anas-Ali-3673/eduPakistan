import React from 'react';

const SubjectsChart = ({ data }) => {
  // In a real application, this would use a charting library like Chart.js or Recharts
  // For now, we'll create a simple visual representation

  const maxValue =
    data.length > 0 ? Math.max(...data.map((item) => item.count)) : 0;

  return (
    <div className="chart-container">
      <h3>Popular Subjects</h3>

      {data.length === 0 ? (
        <p className="no-data-message">
          No data available for the selected period.
        </p>
      ) : (
        <div className="horizontal-bar-chart">
          {data.map((item, index) => (
            <div className="chart-item" key={index}>
              <div className="chart-label">{item.subject}</div>
              <div className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    width: `${(item.count / maxValue) * 100}%`,
                    backgroundColor: `hsl(${index * 25}, 70%, 60%)`,
                  }}
                ></div>
                <span className="chart-value">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectsChart;
