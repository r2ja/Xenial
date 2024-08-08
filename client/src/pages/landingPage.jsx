import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useGoogleLogin } from "@react-oauth/google";
import WallpaperImage from "../assets/images/landing/Wallpaper.jpg";
import { authApi } from "../utils/authApi";
import GoogleIcon from "../components/GoogleIcon";

const validationSchema = Yup.object().shape({
  emailOrUsername: Yup.string().required("Email or username is required"),
  password: Yup.string().required("Password is required"),
});

const LandingPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/latest");
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await authApi.login(values.emailOrUsername, values.password);
      navigate("/latest");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await authApi.googleLogin(tokenResponse.access_token);
        navigate("/latest");
      } catch (error) {
        console.error("Google login error:", error);
        setLoginError("Google login failed. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setLoginError("Google login failed. Please try again.");
    },
  });
  return (
    <div className="flex h-screen w-full bg-xenial-dark text-white">
      {/* Left side */}
      <div className="w-1/2 relative">
        <img
          src={WallpaperImage}
          alt="Xenial Wallpaper"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-xenial-dark bg-opacity-50"></div>
        <div className="absolute top-8 left-8">
          <h1 className="font-heading text-xenial-blue text-5xl font-bold">
            XENIAL
          </h1>
        </div>
        <div className="absolute bottom-8 left-8 space-y-4">
          <h2 className="font-heading text-5xl font-bold">WELCOME</h2>
          <p className="font-body text-lg max-w-md">
            embrace the social media landscape in a way that doesn't waste your
            time.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 px-4">
          <Formik
            initialValues={{ emailOrUsername: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <Field
                  name="emailOrUsername"
                  type="text"
                  placeholder="email/username"
                  className="w-full bg-xenial-gray text-white p-3 rounded font-body"
                />
                {errors.emailOrUsername && touched.emailOrUsername && (
                  <div className="text-red-500 text-sm">
                    {errors.emailOrUsername}
                  </div>
                )}
                <Field
                  name="password"
                  type="password"
                  placeholder="password"
                  className="w-full bg-xenial-gray text-white p-3 rounded font-body"
                />
                {errors.password && touched.password && (
                  <div className="text-red-500 text-sm">{errors.password}</div>
                )}
                <div className="text-right">
                  <a href="#" className="text-xenial-blue text-sm font-body">
                    forgot your password?
                  </a>
                </div>
                {loginError && (
                  <div className="text-red-500 text-sm">{loginError}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-white text-xenial-dark font-bold py-2 px-4 rounded font-body"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "sign in"}
                </button>
              </Form>
            )}
          </Formik>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="flex-grow border-t border-xenial-gray"></div>
              <span className="px-4 font-body">or continue with</span>
              <div className="flex-grow border-t border-xenial-gray"></div>
            </div>
            <button
              onClick={() => googleLogin()}
              className="mt-4 w-full bg-white text-xenial-dark font-bold py-2 px-4 rounded flex items-center justify-center font-body"
            >
              <GoogleIcon className="mr-2" />
              Continue with Google
            </button>
          </div>
          <div className="text-center font-body">
            <p>
              don't have an account?{" "}
              <Link to="/createaccount" className="text-xenial-blue">
                sign up
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;