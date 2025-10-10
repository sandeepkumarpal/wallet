import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import CommonTable from "../../Common/CommonTable/CommonTable";
import "./Transaction.scss";
import { Col, Form, Row } from "react-bootstrap";
import CommonInput from "../../Common/CommonInput/CommonInput";
import CommonButton from "../../Common/CommonButton/CommonButton";

const Transaction = () => {
  const [activeKey, setActiveKey] = useState("1");

  const handleSelect = (selectedKey: string | null) => {
    if (selectedKey) {
      setActiveKey(selectedKey);
    }
  };

  const fields = [
    { key: "Amount", label: "Amount" },
    { key: "Description", label: "Description" },
    { key: "Date", label: "Date" },
  ];

  return (
    <div className="transaction-container">
      <Nav
        className="transaction-container_menus"
        variant="pills"
        activeKey={activeKey}
        onSelect={handleSelect}
      >
        <Nav.Item>
          <Nav.Link eventKey="1">Transactions</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="2">Add New Transaction</Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="mt-4 transaction-table">
        {activeKey === "1" && (
          <div>
            <h3>Transaction History</h3>
            <CommonTable
              fields={fields}
              data={[
                { Amount: "100", Description: "Groceries", Date: "2024-06-01" },
                { Amount: "50", Description: "Transport", Date: "2024-06-02" },
                { Amount: "100", Description: "Groceries", Date: "2024-06-01" },
                { Amount: "50", Description: "Transport", Date: "2024-06-02" },
                { Amount: "100", Description: "Groceries", Date: "2024-06-01" },
                { Amount: "50", Description: "Transport", Date: "2024-06-02" },
              ]}
            />
          </div>
        )}

        {activeKey === "2" && (
          <div className="add-transaction-form">
            <h3>Add a New Transaction</h3>
            <Form className="transaction-form">
              <Row className="mb-3">
                <Col md={6}>
                  <CommonInput
                    label="Amount"
                    type="number"
                    placeholder="Enter amount"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Col>

                <Col md={6}>
                  {" "}
                  <CommonInput
                    label="Description"
                    type="text"
                    placeholder="Enter description"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <CommonInput
                    label="Date"
                    type="date"
                    placeholder="Select date"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Col>

                <Col md={6}>
                  <CommonInput
                    label="Category"
                    type="text"
                    placeholder="Enter category"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  {" "}
                  <CommonInput
                    label="Payment Method"
                    type="text"
                    placeholder="Enter payment method"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  {" "}
                  <CommonInput
                    label="Notes"
                    type="text"
                    placeholder="Enter any notes"
                    onChange={(e) => console.log(e.target.value)}
                  />
                </Col>
              </Row>
              <CommonButton className="submit-btn">Submit</CommonButton>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transaction;
