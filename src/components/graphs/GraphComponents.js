import React from 'react';
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
    LittleCircle,
    fmtTwoDatestr
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
        if (data.length > 0) {
            ticks.push(new Date(data[data.length - 1].calendarDate));
        }
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

export const SingleStat = ({
    stat, 
    title, 
    color, 
    formatterFunc,
    unit=''}) => {
    const pStyle = {
            paddingRight: '1.1rem',
            color: '#fff',
            fontSize: '1.1rem',
            whiteSpace: 'nowrap',
        }

    return (
    <p style={pStyle}>
        <LittleCircle color={color} />
        {title}{': '}
        {formatterFunc(stat)}
        {unit}
        </p>
    )
}

export const StatsHeader = ({selection, statsTitle}) => {
    if (selection.length > 0) {
        return (
        <div className='flex gap-5'>
            <div>{statsTitle}</div>
            <div style={{color: '#ffffffbb'}}>{} </div>
            <hr style={{ borderTop: '1px solid #ffffffbb', margin: '0.25rem 0' }} />
        </div>
        )
    }
    else {
        return <div></div>
    }
}

export const StatsDiv = ({
    statsTitle,
    selection,
    statsData,
    svgDimensions,
    titles,
    allColors,
    fmtFuncs,
    units,
}) => {
    const statsStyle = {
        width: (
            svgDimensions.width - 
            svgDimensions.margin.left - 
            svgDimensions.margin.right),
        display: 'flex',
        marginLeft: svgDimensions.margin.left,
        flexDirection: 'column',
    }
    return  (
        <div style={statsStyle} >
            <StatsHeader statsTitle={statsTitle} selection={selection} />
            <div className='grid grid-cols-2 lg:grid-cols-3'>
    {statsData.map((stat, index) => (
        <SingleStat
            key={titles[index]}  // Using titles as the key, assuming they are unique
            stat={stat}
            title={titles[index]}
            color={allColors[index]}
            formatterFunc={fmtFuncs[index]}
            unit={units[index]}
        />
    )
    )}
</div>
        </div>
    );
}
