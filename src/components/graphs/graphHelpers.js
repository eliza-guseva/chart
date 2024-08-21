import { timeDay } from 'd3-time';
import { timeFormat } from 'd3-time-format';
import { 
    getYear, 
    getDay, 
    startOfWeek, 
    addDays, 
    addMonths, 
    startOfMonth 
} from 'date-fns';
import { scaleTime } from '@visx/scale';

/**
 * Calculates the SVG width based on the container width.
 * @param {number} containerWidth - The width of the container.
 * @returns {number} The calculated SVG width.
 */
export function calculateSvgWidth(containerWidth) {
    if (containerWidth < 750) {
        return containerWidth;
    }
    else if (containerWidth < 900) {
        return containerWidth * 0.85;
    }
    else if (containerWidth < 1200) {
        return containerWidth * 0.8;
    }
    return containerWidth * 0.7;
}

/**
 * Calculates the width-to-height ratio for the SVG based on the container width.
 * @param {number} containerWidth - The width of the container.
 * @returns {number} The calculated width-to-height ratio.
 */
export function calculateWHRatio(containerWidth) {
    if (containerWidth < 600) {
        return 0.9;
    }
    else if (containerWidth < 750) {
        return 0.75;
    }
    else if (containerWidth < 900) {
        return 0.7;
    }
    return 0.6;
}

/**
 * Calculates the SVG height based on the container width.
 * @param {number} containerWidth - The width of the container.
 * @returns {number} The calculated SVG height.
 */
export function calculateSvgHeight(containerWidth) {
    return calculateSvgWidth(containerWidth) * calculateWHRatio(containerWidth);
}

/**
 * Calculates the margin object based on the width and left factor.
 * @param {number} width - The width of the chart.
 * @param {number} [left_factor=1.0] - The factor to multiply the left margin by.
 * @returns {Object} The margin object.
 */
export function getMargin(width, left_factor=1.0) {
    if (width < 600) {
        return { top: 30, right: 10, bottom: 30, left: left_factor * 40 };
    }
    else if (width < 1200) {
        return { top: 30, right: 10, bottom: 30, left: left_factor * 60 };
    }
    return { top: 30, right: 10, bottom: 60, left: left_factor *  60 };
}

/**
 * Calculates the inner height of the chart based on the height and margin.
 * @param {number} height - The height of the chart.
 * @param {Object} margin - The margin object.
 * @returns {number} The calculated inner height.
 */
export function getInnerHeight(height, margin) {
    return height - margin.top - margin.bottom;
}

/**
 * Calculates the maximum x-coordinate based on the width and margin.
 * @param {number} width - The width of the chart.
 * @param {Object} margin - The margin object.
 * @returns {number} The calculated maximum x-coordinate.
 */
export function getXMax(width, margin) {
    return width - margin.right;
}

/**
 * Calculates the height of the brush based on the height and margin.
 * @param {number} height - The height of the chart.
 * @param {Object} margin - The margin object.
 * @returns {number} The calculated brush height.
 */
export function getBrushHeight(height, margin) {
    return getInnerHeight(height, margin) * 0.15;
}

/**
 * Formats the date using the specified time format.
 * @type {Function}
 */
export const formatDate = timeFormat('%b %d');

/**
 * Formats the date with year using the specified time format.
 * @type {Function}
 */
export const formatDateYear = timeFormat('%b %d, %y');

/**
 * Formats the date with year (fully spelled out) using the specified time format.
 * @type {Function}
 */
export const formatDateYearPretty = timeFormat('%b %d, %Y');

export const formatDateWithWeekday = timeFormat('%a %b %d');

/**
 * Formats the year using the specified time format.
 * @type {Function}
 */
export const formatYear = timeFormat('%Y');

/**
 * Formats the month using the specified time format.
 * @type {Function}
 */
export const formatMonth = timeFormat('%b');

/**
 * Formats the month and year using the specified time format.
 * @type {Function}
 */
export const formatMonthYear = timeFormat('%b %Y');

