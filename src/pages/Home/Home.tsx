import { useNavigate } from "react-router-dom";
import { useState } from "react";
import wallpaper from "../../imagens/wallpaper.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [mostrarSobre, setMostrarSobre] = useState(false);

  return (
    <div
      className="h-screen w-full flex flex-col bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <header className="flex justify-between items-center px-10 py-6 bg-black/40 backdrop-blur-md shadow-md">
        <div className="text-2xl font-bold tracking-wide">⚡ ElectroStock</div>
        <nav className="flex gap-6 text-lg font-medium">
          <button
            onClick={() => setMostrarSobre(true)}
            className="hover:text-blue-300 transition-colors"
          >
            Sobre
          </button>
          <a
            href="https://github.com/Weryck-Lemos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-300 transition-colors"
          >
            Contato
          </a>
        </nav>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <div className="bg-black/40 backdrop-blur-md p-10 rounded-3xl shadow-lg max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 drop-shadow-lg">
            Gerencie seu estoque de forma inteligente
          </h1>
          <p className="text-lg max-w-2xl mb-10 text-white/90 leading-relaxed">
            O <strong>ElectroStock</strong> conecta você ao seu estoque com tecnologia e praticidade.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-white/90 text-blue-700 font-semibold rounded-xl hover:scale-105 hover:bg-white transition-all duration-300"
            >
              🔑 Entrar
            </button>
            <button
              onClick={() => navigate("/registrar")}
              className="px-8 py-3 bg-blue-600/80 hover:bg-blue-600 font-semibold rounded-xl hover:scale-105 transition-all duration-300"
            >
              📝 Criar Conta
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 bg-black/40 backdrop-blur-sm text-sm">
        © 2025 ElectroStock — Desenvolvimento Web
      </footer>

      {mostrarSobre && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm z-50"
          onClick={() => setMostrarSobre(false)}
        >
          <div
            className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg text-center max-w-lg mx-4 border border-white/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Sobre o Projeto
            </h2>
            <p className="text-white/90 mb-6 leading-relaxed">
              Este site foi desenvolvido como parte da disciplina{" "}
              <strong>Desenvolvimento de Software para a Web</strong> da{" "}
              <strong>Universidade Federal do Ceará (UFC)</strong>, semestre{" "}
              <strong>2025.2</strong>.
            </p>
            <button
              onClick={() => setMostrarSobre(false)}
              className="px-6 py-2 bg-white/90 text-blue-700 font-semibold rounded-lg hover:scale-105 hover:bg-white transition-all duration-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
