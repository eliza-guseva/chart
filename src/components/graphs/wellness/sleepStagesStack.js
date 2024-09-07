import React from 'react';
import PropTypes from 'prop-types';
import {curveStepBefore} from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { max, min } from 'd3-array';
import { useMemo } from 'react';
import { useTooltip, defaultStyles } from '@visx/tooltip';
import { Line } from '@visx/shape';

import BrushTimeGraph from '../BrushTimeGraph';
import { 
    StandardAxisLeft,
    Grid,
    StatsDiv,
} from '../GraphComponents';
import { MyAreaStackVsDate } from '../MainChartsMods';
import {
    hours2TimeStr,
    LittleCircle,
    mergeColor,
 } from '../graphHelpers';
import { 
    MAIN_GRAPH_BCKG, 
    GRID_COLOR,
    getBrushStyle,
} from '../styles';
import {
    getAvg
} from '../fileAndDataProcessors';
import {
    handleAnyTooltip,
    getThisPeriodData,
    ToolTipBar,
} from '../tooltipHelpers';


const keys = ['deepSleepHours', 'remSleepHours', 'lightSleepHours', 'awakeSleepHours'];
const colors = ['#0056b3', '#cc0099', '#0080ff', '#aa99cc'];
const brushKey = 'totalSleepHours';
const allKeys = ['totalSleepHours', ...keys];
const allColors = ['#fff', ...colors];
const titles = ['Total', 'Deep', 'REM', 'Light', 'Awake'];


function fmtToolTip (d, pointInSvg, xScale, aggrLevel) {
    const x = pointInSvg.x;
    const date = xScale.invert(x);
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';

    const sleepStages = [
        { key: 'totalSleepHours', label: 'Total', color: '#ffffff' },
        { key: 'deepSleepHours', label: 'Deep', color: '#007bff' },
        { key: 'remSleepHours', label: 'REM', color: '#ff44cc' },
        { key: 'lightSleepHours', label: 'Light', color: '#44aaff' },
        { key: 'awakeSleepHours', label: 'Awake', color: '#ccbbee' },
    ];

    return (
        <div>
            <p style={{color: '#ffffffbb', margin: '1px 0'}}>{datestr}</p>
            {sleepStages.map((stage, index) => (
                <React.Fragment key={stage.key}>
                    <p>
                        <LittleCircle color={stage.color}/>
                        {avg}{stage.label}: <strong>{hours2TimeStr(thisDataPoint[stage.key])}</strong>
                    </p>
                    {index === 0 && <hr style={{border: '1px solid #ffffffbb', margin: '2px 0'}} />}
                </React.Fragment>
            ))}
        </div>
    );
}


const SleepStackMainGraph = ({
    selection, 
    svgDimensions, 
    xScale,
    tooltipInfo,
    setTooltipInfo,
    aggrLevel,
}) => {
    const { margin, xMax, yMax } = svgDimensions;
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

    const { 
        tooltipData, 
        tooltipLeft, 
        tooltipTop, 
        tooltipOpen, 
        showTooltip, 
        hideTooltip 
    } = useTooltip();

    const svg_id = 'sleepStack';
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
        );
    };

    const handleMouseLeave = () => {
        setTooltipInfo(['']); // Clear tooltip info
        hideTooltip(); // Hide the tooltip
    };

    // Calculate averages for each sleep stage
    const averages = useMemo(() => {
        return keys.reduce((acc, key) => {
            acc[key] = getAvg(selection, key);
            return acc;
        }, {});
    }, [selection]);

    // Calculate cumulative averages for stacking
    const cumulativeAverages = useMemo(() => {
        let cumulative = 0;
        return keys.map(key => {
            cumulative += averages[key];
            return cumulative;
        });
    }, [averages]);

    // Calculate total average sleep time
    const totalAverage = useMemo(() => 
        keys.reduce((total, key) => total + averages[key], 0),
    [averages]);

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
            aggrLevel: aggrLevel,
            curve: curveStepBefore,
        })}
        {/* Add average lines */}
        {keys.map((key, index) => (
            <Line
                key={`avg-line-${key}`}
                from={{ x: margin.left, y: yScale(cumulativeAverages[index]) }}
                to={{ x: xMax, y: yScale(cumulativeAverages[index]) }}
                stroke={mergeColor(colors[index], '#ffffff', false)}
                strokeWidth={4}
            />
        ))}
        {/* Replace the existing average value labels with this new implementation */}
        <g>
            {keys.map((key, index) => {
                const yPosition = yScale(cumulativeAverages[index]);
                const xPosition = xMax - 10; // Adjust this value to move labels left or right
                const verticalOffset = index === keys.length - 2 ? 1 : -4; 
                const dominantBaseline = index === keys.length - 2 ? 'hanging' : 'text-top';

                return (
                    <text
                        key={`avg-text-${key}`}
                        x={xPosition}
                        y={yPosition + verticalOffset}
                        fontSize={'0.95em'}
                        fill={'#ffffff'}
                        textAnchor="end"
                        dominantBaseline={dominantBaseline}
                    >
                        {`${titles[index + 1]}: ${hours2TimeStr(averages[key])} (${((averages[key] / totalAverage) * 100).toFixed(1)}%)`}
                    </text>
                );
            })}
        </g>

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
        <ToolTipBar 
            svgDimensions={svgDimensions}
            selection={selection}
            handleTooltip={handleTooltip}
            handleMouseLeave={handleMouseLeave}
        />
    </>)}


const SleepStagesStack = ({ sleepData }) => {
    return (
        <BrushTimeGraph
            dailyData={sleepData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={SleepStackMainGraph}
            brushStyle={getBrushStyle(mergeColor('#0056b3', '#ffffff', false))}
            graphTitle='Sleep Stages'
            left_factor={1.0}
            isAllowAgg={true}
            SelectionStats={SleepStagesStats}
            svg_id='sleepStack'
        />
    );
};



const SleepStagesStats = ({selection, allData, svgDimensions}) => {
    const fmtFuncs = Array.from({length: allKeys.length}, () => hours2TimeStr);
    const units = Array.from({length: allKeys.length}, () => 'h');
    
    const avgSleepHours = allKeys.map(key => getAvg(selection, key));
    return (
        StatsDiv({
            statsTitle: 'Avg Sleep Hours',
            selection: selection,
            statsData: avgSleepHours,
            svgDimensions: svgDimensions,
            fmtFuncs: fmtFuncs,
            units: units,
            titles: titles,
            allColors: allColors,
            allKeys: allKeys,
        })
    )
}



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



                