export function fmtMonthlyDatestr(selectedMonth, thirtyDaysBefore) {
    if (getYear(selectedMonth) === getYear(thirtyDaysBefore)) {
        if (selectedMonth.getMonth() === thirtyDaysBefore.getMonth()) {
            return formatDate(thirtyDaysBefore) + ' - ' + selectedMonth.getDate() + ' ,' + getYear(selectedMonth)
        }
        return formatDate(selectedMonth) + ' - ' + formatDate(thirtyDaysBefore) + ' ,' + getYear(selectedMonth)
    }
    return formatDateYearPretty(thirtyDaysBefore) + ' - ' + formatDateYearPretty(selectedMonth);
}

/**
 * Gets the tick frequencies based on the data and point frequency.
 * @param {Array} data - The data array.
 * @param {string} pointFreq - The point frequency ('day', 'week', 'month', 'year').
 * @returns {number|undefined} The tick frequency.
 */
export function getTicksFrequencies(pointFreq) {
    let multiplier;
    if (pointFreq  === 'daily') {
        multiplier = 1;
    }
    else if (pointFreq === 'weekly') {
        multiplier = 7;
    }
    else if (pointFreq === 'monthly') {
        multiplier = 30;
    }
    else {
        multiplier = 365;
    }
    return multiplier
}

/**
 * Calculates the bottom position of the main chart based on the margin, height, and width.
 * @param {Object} margin - The margin object.
 * @param {number} height - The height of the chart.
 * @param {number} width - The width of the chart.
 * @returns {number} The calculated bottom position of the main chart.
 */
export function getMainChartBottom(margin, height, width) {
    let chart_separation;
    if (width < 600) {
        chart_separation = 60;
    }
    else if (width < 1200) {
        chart_separation = 70;
    }
    else {
        chart_separation = 80;
    }
    let innerHeight = getInnerHeight(height, margin);
    let brushHeight = getBrushHeight(height, margin);
    return margin.top + innerHeight - brushHeight - chart_separation; 
}

/**
 * Gets the index from the end of the array.
 * @param {Array} array - The array.
 * @param {number} indexFromEnd - The index from the end.
 * @returns {number} The calculated index from the end.
 */
export function getIdxFromEnd(array, indexFromEnd) {
  return array.length - indexFromEnd;
}

/**
 * Converts hours to a time string in the format "HH:MM".
 * @param {number} hours - The hours value.
 * @returns {string} The formatted time string.
 */
export function hours2TimeStr(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return h + ':' + m.toString().padStart(2, '0');
}

/**
 * A functional component that renders a little circle with the specified color.
 * @param {string} color - The color of the circle.
 * @returns {JSX.Element} The rendered circle element.
 */
export const LittleCircle = ({color}) => {
    return <span style={{ 
        display: 'inline-block', 
        width: '0.6rem', 
        height: '0.6rem', 
        backgroundColor: color,
        borderRadius: '50%', 
        marginRight: '0.5rem'
        }
    }></span>;
}

// time tick tools

const getallDoW = (startDate, endDate, dayNum) => {
    const fridays = [];
    let current = startOfWeek(startDate, { weekStartsOn: dayNum });

    while (current <= endDate) {
        fridays.push(current);
        current = addDays(current, 7);
    }

    return fridays;
};

export function getMonthlyTicks(data, xScale) {
    let ticks;
    const lastDate = new Date(data[data.length - 1].calendarDate)
    const firstDate = xScale.invert(xScale.range()[0]);
    const timeScale = scaleTime({
        range: xScale.range(),
        domain: xScale.domain(),
    });
    ticks = timeScale.ticks();

    if (data.length <= 5) {
    ticks = [];
        let current = startOfMonth(firstDate);

        while (current <= lastDate) {
            ticks.push(current);
            current = addMonths(current, 1); // Move to the next month
        }
    }

    ticks.push(lastDate);

    return ticks;
};

export function getWeeklyTicks(data, xScale) {
    let ticks;
    const lastDate = new Date(data[data.length - 1].calendarDate);
    const firstDate = xScale.invert(xScale.range()[0]);
    ticks = getallDoW(firstDate, lastDate, getDay(lastDate));
    if (ticks.length >= 14 && ticks.length <= 26) {
        ticks = ticks.slice()
        .reverse()
        .filter((_, index) => index % 2 === 0)
        .reverse();    
    }
    else if (ticks.length > 26) {
        ticks = getMonthlyTicks(data, xScale);
    }
    return ticks;
}
