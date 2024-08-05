import React from 'react';
import { AreaClosed } from '@visx/shape';
import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { Brush } from '@visx/brush';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { timeFormat } from 'd3-time-format';
import { format as d3Format } from 'd3-format';
import { timeDay } from 'd3-time';
import { getDate } from './fileAndDataProcessors';

// function
export function getMargin(width) {
    if (width < 600) {
        return { top: 30, right: -30, bottom: 30, left: 40 };
    }
    else if (width < 1200) {
        return { top: 40, right: 0, bottom: 30, left: 60 };
    }
    return { top: 60, right: 0, bottom: 60, left: 60 };
}


export function getInnerHeight(height, margin) {
    return height - margin.top - margin.bottom;
}

export function getXMax(width, margin) {
    return width - margin.left - margin.right;
}



export function getBrushHeight(height, margin) {
    return getInnerHeight(height, margin) * 0.2;

}

// time format
export const formatDate = timeFormat('%b %d');
export const formatYear = timeFormat('%Y');
export const formatMonth = timeFormat('%b');
export const formatMonthYear = timeFormat('%b %Y');

// get ticks frequescies
function getTicksFrequencies(data, pointFreq) {
    let multiplier;
    if (pointFreq  === 'day') {
        multiplier = 1;
    }
    else if (pointFreq === 'week') {
        multiplier = 7;
    }
    else if (pointFreq === 'month') {
        multiplier = 30;
    }
    else {
        multiplier = 365;
    }
    if (data.length <= 8) {
        return timeDay.every(1 * multiplier);
    }
    return 0
}

export const StandardAxisBottom = ({
    data,
    yMax,
    xScale,
    pointFreq = 'day',
}) => {
    let tickFreq = getTicksFrequencies(data, pointFreq);
    let tickVal = tickFreq === 0 ? null : tickFreq;
    
    return (<AxisBottom
        top={yMax}
        scale={xScale}
        stroke='#fff'
        tickValues={xScale.ticks(tickVal)}
        tickStroke='#fff'
        tickFormat={formatDate}
        tickLabelProps={() => ({
            fill: '#fff',
            textAnchor: 'end',
            dy: '-0.2em',
            fontSize: '0.8em',
            angle: 270
        })}
      />);
};


export const StandardAxisLeft = ({
    label,
    yScale,
    margin,
    svgDimensions
}) => {
    return (<AxisLeft
        left={margin.left}
        scale={yScale}
        stroke='#fff'
        tickStroke='#fff'
        tickFormat={d3Format('.0f')}
        tickLabelProps={() => ({
          fill: '#fff',
          fontSize: '0.8em',
          textAnchor: 'end',
        })}
        label={label}
        labelProps={{
            fill: '#fff',
            fontSize: '1em',
            textAnchor: 'middle',
            dx: (svgDimensions.width < 600) ? '1.5em' : '0.5em',
        }}
      />);
};



// AreaStack component
export const MyAreaStackVsDate = ({
    data, 
    xScale, 
    yScale,
    yMax,
    keys, 
    colors, 
    ...props}) => {
    let stack = [];
    // iterate from the end of the keys array
    for (let i = keys.length - 1; i >= 0; i--) {
        console.log(i);
        stack.push(
            <AreaClosed
                className={keys[i]}
                key={i}
                data={data}
                x={(d) => xScale(getDate(d))}
                // y = sum of all previous keys
                y={(d) => {
                    let sum = keys.slice(0, i + 1).reduce((acc, key) => acc + d[key], 0)
                    return yScale(sum)}
                }
                fill={colors[i]}
                yScale={yScale}
                xScale={xScale}
                {...props}
            />
        );
}
console.log(data);
console.log(getTicksFrequencies(data, 'day'))
return <>
        {stack}
        <StandardAxisBottom
            data={data}
            yMax={yMax}
            xScale={xScale}
        />
    </>;
};

// brush component

export const BrushSubGraph = (
    { 
        allData, 
        brushColumn,
        brushXScale, 
        brushYScale, 
        svgDimensions,
        margin,
        onBrushChange,
        initialBrushPosition,
        brushRef,
        brushStyle
    }) => {

    function getBrushTop(height, margin) {
        return height - margin.bottom - getBrushHeight(height, margin);
        }

    const svgHeight = svgDimensions.height;
    const svgWidth = svgDimensions.width;
    let xMax = getXMax(svgWidth, margin);
    return (
        <Group top={getBrushTop(svgHeight, margin)}> 
        <defs>
            <PatternLines
            id={'brush_pattern'}
            height={8}
            width={8}
            stroke={brushStyle.accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
            />
        </defs>
            <AreaClosed
                data={allData}
                x={(d) => brushXScale(getDate(d))}
                y={(d) => brushYScale(d[brushColumn])}
                yScale={brushYScale}
                fill={brushStyle.fillColor}
            />
            <AxisBottom
                top={getBrushHeight(svgHeight, margin)}
                scale={brushXScale}
                tickFormat={formatMonthYear}
                stroke='#ffffff'
                tickStroke='#ffffff'
                tickLabelProps={() =>({
                    fill: '#fff',
                    fontSize: '0.7em',
                    angle: 0,
                    dy: '0.1em',
                    textAnchor: 'middle'
                })}
            />
            <AxisLeft
                left={margin.left}
                scale={brushYScale}
                stroke='#ffffff'
                hideTicks
                tickFormat={() => ''}
            />
            <PatternLines
                id={'brush_pattern'}
                height={8}
                width={8}
                stroke={brushStyle.accentColor}
                strokeWidth={1}
                orientation={['diagonal']}
            />
            <Brush
                xScale={brushXScale}
                yScale={brushYScale}
                width={xMax}
                height={getBrushHeight(svgHeight, margin)}
                initialBrushPosition={initialBrushPosition}
                onChange={onBrushChange}
                selectedBoxStyle={brushStyle.selectedBoxStyle}
                ref={brushRef}
                useWindowMoveEvents
            />
        </Group>
    );
};
