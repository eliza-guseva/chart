import React from 'react';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveStepBefore} from '@visx/curve';
import {AreaClosed} from '@visx/shape';
import { useTooltip, defaultStyles } from '@visx/tooltip';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate, getAvg } from '../fileAndDataProcessors';
import { 
    locateEventLocalNAbs, 
    getThisPeriodData,
    ToolTipBar } from '../tooltipHelpers';
import { 
    StandardAxisLeft, 
    StandardAxisBottom,
    Grid,
    StatsDiv,
} from '../GraphComponents';

import { LittleCircle } from '../graphHelpers';


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

function ftmToolTip (d, point, xScale, aggrLevel) {
    const x = point.x;
    const date = xScale.invert(x)
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';
    const color = getEnduranceBandColor(thisDataPoint.overallScore);
    return (
        <div>
        <p style={{color: '#ffffffbb'}} >{datestr}</p>
        <p><LittleCircle color={color}/>{avg}Endurance score:{' '}
             <strong>{thisDataPoint.overallScore.toFixed(0)}</strong></p>
        </div>
    )
}


const EnduranceMainGraph = ({ 
    selection, 
    svgDimensions,
    xScale,  
    tooltipInfo,
    setTooltipInfo,
    aggrLevel,
    ...props}) => {
    console.log('svgDimensions', svgDimensions);
    const { margin, xMax, yMax } = svgDimensions;
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

    const { 
        tooltipData, 
        tooltipLeft, 
        tooltipTop, 
        tooltipOpen, 
        showTooltip, 
        hideTooltip 
    } = useTooltip();

    const handleTooltip = (event, data) => {
        if (data.length === 0) {
            return;
        }
        const { pointInSvg, svgTop, svgLeft } = locateEventLocalNAbs(event, 'enduranceScore');
        if (pointInSvg) {
            console.log('pointInSvg', pointInSvg);
            setTooltipInfo([
                {
                    tooltipData: tooltipData,
                    tooltipLeft: pointInSvg.x + svgLeft,
                    tooltipTop: svgTop + yMax + margin.top - 24,
                    loc_x: pointInSvg.x,
                    loc_y: pointInSvg.y,
                    style: {
                        ...defaultStyles,
                        backgroundColor: '#2d363fdd',
                        color: '#fff',
                        border: 'none',
                        lineHeight: '1.2',
                    },
                }
            ]);
            showTooltip({
                tooltipData: ftmToolTip(data, pointInSvg, xScale, aggrLevel),
                tooltipLeft: pointInSvg.x + svgLeft,
                tooltipTop: svgTop + yMax + 24,
            });
        }}

    const handleMouseLeave = () => {
        setTooltipInfo(['']); 
        hideTooltip();
    };

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
                        curve={curveStepBefore}
                        xScale={xScale}
                        yScale={yScale}
                    />
                );
            })}
        <ToolTipBar
            svgDimensions={svgDimensions}
            selection={selection}
            handleTooltip={handleTooltip}
            handleMouseLeave={handleMouseLeave}
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
            svg_id='enduranceScore'
            colors={colors}
            left_factor={1.6}
            isAllowAgg={true}
            SelectionStats={EnduranceStats}
        />
    );
};

const EnduranceStats = ({selection, allData, svgDimensions}) => {
    const titles = ['Endurance score'];
    const allKeys = ['overallScore'];
    const averages = [getAvg(selection, 'overallScore')];
    const fmtFuncs = Array.from({length: allKeys.length}, () => Math.round);
    const units = Array.from({length: allKeys.length}, () => '');
    const allColors = [getEnduranceBandColor(averages[0])];
    return (
        StatsDiv({
            statsTitle: 'Avg Endurance score',
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

export default EnduranceGraph;