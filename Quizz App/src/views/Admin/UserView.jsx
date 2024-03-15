import PropTypes from "prop-types";


const UserView = ({ user, handleBlock, text, changeAdminStatus}) => {
  
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
        <button className="btn btn-primary" onClick={() => handleBlock(user.username)}>{text}</button>
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
