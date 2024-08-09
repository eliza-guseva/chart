import React from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import { scaleSequential } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';
import {curveStepBefore, curveStepAfter, curveLinear} from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import {LinePath, AreaClosed} from '@visx/shape';
import { GlyphSquare } from '@visx/glyph';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    getDate, 
    sortData, 
    selectDaysAgo, 
    aggregateData, 
    getAvg, 
    getMin, 
    getMedian
} from '../fileAndDataProcessors';
import { getMainChartBottom } from '../graphHelpers';
import { StandardAxisLeft, StandardAxisBottom } from '../GraphComponents';

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

    return (<>
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - margin.left} 
            height={yMax - margin.top} 
            fill="#f8f9fb44"/>
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
        <LinePath
            data={monthly}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(d[brushKey])}
            stroke='#ccffcc'
            strokeWidth={4}
            curve={curveLinear}
        />
        <LinePath
            data={monthlyMin}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(d[brushKey])}
            stroke='#44dd44'
            strokeWidth={4}
            curve={curveLinear}
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
                    fillOpacity={0.5}
                    stroke={colorScale(d['homolElGain_m'])}
                    strokeWidth={1}
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
            left_factor={1.4}
            isAllowAgg={false}
            inverseBrush={true}
        />
    );
}

RunPaceTime.propTypes = {
    runningData: PropTypes.array,
};

export default RunPaceTime;