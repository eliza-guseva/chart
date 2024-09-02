import React from 'react';
import { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { max, min } from 'd3-array';
import { curveLinear } from '@visx/curve';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { GlyphStar, GlyphCircle, GlyphSquare } from '@visx/glyph';

import { sortData } from '../fileAndDataProcessors';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    StandardAxisBottom, 
    StandardAxisLeft, 
    Grid 
} from '../GraphComponents';


const brushStyle = {
    fillColor: "#3cb8b4",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
};

const metricOptions = {
    'avgDoubleCadence': {
        'title': 'Cadence',
        'unit': 'spm',
        'format': '.0f',
        'color': '#ff7f0e',
    },
    'avgGroundContactTime': {
        'title': 'Ground Contact Time',
        'unit': 'ms',
        'format': '.0f',
        'color': '#1f77b4',
    },
    'avgPower': {
        'title': 'Power',
        'unit': 'W',
        'format': '.0f',
        'color': '#2ca02c',
    },
    'avgStrideLength': {
        'title': 'Stride Length',
        'unit': 'cm',
        'format': '.0f',
        'color': '#d62728',
    },
    'avgVerticalOscillation': {
        'title': 'Vertical Oscillation',
        'unit': 'cm',
        'format': '.1f',
        'color': '#9467bd',
    },
    'avgVerticalRatio': {
        'title': 'Vertical Ratio',
        'unit': '%',
        'format': '.2f',
        'color': '#8c564b',
    },
    'vO2MaxValue': {
        'title': 'VO2 Max',
        'unit': 'ml/kg/min',
        'format': '.0f',
        'color': '#e377c2',
    },
}

const SecondaryRunMetricsMainGraph = ({
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
    const yLabel = metricOptions[brushKey].title;
    const yScale = useMemo(
        () =>
            scaleLinear({
            range: [yMax, margin.top],
            domain: [min(selection, (d) => d[brushKey]), max(selection, (d) => d[brushKey])],
            nice: true,
            }),
        [yMax, selection, margin, brushKey]
    );
    console.log('selection', selection.slice(0, 5));
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
            tickFormat={metricOptions[brushKey].format}
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
            stroke={metricOptions[brushKey].color}
            strokeWidth={4}
            curve={curveLinear}
        />}
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
                    fill={metricOptions[brushKey].color}
                    fillOpacity={0.6}
                    stroke={metricOptions[brushKey].color}
                    strokeWidth={1}
                />
            );
        })}
        </Group>
        </>
    )
    
}

const SecondaryRunMetrics = ({runningData}) => {
    runningData = sortData(runningData, 'calendarDate');
    const brushKey = 'avgDoubleCadence';
    // keep only entries with the selected key present in the keys
    runningData = runningData.filter(
        (d) => d[brushKey] !== null && d[brushKey] !== undefined
    );
    console.log('runningData', runningData);
    
    const title = (
        metricOptions[brushKey].title + 
        ' (' + 
        metricOptions[brushKey].unit +
        ')' 
    );
    return (
        <BrushTimeGraph
            dailyData={runningData}
            keys={[brushKey]}
            brushKey={brushKey}
            mainGraphComponent={SecondaryRunMetricsMainGraph}
            brushStyle={brushStyle}
            graphTitle={title}
            colors={[metricOptions[brushKey].color]}
            left_factor={1.0}
            isAllowAgg={true}
        />
    );
}

export default SecondaryRunMetrics;