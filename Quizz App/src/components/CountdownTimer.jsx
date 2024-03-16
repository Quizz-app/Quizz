import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

export const CountdownTimer = ({ seconds, onTimeUp }) => {

    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        if (!timeLeft) {
            onTimeUp();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    return (
        <div>
            Time left: {timeLeft}
        </div>
    );
};


CountdownTimer.propTypes = {
    seconds: PropTypes.number.isRequired,
    onTimeUp: PropTypes.func.isRequired,
};