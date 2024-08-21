import React from 'react';
import { 
    startOfWeek, 
    addDays, 
    getDay, 
    addMonths, 
    startOfMonth 
} from 'date-fns';
import { AreaClosed } from '@visx/shape';
import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { Brush } from '@visx/brush';
import { scaleTime } from '@visx/scale';
import { GridRows, GridColumns } from '@visx/grid';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { format as d3Format } from 'd3-format';
import { getDate } from './fileAndDataProcessors';
import { 
    formatDateYear,
    getBrushHeight,
    getXMax,
    formatMonthYear,
    getWeeklyTicks,
    getMonthlyTicks,
} from './graphHelpers';



export const StandardAxisBottom = ({
    data,
    yMax,
    xScale,
    aggrLevel = 'daily',
}) => {
    let ticks;
    if (aggrLevel === 'weekly') {
        ticks = getWeeklyTicks(data, xScale);
    }
    else if (aggrLevel === 'monthly') {
        ticks = getMonthlyTicks(data, xScale);
    }
    else {
        const timeScale = scaleTime({
            range: xScale.range(),
            domain: xScale.domain(),
        });
        ticks = timeScale.ticks();
        ticks.push(new Date(data[data.length - 1].calendarDate));
    }
    return (<AxisBottom
        top={yMax}
        scale={xScale}
        stroke='#fff'
        tickStroke='#fff'
        tickValues={ticks}
        tickFormat={formatDateYear}
        tickLabelProps={() => ({
            fill: '#fff',
            textAnchor: 'end',
            dy: '-0.2em',
            fontSize: '0.8em',
            angle: 270
        })}
      />);
};


/**
 * Renders a grid component with optional rows and columns.
 *
 * @param {boolean} rows - Whether to render grid rows.
 * @param {boolean} cols - Whether to render grid columns.
 * @param {function} xScale - The x-axis scale function.
 * @param {number} xMax - The maximum value of the x-axis scale.
 * @param {function} yScale - The y-axis scale function.
 * @param {number} yMax - The maximum value of the y-axis scale.
 * @param {object} margin - The margin object containing top, right, bottom, and left values.
 * @returns {JSX.Element} The rendered grid component.
 */
export const Grid = ({
    rows,
    cols,
    xScale,
    xMax,
    yScale,
    yMax,
    margin,
    stroke = '#fff',
}) => {
    return (
        <>
        {rows &&
            <GridRows
                left={margin.left}
                scale={yScale}
                width={xMax - margin.left}
                stroke={stroke}
                strokeOpacity={0.2}
                pointerEvents="none"
            />
        }
       {cols &&
            <GridColumns
                top={margin.top}
                scale={xScale}
                height={yMax - margin.top}
                stroke={stroke}
                strokeOpacity={0.2}
                pointerEvents="none"
                />
        }
        </>
    )
};


export const StandardAxisLeft = ({
    label,
    yScale,
    svgDimensions,
    dx,
    tickFormat='.0f',
}) => {
    return (<AxisLeft
        left={svgDimensions.margin.left}
        scale={yScale}
        stroke='#fff'
        tickStroke='#fff'
        tickFormat={d3Format(tickFormat)}
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
            dx: dx,
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
    aggrLevel,
    ...props}) => {
    let stack = [];
    // iterate from the end of the keys array
    for (let i = keys.length - 1; i >= 0; i--) {
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
return <>
        {stack}
        <StandardAxisBottom
            data={data}
            yMax={yMax}
            xScale={xScale}
            aggrLevel={aggrLevel}

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
                useWindowMoveEvents={false}
            />
        </Group>
    );
};
