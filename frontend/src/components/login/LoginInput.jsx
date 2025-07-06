import { useState } from 'react';

function LoginInput({ 
  id, 
  name,
  type, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  label, 
  required,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="block text-sm font-semibold text-gray-700 hover:text-[#003366] transition-colors duration-200"
      >
        <i className={`${icon} mr-2 text-[#003366]`}></i>
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className={`${icon} text-gray-400 group-focus-within:text-[#003366] transition-colors duration-200`}></i>
        </div>
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-gray-400"
          placeholder={placeholder}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#003366] transition-colors duration-200 cursor-pointer"
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        )}
      </div>
    </div>
  );
}

export default LoginInput; 