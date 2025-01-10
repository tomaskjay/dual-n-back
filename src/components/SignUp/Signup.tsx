import "./Signup.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
    const [name, setName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  return (
    <div className="register-form-container">
      <div className="header-register-form">
        <h1>Register</h1>
      </div>
      <div className="register-input-fields">
        <form className="register-form">
          <div className="register-form-input">
            <label htmlFor="name">First Name:</label>
            <input
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
              className="input-register"
              placeholder="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="register-button-register">Register</button>
        </form>
        <Link to="/login" className="toLogin-form">Already have an account?</Link>
      </div>
    </div>
  );
}

export default Signup;