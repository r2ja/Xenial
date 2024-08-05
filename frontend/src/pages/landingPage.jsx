import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import WallpaperImage from '../assets/images/landing/Wallpaper.jpg';

const GoogleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const validationSchema = Yup.object().shape({
  emailOrUsername: Yup.string().required('Email or username is required'),
  password: Yup.string().required('Password is required'),
});

const LandingPage = () => {
  const handleSubmit = (values, { setSubmitting }) => {
    // Handle form submission here
    console.log(values);
    setSubmitting(false);
  };

  return (
    <div className="flex h-screen bg-xenial-dark text-white">
      {/* Left side */}
      <div className="w-1/2 relative">
        <img 
          src={WallpaperImage} 
          alt="Xenial Wallpaper" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-xenial-dark bg-opacity-50"></div>
        <div className="absolute top-8 left-8">
          <h1 className="font-heading text-xenial-blue text-5xl font-bold">XENIAL</h1>
        </div>
        <div className="absolute bottom-8 left-8 space-y-4">
          <h2 className="font-heading text-5xl font-bold">
            EMBRACE<br />SIMPLICITY.
          </h2>
          <p className="font-body text-lg max-w-md">
            tired of today's social media apps and how cluttered they are? try xenial.
            <br /><br />
            it's simple, clean, and doesn't waste your time.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <Formik
            initialValues={{ emailOrUsername: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <Field 
                    name="emailOrUsername"
                    type="text" 
                    placeholder="email/username" 
                    className="w-full bg-xenial-gray text-white p-3 rounded font-body"
                  />
                  {errors.emailOrUsername && touched.emailOrUsername ? (
                    <div className="text-red-500 text-sm mt-1">{errors.emailOrUsername}</div>
                  ) : null}
                </div>
                <div>
                  <Field 
                    name="password"
                    type="password" 
                    placeholder="password" 
                    className="w-full bg-xenial-gray text-white p-3 rounded font-body"
                  />
                  {errors.password && touched.password ? (
                    <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                  ) : null}
                </div>
                <div className="text-right">
                  <a href="#" className="text-xenial-blue text-sm font-body">forgot your password?</a>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-white text-xenial-dark font-bold py-2 px-4 rounded font-body"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'sign in'}
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
            <button className="mt-4 w-full bg-white text-xenial-dark font-bold py-2 px-4 rounded flex items-center justify-center font-body">
              <GoogleIcon className="mr-2" />
              Continue with Google
            </button>
          </div>
          <div className="text-center font-body">
            <p>don't have an account? <Link to="/signup" className="text-xenial-blue">sign up</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;