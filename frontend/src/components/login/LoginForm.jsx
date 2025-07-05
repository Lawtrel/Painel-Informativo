import { useState } from 'react';
import { User } from '../../model/userModel.js';
import LoginInput from './LoginInput.jsx';
import LoginButton from './LoginButton.jsx';
import ErrorMessage from './ErrorMessage.jsx';

function LoginForm({ loading, error, onSubmit }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tempUser = new User({
      username: formData.username,
      password: formData.password
    });

    if (!tempUser.username || !formData.password) {
      return;
    }

    onSubmit(formData.username, formData.password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <LoginInput
        id="username"
        name="username"
        type="text"
        value={formData.username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        placeholder="Digite seu usuário"
        icon="fas fa-user"
        label="Usuário"
        required
      />

      <LoginInput
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        placeholder="Digite sua senha"
        icon="fas fa-lock"
        label="Senha"
        required
      />

      <LoginButton loading={loading} />
    </form>
  );
}

export default LoginForm; 