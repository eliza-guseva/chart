import React from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveStepBefore, curveStepAfter} from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import {LinePath, AreaClosed} from '@visx/shape';
import { GridRows } from '@visx/grid';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate } from '../fileAndDataProcessors';
import { getMainChartBottom } from '../graphHelpers';
import { StandardAxisLeft, StandardAxisBottom } from '../GraphComponents';


const brushStyle = {
    fillColor: "#676e72",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

const RunPaceTime = ({
}) => {
    return (
        <>
    
        </>
    );
}

export default RunPaceTime;