import "./Login.css";
import {Link} from "react-router-dom";
import userIcon from "./imagens/user.png";
import mailIcon from "./imagens/mail.png";
import lockIcon from "./imagens/lock.png";

export default function Registrar() {
  return (
    <div className="login-container">
      <div className="login-box">

        <Link to="/" className="back-arrow">←</Link>

        <img src={userIcon} className="login-user-icon" />
        <h2>CRIAR CONTA</h2>

        <div className="input-group">
          <img src={userIcon} className="icon" />
          <input type="text" placeholder="Nome completo" />
        </div>

        <div className="input-group">
          <img src={mailIcon} className="icon" />
          <input type="email" placeholder="Email" />
        </div>

        <div className="input-group">
          <img src={lockIcon} className="icon" />
          <input type="password" placeholder="Senha" />
        </div>

        <div className="input-group">
          <img src={lockIcon} className="icon" />
          <input type="password" placeholder="Confirmar senha" />
        </div>

        <button className="btn-login">Registrar</button>

        <div className="extras">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
