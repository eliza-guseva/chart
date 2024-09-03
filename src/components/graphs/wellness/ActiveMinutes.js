import React from 'react';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveStepBefore} from '@visx/curve';
import {AreaClosed, LinePath} from '@visx/shape';
import { useTooltip, defaultStyles } from '@visx/tooltip';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    MAIN_GRAPH_BCKG, 
    GRID_COLOR,
} from '../styles';
import { getDate } from '../fileAndDataProcessors';
import { 
    locateEventLocalNAbs, 
    getThisPeriodData,
    ToolTipBar } from '../tooltipHelpers';
import { 
    StandardAxisLeft, 
    MyAreaStackVsDate,
    StandardAxisBottom,
    Grid,
    StatsDiv,
} from '../GraphComponents';

import { LittleCircle } from '../graphHelpers';


const brushStyle = {
    fillColor: "#676e72",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

const keys = ['moderateIntensityMinutes', 'doubleVigorousIntensityMinutes'];
const colors = ['#00ff00', '#ff7f00'];
const brushKey = 'allIntensityMinutes';
const allKeys = ['allIntensityMinutes', ...keys];
const allColors = ['#fff', ...colors];
const titles = ['Total', 'Moderate', 'Vigorous'];


function ftmToolTip (d, point, xScale, aggrLevel) {
    const x = point.x;
    const date = xScale.invert(x)
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';
    const color = '#ed4bea';
    return (
        <div>
        <p style={{color: '#ffffffbb'}} >{datestr}</p>
        <p><LittleCircle color={color}/>{avg}Active Minutes:{' '}
             <strong>{thisDataPoint.allIntensityMinutes.toFixed(0)}</strong></p>
        </div>
    )
}

const ActiveMinutesStackMainGraph = ({
    selection,
    svgDimensions, 
    xScale,
    tooltipInfo,
    setTooltipInfo,
    aggrLevel,
    }) => {
    const { margin, xMax, yMax } = svgDimensions;
    const yLabel = 'Weekly Active Minutes';
    const yScale = useMemo(
        () =>
            scaleLinear({
            range: [yMax, margin.top],
            domain: [0, max(selection, (d) => d[brushKey])],
            nice: true,
            }),
        [yMax, selection, margin]
    );

    const avgTotal = selection.reduce((acc, cur) => acc + cur.allIntensityMinutes, 0) / selection.length;

    return (
        <>
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
                aggrLevel: aggrLevel,
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
            <LinePath
                data={selection}
                x={(d) => xScale(getDate(d))}
                y={(d) => yScale(avgTotal)}
                stroke={'#fff'}
                strokeWidth={3}
                curve={curveStepBefore}
                xScale={xScale}
                yScale={yScale}
            />
        </>
    )
}

const ActiveMinutes = ({activeMinutesData}) => {
    console.log('ActiveMinutes: ', activeMinutesData);
    return (
        <BrushTimeGraph
            dailyData={activeMinutesData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={ActiveMinutesStackMainGraph}
            brushStyle={brushStyle}
            graphTitle='Active Minutes'
            left_factor={1.0}
            isAllowAgg={true}
            svg_id='activeMinutesStack'
        />
    );
}

export default ActiveMinutes;
