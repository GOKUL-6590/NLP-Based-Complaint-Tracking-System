import React from "react";
import "./Spinner.css"; // Ensure to style the spinner

const Spinner = () => {
    return (
        <div className="spinner-overlay">
            <div className="spinner"></div>
        </div>
    );
};

export default Spinner;
