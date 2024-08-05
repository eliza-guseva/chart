import React, { useRef, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { scaleTime, scaleLinear } from '@visx/scale';
import {curveStepAfter } from '@visx/curve';
import { extent } from 'd3-array';
import { max } from 'd3-array';
import { getDate, aggregateData, getAvg } from '../fileAndDataProcessors';
import { 
    MyAreaStackVsDate, 
    StandardAxisLeft,
    BrushSubGraph, 
    getInnerHeight,
    getBrushHeight,
    getXMax,
    getMargin,
} from '../GraphComponents';

const brushStyle = {
    fillColor: "#ffddff",
    accentColor: "#f6acc8",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

