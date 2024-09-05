import React from 'react';
import { useMemo } from 'react';

import { scaleLinear } from '@visx/scale';
import { curveLinear, curveBasis, curveNatural } from '@visx/curve';
import { LinePath, BarGroup } from '@visx/shape';
import { min, max } from 'd3-array';

import BrushTimeGraph from '../BrushTimeGraph';
import { getBrushStyle } from '../styles';
import { getMainChartBottom } from '../graphHelpers';
import { 
    Grid,
    StandardAxisLeft,
    StandardAxisBottom,
    StatsDiv
 } from '../GraphComponents';
import { getDate, getAvg } from '../fileAndDataProcessors';




const keys = [
    "qualityScore",
    "recoveryScore",
    "restfulnessScore",
    "overallScore",
]
const colors = ["#ff44ccbb", "#44aaffbb", "#ccbbeebb", "#fff"];
const brushKey = 'overallScore';
const strokeTypes = ['dashed', 'dotted', 'dash-dotted', 'solid'];
const strokeWidths = [3, 3, 3, 5];
const titles = ['Quality Score', 'Recovery Score', 'Restfulness Score', 'Overall Score'];

const SleepScoresMainGraph = ({selection, 
    svgDimensions,
    xScale,  
    ...props}) => {
        const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
        const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
        const xMax = svgWidth - margin.right;
        const yLabel = 'Sleep Score';
        const lowestScore = min(selection, (d) => min(keys.map((key) => d[key])));
        const highestScore = max(selection, (d) => max(keys.map((key) => d[key])));
        const yScale = useMemo(
            () =>
                scaleLinear({
                range: [yMax, margin.top],
                domain: [lowestScore, highestScore],
                nice: true,
                }),
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
            {keys.map((key) => {
                return (
                    <LinePath
                        key={key}
                        data={selection}
                        x={(d) => xScale(getDate(d))}
                        y={(d) => yScale(d[key])}
                        stroke={colors[keys.indexOf(key)]}
                        strokeWidth={strokeWidths[keys.indexOf(key)]}
                        curve={curveNatural}
                    />
                );
            }
            )}
        <StandardAxisLeft
            label={yLabel}
            yScale={yScale}
            svgDimensions={svgDimensions}
            dx='0.0em'
        />
        <StandardAxisBottom
            data={selection}
            yMax={yMax}
            xScale={xScale}
        />
            </>);

}


const SleepScores = ({sleepData}) => {
    sleepData = sleepData.map((d) => {
        return {
            calendarDate: d.calendarDate,
            ...d.sleepScores
        }
    });
    // add scoresSum to sleepData
    sleepData = sleepData.map((d, i) => {
        return {
            ...d,
            scoresSum: keys.reduce((acc, key) => acc + d[key], 0)
        }
    });
    // scoresSum not null or undefined and not NaN
    sleepData = sleepData.filter(
        (d) => d.scoresSum !== null && d.scoresSum !== undefined
        && !isNaN(d.scoresSum));
    return (
        <BrushTimeGraph
            dailyData={sleepData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={SleepScoresMainGraph}
            brushStyle={getBrushStyle('#f6acc8')}
            graphTitle='Sleep Scores'
            left_factor={1.0}
            isAllowAgg={true}
            SelectionStats={SleepScoresStats}
        />
    );
}

const SleepScoresStats = ({
    selection,
    svgDimensions,
}) => {
    const averages = keys.map((key) => getAvg(selection, key));
    const fmtFuncs = Array.from({length: keys.length}, () => Math.round);
    const units = Array.from({length: keys.length}, () => '');
    return (
        StatsDiv({
            statsTitle: 'Sleep Scores',
            selection: selection,
            svgDimensions: svgDimensions,
            statsData: averages,
            fmtFuncs: fmtFuncs,
            units: units,
            titles: titles,
            allColors: colors,
        })
    );
}

export default SleepScores;