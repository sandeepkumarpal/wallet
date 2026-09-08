import React from "react";
import Form from "react-bootstrap/Form";

interface CommonInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isInvalid?: boolean;
  feedback?: string;
  error?: string; // Added error prop
}

const CommonInput: React.FC<CommonInputProps> = ({
  label,
  type = "text",
  placeholder = "",
  value,
  name = "",
  onChange,
  disabled = false,
  isInvalid = false,
  feedback,
  error, // Added error prop
}) => (
  <Form.Group className="mb-3" controlId={`commonInput-${label}`}>
    {label && <Form.Label>{label}</Form.Label>}
    <Form.Control
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      isInvalid={isInvalid || !!error}
      style={{
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        fontSize: "1rem",
        padding: "0.75rem 1rem",
      }}
    />
    {(feedback || error) && (
      <Form.Control.Feedback type="invalid">
        {error || feedback}
      </Form.Control.Feedback>
    )}
  </Form.Group>
);

export default CommonInput;
