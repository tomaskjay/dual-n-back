import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authenticateUser } from '../utils/authUtils';
import "./Signin.css";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const user = await authenticateUser(email, password);
      
      // Store user data in localStorage or state management solution
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to game page
      navigate('/game');
    } catch (err: any) {
      if (err.message === 'User not found') {
        setError('No account found with this email');
      } else if (err.message === 'Invalid password') {
        setError('Incorrect password');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    }
  };

  return (
    <div className="signin-form-container">
      <div className="header-signin-form">
        <h1>Login</h1>
      </div>
      <div className="signin-input-fields">
        <form className="signin-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="signin-form-input">
            <label>Email:</label>
            <input
              className="input-signin"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="signin-form-input">
            <label>Password:</label>
            <input
              className="input-signin"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            className="signin-button"
            onClick={handleLogin}
          >
            Login
          </button>
        </form>
        <Link to="/register" className="toRegister-form-text">
          Don&apos;t have an account?
        </Link>
      </div>
    </div>
  );
}

export default Signin;