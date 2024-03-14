import PropTypes from 'prop-types';
import {cn} from "../../utils/cn"

const LabelInputContainer = ({ children, className }) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};

LabelInputContainer.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

export default LabelInputContainer;