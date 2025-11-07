import "./Login.css";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import userIcon from "./imagens/user.png";
import mailIcon from "./imagens/mail.png";
import lockIcon from "./imagens/lock.png";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="login-container">
      <div className="login-box">

        <Link to="/" className="back-arrow">←</Link>
        <img src={userIcon} className="login-user-icon" />
        <h2>BEM-VINDO!</h2>

        <div className="input-group">
          <img src={mailIcon} className="icon" />
          <input type="email" placeholder="Email" />
        </div>

        <div className="input-group">
          <img src={lockIcon} className="icon" />
          <input type="password" placeholder="Senha" />
        </div>

        <div className="extras">
          <label>
            <input type="checkbox" /> Lembre-se de mim
          </label>
          <Link to="/registrar">Registrar</Link>
        </div>

        <button onClick={() => navigate("/dashboard")} className="btn-login">Entrar</button>
      </div>
    </div>
  );
}
