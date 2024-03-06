import PropTypes from 'prop-types';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
/**
 * 
 * @param {{teacher: {username: string, email: string, role: string, firstName: string, lastName: string}, handleRemoveMember: function, creator: string}} param0 
 * @returns 
 */
const TableRow = ({ teacher, handleRemoveMember, creator }) => {
    const { email, firstName, lastName, role, username } = teacher;

    const {userData} = useContext(AppContext)

    return (
        <tbody>
            <tr>
                <td>
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                                <img src="/tailwind-css-component-profile-2@56w.png" alt="Avatar Tailwind CSS Component" />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold">{username}</div>
                        </div>
                    </div>
                </td>
                <td>
                    {`${firstName} ${lastName}`}
                    <br />
                    <span className="badge badge-ghost badge-sm">{`${role}`}</span>
                </td>
                <td>{`${email}`}</td>
                <th>
                    {userData?.username === creator &&
                        <button className="btn btn-ghost btn-xs" onClick={handleRemoveMember}>Remove member</button>
                    }
                </th>
            </tr>
        </tbody>
    )
}

TableRow.propTypes = {
    teacher: PropTypes.object,
    handleRemoveMember: PropTypes.func,
    creator: PropTypes.string,
}

export default TableRow;