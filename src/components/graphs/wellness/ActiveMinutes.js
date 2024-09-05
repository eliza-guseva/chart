import React from 'react';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveStepBefore} from '@visx/curve';
import {Bar, LinePath} from '@visx/shape';
import { useTooltip, defaultStyles} from '@visx/tooltip';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    MAIN_GRAPH_BCKG, 
    GRID_COLOR,
} from '../styles';
import { getDate } from '../fileAndDataProcessors';
import {
    getThisPeriodData,
    ToolTipBar,
    locateEventLocalNAbs,
    handleAnyTooltip,
 } from '../tooltipHelpers';
import { 
    StandardAxisLeft, 
    StandardAxisBottom,
    Grid,
    StatsDiv,
} from '../GraphComponents';
import { 
    LittleCircle, 
    mergeColor, 
    isData,
    getBarWidth,
    getBarX,

} from '../graphHelpers';

import {
    GARMIN_GREEN,
    GARMIN_GOOD,
    GARMIN_FAIR,
    BRUSH_GREEN,
    getBrushStyle
} from '../styles';

const modColor = mergeColor(GARMIN_GREEN, '#0F7D2D');
const vigColor = mergeColor(GARMIN_FAIR,'#E65C4F');

const keys = ['moderateIntensityMinutes', 'doubleVigorousIntensityMinutes'];
const colors = [modColor, vigColor];
const brushKey = 'allIntensityMinutes';


function fmtToolTip (d, point, xScale, aggrLevel) {
    const x = point.x;
    const date = xScale.invert(x)
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';
    let color = (thisDataPoint.moderateIntensityMinutes >= thisDataPoint.doubleVigorousIntensityMinutes * 2) ? modColor : vigColor;
    color = mergeColor(color, '#ffffff', false);
    return (
        <div>
        <p style={{color: '#ffffffbb'}} >{datestr}</p>
        <p><LittleCircle color={color}/>{avg}Active Minutes:{' '}
             <strong>{thisDataPoint.allIntensityMinutes.toFixed(0)}</strong></p>
        <p><LittleCircle color={modColor}/>Moderate Intensity:{' '}
                <strong>{thisDataPoint.moderateIntensityMinutes.toFixed(0)}</strong></p>
        <p><LittleCircle color={vigColor}/>Vigorous Intensity:{' '}
                <strong>{(thisDataPoint.doubleVigorousIntensityMinutes/2).toFixed(0)}x2</strong></p>
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
    const modTotal = selection.reduce((acc, cur) => acc + cur.moderateIntensityMinutes, 0) / selection.length;
    const vigTotal = selection.reduce((acc, cur) => acc + cur.doubleVigorousIntensityMinutes / 2, 0) / selection.length;
    const avgColor = (modTotal >= vigTotal * 2 ) ? modColor : vigColor;

    const { 
        tooltipData, 
        tooltipLeft, 
        tooltipTop, 
        tooltipOpen, 
        showTooltip, 
        hideTooltip 
    } = useTooltip();

    const svg_id = 'activeMinutesStack';
    const handleTooltip = (event, data) => {
        handleAnyTooltip(
            event, 
            data, 
            svg_id, 
            svgDimensions, 
            tooltipData,
            xScale,
            aggrLevel,
            showTooltip,
            setTooltipInfo,
            fmtToolTip
        )
    };

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
            fill={MAIN_GRAPH_BCKG}/>
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
            <StandardAxisBottom
                data={selection}
                yMax={yMax}
                xScale={xScale}
                aggrLevel={aggrLevel}
            />
            { isData(selection) &&
                <> 
                {
                selection.slice(1).map((d, i) => {
                const segmentData = [selection[i], selection[i + 1]];
                const barWidth = getBarWidth(segmentData, aggrLevel, xScale);
                let cumulativeHeight = 0;
                const stack = [];
                for (let j = 0, len = keys.length; j < len; j++) {
                    const key = keys[j];
                    const value = d[key];
                    stack.push(
                        <Bar
                            key={`bar-${i}-${j}`}
                            x={getBarX(segmentData, aggrLevel, xScale)}
                            y={yScale(cumulativeHeight + value)}
                            width={barWidth}
                            height={yScale(cumulativeHeight) - yScale(cumulativeHeight + value)}
                            fill={colors[j]}
                        />
                    );
                    cumulativeHeight += value;
                }

                return <g key={`group-${i}`}>{stack}</g>;
            })}
            <LinePath
                data={selection}
                x={(d) => xScale(getDate(d))}
                y={(d) => yScale(avgTotal)}
                stroke={mergeColor(avgColor, '#ffffff', true)}
                strokeWidth={3}
                curve={curveStepBefore}
                xScale={xScale}
                yScale={yScale}
            />
            <text
            x={xScale(selection[selection.length - 1].calendarDate) - 2}
            y={yScale(avgTotal) - 10}
            fontSize={'0.95em'}
            fill={mergeColor(avgColor, '#ffffff', true)}
            textAnchor='end'
            style={{ 
                pointerEvents: "none", 
                backgroundColor: 'white',
                fontWeight: 'bold',
            }}
        >
            Avg: {avgTotal.toFixed(0)} = {modTotal.toFixed(0)} + {vigTotal.toFixed(0)}x2
        </text>

            </>
            }
        <ToolTipBar
            svgDimensions={svgDimensions}
            selection={selection}
            handleTooltip={handleTooltip}
            handleMouseLeave={handleMouseLeave}
        />  
            
        </>
    )
}

const ActiveMinutes = ({activeMinutesData}) => {
    return (
        <BrushTimeGraph
            dailyData={activeMinutesData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={ActiveMinutesStackMainGraph}
            brushStyle={getBrushStyle(BRUSH_GREEN)}
            graphTitle='Active Minutes'
            left_factor={1.0}
            isAllowAgg={true}
            svg_id='activeMinutesStack'
            SelectionStats={ActiveMinutesStats}
        />
    );
}

const ActiveMinutesStats = ({selection, allData, svgDimensions}) => {
    const avgTotal = selection.reduce((acc, cur) => acc + cur.allIntensityMinutes, 0) / selection.length;
    const modTotal = selection.reduce((acc, cur) => acc + cur.moderateIntensityMinutes, 0) / selection.length;
    const vigTotal = selection.reduce((acc, cur) => acc + cur.doubleVigorousIntensityMinutes / 2, 0) / selection.length;
    let avgColor = (modTotal >= vigTotal * 2 ) ? modColor : vigColor;
    avgColor = mergeColor(avgColor, '#ffffff', false);

    const stats = {
        avg_total: avgTotal,
        avg_mod: modTotal,
        avg_vig: vigTotal,
    };

    return (
        <StatsDiv
            statsTitle='Avg Active Minutes'
            selection={selection}
            svgDimensions={svgDimensions}
            statsData={[stats.avg_total, stats.avg_mod, stats.avg_vig]}
            fmtFuncs={
                Array.from({length: 3}, () => Math.round)
            }
            units={Array.from({length: 3}, () => 'min')}
            titles={['All', 'Moderate', 'Vigorous']}
            allColors={[avgColor, modColor, vigColor]}
        />
    );
}

export default ActiveMinutes;
