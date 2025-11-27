import { useNavigate, Link } from "react-router-dom";
import userIcon from "./imagens/user.png";
import mailIcon from "./imagens/mail.png";
import lockIcon from "./imagens/lock.png";
import wallpaper from "../../imagens/wallpaper.jpg";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-full flex justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <div className="relative w-[450px] bg-white/10 backdrop-blur-md p-12 rounded-3xl shadow-2xl text-center animate-[slideIn_0.6s_ease]">
        <Link
          to="/"
          className="absolute top-4 left-5 text-white text-2xl bg-white/20 px-3 py-1 rounded-lg hover:bg-white/40 transition-transform duration-200 hover:scale-110"
        >
          ←
        </Link>

        <img
          src={userIcon}
          alt="User"
          className="w-[90px] h-[90px] mx-auto mb-2 drop-shadow-[3px_3px_3px_rgba(0,0,0,0.4)]"
        />

        <h2 className="text-3xl mb-6 text-white font-semibold drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)]">
          BEM-VINDO!
        </h2>

        <div className="flex items-center border border-white/50 rounded-xl px-3 py-2 bg-white/30 mb-3">
          <img src={mailIcon} alt="mail" className="w-[22px] mr-2" />
          <input
            type="email"
            placeholder="Email"
            className="flex-1 bg-transparent text-white placeholder-white/80 focus:outline-none text-[15px]"
          />
        </div>

        <div className="flex items-center border border-white/50 rounded-xl px-3 py-2 bg-white/30 mb-4">
          <img src={lockIcon} alt="lock" className="w-[22px] mr-2" />
          <input
            type="password"
            placeholder="Senha"
            className="flex-1 bg-transparent text-white placeholder-white/80 focus:outline-none text-[15px]"
          />
        </div>

        <div className="flex justify-between text-white text-[15px] mb-4">
          <label className="flex items-center gap-1">
            <input type="checkbox" /> Lembre-se de mim
          </label>
          <Link to="/registrar" className="underline hover:text-blue-200 transition">
            Registrar
          </Link>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 text-lg bg-white/90 text-blue-700 rounded-xl hover:scale-105 hover:bg-white transition-all duration-300 font-semibold"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
