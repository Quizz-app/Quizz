import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const TeamCard = ({ team, handleClick, type, path }) => {

    const navigate = useNavigate();

    return (
        <div className="card w-96 shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(144,238,144,0.9)] px-8 py-2 bg-[#90ee90] rounded-md text-dark font-light transition duration-200 ease-linear mr-6 mb-5">
            <div className="card-body">
                <h2 className="card-title text-black">{team?.name}</h2>
                <p className='text-black'>{team?.description}</p>
                <div className="card-actions justify-between mt-5">
                    <button className="btn btn-sm bg-blue shadow-xl" onClick={() => navigate(`/${path}/${team?.id}`)}>Go to {type}</button>
                    {handleClick && <button className="btn btn-sm bg-blue shadow-xl" onClick={handleClick}>Leave team</button>}
                </div>
            </div>
        </div>
    );
}

TeamCard.propTypes = {
    team: PropTypes.object,
    handleClick: PropTypes.func,
    type: PropTypes.string,
    path: PropTypes.string,
};

export default TeamCard;

