import PropTypes from "prop-types";

/**
 *
 * @param {{ children: any, onClick: function }} props
 * @returns
 */
export default function Button({ children = null, onClick = () => {} }) {
  return (
    <div>
      <button
        onClick={onClick}
        className="bg-purple-700 text-yellow-500 font-bold py-2 px-5 rounded transition duration-300 ease-in-out" // Add this line
      >
        {children}
      </button>
    </div>
  );
}

Button.propTypes = {
  children: PropTypes.any,
  onClick: PropTypes.func,
};
