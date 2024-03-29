import PropTypes from 'prop-types';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
/**
 * 
 * @param {{member: {username: string, email: string, role: string, firstName: string, lastName: string, avatar: string}, handleRemoveMember: function, creator: string}} param0 
 * @returns 
 */
const TableRow = ({ member, handleRemoveMember, creator }) => {
    const { avatar, email, firstName, lastName, role, username } = member;
    

    const { userData } = useContext(AppContext)

    return (
        <tbody>
            <tr>
                <td>
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                                <img src={avatar} />
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
                    {(userData?.username === creator || userData?.isAdmin || userData?.username === username) &&
                        <button className="btn btn-ghost btn-xs" onClick={handleRemoveMember}>Remove member</button>
                    }
                </th>
            </tr>
        </tbody>
    )
}

TableRow.propTypes = {
    member: PropTypes.object,
    handleRemoveMember: PropTypes.func,
    creator: PropTypes.string,
}

export default TableRow;