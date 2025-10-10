import React from "react";
import { Form, Row } from "react-bootstrap";
import CommonInput from "../../Common/CommonInput/CommonInput";
import CommonButton from "../../Common/CommonButton/CommonButton";
import LoginIcon from "../../../assets/images/svgIcons/login.svg";
import "./Login.scss";
import axios from "axios";
import API_URLS from "../../../utils/Apiurls";

const Login = () => {
  const handleLogin = async () => {
    const response: any = await axios.post(API_URLS.LOGIN_USER, {
      email: "sandeep@gmail.com",
      password: "Test@123",
    });
    console.log(response);
  };
  return (
    <div className="login-container">
      <h2 className="login-container_title">Login</h2>
      <div className="left-section">
        {" "}
        <Form className="login-container_left-section_login-form">
          <Row className="mb-3">
            <CommonInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              onChange={(e) => console.log(e.target.value)}
            />
          </Row>
          <Row className="mb-3">
            <CommonInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              onChange={(e) => console.log(e.target.value)}
            />
          </Row>
          <CommonButton onClick={handleLogin}>Login</CommonButton>
        </Form>
      </div>
      <div className="login-container_right-section">
        <img src={LoginIcon} alt="login" height="80%" width="70%" />
      </div>
    </div>
  );
};

export default Login;
