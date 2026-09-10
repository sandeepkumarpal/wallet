type FieldErrorProps = {
  message?: string;
  id?: string;
};

const FieldError = ({ message, id }: FieldErrorProps) => {
  if (!message) return null;
  return (
    <span id={id} className="field-error" role="alert">
      {message}
    </span>
  );
};

export default FieldError;
