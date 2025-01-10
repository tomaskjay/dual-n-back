import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signin.css";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  
  return (
    <div className="signin-form-container">
      <div className="header-signin-form">
        <h1>Login</h1>
      </div>
      <div className="signin-input-fields">
        <form className="signin-form">
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
          <button className="signin-button">Login</button>
        </form>
        <Link to="/register" className="toRegister-form-text">Don&apos;t have an account?</Link>
      </div>
    </div>
  );
}

export default Signin;