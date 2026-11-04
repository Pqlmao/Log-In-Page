const LoginPage = ({ onLogin, error, isLoading }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0B0E14] overflow-hidden font-sans">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[400px] bg-[#151923] rounded-2xl border border-gray-800/50 shadow-2xl p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-1 mb-6">
            <span className="text-xl font-bold text-white tracking-wide">
              My
              <span className="bg-gradient-to-r from-[#A855F7] via-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
                Play
              </span>
              List
            </span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-gray-400">
            Masuk untuk melanjutkan petualangan Anda.
          </p>
        </div>

        {/* Form Section */}
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onLogin({
              email: formData.get("email"),
              password: formData.get("password"),
            });
          }}
        >
          {/* Email Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[11px] font-semibold text-gray-400 tracking-wider"
            >
              EMAIL
            </label>
            <div className="relative flex items-center bg-[#1A1F2C] rounded-lg border border-gray-700/50 focus-within:border-indigo-500 transition-colors">
              <div className="absolute left-3 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                placeholder="Masukkan email Anda"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 py-3 pl-10 pr-4 outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold text-gray-400 tracking-wider"
              >
                KATA SANDI
              </label>
              <a
                href="#"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Lupa sandi?
              </a>
            </div>
            <div className="relative flex items-center bg-[#1A1F2C] rounded-lg border border-gray-700/50 focus-within:border-indigo-500 transition-colors">
              <div className="absolute left-3 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 py-3 pl-10 pr-10 outline-none"
              />
              <button
                type="button"
                className="absolute right-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex items-center justify-center cursor-pointer">
              <input
                type="checkbox"
                className="peer appearance-none w-4 h-4 bg-[#1A1F2C] border border-gray-700/50 rounded checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer"
              />
              <svg
                className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <label className="text-xs text-gray-400 cursor-pointer">
              Ingat saya di perangkat ini
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-400 hover:via-purple-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60 text-white font-medium py-3 rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] mt-2"
          >
            {isLoading ? "Memeriksa..." : "Masuk Sekarang ➔"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <div className="h-px bg-gray-800 flex-1"></div>
          <span className="text-[10px] font-semibold text-gray-500 tracking-wider px-4">
            ATAU MASUK DENGAN
          </span>
          <div className="h-px bg-gray-800 flex-1"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[#1A1F2C] hover:bg-[#232938] border border-gray-700/50 text-white text-xs font-medium py-2.5 rounded-lg transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path
                  fill="#4285F4"
                  d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                />
                <path
                  fill="#34A853"
                  d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                />
                <path
                  fill="#EA4335"
                  d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                />
              </g>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[#1A1F2C] hover:bg-[#232938] border border-gray-700/50 text-white text-xs font-medium py-2.5 rounded-lg transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
            Discord
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Belum memiliki akun?{" "}
            <a
              href="#"
              className="text-white font-medium hover:text-indigo-400 transition-colors"
            >
              Daftar Gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
