import React from 'react';
import { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { max, min } from 'd3-array';
import { curveLinear, curveStepBefore } from '@visx/curve';
import { LinePath, Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { GlyphSquare } from '@visx/glyph';

import { 
    sortData, 
    getSum,
    getDate, 
} from '../fileAndDataProcessors';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    StandardAxisBottom, 
    StandardAxisLeft, 
    Grid,
    StatsDiv
} from '../GraphComponents';
import { formatDateYearPretty, fmtTwoDatestr } from '../graphHelpers';
import { RunSumsOptionsEnum } from '../../../common/jsDB';
import { useTooltip, defaultStyles } from '@visx/tooltip';
import { locateEventLocalNAbs } from '../tooltipHelpers';



const brushStyle = {
    fillColor: "#888888",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
};


function ftmToolTip (d, point, xScale, aggrLevel, metricEnum) {
    const x = point.x;
    const date = xScale.invert(x)
    let datestr = '';
    let avg = '';
    const thisDataPoint = min(d.filter((d) => {
        return (getDate(d) >= date);
    })) || d[d.length - 1];
    if (aggrLevel === 'daily') {
        datestr = formatDateYearPretty(date);
    }
    else {
        const prevDataPoint = d[d.indexOf(thisDataPoint) - 1] || d[0];
        datestr = fmtTwoDatestr(thisDataPoint.calendarDate, prevDataPoint.calendarDate);
        avg = ''
    }
    return (
        <div>
            <p style={{color: '#ffffffbb'}} >{datestr}</p>
            <p>{avg}{metricEnum.title}: {' '}
                <strong>{thisDataPoint[metricEnum.brushKey].toFixed(0)+ ' ' + metricEnum.unit }</strong></p>
        </div>
    )
}



/**
 * Renders the secondary run metrics main graph component.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.selection - Data between the dates selected by the brush.
 * @param {Object} props.svgDimensions - The dimensions of the SVG container.
 * @param {Function} props.xScale - The x-axis scale function.
 * @param {Object} props.tooltipInfo - The tooltip information.
 * @param {Function} props.setTooltipInfo - The function to set the tooltip information.
 * @param {RunSecondaryMetricsEnum} props.metricEnum - The enumeration of the secondary run metrics.
 * @param {string} props.aggrLevel - The aggregation level for the graph.
 * @returns {JSX.Element} The rendered secondary run metrics main graph component.
 */
const RunSumsMainGraph = ({
    selection, 
    svgDimensions, 
    xScale, 
    tooltipInfo,
    setTooltipInfo,
    brushKey,
    aggrLevel,
    ...props }) => 
{
    const { margin, xMax, yMax } = svgDimensions;
    const metricEnum = RunSumsOptionsEnum[brushKey];
    const yLabel = metricEnum.title;
    const yScale = useMemo(
        () =>
            scaleLinear({
            range: [yMax, margin.top],
            domain: [min(selection, (d) => d[brushKey]), max(selection, (d) => d[brushKey])],
            nice: true,
            }),
        [yMax, selection, margin, brushKey]
    );
    const average = selection.reduce((acc, d) => acc + d[brushKey], 0) / selection.length;
    // stroke = average between {metricEnum.color} but tilted towards white
    const avgStroke = `#${Math.floor((parseInt(metricEnum.color.slice(1), 16) + 0xffffff) / 2).toString(16)}`;
    // and even lighter stroke for text above the average line
    const textStroke = `#${Math.floor((parseInt(avgStroke.slice(1), 16) + 0xffffff) / 2).toString(16)}`;

    const { 
        tooltipData, 
        tooltipLeft, 
        tooltipTop, 
        tooltipOpen, 
        showTooltip, 
        hideTooltip 
    } = useTooltip();

    const handleTooltip = (event, data) => {
        if (data.length === 0) {
            return;
        }
        const { pointInSvg, svgTop, svgLeft } = locateEventLocalNAbs(event, 'runSums');
        if (pointInSvg) {
            setTooltipInfo([
                {
                    tooltipData: tooltipData,
                    tooltipLeft: pointInSvg.x + svgLeft,
                    tooltipTop: svgTop + yMax + margin.top - 24,
                    loc_x: pointInSvg.x,
                    loc_y: pointInSvg.y,
                    style: {
                        ...defaultStyles,
                        backgroundColor: '#2d363fdd',
                        color: '#fff',
                        border: 'none',
                        lineHeight: '1.2',
                    },
                }
            ]);
            showTooltip({
                tooltipData: ftmToolTip(data, pointInSvg, xScale, aggrLevel, metricEnum),
                tooltipLeft: pointInSvg.x + svgLeft,
                tooltipTop: svgTop + yMax + 24,
            });
        }
    }

    const handleMouseLeave = () => {
        setTooltipInfo(['']); 
        hideTooltip();
    };

    return (
        <>
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - margin.left} 
            height={yMax - margin.top} 
            fill="#f8f9fb11" 
            />
        <StandardAxisLeft
            label={yLabel}
            yScale={yScale}
            svgDimensions={svgDimensions}
            dx={(svgDimensions.width < 600) ? '0.7em' : '0.5em'}
            tickFormat={metricEnum.format}
        />
        <StandardAxisBottom
            data={selection}
            yMax={yMax}
            xScale={xScale}
        />
        <Grid
            rows={true}
            cols={true}
            xScale={xScale}
            xMax={xMax}
            yScale={yScale}
            yMax={yMax}
            margin={margin}
            stroke='#858585'
        />
        {aggrLevel !== 'daily' && <LinePath
            data={selection}
            x={(d) => xScale(d.calendarDate)}
            y={(d) => yScale(d[brushKey])}
            stroke={metricEnum.color}
            strokeWidth={4}
            curve={curveStepBefore}
        />}
        {aggrLevel === 'daily' && 
        <Group>
        {selection.map((d, i) => {
            const date = d.calendarDate;
            const x = xScale(date);
            const y = yScale(d[brushKey]);
            return (
                <GlyphSquare
                    key={i}
                    left={x}
                    top={y}
                    size={40}
                    fill={metricEnum.color}
                    fillOpacity={0.6}
                    stroke={metricEnum.color}
                    strokeWidth={1}
                />
            );
        })}
        </Group>
        }
        {/* draw average as a line */}
        <LinePath
            data={selection}
            x={(d) => xScale(d.calendarDate)}
            y={(d) => yScale(average)}
            stroke={textStroke}
            strokeWidth={3}
            curve={curveLinear}
        />
        <text
            x={xScale(selection[selection.length - 1].calendarDate) - 2}
            y={yScale(average) - 10}
            fontSize={'0.95em'}
            fill={textStroke}
            textAnchor='end'
            style={{ 
                pointerEvents: "none", 
                backgroundColor: 'white',
                fontWeight: 'bold',
            }}
        >
            Avg: {average.toFixed(1) + metricEnum.unit}
        </text>
        <Bar
            x={margin.left}
            y={margin.top}
            width={xMax - margin.left}
            height={yMax - margin.top}
            fill='transparent'
            onTouchStart={(event) => handleTooltip(event, selection)}
            onTouchMove={(event) => handleTooltip(event, selection)}
            onMouseMove={(event) => handleTooltip(event, selection)}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleMouseLeave}
        />
        </>
    )
    
}

