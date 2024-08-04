import React from 'react';
import { AreaClosed } from '@visx/shape';
import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { Brush } from '@visx/brush';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { timeFormat } from 'd3-time-format';
import { getDate } from './fileAndDataProcessors';

// function
export function getInnerHeight(height, margin) {
    return height - margin.top - margin.bottom;
}

export function getXMax(width, margin) {
    return width - margin.left - margin.right;
}

export function getBrushHeight(height, margin) {
    return getInnerHeight(height, margin) * 0.2;

}

export const formatDate = timeFormat('%b %d %Y');


// AreaStack component
export const MyAreaStackVsDate = ({data, xScale, yScale, keys, colors, ...props}) => {
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
return <>{stack}</>;
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
                tickFormat={formatDate}
            />
            <AxisLeft
                left={margin.left}
                scale={brushYScale}
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
