import React from 'react';
import PropTypes from 'prop-types';
import {curveStepBefore} from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { max, min } from 'd3-array';
import { useMemo } from 'react';
import { useTooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Bar } from '@visx/shape';
import { addDays} from 'date-fns';

import BrushTimeGraph from '../BrushTimeGraph';
import { 
    MyAreaStackVsDate,  
    StandardAxisLeft,
    Grid,
    StatsDiv,
} from '../GraphComponents';
import {
    getMainChartBottom,
    formatDate,
    hours2TimeStr,
    LittleCircle,
    fmtTwoDatestr,
 } from '../graphHelpers';
import { 
    MAIN_GRAPH_BCKG, 
    GRID_COLOR,
} from '../styles';
import {
    getDate,
    getAvg
} from '../fileAndDataProcessors';
import { sv } from 'date-fns/locale';


const brushStyle = {
    fillColor: "#4bb0ff",
    accentColor: "#c8d6f2",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

const keys = ['deepSleepHours', 'remSleepHours', 'lightSleepHours', 'awakeSleepHours'];
const colors = ['#007bff', '#ff44cc', '#44aaff', '#ccbbee'];
const brushKey = 'totalSleepHours';
const allKeys = ['totalSleepHours', ...keys];
const allColors = ['#fff', ...colors];
const titles = ['Total', 'Deep', 'REM', 'Light', 'Awake'];


const ToolTipDiv = ({d, point, xScale, aggrLevel}) => {
    const x = point.x;
    const date = xScale.invert(x);
    let datestr;
    let avgText = '';
    const selectedPeriod = min(d.filter((d) => {
        return (getDate(d) >= date);
    })) || d[d.length - 1];
    if (aggrLevel === 'daily') {
        datestr = formatDate(date);

    }
    else {
        avgText = 'Avg ';
        const periodBeforeDt = addDays((d[d.indexOf(selectedPeriod) - 1] || d[0]).calendarDate, 1);
        if (selectedPeriod['calendarDate'].getMonth() 
            === periodBeforeDt.getMonth()) {
            datestr = (
                formatDate(periodBeforeDt)
                + ' - ' + 
                selectedPeriod['calendarDate'].getDate()
            );
        }
        else {
            datestr = (
                formatDate(periodBeforeDt)
                + ' - ' 
                + formatDate(getDate(selectedPeriod))
            );}
    }

    return (
        <div>
        <p style={{color: '#ffffffbb'}}>{datestr}</p>
        {allKeys.map((key, index) => (
            <div key={key}>
                {index === 0 ? (
                    <>
                        <p>
                            <LittleCircle color={allColors[index]} />
                            {avgText} {titles[index]}: <strong>{hours2TimeStr(selectedPeriod[key])}</strong>
                        </p>
                        <hr style={{ borderTop: '1px solid #ccc', margin: '0.25rem 0' }} />
                    </>
                ) : (
                    <p>
                        <LittleCircle color={allColors[index]} />
                        {avgText} {titles[index]}: <strong>{hours2TimeStr(selectedPeriod[key])}</strong>
                    </p>
                )}
            </div>
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
    const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
    const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
    const xMax = svgWidth - margin.right;
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

    const handleTooltip = (event, data) => {
        const svg = event.currentTarget.ownerSVGElement;
        const point = localPoint(svg, event);

        if (point) {
            const { top, left } = svg.getBoundingClientRect();
            const datapoint = data['data'];
                setTooltipInfo([
                    {
                        tooltipData: tooltipData,
                        tooltipLeft: point.x + left,
                        tooltipTop: top + yMax + margin.top - 12,
                        style: {
                            ...defaultStyles,
                            backgroundColor: '#2d363fdd',
                            color: '#fff',
                            border: 'none',
                            lineHeight: '1.2',
                        },
                        loc_x: point.x,
                        loc_y: point.y,
                    }
                ])
                showTooltip({
                    tooltipData: ToolTipDiv({
                        d: selection,
                        point: point,
                        xScale: xScale,
                        aggrLevel: aggrLevel,
                    }),
                    tooltipLeft: point.x + left,
                    tooltipTop: top + yMax + 24,
                });
        }
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
        <Bar
            x={margin.left}
            y={margin.top}
            width={xMax - margin.left}
            height={yMax - margin.top}
            fill='transparent'
            onTouchStart={(event) => handleTooltip(event, {'name': 'selection', 'data': selection})}
            onTouchMove={(event) => handleTooltip(event, {'name': 'selection', 'data': selection})}
            onMouseMove={(event) => handleTooltip(event, {'name': 'selection', 'data': selection})}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleMouseLeave}
        />
    </>)}


const SleepStagesStack = ({ sleepData }) => {
    return (
        <BrushTimeGraph
            dailyData={sleepData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={SleepStackMainGraph}
            brushStyle={brushStyle}
            graphTitle='Sleep Stages'
            left_factor={1.0}
            isAllowAgg={true}
            SelectionStats={SleepStagesStats}
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



                