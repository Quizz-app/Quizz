import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { updateUser, updateUserInfo } from "../services/users-service";
import toast from "react-hot-toast";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "../config/firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";


const Profile = () => {

  const [user] = useAuthState(auth);
  const { userData, setContext } = useContext(AppContext)
  const [formData, setFormData] = useState(userData)
  const [file, setFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {


    event.preventDefault();

    if (newPassword !== '') {
      await handleSavePassword();
    }

    try {
      let avatarUrl = userData?.avatarUrl;
      if (file) {
        const imageRef = ref(storage, `images/${user.uid}`);
        await uploadBytes(imageRef, file);
        avatarUrl = await getDownloadURL(imageRef);
      }

      const updatedUserData = {
        ...formData,
        avatarUrl
      };


      await updateUser(userData.username, updatedUserData);

      setContext(prevContext => ({
        ...prevContext,
        userData: updatedUserData
      }));

    } catch (error) {
      console.error('Failed to update user:', error);
    }

  };

  const handleUpdatePassword = async () => {
    try {
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(
        "Error updating password. Please check the console for details."
      );

      console.error("Error updating password:", error.message);
    }
  };

  const handleSavePassword = async () => {
    if (currentPassword && newPassword && newPassword === newPassword) {
      const credential = EmailAuthProvider.credential(userData.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        await handleUpdatePassword();
      } catch (error) {
        console.error(
          "Error reauthenticating or updating password:",
          error.message
        );
        toast.error("Please double-check and try again.");
      }
    }
  };

  return (
    <>
      <div className="hero min-h-screen bg-base-200 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Profile details</h2>
        <div className="hero-content basis-1/4 w-full">
          <div className="w-32 rounded-full mb-43 absolute right-100 top-30" style={{ marginTop: '40px', marginRight: '1120px', marginBottom: '245px' }}>
            <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" className="rounded-full" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-col w-1/2 mb-5 mr-5" style={{ marginTop: '274px' }}>
                <div className="form-control mb-5">
                  <label htmlFor="name">
                    <span className="label-text">First name</span>
                  </label>
                  <input value={formData?.firstName} onChange={handleInputChange} type="text" name="firstName" className="input input-bordered" placeholder={userData?.firstName} />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="email">
                    <span className="label-text">Email address</span>
                  </label>
                  <input value={formData?.email} type="email" placeholder="email" name="email" className="input input-bordered" readOnly onDoubleClick={() => toast.error("You cannot change your email.")}
                  />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="currentPassword">
                    <span className="label-text">Current password</span>
                  </label>
                  <input onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="input input-bordered"
                  />
                </div>

              </div>
              <div className="flex flex-col w-1/2 mb-5 mt-40">
                <h2>About me</h2>
                <textarea className="textarea textarea-bordered mb-4" placeholder="Write something about you..."
                ></textarea>
                <div className="form-control mb-5">
                  <label htmlFor="name">
                    <span className="label-text">Last name</span>
                  </label>
                  <input value={formData?.lastName} onChange={handleInputChange} type="text" name="lastName" className="input input-bordered"
                  />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="role">
                    <span className="label-text">Role</span>
                  </label>
                  <input value={formData?.role} type="text" name="role" className="input input-bordered" readOnly
                  />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="password">
                    <span className="label-text">New password</span>
                  </label>
                  <input onChange={(e) => setNewPassword(e.target.value)} type="password" name="password" className="input input-bordered" />
                </div>

              </div>
            </div>

          </form>
          <div className="absolute bottom-0 right-0 mb-5 mr-5">
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;

