import { localPoint } from '@visx/event';
import { Bar } from '@visx/shape';
import { min } from 'd3-array';
import { getDate } from './fileAndDataProcessors';
import { fmtTwoDatestr, formatDateYearPretty, isData } from './graphHelpers';
import { defaultStyles, useTooltip } from '@visx/tooltip';


export function locateEventLocalNAbs(event, svgId) {
    const svg = document.getElementById(svgId);
    const point = localPoint(svg, event);
    let { top, left } = svg.getBoundingClientRect();
    top = top + window.scrollY;
    left = left + window.scrollX;
    return {
        pointInSvg: point,
        svgLeft: left,
        svgTop: top,
    }
}

export const ToolTipBar = ({ 
    svgDimensions,
    selection, 
    handleTooltip, 
    handleMouseLeave }) => {
    const { margin, xMax, yMax } = svgDimensions;
    return (
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
    )
}

export function getThisPeriodData(dataArray, targetDate, aggrLevel) {
    let datestr = '';
    const thisDataPoint = min(dataArray.filter((d) => {
        return (getDate(d) >= targetDate);
    })) || dataArray[dataArray.length - 1];
    if (aggrLevel === 'daily') {
        datestr = formatDateYearPretty(targetDate);
    }
    else {
        const prevDataPoint = dataArray[dataArray.indexOf(thisDataPoint) - 1] || dataArray[0];
        datestr = fmtTwoDatestr(thisDataPoint.calendarDate, prevDataPoint.calendarDate);
    }
    return {
        datestr: datestr,
        thisDataPoint: thisDataPoint,
    }
}


export const handleAnyTooltip = (
    event, 
    data, 
    svg_id, 
    svgDimensions, 
    tooltipData,
    xScale,
    aggrLevel,
    showTooltip,
    setTooltipInfo,
    fmtToolTip
) => {
    if (! isData(data)) {
        return;
    }
    const { margin, xMax, yMax } = svgDimensions;
    const { pointInSvg, svgTop, svgLeft } = locateEventLocalNAbs(event, svg_id);
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
            tooltipData: fmtToolTip(data, pointInSvg, xScale, aggrLevel),
            tooltipLeft: pointInSvg.x + svgLeft,
            tooltipTop: svgTop + yMax + 24,
        });
    }}


