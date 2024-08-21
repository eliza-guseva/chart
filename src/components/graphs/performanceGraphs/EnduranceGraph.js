import React from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveStepBefore, curveStepAfter} from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import {LinePath, AreaClosed} from '@visx/shape';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate } from '../fileAndDataProcessors';
import { getMainChartBottom } from '../graphHelpers';
import { 
    StandardAxisLeft, 
    StandardAxisBottom,
    Grid,
} from '../GraphComponents';


const brushStyle = {
    fillColor: "#676e72",
    accentColor: "#e8e6ff",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}


const keys = ['overallScore'];
const colors = ['#fff'];
const brushKey = 'overallScore';

const enduranceBands = [
    {score: 4699, color: '#c43535'},
    {score: 5199, color: '#eb7531'},
    {score: 5699, color: '#f59807'},
    {score: 6299, color: '#04a90f'},
    {score: 6799, color: '#1d4bea'},
    {score: 7299, color: '#8d4bea'},
]

function getEnduranceBandColor(score) {
    for (let band of enduranceBands) {
        if (score < band.score) {
            return band.color;
        }
    }

    return '#ed4bea';
}

const EnduranceMainGraph = ({ 
    selection, 
    svgDimensions,
    xScale,  
    ...props}) => {
    const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
    const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
    const xMax = svgWidth - margin.right;
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
    return (<>
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - margin.left} 
            height={yMax - margin.top} 
            fill="#f8f9fb11"/>
        <Grid
            rows={true}
            cols={true}
            xScale={xScale}
            yScale={yScale}
            xMax={xMax}
            yMax={yMax}
            margin={margin}
        />
        {selection.slice(1).map((d, i) => {
                const segmentData = [selection[i], selection[i + 1]];
                return (
                    <AreaClosed
                        key={`line-segment-${i}`}
                        data={segmentData}
                        x={(d) => xScale(getDate(d))}
                        y={(d) => yScale(d.overallScore)}
                        stroke={getEnduranceBandColor(segmentData[0].overallScore)}
                        fill={getEnduranceBandColor(segmentData[0].overallScore)}
                        strokeWidth={1}
                        curve={curveStepAfter}
                        xScale={xScale}
                        yScale={yScale}
                    />
                );
            })}
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