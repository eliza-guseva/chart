import React from 'react';
import { useMemo } from 'react';
import { max } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveLinear, curveBasis} from '@visx/curve';
import {LinePath, AreaClosed} from '@visx/shape';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate, getAvg } from '../fileAndDataProcessors';
import { getMainChartBottom } from '../graphHelpers';
import { 
    StandardAxisLeft, 
    StandardAxisBottom, 
    Grid,
    StatsDiv,
} from '../GraphComponents';


const brushStyle = {
    fillColor: "#676e72",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

const keys = [
    'dailyTrainingLoadAcute', 
    'dailyTrainingLoadChronic', 
    'dailyAcuteChronicWorkloadRatio', 
    'maxAcuteLoad'
];
const colors = ['#fff'];
const brushKey = 'dailyTrainingLoadAcute';


/**
 * Renders the main graph component for the Training Load time graph.
 *
 * @param {Object[]} selection - The data points to be displayed on the graph.
 * @param {Object} svgDimensions - The dimensions of the SVG container.
 * @param {Object} xScale - The x-axis scale.
 * @param {Object} props - Additional props.
 * @returns {JSX.Element} The rendered TrainingLoadMainGraph component.
 */
const TrainingLoadMainGraph = ({
    selection, 
    svgDimensions,
    xScale,  
    ...props}) => {
        const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
        const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
        const xMax = svgWidth - margin.right;
        const yLabel = 'Training Load';
        const yScale = useMemo(
            () =>
                scaleLinear({
                range: [yMax, margin.top],
                domain: [0, max(selection, (d) => d['maxAcuteLoad'])],
                nice: true,
                }),
            [yMax, selection, margin]
        );
    return (<>
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - margin.left} 
            height={yMax - margin.top} 
            fill="#f8f9fb11"
            />
        <Grid
            rows={true}
            cols={true}
            xScale={xScale}
            yScale={yScale}
            xMax={xMax}
            yMax={yMax}
            margin={margin}
        />
          <AreaClosed
            data={selection}
            fill='#108010bb'
            stroke='#108010ff'
            x={(d) => xScale(getDate(d))}
            y0={(d) => yScale(d[keys[1]] * 0.8)}
            y1={(d) => yScale(d[keys[1]] * 1.5)}
            yScale={yScale}
            curve={curveBasis}
                />
        <LinePath
            data={selection}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(d[keys[0]])}
            stroke='#ddffdd'
            strokeWidth={4}
            curve={curveLinear}
        />
        
        <StandardAxisLeft
            label={yLabel}
            yScale={yScale}
            svgDimensions={svgDimensions}
            dx={(svgDimensions.width < 600) ? '0.0em' : '-0.5em'}
        />
        <StandardAxisBottom
            data={selection}
            yMax={yMax}
            xScale={xScale}
        />
    </>)
}

/**
 * Renders the Training Load Time graph component.
 *
 * @param {Object} trainingLoadData - The training load data.
 * @returns {JSX.Element} The rendered TrainingLoadTime component.
 */
const TrainingLoadTime = ({ trainingLoadData }) => {
    console.log('traingLoad', trainingLoadData.slice(105, 115));
    return (
        <BrushTimeGraph
            dailyData={trainingLoadData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={TrainingLoadMainGraph}
            brushStyle={brushStyle}
            graphTitle='Acute Training Load'
            colors={colors}
            left_factor={1.4}
            isAllowAgg={true}
            SelectionStats={TrLoadStats}
        />
    );
}

const TrLoadStats = ({selection, allData, svgDimensions}) => {
    const titles = ['Avg Acute Load', 'Avg Chronic Load', 'Avg Acute/Chronic',];
    const allKeys = ['dailyTrainingLoadAcute', 'dailyTrainingLoadChronic', 
    'dailyAcuteChronicWorkloadRatio'];
    const averages = allKeys.map((key) => getAvg(selection, key));
    const fmtFuncs = [Math.round, Math.round,  (d) => d.toFixed(1)];
    const units = Array.from({length: allKeys.length}, () => '');
    const allColors = ['#108010', '#108010', '#108010',];
    return (
        StatsDiv({
            statsTitle: 'Training Load Stats',
            selection: selection,
            statsData: averages,
            svgDimensions: svgDimensions,
            fmtFuncs: fmtFuncs,
            units: units,
            titles: titles,
            allColors: allColors,
            allKeys: allKeys,
        })
    )
}

export default TrainingLoadTime;