import {React} from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import {curveLinear, curveStepBefore} from '@visx/curve';
import {LinePath, Bar, AreaClosed} from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { GlyphSquare } from '@visx/glyph';
import { Group } from '@visx/group';
import { useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import BrushTimeGraph from '../BrushTimeGraph';
import { 
    getDate, 
    sortData, 
    selectDaysAgo, 
    aggregateData, 
    getMin, 
    getMedian
} from '../fileAndDataProcessors';
import { getMainChartBottom, formatDateYearPretty } from '../graphHelpers';
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

    function formatTooltipData(d) {
        const date = formatDateYearPretty(d['calendarDate']);
        const avgPace = (
            Math.floor(d['pace_minkm']) 
            + ':' 
            + Math.floor((d['pace_minkm'] % 1) * 60).toString().padStart(2, '0')
        );
        // add new line
        return (
                <div>
                    <strong>Date:</strong> {date} <br />
                    <strong>Pace:</strong> {avgPace} min/km <br />
                    <strong>Distance:</strong> {d['distance_km'].toFixed(2)} km <br />
                    <strong>Elevation: 🔼</strong> {d['elevationGain_m'].toFixed(0)} m 🔽 {d['elevationLoss_m'].toFixed(0)} m
                </div>
            );
    }

    const handleTooltip = (event, datapoint) => {
        const svg = event.currentTarget.ownerSVGElement;
        const point = localPoint(svg, event);
        
        if (point) {
            const { top, left } = svg.getBoundingClientRect();
            setTooltipInfo(
                {
                    tooltipData: tooltipData,
                    tooltipLeft: tooltipLeft,
                    tooltipTop: tooltipTop,
                }
            );
            showTooltip({
            tooltipData: formatTooltipData(datapoint),
            tooltipLeft: point.x + left,
            tooltipTop: point.y + margin.top + 24 + top,
            });
            
        }
        };
    const handleMouseLeave = () => {
        setTooltipInfo(''); // Clear tooltip info
        hideTooltip(); // Hide the tooltip
    };

    return (<>
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
            stroke='#d4ffdd'
            strokeWidth={6}
            curve={curveLinear}
            yScale={yScale}
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
                    onTouchStart={(event) => handleTooltip(event, d)}
                    onTouchMove={(event) => handleTooltip(event, d)}
                    onMouseMove={(event) => handleTooltip(event, d)}
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
    console.log('runningData', runningData[180]);
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