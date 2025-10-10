import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import CommonInput from "../../Common/CommonInput/CommonInput";
import CommonButton from "../../Common/CommonButton/CommonButton";
import LoginIcon from "../../../assets/images/svgIcons/profile.svg";
import "./Profile.scss";

const Profile = () => {
  return (
    <div className="add-profile-form">
      <div>
        {" "}
        <Form className="transaction-form">
          <h3>Profile</h3>
          <Row className="mb-3">
            <Col md={6}>
              <CommonInput
                label="Name"
                type="number"
                placeholder="Enter amount"
                onChange={(e) => console.log(e.target.value)}
              />
            </Col>

            <Col md={6}>
              {" "}
              <CommonInput
                label="Email"
                type="text"
                placeholder="Enter description"
                onChange={(e) => console.log(e.target.value)}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <CommonInput
                label="Date Of Birth"
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
      <div>
        <img src={LoginIcon} alt="login" height="80%" width="70%" />
      </div>
    </div>
  );
};

export default Profile;
