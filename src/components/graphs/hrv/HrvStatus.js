import React from 'react';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {LinePath, Bar} from '@visx/shape';
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

import { 
    LittleCircle,
    getBarWidth,
    getBarX,
    mergeColor,
    isData
 } from '../graphHelpers';
 import {
    GARMIN_GOOD,
    GARMIN_FAIR,
    GARMIN_POOR,
    GARMIN_UNK,
 } from '../styles';


const brushStyle = {
    fillColor: "#678e72",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

const keys = ['hrvWeeklyAverage', 'hrvFactorPercent'];
const colors = ['#fff'];
const brushKey = 'hrvWeeklyAverage';

const hrvBands = [
    {score: 70, color: GARMIN_GOOD},
    {score: 40, color: GARMIN_FAIR},
    {score: 10, color: GARMIN_POOR},
    {score: 0, color: GARMIN_UNK},
]

function getHRVBandColor(score) {
    for (let band of hrvBands) {
        if (score >= band.score) {
            return band.color;
        }
    }

    return GARMIN_UNK;
}

function ftmToolTip (d, point, xScale, aggrLevel) {
    const x = point.x;
    const date = xScale.invert(x)
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';
    const color = getHRVBandColor(thisDataPoint.hrvFactorPercent);
    return (
        <div>
        <p style={{color: '#ffffffbb'}} >{datestr}</p>
        <p><LittleCircle color={color}/>{avg}HRV Status:{' '}
             <strong>{thisDataPoint.hrvWeeklyAverage.toFixed(0)}</strong></p>
             <p>
                    <LittleCircle color={color}/>HRV Factor:{' '}
                    <strong>{thisDataPoint.hrvFactorPercent.toFixed(0)}</strong>
             </p>
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
        if (isData(data)) {
            return;
        }
        const { pointInSvg, svgTop, svgLeft } = locateEventLocalNAbs(event, 'hrvStatus');
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
                tooltipData: ftmToolTip(data, pointInSvg, xScale, aggrLevel),
                tooltipLeft: pointInSvg.x + svgLeft,
                tooltipTop: svgTop + yMax + 24,
            });
        }}

    const handleMouseLeave = () => {
        setTooltipInfo(['']); 
        hideTooltip();
    };
    const avgHrv = selection.reduce((acc, d) => acc + d.hrvWeeklyAverage, 0) / selection.length;
    const avgFactor = selection.reduce((acc, d) => acc + d.hrvFactorPercent, 0) / selection.length;
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
        <StandardAxisLeft
            label={yLabel}
            yScale={yScale}
            margin={margin}
            svgDimensions={svgDimensions}
            dx={(svgDimensions.width < 600) ? '0.0em' : '0.5em'}
        />
        <StandardAxisBottom
            data={selection}
            yMax={yMax}
            xScale={xScale}
        />
        {isData(selection) &&
        <>
            {selection.slice(1).map((d, i) => {
                const segmentData = [selection[i], selection[i + 1]]
                const barWidth = getBarWidth(segmentData, aggrLevel, xScale);
                return (<Bar
                    key={`bar-${i}`}
                    x={getBarX(segmentData, aggrLevel, xScale)}
                    y={yScale(d.hrvWeeklyAverage)}
                    width={barWidth}
                    height={yMax - yScale(d.hrvWeeklyAverage)}
                    fill={getHRVBandColor(d.hrvFactorPercent)}
                    rx={2}
                    ry={2}
                    />)
            })}
        <LinePath
            data={selection}
            x={d => xScale(getDate(d))}
            y={d => yScale(avgHrv)}
            stroke={mergeColor(getHRVBandColor(avgFactor))}
            strokeWidth={4}
            />
        <text
            x={xScale(selection[selection.length - 1].calendarDate) - 2}
            y={yScale(avgHrv) - 10}
            fontSize={'0.95em'}
            fill={mergeColor(getHRVBandColor(avgFactor))}
            textAnchor='end'
            style={{ 
                pointerEvents: "none", 
                backgroundColor: 'white',
                fontWeight: 'bold',
            }}
        >
            Avg: {avgHrv.toFixed(0) + ' ' + 'ms'}
        </text>
        <ToolTipBar
            svgDimensions={svgDimensions}
            selection={selection}
            handleTooltip={handleTooltip}
            handleMouseLeave={handleMouseLeave}
        />
        </>
        }
        </>);
    };


export const HRVGraph = ({ hrvData }) => {
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
            SelectionStats={HRVStatusStats}
        />
    );
};

const HRVStatusStats = ( {
    selection,
    svgDimensions,
    metricKey,
}) => {
    const stats = selection.reduce(
        (acc, d, index, array) => {  // Adding array to access the length for mean calculation
          if (d[metricKey] < acc.min) {
            acc.min = d[metricKey];
            acc.minIndex = d.calendarDate;
          }
          if (d[metricKey] > acc.max) {
            acc.max = d[metricKey];
            acc.maxIndex = d.calendarDate;
          }
          acc.mean += d[metricKey];
      
          // Calculate mean correctly at the end
          if (index === array.length - 1) {
            acc.mean /= array.length;  
          }
      
          return acc;
        },
        {
          min: Infinity,
          max: -Infinity,
          minIndex: '',
          maxIndex: '',
          mean: 0,
        }
      );
      
    let minColor = '#888888';
    let maxColor = '#888888';
    let avgColor = '#888888';
    if (isData(selection)) {
        minColor = getHRVBandColor(selection.find((d) => d.calendarDate === stats.minIndex).hrvFactorPercent);
        maxColor = getHRVBandColor(selection.find((d) => d.calendarDate === stats.maxIndex).hrvFactorPercent);
        avgColor = getHRVBandColor(selection.reduce((acc, d) => acc + d.hrvFactorPercent, 0) / selection.length);
    }

    return (
        <StatsDiv
            statsTitle='HRV Status'
            selection={selection}
            svgDimensions={svgDimensions}
            statsData={[stats.min, stats.mean, stats.max]}
            fmtFuncs={
                Array.from({length: 3}, () => Math.round)
            }
            units={['ms', 'ms', 'ms']}
            titles={['Min', 'Avg', 'Max']}
            allColors={[minColor, avgColor, maxColor]}
        />
    );
}
