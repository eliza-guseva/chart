import React from 'react';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveStepBefore} from '@visx/curve';
import {AreaClosed, LinePath} from '@visx/shape';
import { useTooltip, defaultStyles } from '@visx/tooltip';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate } from '../fileAndDataProcessors';
import { 
    locateEventLocalNAbs, 
    getThisPeriodData,
    ToolTipBar } from '../tooltipHelpers';
import { 
    StandardAxisLeft, 
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

const keys = ['hrvWeeklyAverage'];
const colors = ['#fff'];
const brushKey = 'hrvWeeklyAverage';

const hrvBands = [
    {score: 70, color: '#00ff00'},
    {score: 40, color: '#ff7f00'},
    {score: 10, color: '#ff0000'},
    {score: 0, color: '#888888'},
]

function getHRVBandColor(score) {
    for (let band of hrvBands) {
        if (score >= band.score) {
            return band.color;
        }
    }

    return '#ed4bea';
}

function ftmToolTip (d, point, xScale, aggrLevel) {
    const x = point.x;
    const date = xScale.invert(x)
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';
    const color = getHRVBandColor(thisDataPoint.hrvWeeklyAverage);
    return (
        <div>
        <p style={{color: '#ffffffbb'}} >{datestr}</p>
        <p><LittleCircle color={color}/>{avg}HRV Status:{' '}
             <strong>{thisDataPoint.hrvWeeklyAverage.toFixed(0)}</strong></p>
        </div>
    )
}


const HRVStatusMainGraph = ({ 
    selection, 
    svgDimensions,
    xScale,  
    tooltipInfo,
    setTooltipInfo,
    aggrLevel,
    ...props}) => {
    const { margin, xMax, yMax } = svgDimensions;
    const yLabel = 'HRV Status';
    const yScale = useMemo(
        () =>
            scaleLinear({
            range: [yMax, margin.top],
            domain: [min(selection, (d) => d[brushKey]), max(selection, (d) => d[brushKey])],
            nice: true,
            }),
        [yMax, selection, margin]
    );

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
        const { pointInSvg, svgTop, svgLeft } = locateEventLocalNAbs(event, 'hrvStatus');
        if (pointInSvg) {
            console.log('pointInSvg', pointInSvg);
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
                tooltipData: ftmToolTip(data, pointInSvg, xScale, aggrLevel),
                tooltipLeft: pointInSvg.x + svgLeft,
                tooltipTop: svgTop + yMax + 24,
            });
        }}

    const handleMouseLeave = () => {
        setTooltipInfo(['']); 
        hideTooltip();
    };

    return (<>
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - margin.left} 
            height={yMax - margin.top} 
            fill="#f8f9fb11"/>
        <Grid
            rows={true}
            cols={true}
            xScale={xScale}
            yScale={yScale}
            xMax={xMax}
            yMax={yMax}
            margin={margin}
        />
        {selection.slice(1).map((d, i) => {
                const segmentData = [selection[i], selection[i + 1]];
                return (
                    <LinePath
                        key={`line-segment-${i}`}
                        data={segmentData}
                        x={(d) => xScale(getDate(d))}
                        y={(d) => yScale(d.hrvWeeklyAverage)}
                        stroke={getHRVBandColor(segmentData[0].hrvFactorPercent)}
                        // fill={getHRVBandColor(segmentData[0].hrvFactorPercent)}
                        strokeWidth={1}
                        curve={curveStepBefore}
                        xScale={xScale}
                        yScale={yScale}
                    />
                );
            })}
        <ToolTipBar
            svgDimensions={svgDimensions}
            selection={selection}
            handleTooltip={handleTooltip}
            handleMouseLeave={handleMouseLeave}
        />
        <StandardAxisLeft
            label={yLabel}
            yScale={yScale}
            margin={margin}
            svgDimensions={svgDimensions}
            dx={(svgDimensions.width < 600) ? '0.0em' : '-0.5em'}
        />
        <StandardAxisBottom
            data={selection}
            yMax={yMax}
            xScale={xScale}
        />
        </>);
    };


export const HRVGraph = ({ hrvData }) => {
    // sort hrvData by date
    hrvData.sort((a, b) => new Date(a.calendarDate) - new Date(b
    .calendarDate));
    return (
        <BrushTimeGraph
            dailyData={hrvData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={HRVStatusMainGraph}
            brushStyle={brushStyle}
            graphTitle='HRV Status'
            svg_id='hrvStatus'
            colors={colors}
            left_factor={1.0}
            isAllowAgg={true}
            // SelectionStats={EnduranceStats}
        />
    );
};