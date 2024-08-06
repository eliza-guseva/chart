import { timeDay } from 'd3-time';
import { timeFormat } from 'd3-time-format';

export const brushStyle = {
    fillColor: "#ffddff",
    accentColor: "#f6acc8",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

export function calculateSvgWidth(containerWidth) {
    if (containerWidth < 600) {
        return containerWidth;
    }
    else if (containerWidth < 1200) {
        return containerWidth * 0.9;
    }
    return containerWidth * 0.8;
  }

export function calculateWHRatio(containerWidth) {
    if (containerWidth < 600) {
        return 0.9;
    }
    return 0.6;
}

export function calculateSvgHeight(containerWidth) {
    return calculateSvgWidth(containerWidth) * calculateWHRatio(containerWidth);
}

export function getMargin(width, left_factor=1.0) {
    if (width < 600) {
        return { top: 20, right: -30, bottom: 30, left: left_factor * 40 };
    }
    else if (width < 1200) {
        return { top: 30, right: 0, bottom: 30, left: left_factor * 60 };
    }
    return { top: 50, right: 0, bottom: 60, left: left_factor *  60 };
}


export function getInnerHeight(height, margin) {
    return height - margin.top - margin.bottom;
}

export function getXMax(width, margin) {
    return width - margin.left - margin.right;
}



export function getBrushHeight(height, margin) {
    return getInnerHeight(height, margin) * 0.15;

}

// time format
export const formatDate = timeFormat('%b %d');
export const formatDateYear = timeFormat('%b %d, %y');
export const formatYear = timeFormat('%Y');
export const formatMonth = timeFormat('%b');
export const formatMonthYear = timeFormat('%b %Y');

// get ticks frequescies
export function getTicksFrequencies(data, pointFreq) {
    let multiplier;
    if (pointFreq  === 'day') {
        multiplier = 1;
    }
    else if (pointFreq === 'week') {
        multiplier = 7;
    }
    else if (pointFreq === 'month') {
        multiplier = 30;
    }
    else {
        multiplier = 365;
    }
    if (data.length <= 8) {
        return timeDay.every(1 * multiplier);
    }
    return 0
}


export function getMainChartBottom(margin, height, width) {
    let chart_separation;
    if (width < 600) {
        chart_separation = 60;
    }
    else if (width < 1200) {
        chart_separation = 90;
    }
    else {
        chart_separation = 90;
    }
    let innerHeight = getInnerHeight(height, margin);
    let brushHeight = getBrushHeight(height, margin);
    return margin.top + innerHeight - brushHeight - chart_separation; 
}


export function getIdxFromEnd(array, indexFromEnd) {
  return array.length - indexFromEnd;
}
