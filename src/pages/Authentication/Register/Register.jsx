import React, { useState } from "react";
import {
  Button,
  Input,
  Radio,
  RadioGroup,
  Checkbox,
  Alert,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../Schema/Register.Schema";
import { registerUser } from "../../../components/services/register.service";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../images/ConnectifyRS.png";

export default function Register() {
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: undefined,
    },
    mode: "onChange",
  });

  async function onSubmit(data) {
    setServerError("");
    setIsLoading(true);

    try {
      const response = await registerUser(data);
      console.log("Success:", response);
      toast.success("Registration successful! You can now log in.");
      navigate("/auth/login");
    } catch (error) {
      let message = "Registration failed. Please try again.";
      if (error.response) {
        const serverData = error.response.data;
        console.log("Full server response:", serverData);
        message = serverData.message || serverData.error || message;
      } else {
        message = error.message || message;
      }
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isValid = await trigger();
    if (!isValid) {
      setServerError("Please fix the errors above.");
      return;
    }
    handleSubmit(onSubmit)();
  };

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
            Join Connectify
          </h1>
          <p className="mt-4 text-xl text-emerald-700/80 dark:text-emerald-300/80">
            Create your account and start sharing your moments with the world
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 shadow-2xl rounded-3xl p-10 border border-emerald-100 dark:border-emerald-900/30 backdrop-blur-md">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {serverError && (
              <Alert
                color="danger"
                title={serverError}
                className="rounded-2xl"
              />
            )}

            <Input
              {...register("name")}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              label="Username"
              placeholder="Choose a unique username"
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
              placeholder="Create a strong password"
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
              {...register("rePassword")}
              type="password"
              isInvalid={!!errors.rePassword}
              errorMessage={errors.rePassword?.message}
              label="Confirm Password"
              placeholder="Confirm your password"
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
              {...register("dateOfBirth")}
              type="date"
              isInvalid={!!errors.dateOfBirth}
              errorMessage={errors.dateOfBirth?.message}
              label="Date of Birth"
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

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  label="Gender"
                  orientation="horizontal"
                  onValueChange={field.onChange}
                  value={field.value}
                  color="success"
                  isInvalid={!!errors.gender}
                  errorMessage={errors.gender?.message}
                  classNames={{
                    label: "text-emerald-700 dark:text-emerald-300 font-medium",
                    wrapper: "gap-12",
                  }}
                >
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                </RadioGroup>
              )}
            />

            <Checkbox
              size="md"
              color="success"
              classNames={{
                label: "text-base",
              }}
            >
              I agree to the{" "}
              <Link href="#" size="md" className="text-emerald-600 font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" size="md" className="text-emerald-600 font-medium">
                Privacy Policy
              </Link>
            </Checkbox>

            <Button
              type="submit"
              color="success"
              size="lg"
              fullWidth
              radius="xl"
              isLoading={isLoading}
              className="font-bold text-lg shadow-xl hover:shadow-2xl transition-all mt-8"
            >
              Create Account
            </Button>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-200 dark:border-emerald-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-6 text-emerald-600 dark:text-emerald-400 font-medium">
                  Or sign up with
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
          </form>

          <p className="text-center mt-12 text-emerald-700 dark:text-emerald-300 text-base">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
