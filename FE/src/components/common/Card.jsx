import React from "react";
import PropTypes from "prop-types";

const Card = ({
  children,
  title,
  subtitle,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  footer,
  onClick,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className} ${
        onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div
          className={`px-4 py-4 border-b border-gray-200 ${headerClassName}`}
        >
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className={`px-4 py-4 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div
          className={`px-4 py-3 bg-gray-50 border-t border-gray-200 ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  footer: PropTypes.node,
  onClick: PropTypes.func,
};

export default Card;
