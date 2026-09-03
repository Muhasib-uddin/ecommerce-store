import React from "react";
import PropTypes from "prop-types";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

const StackedColumnChart = ({ dataColors, periodData }) => {
  const chartColors = getChartColorsArray(dataColors || '["--bs-primary", "--bs-success"]');

  const series = (periodData && periodData.length > 0)
    ? periodData
    : [
        {
          name: "Revenue ($)",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: "Orders",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ];

  const options = {
    chart: {
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Revenue ($)",
          style: { color: "#556ee6" },
        },
        labels: {
          formatter: (value) => `$${Number(value || 0).toLocaleString()}`,
        },
      },
      {
        opposite: true,
        title: {
          text: "Orders Count",
          style: { color: "#34c38f" },
        },
        labels: {
          formatter: (value) => Number(value || 0).toFixed(0),
        },
      },
    ],
    colors: chartColors,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val, opts) => {
          if (opts.seriesIndex === 0) {
            return `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
          return `${val} orders`;
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  return (
    <React.Fragment>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height="359"
        className="apex-charts"
      />
    </React.Fragment>
  );
};

StackedColumnChart.propTypes = {
  dataColors: PropTypes.string,
  periodData: PropTypes.any,
};

export default StackedColumnChart;

