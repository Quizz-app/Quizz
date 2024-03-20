import PropTypes from "prop-types";
import { motion } from 'framer-motion';


const UserView = ({ user, handleBlock, text, changeAdminStatus }) => {

  return (
    <tr>
      <td>
        <div className="ml-20">
          <img src={user.avatar} alt="User avatar" className="rounded-full w-20 h-20 mb-0 text-center" />
        </div>
      </td>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td onClick={() => changeAdminStatus(user.username)}>
        {user.isAdmin ? "Yes" : "No"}
      </td>
      <td>
        <motion.button
          onClick={() => handleBlock(user.username)}
          className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-red-600 px-8 py-2 bg-red-500 rounded-md text-white font-bold transition duration-200 ease-linear "
          initial={{ scale: 2 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
        >
          {text}
        </motion.button>
      </td>
    </tr>
  );
};

UserView.propTypes = {
  user: PropTypes.object,
  handleBlock: PropTypes.func,
  text: PropTypes.string,
  changeAdminStatus: PropTypes.func,
};

export default UserView;


