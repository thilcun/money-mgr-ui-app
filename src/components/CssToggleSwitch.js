import React from 'react';
import { Helmet } from "react-helmet";

function CssToggleSwitch(props) {
    return (
        <>
            <Helmet>
                <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/css-toggle-switch@latest/dist/toggle-switch.css" />
                <link href="https://cdn.jsdelivr.net/css-toggle-switch/latest/toggle-switch.css" rel="stylesheet" />

            </Helmet>
            <div className="switch-toggle switch-3 switch-candy">

                <input id="on" name="state-d" type="radio" onChange="" />
                <label htmlFor="on" onClick="">WIN</label>

                <input id="na" name="state-d" type="radio" checked="checked" onChange="" />
                <label htmlFor="na" className="disabled" onClick="">N/S</label>

                <input id="off" name="state-d" type="radio" onChange="" />
                <label htmlFor="off" onClick="">LOSS</label>

            </div>
        </>
    );
}

export default CssToggleSwitch;