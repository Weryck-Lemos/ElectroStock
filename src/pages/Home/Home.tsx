import "./Home.css";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

export default function Home() {
  const navigate = useNavigate();
  const [mostrarSobre, setMostrarSobre] = useState(false);

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="logo">⚡ ElectroStock</div>
        <nav>
          <button className="link-btn" onClick={()=> setMostrarSobre(true)}>Sobre</button>
          <a href="https://github.com/Weryck-Lemos" target="_blank">Contato</a>
        </nav>
      </header>

      <div className="home-content">
        <h1 className="title">Gerencie seu estoque de forma inteligente</h1>
        <p className="subtitle">
          O <strong>ElectroStock</strong> conecta você ao seu estoque com tecnologia e praticidade.
        </p>

        <div className="buttons">
          <button onClick={()=> navigate("/login")} className="btn primary">
            🔑 Entrar
          </button>
          <button onClick={() => navigate("/registrar")} className="btn secondary">
            📝 Criar Conta
          </button>
        </div>
      </div>

      <footer className="footer">
        © 2025 ElectroStock — Desenvolvimento Web
      </footer>

      {mostrarSobre &&(
        <div className="sobre-overlay" onClick={()=> setMostrarSobre(false)}>
          <div className="sobre-box" onClick={(e)=>e.stopPropagation()}>
            <h2>Sobre o Projeto</h2>
            <p>Este site foi desenvolvido como parte da disciplina{" "}
              Desenvolvimento de Software para a Web da{" "}
              Universidade Federal do Ceará (UFC), semestre{" "}
              <strong>2025.2</strong>.
            </p> 
            <button onClick={()=>setMostrarSobre(false)} className="btn-fechar">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
