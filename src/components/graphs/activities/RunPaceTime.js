import {React} from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import {curveLinear} from '@visx/curve';
import {LinePath, Bar, Line} from '@visx/shape';
import { GlyphSquare } from '@visx/glyph';
import { Group } from '@visx/group';
import { useTooltip, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    getDate, 
    sortData, 
    selectDaysAgo, 
    aggregateData, 
    getMin, 
    getMedian
} from '../fileAndDataProcessors';
import { 
    getMainChartBottom, 
    formatDateYearPretty, 
    fmtMonthlyDatestr,
    hours2TimeStr
} from '../graphHelpers';
import { StandardAxisLeft, StandardAxisBottom, Grid } from '../GraphComponents';

const brushStyle = {
    fillColor: "#676e72",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

const keys = ['pace_minkm'];
const colors = ['#fff'];
const brushKey = 'pace_minkm';


function fmtSingleRunToolTip(d) {
    const date = formatDateYearPretty(d['calendarDate']);
    const avgPace = (
        Math.floor(d['pace_minkm']) 
        + ':' 
        + Math.floor((d['pace_minkm'] % 1) * 60).toString().padStart(2, '0')
    );
    
    return (
            <div>
                <p style={{color: '#ffffffbb'}} > 🏃🏽 {date} 🏃🏽‍♀️</p>
                Pace: <strong>{avgPace} min/km </strong> <br />
                Distance: <strong> {d['distance_km'].toFixed(2)} km </strong> <br />
                Avg HR: <strong> {d['avgHr'].toFixed(0)} bpm </strong> <br />
                Elevation: <strong>🔼 {d['elevationGain_m'].toFixed(0)} m 🔽 {d['elevationLoss_m'].toFixed(0)} m </strong>
            </div>
        );
}


function fmtMonthlyToolTip(d, point, xScale) {
    const x = point.x;
    const date = xScale.invert(x)
    // d is an array of objects. find the one with the date less than date and max date
    const selectedMonth = min(d.filter((d) => {
        return (getDate(d) >= date);
    })) || d[d.length - 1];
    const thirtyDaysBefore = new Date(selectedMonth.calendarDate - 29 * 24 * 60 * 60 * 1000);
    const datestr = fmtMonthlyDatestr(selectedMonth.calendarDate, thirtyDaysBefore);
    let medianPace = selectedMonth['pace_minkm'];
    medianPace = ' ' + hours2TimeStr(medianPace);
    return (
        <div>
            <p style={{color: '#ffffffbb'}} >{datestr}</p>
            Median Run: <strong>{medianPace} min/km </strong> 
        </div>
    );
}


const RunPaceMainGraph = ({ 
    selection, 
    svgDimensions, 
    xScale, 
    tooltipInfo,
    setTooltipInfo,
    ...props }) => 
{
    const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
    const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
    const xMax = svgWidth - margin.right;
    const yLabel = 'Pace (min/km)';
    const yScale = useMemo(
        () =>
            scaleLinear({
            range: [yMax, margin.top],
            domain: [max(selection, (d) => d[brushKey]), min(selection, (d) => d[brushKey])],
            nice: true,
            }),
        [yMax, selection, margin]
    );

    const monthly = aggregateData(selection, 'month', keys, selectDaysAgo, getMedian);
    const monthlyMin = aggregateData(selection, 'month', keys, selectDaysAgo, getMin);

    // get max value of absolute selection.homolElGain_m
    const maxAbsHomolElGain = max(selection, (d) => Math.abs(d[
        'homolElGain_m'
    ]));
    const colorScale = scaleSequential(interpolateRdBu)
    .domain([maxAbsHomolElGain, -maxAbsHomolElGain]);

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
            if (data['name'] === 'single') {
                const datapoint = data['data'];
                setTooltipInfo(
                    [{
                        tooltipData: tooltipData,
                        tooltipLeft: tooltipLeft,
                        tooltipTop: tooltipTop,
                        style: {
                            ...defaultStyles,
                            backgroundColor: '#2d363fdd',
                            color: '#fff',
                            border: 'none',
                            lineHeight: '1.2',
                        },
                        loc_x: point.x,
                        loc_y: point.y,
                    }]
                );
                showTooltip({
                    tooltipData: fmtSingleRunToolTip(datapoint),
                    tooltipLeft: point.x + left,
                    tooltipTop: point.y + margin.top + 24 + top,
                });
            } else if (data['name'] === 'monthly') {
                const datapoint = data['data'];
                setTooltipInfo([
                    {
                        tooltipData: tooltipData,
                        tooltipLeft: point.x + left,
                        tooltipTop: top + yMax + margin.top - 24,
                        loc_x: point.x,
                        loc_y: point.y,
                        style: {
                            ...defaultStyles,
                            backgroundColor: '#2d363fdd',
                            color: '#fff',
                            border: 'none',
                            lineHeight: '1.2',
                        },
                    }
                ])
                showTooltip({
                    tooltipData: fmtMonthlyToolTip(datapoint, point, xScale),
                    tooltipLeft: point.x + left,
                    tooltipTop: top + yMax + 24,
                });
            }
        };
    };
    const handleMouseLeave = () => {
        setTooltipInfo(['']); // Clear tooltip info
        hideTooltip(); // Hide the tooltip
    };
    return (<>
    <LinearGradient 
        id="lineGradient" 
        from="#3cb7b4" 
        to="#42e397" 
        vertical={false} />
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
            tickFormat='0.1f'
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
        <LinePath
            data={monthly}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(d[brushKey])}
            stroke='url(#lineGradient)'
            strokeWidth={6}
            curve={curveLinear}
            yScale={yScale}
        />
        {tooltipData &&  <Line
            // locate at cursor point
            from={{ x: tooltipInfo[0].loc_x, y: margin.top }}
            to={{ x: tooltipInfo[0].loc_x, y: yMax }}
            stroke='#ffffff'
              />}
        <Bar
            x={margin.left}
            y={margin.top}
            width={xMax - margin.left}
            height={yMax - margin.top}
            fill='transparent'
            onTouchStart={(event) => handleTooltip(event, {'name': 'monthly', 'data': monthly})}
            onTouchMove={(event) => handleTooltip(event, {'name': 'monthly', 'data': monthly})}
            onMouseMove={(event) => handleTooltip(event, {'name': 'monthly', 'data': monthly})}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleMouseLeave}
        />
        <Group>
        {selection.map((d, i) => {
            const date = getDate(d);
            const x = xScale(date);
            const y = yScale(d[brushKey]);
            return (
                <GlyphSquare
                    key={i}
                    left={x}
                    top={y}
                    size={10 * d['distance_km']}
                    fill={colorScale(d['homolElGain_m'])}
                    fillOpacity={0.6}
                    stroke={colorScale(d['homolElGain_m'])}
                    strokeWidth={1}
                    onTouchStart={(event) => handleTooltip(event, {'name': 'single', 'data': d})}
                    onTouchMove={(event) => handleTooltip(event, {'name': 'single', 'data': d})}
                    onMouseMove={(event) => handleTooltip(event, {'name': 'single', 'data': d})}
                    onMouseLeave={handleMouseLeave}
                    onTouchEnd={handleMouseLeave}
                />
            );
        })}
        </Group>
        </>);
}


const RunPaceTime = ({ runningData }) => {
    runningData = sortData(runningData, 'calendarDate');
    return (
        <BrushTimeGraph
            dailyData={runningData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={RunPaceMainGraph}
            brushStyle={brushStyle}
            graphTitle='Pace vs time, (min/km)'
            colors={colors}
            left_factor={1.0}
            isAllowAgg={false}
            inverseBrush={true}
        />
    );
}

RunPaceTime.propTypes = {
    runningData: PropTypes.array,
};

export default RunPaceTime;