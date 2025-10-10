import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from "recharts";

import { Col, Row } from "react-bootstrap";
import "./Dashboard.scss";
const data = [{name: 'Page A', uv: 900, pv: 2400, amt: 2400},{name: 'Page B', uv: 100, pv: 2400, amt: 2400},{name: 'Page C', uv: 700, pv: 2400, amt: 2400},{name: 'Page D', uv: 50, pv: 2400, amt: 2400}];
const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* <h2 className="dashboard-title">Dashboard</h2> */}
      <Row>
        <Col md={6}>
          <div className="dashboard-container_left-section">
            <h3>Total Expence</h3>
            <Row className="mb-3">
              <Col>This Month</Col>
              <Col>4000 Rs</Col>
            </Row>
            <Row className="mb-3">
              <Col>Last Month</Col>
              <Col>2000 Rs</Col>
            </Row>
          </div>
        </Col>
        <Col md={6}>
          <div className="dashboard-container_right-section">
            <LineChart
              width={700}
              height={500}
              data={data}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="uv"
                stroke="purple"
                strokeWidth={2}
                name="My data series name"
              />
              <XAxis dataKey="name" />
              <YAxis
                width="auto"
                label={{ value: "UV", position: "insideLeft", angle: -90 }}
              />
              <Legend align="right" />
              <Tooltip />
            </LineChart>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
