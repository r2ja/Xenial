import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import WallpaperImage from '../assets/images/landing/Wallpaper.jpg';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  termsAccepted: Yup.boolean().oneOf([true], 'You must accept the terms and conditions')
});

const CreateAccountPage = () => {
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
            WELCOME
          </h2>
          <p className="font-body text-lg max-w-md">
            embrace the social media landscape
            in a way that doesn't waste your
            time.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <Formik
            initialValues={{
              username: '',
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
              dateOfBirth: '',
              termsAccepted: false
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <Field name="username" type="text" placeholder="username" className="w-full bg-xenial-gray text-white p-3 rounded font-body" />
                {errors.username && touched.username && <div className="text-red-500 text-sm">{errors.username}</div>}

                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <Field name="firstName" type="text" placeholder="first name" className="w-full bg-xenial-gray text-white p-3 rounded font-body" />
                    {errors.firstName && touched.firstName && <div className="text-red-500 text-sm">{errors.firstName}</div>}
                  </div>
                  <div className="w-1/2">
                    <Field name="lastName" type="text" placeholder="last name" className="w-full bg-xenial-gray text-white p-3 rounded font-body" />
                    {errors.lastName && touched.lastName && <div className="text-red-500 text-sm">{errors.lastName}</div>}
                  </div>
                </div>

                <Field name="email" type="email" placeholder="email" className="w-full bg-xenial-gray text-white p-3 rounded font-body" />
                {errors.email && touched.email && <div className="text-red-500 text-sm">{errors.email}</div>}

                <Field name="password" type="password" placeholder="password" className="w-full bg-xenial-gray text-white p-3 rounded font-body" />
                {errors.password && touched.password && <div className="text-red-500 text-sm">{errors.password}</div>}

                <Field name="confirmPassword" type="password" placeholder="confirm password" className="w-full bg-xenial-gray text-white p-3 rounded font-body" />
                {errors.confirmPassword && touched.confirmPassword && <div className="text-red-500 text-sm">{errors.confirmPassword}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-300">date of birth</label>
                  <Field name="dateOfBirth" type="date" className="w-full bg-xenial-gray text-white p-3 rounded font-body" />
                  {errors.dateOfBirth && touched.dateOfBirth && <div className="text-red-500 text-sm">{errors.dateOfBirth}</div>}
                </div>

                <div className="flex items-center">
                  <Field name="termsAccepted" type="checkbox" className="mr-2" />
                  <label htmlFor="termsAccepted" className="text-sm">I have read and accept the Terms & Conditions</label>
                </div>
                {errors.termsAccepted && touched.termsAccepted && <div className="text-red-500 text-sm">{errors.termsAccepted}</div>}

                <button 
                  type="submit" 
                  className="w-full bg-white text-xenial-dark font-bold py-2 px-4 rounded font-body"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing up...' : 'sign up'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;