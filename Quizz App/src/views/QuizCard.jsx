import PropTypes from 'prop-types';

const QuizCard = ({content}) => {
    return(
        <div className="card w-96 bg-base-100 shadow-xl image-full">
                <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
                <div className="card-body">
                    <h2 className="card-title"></h2>
                    <p>{content}</p>
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary">see quiz</button>
                    </div>
                </div>
            </div>
    )
}

export default QuizCard;

QuizCard.propTypes = {
    content: PropTypes.string.isRequired,
}