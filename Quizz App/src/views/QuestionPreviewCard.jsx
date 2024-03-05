

const QuestionPreviewCard = ({ time, points}) => {

    return (
        <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Question Type</h2>
                <div className="card-actions justify-end">
                    <p>Time: {time} s</p>
                    <p>Points: {points}</p>
                </div>
            </div>
        </div>
    )
}

export default QuestionPreviewCard;