import React from 'react';
import PropTypes from 'prop-types';
import {curveStepAfter, curveStepBefore} from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { max } from 'd3-array';
import { useMemo } from 'react';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    MyAreaStackVsDate,  
    StandardAxisLeft,
    Grid,
} from '../GraphComponents';
import { getMainChartBottom } from '../graphHelpers';
import { 
    MAIN_GRAPH_BCKG, 
    GRID_COLOR,
} from '../styles';


const brushStyle = {
    fillColor: "#4bb0ff",
    accentColor: "#c8d6f2",
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
    console.log('xScale', xScale.domain());
    console.log('selection', selection);
    // selection.push({
    //     calendarDate: xScale.domain()[1],
    //     deepSleepHours: 0,
    //     remSleepHours: 0,
    //     lightSleepHours: 0,
    //     awakeSleepHours: 0,
    // });
    return (<>
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - margin.left} 
            height={yMax - margin.top} 
            fill={MAIN_GRAPH_BCKG}/>
        {MyAreaStackVsDate({
            data: selection,
            xScale,
            yScale,
            yMax,
            keys: keys,
            colors: colors,
            margin,
            curve: curveStepBefore,
        })}
        <Grid
            rows={true}
            cols={false}
            yScale={yScale}
            xScale={xScale}
            xMax={xMax}
            yMax={yMax}
            margin={margin}
            stroke={GRID_COLOR}
            />
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



                