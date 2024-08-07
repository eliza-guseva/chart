import React from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveLinear, curveStepAfter, curveBasis} from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import {LinePath, AreaClosed} from '@visx/shape';
import { Threshold } from '@visx/threshold';
import { GridRows } from '@visx/grid';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate } from '../fileAndDataProcessors';
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

const keys = [
    'dailyTrainingLoadAcute', 
    'dailyTrainingLoadChronic', 
    'dailyAcuteChronicWorkloadRatio', 
    'maxAcuteLoad'
];
const colors = ['#fff'];
const brushKey = 'dailyTrainingLoadAcute';

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
        <LinearGradient id="threshold" from='#f8f9ff64' to='#fdf9fb44' />
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - 2 * margin.left} 
            height={yMax - margin.top} 
            fill="url(#threshold)"
            />
        <GridRows
            left={margin.left}
            scale={yScale}
            width={xMax - 2 * margin.left}
            stroke='#fff'
            strokeOpacity={0.2}
            pointerEvents="none"
          />
          <AreaClosed
            data={selection}
            fill='#0d760aa8'
            stroke='#0d760aff'
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
            stroke='#ffffff'
            strokeWidth={4}
            curve={curveLinear}
        />
        
        <StandardAxisLeft
            label={yLabel}
            yScale={yScale}
            margin={margin}
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
        />
    );
}

export default TrainingLoadTime;