import "./Signup.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { putItem } from '../utils/dynamoUtils';

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const saveUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const newUser = {
        email,
        name,
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await putItem("gameBuilder", newUser);
      alert("You have been successfully registered!")
      navigate('/login');
    } catch (err: any) {
      if (err.message === 'EmailExistsError') {
        setError('An account with this email already exists');
      } else {
        setError('Error registering user. Please try again.');
        console.error('Error Registering User:', err);
      }
    }
  };

  return (
    <div className="register-form-container">
      <div className="header-register-form">
        <h1>Register</h1>
      </div>
      <div className="register-input-fields">
        <form className="register-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="register-form-input">
            <label htmlFor="name">First Name:</label>
            <input
              id="name"
              className="input-register"
              placeholder="First Name"
              autoComplete="off"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="register-form-input">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              className="input-register"
              placeholder="Email"
              autoComplete="off"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="register-form-input">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              className="input-register"
              placeholder="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            onClick={saveUser} 
            className="register-button-register"
          >
            Register
          </button>
        </form>
        <Link to="/login" className="toLogin-form">
          Already have an account?
        </Link>
      </div>
    </div>
  );
}

export default Signup;