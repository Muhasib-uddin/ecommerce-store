import React from "react";
import PropTypes from "prop-types";
import ReactApexChart from "react-apexcharts";
import "./dashboard.scss";
import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

const ApexRadial = ({ dataColors, value = 100, label = "Fulfilled" }) => {
  const apexRadialColors = getChartColorsArray(dataColors || '["--bs-primary"]');
  const series = [Math.min(100, Math.max(0, Math.round(value)))];

  const options = {
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: "13px",
            color: "#74788d",
            offsetY: 60,
          },
          value: {
            offsetY: 22,
            fontSize: "18px",
            color: "#495057",
            formatter: function (e) {
              return e + "%";
            },
          },
        },
      },
    },
    colors: apexRadialColors,
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        shadeIntensity: 0.15,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91],
      },
    },
    stroke: {
      dashArray: 4,
    },
    labels: [label],
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radialBar"
      height="200"
      className="apex-charts"
    />
  );
};

ApexRadial.propTypes = {
  dataColors: PropTypes.string,
  value: PropTypes.number,
  label: PropTypes.string,
};

export default ApexRadial;

