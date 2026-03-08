// src/pages/LoginPage.tsx

import { useState } from "react";
import { useTrainerLogin } from "../controllers/trainerAuth";
import { useSendOtp, useVerifyOtp } from "../controllers/traineeAuth";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Tab = "trainer" | "trainee";
type TraineeStep = "phone" | "otp";

export default function LoginPage() {
  // --- Tab State ---
  const [activeTab, setActiveTab] = useState<Tab>("trainer");

  // --- Trainer Form ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- Trainee Form ---
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [traineeStep, setTraineeStep] = useState<TraineeStep>("phone");

  // --- Error ---
  const [error, setError] = useState("");

  // --- Auth ---
  const { loginTrainer, loginTrainee } = useAuth();
  const trainerLogin = useTrainerLogin();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  // --- Handlers ---

  const handleTrainerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    trainerLogin.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          loginTrainer(data.token, data.trainer);
        },
        onError: (err) => {
          setError(err.response?.data?.message || "Login failed");
        },
      },
    );
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    sendOtp.mutate(
      { phone },
      {
        onSuccess: () => {
          setTraineeStep("otp");
        },
        onError: (err) => {
          setError(err.response?.data?.message || "Failed to send OTP");
        },
      },
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required");
      return;
    }

    verifyOtp.mutate(
      { phone, otp },
      {
        onSuccess: (data) => {
          loginTrainee(data.token, data.trainee);
        },
        onError: (err) => {
          setError(err.response?.data?.message || "Verification failed");
        },
      },
    );
  };

  const handleBackToPhone = () => {
    setTraineeStep("phone");
    setOtp("");
    setError("");
  };

  // Replace the return in LoginPage (everything inside the root div)

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* ===== Animated Wave Background ===== */}
      <WaveBackground />

      {/* ===== Left Content (Green Side) ===== */}
      <div className="relative z-10 flex w-[55%] flex-col justify-between p-8 md:p-12 lg:p-16">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
              <span className="text-base font-bold text-white">S</span>
            </div>
            <span className="text-xs font-medium leading-tight text-white/80">
              Learning
              <br />
              Management
            </span>
          </div>

          <h1 className="mb-4 font-mono text-5xl font-black tracking-[0.2em] text-white md:text-6xl">
            SkillBridge
          </h1>

          <p className="max-w-sm text-sm leading-relaxed text-emerald-100/80 md:text-base">
            Our goal is to continuously improve the quality and accessibility of
            training programs using modern digital tools.
          </p>
        </div>

        <div className="mt-auto">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white">
              ED
            </div>
            <div className="h-5 w-px bg-white/30" />
            <div className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white">
                S
              </div>
              <span className="text-[10px] leading-tight text-white/60">
                Learning
                <br />
                Management
              </span>
            </div>
          </div>
          <p className="max-w-md text-[11px] leading-relaxed text-emerald-200/50">
            This Learning Management System is designed by a dedicated team of
            educators and developers to deliver high-quality training
            experiences.
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-300/60">
            <a href="#" className="underline hover:text-emerald-300">
              Contribute on Github
            </a>
            <span>|</span>
            <a href="#" className="underline hover:text-emerald-300">
              Third Party Software Licenses
            </a>
          </div>
        </div>
      </div>

      {/* ===== Right Login Card (White Side) ===== */}
      <div className="relative z-10 flex w-[45%] flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm rounded-xl border-2 border-gray-100 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900">Welcome back!</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Choose your login method to continue
          </p>

          {/* --- Tabs --- */}
          <div className="mt-4 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => {
                setActiveTab("trainer");
                setError("");
              }}
              className={`flex-1 rounded-md py-2 text-center text-xs font-medium transition-all ${
                activeTab === "trainer"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Log in as Trainer
            </button>
            <button
              onClick={() => {
                setActiveTab("trainee");
                setError("");
              }}
              className={`flex-1 rounded-md py-2 text-center text-xs font-medium transition-all ${
                activeTab === "trainee"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Log in as Trainee
            </button>
          </div>

          {/* --- Error --- */}
          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* --- Trainer Form --- */}
          {activeTab === "trainer" && (
            <form onSubmit={handleTrainerLogin} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-900"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-900"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <a
                  href="#"
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={trainerLogin.isPending}
                className="h-10 w-full "
              >
                {trainerLogin.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          )}

          {/* --- Trainee Phone Form --- */}
          {activeTab === "trainee" && traineeStep === "phone" && (
            <form onSubmit={handleSendOtp} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-medium text-gray-900"
                >
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5">
                    <span className="text-base">🇮🇳</span>
                    <span className="text-[10px] text-gray-500">▾</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="h-10 flex-1 text-sm"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={sendOtp.isPending}
                className="h-10 w-full"
              >
                {sendOtp.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          )}

          {/* --- Trainee OTP Form --- */}
          {activeTab === "trainee" && traineeStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="otp"
                  className="text-xs font-medium text-gray-900"
                >
                  Enter OTP
                </Label>
                <p className="text-[11px] text-gray-500">
                  OTP sent to{" "}
                  <span className="font-medium text-gray-700">+91 {phone}</span>
                </p>
                <div className="flex justify-center gap-2.5 pt-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join("").slice(0, 4));
                        if (val && i < 3) {
                          document.getElementById(`otp-${i + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus();
                        }
                      }}
                      className="h-11 w-11 rounded-lg border border-gray-300 text-center text-base font-semibold text-gray-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={verifyOtp.isPending || otp.length < 4}
                className="h-10 w-full bg-emerald-700 text-sm text-white hover:bg-emerald-800"
              >
                {verifyOtp.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="text-[11px] text-gray-500 hover:text-gray-700"
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    sendOtp.mutate(
                      { phone },
                      {
                        onError: (err) => {
                          setError(
                            err.response?.data?.message ||
                              "Failed to resend OTP",
                          );
                        },
                      },
                    );
                  }}
                  disabled={sendOtp.isPending}
                  className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                >
                  {sendOtp.isPending ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* --- Language Bar --- */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-400">Available in</p>
          <div className="mt-1 flex flex-wrap justify-center gap-2 text-[11px]">
            <span className="cursor-pointer text-emerald-700 underline">
              English
            </span>
            <span className="cursor-pointer text-emerald-600/60 hover:text-emerald-700">
              தமிழ்
            </span>
            <span className="cursor-pointer text-emerald-600/60 hover:text-emerald-700">
              മലയാളം
            </span>
            <span className="cursor-pointer text-emerald-600/60 hover:text-emerald-700">
              मराठी
            </span>
            <span className="cursor-pointer text-emerald-600/60 hover:text-emerald-700">
              ಕನ್ನಡ
            </span>
            <span className="cursor-pointer text-emerald-600/60 hover:text-emerald-700">
              हिन्दी
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Animated Wave Background Component =====

function WaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Solid green left */}
      <div className="absolute left-0 top-0 h-full w-[40%] bg-[#1a3a2a]" />

      {/* Solid white right */}
      <div className="absolute right-0 top-0 h-full w-[35%] bg-white" />
      <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
        {/* Wave 1 — darkest, furthest left */}
        <div
          className="absolute top-[-10%] h-[120%] animate-wave-drift-1"
          style={{ left: "30%", width: "30%" }}
        >
          <svg
            viewBox="0 0 300 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path fill="#6bc294">
              <animate
                attributeName="d"
                dur="8s"
                repeatCount="indefinite"
                values="
                M0,0 L0,1000 L300,1000 L300,0 L200,0 C220,80 180,180 200,280 C220,380 175,480 200,580 C225,680 180,780 200,880 L200,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L210,0 C230,100 190,200 220,300 C240,400 185,500 210,600 C235,700 190,800 210,900 L210,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L190,0 C210,70 170,170 190,270 C215,370 165,470 190,570 C220,670 170,770 190,870 L190,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L200,0 C220,80 180,180 200,280 C220,380 175,480 200,580 C225,680 180,780 200,880 L200,1000 L0,1000 Z
              "
              />
            </path>
          </svg>
        </div>

        {/* Wave 2 — mid dark */}
        <div
          className="absolute top-[-10%] h-[120%] animate-wave-drift-2"
          style={{ left: "34%", width: "28%" }}
        >
          <svg
            viewBox="0 0 300 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path fill="#4a9a70">
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="
                M0,0 L0,1000 L300,1000 L300,0 L195,0 C215,100 175,200 205,300 C225,400 170,500 195,600 C225,700 175,800 195,900 L195,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L210,0 C230,80 190,180 220,280 C240,380 185,480 210,580 C235,680 190,780 210,880 L210,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L185,0 C205,110 165,210 195,310 C220,410 160,510 185,610 C215,710 165,810 185,910 L185,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L195,0 C215,100 175,200 205,300 C225,400 170,500 195,600 C225,700 175,800 195,900 L195,1000 L0,1000 Z
              "
              />
            </path>
          </svg>
        </div>

        {/* Wave 3 — mid light */}
        <div
          className="absolute top-[-10%] h-[120%] animate-wave-drift-3"
          style={{ left: "38%", width: "26%" }}
        >
          <svg
            viewBox="0 0 300 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path fill="#2d5a47">
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="
                M0,0 L0,1000 L300,1000 L300,0 L200,0 C220,90 180,190 210,290 C230,390 175,490 200,590 C230,690 180,790 200,890 L200,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L185,0 C205,110 165,210 195,310 C215,410 160,510 185,610 C215,710 165,810 185,910 L185,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L215,0 C235,80 195,180 225,280 C245,380 190,480 215,580 C240,680 195,780 215,880 L215,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L200,0 C220,90 180,190 210,290 C230,390 175,490 200,590 C230,690 180,790 200,890 L200,1000 L0,1000 Z
              "
              />
            </path>
          </svg>
        </div>

        {/* Wave 4 — lightest */}
        <div
          className="absolute top-[-10%] h-[120%] animate-wave-drift-4"
          style={{ left: "41%", width: "24%" }}
        >
          <svg
            viewBox="0 0 300 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path fill="#1a3a2a">
              <animate
                attributeName="d"
                dur="9s"
                repeatCount="indefinite"
                values="
                M0,0 L0,1000 L300,1000 L300,0 L205,0 C225,100 185,200 215,300 C235,400 180,500 205,600 C235,700 185,800 205,900 L205,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L190,0 C210,80 170,180 200,280 C220,380 165,480 190,580 C220,680 170,780 190,880 L190,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L220,0 C240,110 200,210 230,310 C250,410 195,510 220,610 C245,710 200,810 220,910 L220,1000 L0,1000 Z;
                M0,0 L0,1000 L300,1000 L300,0 L205,0 C225,100 185,200 215,300 C235,400 180,500 205,600 C235,700 185,800 205,900 L205,1000 L0,1000 Z
              "
              />
            </path>
          </svg>
        </div>
      </div>
    </div>
  );
}

// #1a3a2a dark
// #6bc294 light
// #4a9a70 mid light
// #2d5a47 mid dark
