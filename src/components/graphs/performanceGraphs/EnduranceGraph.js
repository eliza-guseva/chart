import React from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveMonotoneY, curveLinear} from '@visx/curve';
import {LinePath} from '@visx/shape';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate } from '../fileAndDataProcessors';
import { getMainChartBottom } from '../graphHelpers';
import { StandardAxisLeft, StandardAxisBottom } from '../GraphComponents';


const brushStyle = {
    fillColor: "#ffddff",
    accentColor: "#f6acc8",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}


const keys = ['overallScore'];
const colors = ['#fff'];
const brushKey = 'overallScore';

const enduranceBands = [
    {score: 4699, color: '#ff0000'},
    {score: 5199, color: '#f56e07'},
    {score: 5699, color: '#ffae00'},
]



const EnduranceMainGraph = ({ 
    selection, 
    svgDimensions,
    xScale,  
    ...props}) => {
    const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
    const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
    const yLabel = 'Endurance score';
    const yScale = useMemo(
        () =>
            scaleLinear({
            range: [yMax, margin.top],
            domain: [min(selection, (d) => d[brushKey]), max(selection, (d) => d[brushKey])],
            nice: true,
            }),
        [yMax, selection, margin]
    );
    return (<><LinePath 
        data={selection} 
        x={d => xScale(getDate(d))}
        y={d => yScale(d.overallScore)} 
        stroke={colors[0]}
        strokeWidth={5}
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
        </>);
    };
        


const EnduranceGraph = ({ enduranceData }) => {
    return (
        <BrushTimeGraph
            dailyData={enduranceData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={EnduranceMainGraph}
            brushStyle={brushStyle}
            graphTitle='Endurance score'
            colors={colors}
            left_factor={1.6}
        />
    );
};

export default EnduranceGraph;