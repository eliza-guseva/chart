import React from 'react';
import { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { max, min } from 'd3-array';
import { curveLinear } from '@visx/curve';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { GlyphSquare } from '@visx/glyph';

import { sortData } from '../fileAndDataProcessors';
import BrushTimeGraph from '../BrushTimeGraph';
import { 
    StandardAxisBottom, 
    StandardAxisLeft, 
    Grid 
} from '../GraphComponents';
import { RunSecondaryMetricsEnum } from '../../../common/jsDB';
import { StatsDiv } from '../GraphComponents';
import { sv } from 'date-fns/locale';


const brushStyle = {
    fillColor: "#3cb8b4",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
};



/**
 * Renders the secondary run metrics main graph component.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.selection - Data between the dates selected by the brush.
 * @param {Object} props.svgDimensions - The dimensions of the SVG container.
 * @param {Function} props.xScale - The x-axis scale function.
 * @param {Object} props.tooltipInfo - The tooltip information.
 * @param {Function} props.setTooltipInfo - The function to set the tooltip information.
 * @param {RunSecondaryMetricsEnum} props.metricEnum - The enumeration of the secondary run metrics.
 * @param {string} props.aggrLevel - The aggregation level for the graph.
 * @returns {JSX.Element} The rendered secondary run metrics main graph component.
 */
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
    const metricEnum = RunSecondaryMetricsEnum[brushKey];
    const yLabel = metricEnum.title;
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
            tickFormat={metricEnum.format}
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
            stroke={metricEnum.color}
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
                    fill={metricEnum.color}
                    fillOpacity={0.6}
                    stroke={metricEnum.color}
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
    const metricObj = RunSecondaryMetricsEnum[brushKey];
    // keep only entries with the selected key present in the keys
    runningData = runningData.filter(
        (d) => d[brushKey] !== null && d[brushKey] !== undefined
    );
    console.log('runningData', runningData);
    
    const title = (
        metricObj.title + 
        ' (' + 
        metricObj.unit +
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
            colors={[metricObj.color]}
            left_factor={1.0}
            isAllowAgg={true}
            choices={RunSecondaryMetricsEnum}
            SelectionStats={SecondaryRunStats}
        />
    );
}

const SecondaryRunStats = ( {
    selection,
    svgDimensions,
    metricKey,
}) => {
    const metricObj = RunSecondaryMetricsEnum[metricKey];
    const data = selection.map((d) => d[metricKey]);
    const stats = {
        mean: data.reduce((acc, d) => acc + d, 0) / data.length,
        min: min(data),
        max: max(data),
    };
    return (
        <StatsDiv
            statsTitle={metricObj.title}
            selection={selection}
            svgDimensions={svgDimensions}
            statsData={[stats.mean, stats.min, stats.max]}
            // round to .1
            fmtFuncs={
                Array.from({length: 3}, () => Math.round)
            }
            units={[metricObj.unit, metricObj.unit, metricObj.unit]}
            titles={['Mean', 'Min', 'Max']}
            allColors={[metricObj.color, metricObj.color, metricObj.color]}
        />
    );
}


export default SecondaryRunMetrics;