import React from 'react';
import PropTypes from 'prop-types';
import {curveStepBefore} from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { max, min } from 'd3-array';
import { useMemo } from 'react';
import { useTooltip, defaultStyles } from '@visx/tooltip';

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
const colors = ['#007bff', '#ff44cc', '#44aaff', '#ccbbee'];
const brushKey = 'totalSleepHours';
const allKeys = ['totalSleepHours', ...keys];
const allColors = ['#fff', ...colors];
const titles = ['Total', 'Deep', 'REM', 'Light', 'Awake'];


function fmtToolTip (d, pointInSvg, xScale, aggrLevel) {
    const x = pointInSvg.x;
    const date = xScale.invert(x);
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';

    return (
        <div>
        <p style={{color: '#ffffffbb', margin: '1px 0'}}>{datestr}</p>
        <p><LittleCircle color='#ffffff'/>{avg}Total:{' '}
            <strong>{hours2TimeStr(thisDataPoint.totalSleepHours)}</strong></p>
            <hr style={{border: '1px solid #ffffffbb', margin: '2px 0'}} />
        <p><LittleCircle color='#007bff'/>{avg}Deep:{' '}
            <strong>{hours2TimeStr(thisDataPoint.deepSleepHours)}</strong></p>
        <p><LittleCircle color='#ff44cc'/>{avg}REM:{' '}
            <strong>{hours2TimeStr(thisDataPoint.remSleepHours)}</strong></p>
        <p><LittleCircle color='#44aaff'/>{avg}Light:{' '}
            <strong>{hours2TimeStr(thisDataPoint.lightSleepHours)}</strong></p>
        <p><LittleCircle color='#ccbbee'/>{avg}Awake:{' '}
            <strong>{hours2TimeStr(thisDataPoint.awakeSleepHours)}</strong></p>

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
            brushStyle={getBrushStyle(mergeColor('#44aaff', '#888888'))}
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



                