import React from 'react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveLinear} from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import {LinePath, AreaClosed} from '@visx/shape';
import { GridRows } from '@visx/grid';
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
    {score: 4699, color: '#dd2222'},
    {score: 5199, color: '#f56e07'},
    {score: 5699, color: '#ffae00'},
]

function getEnduranceBandColor(score) {
    for (let band of enduranceBands) {
        if (score < band.score) {
            return band.color;
        }
    }

    return '#fff';
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
        <LinearGradient id="area-gradient" from="#7f888e" to="#545b62" />
        <rect 
            x={margin.left} 
            y={margin.top} 
            width={xMax - 2 * margin.left} 
            height={yMax - margin.top} 
            fill="#767d84"/>
        <GridRows
            left={margin.left}
            scale={yScale}
            width={xMax - 2 * margin.left}
            stroke='#fff'
            strokeOpacity={0.2}
            pointerEvents="none"
          />
        {selection.slice(1).map((d, i) => {
                const segmentData = [selection[i], selection[i + 1]];
                return (
                    <LinePath
                        key={`line-segment-${i}`}
                        data={segmentData}
                        x={(d) => xScale(getDate(d))}
                        y={(d) => yScale(d.overallScore)}
                        stroke={getEnduranceBandColor(segmentData[0].overallScore)}
                        strokeWidth={8}
                        curve={curveLinear}
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