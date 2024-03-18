import { useContext } from "react"
import { AppContext } from "../context/AppContext";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';

export const AuthenticationRequired = ({ children }) => {
    const { user } = useContext(AppContext);
    const location = useLocation();

    if (!user) {
        return <Navigate replace to="/login" state={{ from: location.pathname }} />
    }

    return (
        <>
            {children}
        </>
    );
}



AuthenticationRequired.propTypes = {
    children: PropTypes.any.isRequired,
    user: PropTypes.object,
};