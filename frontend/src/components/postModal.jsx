import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { X, Send } from 'lucide-react';
import { postApi } from '../utils/postApi';

const postSchema = Yup.object().shape({
  content: Yup.string()
    .required('Post content is required')
    .max(512, 'Post must be 512 characters or less')
});

const PostModal = ({ isOpen, onClose, onPostCreated }) => {
  if (!isOpen) return null;

  const handlePostSubmit = async (values, { resetForm }) => {
    try {
      await postApi.createPost({ content: values.content });
      resetForm();
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-xenial-dark rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white font-heading">Create a Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <Formik
          initialValues={{ content: '' }}
          validationSchema={postSchema}
          onSubmit={handlePostSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="relative">
                <Field
                  as="textarea"
                  name="content"
                  placeholder="What's on your mind?"
                  className="w-full bg-xenial-gray text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-xenial-blue font-body"
                  rows="4"
                />
                {errors.content && touched.content && (
                  <div className="text-red-500 text-sm mt-1 font-body">{errors.content}</div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-xenial-blue text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-opacity-80 transition-colors font-body"
                  disabled={isSubmitting}
                >
                  <Send size={16} />
                  <span>Post</span>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PostModal;