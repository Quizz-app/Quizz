import PropTypes from 'prop-types';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const RankingTable = ({ student, index }) => {
    const { avatar, firstName, lastName, username } = student;

    return (
        <tr>
            <td>{index + 1}</td>
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
            <td>{`${firstName} ${lastName}`}</td>
        </tr>
    )
}

RankingTable.propTypes = {
    student: PropTypes.object,
    index: PropTypes.number,
}

export default RankingTable;