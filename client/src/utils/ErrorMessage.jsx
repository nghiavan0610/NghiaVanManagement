const ErrorMessage = ({ msg = 'Vui lòng điền trường này!' }) => {
  return <span className='text-sm text-red-500'>{msg}</span>;
};

export default ErrorMessage;
