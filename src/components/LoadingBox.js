import React from 'react';

function LoadingBox(props) {
    return (
        <>
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-light m-5" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </>
    );
}

export default LoadingBox;