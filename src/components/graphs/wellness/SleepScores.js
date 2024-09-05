import React from 'react';
import { useMemo } from 'react';

import { scaleLinear } from '@visx/scale';
import { curveBasis, curveStepBefore } from '@visx/curve';
import { LinePath, AreaClosed } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { min, max } from 'd3-array';
import { LinearGradient } from '@visx/gradient';

import BrushTimeGraph from '../BrushTimeGraph';
import { getBrushStyle } from '../styles';
import { 
    isData,
    LittleCircle,
 } from '../graphHelpers';
import { 
    Grid,
    StandardAxisLeft,
    StandardAxisBottom,
    StatsDiv
 } from '../GraphComponents';
import { 
    handleAnyTooltip, 
    ToolTipBar, 
    getThisPeriodData, 
} from '../tooltipHelpers';
import { getAvg,} from '../fileAndDataProcessors';
import { SleepScoresOptionsEnum } from '../../../common/jsDB';

function fmtToolTip (d, point, xScale, aggrLevel, brushKey) {
    const x = point.x;
    const date = xScale.invert(x)
    const {datestr, thisDataPoint} = getThisPeriodData(d, date, aggrLevel);
    const avg = aggrLevel === 'daily' ? '' : 'Avg ';
    const metricObj = SleepScoresOptionsEnum[brushKey];
    return (
        <div>
        <p style={{color: '#ffffffbb'}} >{datestr}</p>
        <p><LittleCircle color='#ffffff'/>{avg}Overall Score:{' '}
                <strong>{thisDataPoint.overallScore.toFixed(0)}</strong></p>
        <p><LittleCircle color={metricObj.color}/>{avg}{metricObj.title}:{' '}
                <strong>{thisDataPoint[brushKey].toFixed(0)}</strong></p>
        
        </div>
    );
}


const keys = [
    "qualityScore",
    "recoveryScore",
    "restfulnessScore",
    "durationScore",
    "overallScore",
]
const colors = ["#5A8BB0", "#7BAF5C", "#A47EBF",  "#D09E55", "#fff"];
const titles = ['Quality Score', 'Recovery Score', 'Restfulness Score', 'Duration Score', 'Overall Score'];

const SleepScoresMainGraph = ({selection, 
    svgDimensions,
    xScale,  
    aggrLevel,
    brushKey,
    setTooltipInfo,
    ...props}) => {
        const { margin, xMax, yMax } = svgDimensions;
        const metricEnum = SleepScoresOptionsEnum[brushKey];
        const yLabel = metricEnum.title;
        const minOfAllScores = min(selection, (d) => min(keys.map((key) => d[key])));
        const maxOfAllScores = max(selection, (d) => max(keys.map((key) => d[key])));

        const yScale = useMemo(
            () =>
                scaleLinear({
                range: [yMax, margin.top],
                domain: [minOfAllScores, maxOfAllScores],
                nice: true,
                }),
            [yMax, margin.top, minOfAllScores, maxOfAllScores]
        );

        const { 
            tooltipData, 
            tooltipLeft, 
            tooltipTop, 
            tooltipOpen, 
            showTooltip, 
            hideTooltip 
        } = useTooltip();
    
        const svg_id = 'sleepScores';
        const handleTooltip = (event, data) => {
            handleAnyTooltip(
                event, 
                data, 
                svg_id, 
                svgDimensions, 
                tooltipData,
                xScale,
                aggrLevel,
                showTooltip,
                setTooltipInfo,
                fmtToolTip,
                brushKey
            )
        };
        const handleMouseLeave = () => {
            setTooltipInfo(['']); 
            hideTooltip();
        };

        return (<>
            <LinearGradient id="area-grad" from={"#fff"} to={"#27272700"} />
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
        {isData(selection) &&
        <>
            <AreaClosed
                data={selection}
                x={(d) => xScale(d.calendarDate)}
                y={(d) => yScale(d.overallScore)}
                stroke={'#fff'}
                strokeWidth={0}
                curve={aggrLevel === 'monthly' ? curveStepBefore : curveBasis}
                fill={"url('#area-grad')"}
                yScale={yScale}
                
            />
            <LinePath
                data={selection}
                x={(d) => xScale(d.calendarDate)}
                y={(d) => yScale(d.overallScore)}
                stroke={'#fff'}
                strokeWidth={2}
                curve={aggrLevel === 'monthly' ? curveStepBefore : curveBasis}
            />
            <LinePath
                data={selection}
                x={(d) => xScale(d.calendarDate)}
                y={(d) => yScale(d[brushKey])}
                stroke={metricEnum.color}
                strokeWidth={3}
                curve={aggrLevel === 'monthly' ? curveStepBefore : curveBasis}
            />
            <ToolTipBar
                svgDimensions={svgDimensions}
                selection={selection}
                handleTooltip={handleTooltip}
                handleMouseLeave={handleMouseLeave}
            />
            </>}
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
    const brushKey = 'qualityScore';
    const metricObj = SleepScoresOptionsEnum[brushKey];
    return (
        <BrushTimeGraph
            dailyData={sleepData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={SleepScoresMainGraph}
            brushStyle={getBrushStyle('#fff')}
            graphTitle={metricObj.title}
            left_factor={1.0}
            isAllowAgg={true}
            choices={SleepScoresOptionsEnum}
            SelectionStats={SleepScoresStats}
            svg_id='sleepScores'
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