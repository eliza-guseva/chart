import React from 'react';
import PropTypes from 'prop-types';
import {curveStepAfter} from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { GridRows } from '@visx/grid';
import { max } from 'd3-array';
import { useMemo } from 'react';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    MyAreaStackVsDate,  
    StandardAxisLeft,
} from '../GraphComponents';
import { getMainChartBottom } from '../graphHelpers';


const brushStyle = {
    fillColor: "#ffddff",
    accentColor: "#f6acc8",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}


const keys = ['deepSleepHours', 'remSleepHours', 'lightSleepHours', 'awakeSleepHours'];
const colors = ['#007bff', '#ff44cc', '#44aaff', '#ccbbee'];
const brushKey = 'totalSleepHours';


const SleepStackMainGraph = ({selection, svgDimensions, xScale}) => {
    const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
    const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
    const xMax = svgWidth - margin.right;
    const yLabel = 'Hours';
    const yScale = useMemo(
        () =>
            scaleLinear({
            range: [yMax, margin.top],
            domain: [0, max(selection, (d) => d[brushKey])],
            nice: true,
            }),
        [yMax, selection, margin]
    );
    return (<>
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - 2 * margin.left - margin.right} 
            height={yMax - margin.top} 
            fill="#767d8888"/>
        <GridRows
            left={margin.left}
            scale={yScale}
            width={xMax - 2 * margin.left}
            stroke='#fff'
            strokeOpacity={0.2}
            pointerEvents="none"
          />
        {MyAreaStackVsDate({
            data: selection,
            xScale,
            yScale,
            yMax,
            keys: keys,
            colors: colors,
            margin,
            curve: curveStepAfter,
        })}
        <StandardAxisLeft
            label={yLabel}
            yScale={yScale}
            margin={margin}
            svgDimensions={svgDimensions}
            dx={(svgDimensions.width < 600) ? '1.5em' : '0.5em'}
        />
    </>)}


const SleepStagesStack = ({ sleepData }) => {
    return (
        <BrushTimeGraph
            dailyData={sleepData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={SleepStackMainGraph}
            brushStyle={brushStyle}
            graphTitle='Sleep Stages'
            left_factor={1.0}
        />
    );
};



// Define PropTypes
SleepStagesStack.propTypes = {
    sleepData: PropTypes.arrayOf(
      PropTypes.shape({
        calendarDate: PropTypes.string.isRequired,
        deepSleepSecondsSleep: PropTypes.number.isRequired,
        lightSleepSeconds: PropTypes.number.isRequired,
        remSleepSeconds: PropTypes.number.isRequired,
        awakeSleepSeconds: PropTypes.number.isRequired,
      })
    ).isRequired,
  };

export default SleepStagesStack;



                