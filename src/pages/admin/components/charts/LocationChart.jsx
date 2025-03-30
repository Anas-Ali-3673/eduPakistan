import React from 'react';

const LocationChart = ({ data }) => {
  const maxValue =
    data.length > 0 ? Math.max(...data.map((item) => item.count)) : 0;

  return (
    <div className="chart-container">
      <h3>Users by Location</h3>

      {data.length === 0 ? (
        <p className="no-data-message">
          No data available for the selected period.
        </p>
      ) : (
        <div className="locations-chart">
          <div className="horizontal-bar-chart">
            {data.map((item, index) => (
              <div className="chart-item" key={index}>
                <div className="chart-label">{item.city}</div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(item.count / maxValue) * 100}%`,
                      backgroundColor: `hsl(200, ${
                        (index % 3) * 20 + 50
                      }%, 50%)`,
                    }}
                  ></div>
                  <span className="chart-value">{item.count} users</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationChart;
