import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { updateUserInfo } from "../services/users-service";
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
  const { userData } = useContext(AppContext);

  const [user] = useAuthState(auth);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);
  const [email] = useState(user?.email);
  const [uploadImage, setUploadImage] = useState(null);
  const [avatarURL, setAvatarURL] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errMessage, setErrMessage] = useState(null);

  const [form, setForm] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    role: userData.role || "",
    avatar: userData.avatar || "",
    password: userData.password || "",
  });

  useEffect(() => {
    uploadImage && console.log(uploadImage) && console.log(user);
  }, [uploadImage, user]);

  useEffect(() => {
    if (user) {
      const imageRef = ref(storage, `images/${user.uid}`);
      getDownloadURL(imageRef)
        .then((url) => setAvatarURL(url))
        .catch((error) => console.error("Error getting avatar URL:", error));
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // console.log(selectedFile);
    if (selectedFile) {
      setUploadImage(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
      setErrMessage(null);
    } else {
      setUploadImage(null);
      setPreviewImage(null);
      setErrMessage("Please select an image to upload");
      return;
    }
  };

  const uploadFile = () => {
    if (uploadImage === null) return;

    if (uploadImage?.size > 1024 * 1024 * 5) {
      toast.error("File size should be less than 5MB");
      setErrMessage("File size should be less than 5MB");
      return;
    } else if (
      uploadImage?.type !== "image/jpeg" &&
      uploadImage?.type !== "image/png"
    ) {
      toast.error("File format is incorrect");
      return;
    }

    const imageRef = ref(storage, `images/${user.uid}`);

    uploadBytes(imageRef, uploadImage)
      .then(() => {
        toast.success("Image uploaded successfully");
        setErrMessage(null);
      })
      .catch((error) => {
        toast.success("Failed to upload the image");

        console.error("Upload error:", error);
      });
    };
    
    const handleSavePhoto = async () => {
      uploadFile();
      await updateUserInfo(userData.username, "avatar", avatarURL);
      updateForm("avatar")
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
      const credential = EmailAuthProvider.credential(email, currentPassword);
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
  const navigate = useNavigate();

  const updateForm = (prop) => (e) => {
    setForm({ ...form, [prop]: e.target.value });
    // setError("");
  };

  const saveChanges = async () => {
    await handleSavePhoto();
    await handleSavePassword();
    await updateUserInfo(userData.username, "firstName", form.firstName);
    await updateUserInfo(userData.username, "lastName", form.lastName);
    await updateUserInfo(userData.username, "email", form.email);
    await updateUserInfo(userData.username, "role", form.role);
    await updateUserInfo(userData.username, "avatar", form.avatar);

    navigate("/home");
  };

  return (
    <div className="hero min-h-screen bg-base-200 flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex-col">Profile details</h2>
      <p>Update your information. You can also change your password here.</p>

      <div className="hero-content basis-1/4"></div>

      <div className="hero-content basis-3/4 flex flex-row">
        <div className="flex flex-col basis-1/2 mb-5">
          <div className="avatar relative mb-4 flex items-center">
            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 mr-2">
              <img
                src={previewImage ?? avatarURL}
                className="object-cover rounded-full"
              />
            </div>
            <button>
              <input
                type="file"
                className="block mx-auto mb-4"
                accept="image/*"
                id="avatar-upload"
                onChange={handleFileChange}
              />
            </button>
          </div>
          <div>
            <div className="text-red-500">{errMessage}</div>
          </div>

          <div className="form-control">
            <label htmlFor="name">
              <span className="label-text">First name</span>
            </label>
            <input
              value={form.firstName}
              onChange={updateForm("firstName")}
              type="text"
              name="firstName"
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label htmlFor="email">
              <span className="label-text">Email address</span>
            </label>
            <input
              value={form.email}
              onChange={updateForm("email")}
              type="email"
              placeholder="email"
              name="email"
              className="input input-bordered"
              readOnly
              onDoubleClick={() => toast.error("You cannot change your email.")}
            />
          </div>

          <div className="form-control">
            <label htmlFor="currentPassword">
              <span className="label-text">Current password</span>
            </label>
            <input
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              className="input input-bordered"
            />
          </div>
        </div>

        <div className="flex flex-col basis-1/2 mb-5">
          <h2>About me</h2>
          <textarea
            className="textarea textarea-bordered mb-4"
            placeholder="Write something about you..."
          ></textarea>
          <div className="form-control">
            <label htmlFor="name">
              <span className="label-text">Last name</span>
            </label>
            <input
              value={form.lastName}
              onChange={updateForm("lastName")}
              type="text"
              name="lastName"
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label htmlFor="role">
              <span className="label-text">Role</span>
            </label>
            <input
              value={form.role}
              onChange={updateForm("role")}
              type="text"
              name="lastName"
              className="input input-bordered"
              readOnly
            />
          </div>

          <div className="form-control">
            <label htmlFor="password">
              <span className="label-text">New password</span>
            </label>
            <input
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              name="password"
              className="input input-bordered"
            />
          </div>
        </div>
      </div>
      <div className="form-control mt-6">
        <button onClick={saveChanges} className="btn btn-primary">
          Save changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
