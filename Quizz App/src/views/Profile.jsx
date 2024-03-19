import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { updateUser, } from "../services/users-service";
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
  const [file, setFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [formData, setFormData] = useState(userData);

  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);


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

    console.log(userData);
    event.preventDefault();
    try {
      let avatar = userData?.avatar;
      if (file) {
        const imageRef = ref(storage, `images/${user.uid}`);
        await uploadBytes(imageRef, file);
        avatar = await getDownloadURL(imageRef);
      }

      if (newPassword !== '') {
        await handleSavePassword();
      }

      const updatedUserData = {
        ...formData,
        avatar,
      }

      await updateUser(userData?.username, updatedUserData);
      setContext(prevContext => ({
        ...prevContext,
        userData: {
          ...prevContext.userData,
          ...formData,
          avatar
        }
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
      <div className="hero min-h-screen flex flex-col items-center justify-center mx-auto">
        <div className="profile-details  ml-0" style={{ marginLeft: '-600px' }}>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-left justify-items-start">Profile details</h2>
            <p>Refreshing your profile is quick and easy, requiring just a few moments of your attention.</p>
          </div>
        </div>
        <div className="hero-content basis-1/4 w-full">
          <div className="w-32 rounded-full mb-43 absolute right-100 top-30" style={{ marginTop: '-15px', marginRight: '1120px', marginBottom: '245px' }}>
            <label htmlFor="name">
              <span className="label-text">Photo</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={userData?.avatar} className="w-32 h-32 rounded-full" />
              <label htmlFor="avatar-upload" className="flex items-center justify-center w-32 h-8 bg-blue-500 text-white rounded cursor-pointer p-2 ml-5" style={{ marginBottom: '-90px' }}>
                Change
              </label>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-col w-1/2 mb-5 mr-5" style={{ marginTop: '293px' }}>
                <div className="form-control mb-5">
                  <label htmlFor="name" className="mb-2">
                    <span className="label-text">First name</span>
                  </label>
                  <input value={formData?.firstName} onChange={handleInputChange} type="text" name="firstName" className="input input-bordered" placeholder={userData?.firstName} />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="email" className="mb-2">
                    <span className="label-text">Email address</span>
                  </label>
                  <input value={formData?.email} type="email" placeholder={userData?.email} name="email" className="input input-bordered" readOnly onDoubleClick={() => toast.error("You cannot change your email.")}
                  />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="currentPassword" className="mb-2">
                    <span className="label-text">Current password</span>
                  </label>
                  <input onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="input input-bordered"
                  />
                </div>
              </div>
              <div className="flex flex-col w-1/2 mb-10 mt-40" style={{ marginTop: '152px' }}>
                <div className="form-control mb-5">
                  <label htmlFor="role" className="mb-2">
                    <span className="label-text">About me</span>
                  </label>
                  <textarea name="aboutMe" onChange={handleInputChange} className="textarea textarea-bordered mb-4" placeholder="Write something about you..." value={formData?.aboutMe}></textarea>
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="name" className="mb-2">
                    <span className="label-text">Last name</span>
                  </label>
                  <input value={formData?.lastName} onChange={handleInputChange} type="text" name="lastName" className="input input-bordered" placeholder={userData?.lastName}
                  />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="role" className="mb-2">
                    <span className="label-text">Role</span>
                  </label>
                  <input value={formData?.role} type="text" name="role" className="input input-bordered" readOnly placeholder={userData?.role} onDoubleClick={() => toast.error("You cannot change your role.")} />
                </div>
                <div className="form-control mb-5">
                  <label htmlFor="password" className="mb-2">
                    <span className="label-text">New password</span>
                  </label>
                  <input onChange={(e) => setNewPassword(e.target.value)} type="password" name="password" className="input input-bordered" />
                </div>

              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center mb-0">
              <button type="submit" className="bg-blue-500 text-white rounded cursor-pointer p-2 ml-5" style={{ marginBottom: '-20px' }} >Save changes</button>
            </div>
          </form>
        </div>
      </div >
    </>
  );
}

export default Profile;

