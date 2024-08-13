import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { userApi } from "../utils/userApi";
import ToastNotification from "../components/toastNotification";

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await userApi.getCurrentUserProfile();
      setUser(response);
      setPreviewImage(userApi.getFullAvatarUrl(response.avatar_url));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setToastMessage("Error fetching user data. Please try again.");
      setShowToast(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const validationSchema = Yup.object({
    bio: Yup.string().max(200, "Bio must be 200 characters or less"),
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    password: Yup.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .when("password", {
        is: val => val && val.length > 0,
        then: Yup.string().required("Confirm Password is required")
      }),
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      avatar: null,
      bio: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      username: "",
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value != null && value !== "" && key !== "confirmPassword") {
            if (key === "firstName" || key === "lastName") {
              formData.append(key, value);
            } else {
              formData.append(key, value instanceof File ? value : String(value));
            }
          }
        });
        formData.append("full_name", `${values.firstName} ${values.lastName}`);

        await userApi.updateUserProfile(formData);
        await fetchUserData();
        setToastMessage("Account details updated successfully.");
        setShowToast(true);
      } catch (error) {
        console.error("Error updating profile:", error);
        setToastMessage("Error updating profile. Please try again.");
        setShowToast(true);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (user) {
      const [firstName, ...lastNameParts] = user.full_name ? user.full_name.split(" ") : ["", ""];
      formik.setValues({
        ...formik.values,
        bio: user.bio || "",
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue("avatar", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div className="text-white font-mono">Loading...</div>;

  return (
    <div className="bg-xenial-dark text-white p-6 font-mono">
      <h1 className="text-3xl font-bold mb-6 font-heading">Settings</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <img
            className="h-16 w-16 object-cover rounded-full"
            src={previewImage || "/default-avatar.png"}
            alt="Profile"
          />
          <input
            type="file"
            id="avatar"
            name="avatar"
            onChange={handleImageChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-xenial-blue file:text-white hover:file:bg-xenial-blue-dark transition-colors"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block mb-2">Bio</label>
          <textarea
            id="bio"
            name="bio"
            {...formik.getFieldProps("bio")}
            className="w-full bg-xenial-gray p-2 rounded"
            rows="3"
          />
          {formik.touched.bio && formik.errors.bio && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.bio}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "firstName", label: "First Name" },
            { name: "lastName", label: "Last Name" },
            { name: "username", label: "Username" },
            { name: "email", label: "Email" },
            { name: "password", label: "New Password", type: "password" },
            { name: "confirmPassword", label: "Confirm New Password", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block mb-2">{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                {...formik.getFieldProps(field.name)}
                className="w-full bg-xenial-gray p-2 rounded"
              />
              {formik.touched[field.name] && formik.errors[field.name] && (
                <div className="text-red-500 text-sm mt-1">{formik.errors[field.name]}</div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-xenial-blue text-white px-6 py-2 rounded-full hover:bg-xenial-blue-dark transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-xenial-blue focus:ring-opacity-50"
        >
          Update Profile
        </button>
      </form>
      {showToast && <ToastNotification message={toastMessage} />}
    </div>
  );
};

export default SettingsPage;