import React from 'react';
import { useMemo } from 'react';
import { max, min } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import {curveLinear, curveBasis} from '@visx/curve';
import {LinePath, AreaClosed, Bar} from '@visx/shape';
import { useTooltip,  defaultStyles} from '@visx/tooltip';
import BrushTimeGraph from '../BrushTimeGraph';
import { getDate, getAvg } from '../fileAndDataProcessors';
import { fmtTwoDatestr, getMainChartBottom, formatDateYearPretty } from '../graphHelpers';
import { 
    StandardAxisLeft, 
    StandardAxisBottom, 
    Grid,
    StatsDiv,
} from '../GraphComponents';
import { locateEventLocalNAbs } from '../tooltipHelpers';


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

function ftmToolTip (d, point, xScale, aggrLevel) {
    const x = point.x;
    const date = xScale.invert(x)
    let datestr = '';
    let avg = '';
    const thisDataPoint = min(d.filter((d) => {
        return (getDate(d) >= date);
    })) || d[d.length - 1];
    if (aggrLevel === 'daily') {
        datestr = formatDateYearPretty(date);
    }
    else {
        const prevDataPoint = d[d.indexOf(thisDataPoint) - 1] || d[0];
        datestr = fmtTwoDatestr(thisDataPoint.calendarDate, prevDataPoint.calendarDate);
        avg = 'Avg '
    }
    return (
        <div>
            <p style={{color: '#ffffffbb'}} >{datestr}</p>
            <p>{avg}Acute Load 💪: <strong>{thisDataPoint.dailyTrainingLoadAcute.toFixed(0)}</strong></p>
            <p>{avg}Acute/Chronic: <strong>{
            thisDataPoint.dailyAcuteChronicWorkloadRatio.toFixed(1)
            }</strong></p>
            <p>{avg}Optimal Range: <strong>{
            (0.8 *thisDataPoint.dailyTrainingLoadChronic).toFixed(0)} 
            - {thisDataPoint.maxAcuteLoad.toFixed(0)}</strong></p>
        </div>
    )
}


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
    tooltipInfo,
    setTooltipInfo,
    aggrLevel,
    ...props}) => {
        const { margin, xMax, yMax } = svgDimensions;
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
        const { pointInSvg, svgTop, svgLeft } = locateEventLocalNAbs(event, 'trainingLoad');
        if (pointInSvg) {
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
        }
    }

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
        <Bar
            x={margin.left}
            y={margin.top}
            width={xMax - margin.left}
            height={yMax - margin.top}
            fill='transparent'
            onTouchStart={(event) => handleTooltip(event, selection)}
            onTouchMove={(event) => handleTooltip(event, selection)}
            onMouseMove={(event) => handleTooltip(event, selection)}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleMouseLeave}
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
    return (
        <BrushTimeGraph
            dailyData={trainingLoadData}
            keys={keys}
            brushKey={brushKey}
            mainGraphComponent={TrainingLoadMainGraph}
            brushStyle={brushStyle}
            graphTitle='Acute Training Load'
            svg_id='trainingLoad'
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