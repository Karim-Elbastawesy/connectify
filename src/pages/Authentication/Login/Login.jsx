import React, { useContext, useState } from "react";
import { Button, Input, addToast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../../../Schema/Login.Schema";
import { loginUser } from "../../../components/services/login.service";
import { useNavigate, Link } from "react-router-dom";
import { tokenContext } from "../../../components/context/tokenContext";
import { useUser } from "../../../components/context/userContext";
import logo from "../../../images/ConnectifyRS.png";

export default function Login() {
  const { setToken } = useContext(tokenContext);
  const { notifyLogin } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    setIsLoading(true);

    try {
      const response = await loginUser(data);
      const authToken = response.data?.token;

      if (authToken) {
        localStorage.setItem("token", authToken);
        setToken(authToken);
        notifyLogin();

        addToast({
          title: "Login successful!",
          description: "You have been logged in.",
          color: "success",
        });

        navigate("/");
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      let message = "Login failed. Please try again.";

      if (error.response) {
        const serverData = error.response.data;
        message =
          serverData.message || serverData.error || "Invalid email or password";
      } else if (error.request) {
        message = "Network error. Please check your connection.";
      } else {
        message = error.message || "An unexpected error occurred.";
      }

      addToast({
        title: "Login Failed",
        description: "Please check your email and password and try again.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950 dark:via-gray-900 dark:to-emerald-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="Connectify Logo"
              className="h-20 w-auto object-contain drop-shadow-xl rounded-2xl"
            />
          </div>
          <h1 className="text-5xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
            Connectify
          </h1>
          <p className="mt-4 text-xl text-emerald-700/80 dark:text-emerald-300/80">
            Log in to continue sharing and connecting
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 shadow-2xl rounded-3xl p-10 border border-emerald-100 dark:border-emerald-900/30 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Input
              {...register("email")}
              type="email"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              label="Email Address"
              placeholder="your.email@example.com"
              variant="bordered"
              size="lg"
              radius="lg"
              color="success"
              classNames={{
                label: "text-emerald-700 dark:text-emerald-300 font-medium",
                inputWrapper:
                  "border-emerald-200 dark:border-emerald-700 focus:border-emerald-500",
              }}
            />

            <Input
              {...register("password")}
              type="password"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              label="Password"
              placeholder="Enter your password"
              variant="bordered"
              size="lg"
              radius="lg"
              color="success"
              classNames={{
                label: "text-emerald-700 dark:text-emerald-300 font-medium",
                inputWrapper:
                  "border-emerald-200 dark:border-emerald-700 focus:border-emerald-500",
              }}
            />

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-200 dark:border-emerald-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-6 text-emerald-600 dark:text-emerald-400 font-medium">
                  Or sign in with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button variant="bordered" radius="xl">
                <i className="fa-brands fa-google mr-2"></i> Google
              </Button>
              <Button variant="bordered" radius="xl">
                <i className="fa-brands fa-github mr-2"></i> Github
              </Button>
            </div>

            <Button
              type="submit"
              color="success"
              size="lg"
              fullWidth
              radius="xl"
              isLoading={isLoading}
              className="font-bold text-lg shadow-xl hover:shadow-2xl transition-all mt-8"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center mt-12 text-emerald-700 dark:text-emerald-300 text-base">
            New to Connectify?{" "}
            <Link
              to="/auth/signup"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
