import React from "react";
import { Form, Row } from "react-bootstrap";
import CommonInput from "../../Common/CommonInput/CommonInput";
import CommonButton from "../../Common/CommonButton/CommonButton";
import SignUpIcon from "../../../assets/images/svgIcons/sign.svg";
import "./SignUp.scss";

const SignUp = () => {
  return (
    <div className="signup-container">
      <h2 className="signup-container_title">SignUp</h2>
      <div className="left-section">
        {" "}
        <Form className="signup-container_left-section_signup-form">
          <Row className="mb-3">
            <CommonInput
              label="Name"
              type="text"
              name="fullName"
              placeholder="Enter your email"
              onChange={(e) => console.log(e.target.value)}
            />
          </Row>
          <Row className="mb-3">
            <CommonInput
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={(e) => console.log(e.target.value)}
            />
          </Row>
          <Row className="mb-3">
            <CommonInput
              label="Password"
              type="text"
              name="password"
              placeholder="Enter your Password"
              onChange={(e) => console.log(e.target.value)}
            />
          </Row>
          <Row className="mb-3">
            <CommonInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              onChange={(e) => console.log(e.target.value)}
            />
          </Row>
          <CommonButton>Sign Up</CommonButton>
        </Form>
      </div>
      <div className="signup-container_right-section">
        <img src={SignUpIcon} alt="signup" height="100%" width="60%" />
      </div>
    </div>
  );
};

export default SignUp;