const RunSums = ({runningData}) => {
    runningData = sortData(runningData, 'calendarDate');
    const brushKey = 'distance_km';
    const metricObj = RunSumsOptionsEnum[brushKey];
    // keep only entries with the selected key present in the keys
    runningData = runningData.filter(
        (d) => d[brushKey] !== null && d[brushKey] !== undefined
    );
    
    const title = (
        metricObj.title + 
        ' (' + 
        metricObj.unit +
        ')' 
    );
    return (
        <BrushTimeGraph
            dailyData={runningData}
            keys={[brushKey]}
            brushKey={brushKey}
            mainGraphComponent={RunSumsMainGraph}
            brushStyle={brushStyle}
            aggFn={getSum}
            graphTitle={title}
            colors={[metricObj.color]}
            left_factor={1.0}
            isAllowAgg={true}
            choices={RunSumsOptionsEnum}
            SelectionStats={RunSumStats}
            svg_id='runSums'
        />
    );
}

const RunSumStats = ( {
    selection,
    svgDimensions,
    metricKey,
}) => {
    const metricObj = RunSumsOptionsEnum[metricKey];
    const data = selection.map((d) => d[metricKey]);
    const stats = {
        mean: data.reduce((acc, d) => acc + d, 0) / data.length,
        min: min(data),
        max: max(data),
    };
    return (
        <StatsDiv
            statsTitle={metricObj.title}
            selection={selection}
            svgDimensions={svgDimensions}
            statsData={[stats.mean, stats.min, stats.max]}
            // round to .1
            fmtFuncs={
                Array.from({length: 3}, () => Math.round)
            }
            units={[metricObj.unit, metricObj.unit, metricObj.unit]}
            titles={['Avg', 'Min', 'Max']}
            allColors={[metricObj.color, metricObj.color, metricObj.color]}
        />
    );
}


export default RunSums;