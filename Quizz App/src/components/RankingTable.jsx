import PropTypes from 'prop-types';
/**
 * 
 * @param {{teacher: {username: string, email: string, role: string, firstName: string, lastName: string, avatar: string}, handleRemoveMember: function, creator: string}} param0 
 * @returns 
 */
const RankingTable = ({ student, index }) => {
    const { avatar, firstName, lastName, username } = student;
    //console.log(username)

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
                    {/* <span className="badge badge-ghost badge-sm">{`${role}`}</span> */}
                </td>
                <td>{`${index}`}</td>
                {/* <th>
                    {(userData?.username === creator || userData?.isAdmin || userData?.username === username) &&
                        <button className="btn btn-ghost btn-xs" onClick={handleRemoveMember}>Remove member</button>
                    }
                </th> */}
            </tr>
        </tbody>
    )
}

RankingTable.propTypes = {
    student: PropTypes.object,
    index: PropTypes.number
}

export default RankingTable;