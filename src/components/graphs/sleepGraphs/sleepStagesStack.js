import React, { useRef, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { scaleTime, scaleLinear } from '@visx/scale';
import {curveLinear } from '@visx/curve';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { extent } from 'd3-array';
import { format as d3Format } from 'd3-format';
import { max } from 'd3-array';
import { getDate } from '../fileAndDataProcessors';
import { 
    MyAreaStackVsDate, 
    BrushSubGraph, 
    getInnerHeight,
    getBrushHeight,
    getXMax,
    formatDate
} from '../GraphComponents';

const WHRatio = 0.6;
const MARGIN = { top: 30, right: 30, bottom: 30, left: 50 };
const CHART_SEPARATION = 30;

const brushStyle = {
    fillColor: "#ffddff",
    accentColor: "#f6acc8",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
}

function calculateSvgWidth(containerWidth) {
    const calculatedWidth = containerWidth * 0.8;
    if (containerWidth < 600) {
        return containerWidth
    }
    return calculatedWidth;
  }

function calculateSvgHeight(containerWidth) {
    return calculateSvgWidth(containerWidth) * WHRatio;
}

function getMainChartBottom(margin, height) {
  let innerHeight = getInnerHeight(height, MARGIN);
  let brushHeight = getBrushHeight(height, MARGIN);
  return margin.top + innerHeight - brushHeight - CHART_SEPARATION; 
}


function getIdxFromEnd(array, indexFromEnd) {
  return array.length - indexFromEnd;
}


const KEYS = ['deepSleepHours', 'remSleepHours', 'lightSleepHours', 'awakeSleepHours'];
const COLORS = ['#007bff', '#ff44cc', '#44aaff', '#ffaa44'];
const TSH = 'totalSleepHours';


const SleepStagesStack = ({ sleepData }) => {
  const initIdxStart = getIdxFromEnd(sleepData, 60);
  const initIdxEnd = getIdxFromEnd(sleepData, 1);
  const brushRef = useRef(null);
  const [selection, setSelection] = useState(
    sleepData.slice(initIdxStart, initIdxEnd)
  );
  const [svgDimensions, setSvgDimensions] = useState({ width: 600, height: 600 }); // Default to 600px for both width and height
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newWidth = calculateSvgWidth(containerWidth);
        const newHeight = calculateSvgHeight(containerWidth);

        // Only update state if the new dimensions are different
        if (newWidth !== svgDimensions.width || newHeight !== svgDimensions.height) {
          setSvgDimensions({ width: newWidth, height: newHeight });
        }
      }
    };

    // Initial calculation
    handleResize();

    // Recalculate on window resize
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [svgDimensions]); // Dependency array includes svgDimensions to avoid unnecessary updates

  const { width: svgWidth, height: svgHeight } = svgDimensions;


  const yMax = getMainChartBottom(MARGIN, svgHeight);
  const xMax = getXMax(svgWidth, MARGIN);
  // add total sleep to sleepData

  // preparing brush
  const onBrushChange = (domain) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const dataCopy = sleepData.filter((d) => {
      const x = getDate(d);
      const y = d[TSH];
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setSelection(dataCopy);
  };

  // scales
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [MARGIN.left, xMax],
        domain: extent(selection, getDate),
      }),
    [xMax, selection]
  );
  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, MARGIN.top],
        domain: [0, max(selection, (d) => d[TSH])],
        nice: true,
      }),
    [yMax, selection]
  );

  const brushXScale = useMemo(
    () =>
      scaleTime({
        range: [MARGIN.left, xMax],
        domain: extent(sleepData, getDate),
      }),
    [xMax, sleepData]
  );

  const brushYScale = useMemo(
    () =>
      scaleLinear({
        range: [getBrushHeight(svgHeight, MARGIN), 0],
        domain: [0, max(sleepData, (d) => d[TSH])],
      }),
    [sleepData, svgHeight]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: brushXScale(getDate(sleepData[initIdxStart])) },
      end: { x: brushXScale(getDate(sleepData[initIdxEnd])) },
    }),
    [brushXScale, sleepData, initIdxStart, initIdxEnd]
  );

  return (
    <div ref={containerRef} className='place-self-center w-full flex flex-col justify-center items-center'>
        <h1 className='text-4xl font-bold'>Sleep Stages</h1>
      <svg className="bg-gentlewhite rounded-lg" width={svgWidth} height={svgHeight}>
      
      <MyAreaStackVsDate
        data={selection}
        xScale={xScale}
        yScale={yScale}
        keys={KEYS}
        colors={COLORS}
        curve={curveLinear}
        />  
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickFormat={formatDate}
            tickLabelProps={() => ({
              fill: '#000000',
              fontSize: 14,
              textAnchor: 'middle',
            })}
          />
          <AxisLeft
            left={MARGIN.left}
            scale={yScale}
            tickFormat={d3Format('.0f')}
            tickLabelProps={() => ({
              fill: '#000000',
              fontSize: 14,
              textAnchor: 'end',
            })}
          />
        <BrushSubGraph
            allData={sleepData}
            brushColumn={TSH}
            brushXScale={brushXScale}
            brushYScale={brushYScale}
            svgDimensions={svgDimensions}
            margin={MARGIN}
            onBrushChange={onBrushChange}
            initialBrushPosition={initialBrushPosition}
            brushRef={brushRef}
            brushStyle={brushStyle}
        />
      </svg>
    </div>
  );
};



// Define PropTypes
SleepStagesStack.propTypes = {
    sleepData: PropTypes.arrayOf(
      PropTypes.shape({
        calendarDate: PropTypes.string.isRequired,
        deepSleepSecondsSleep: PropTypes.number.isRequired,
        lightSleepSeconds: PropTypes.number.isRequired,
        remSleepSeconds: PropTypes.number.isRequired,
        awakeSleepSeconds: PropTypes.number.isRequired,
      })
    ).isRequired,
  };

export default SleepStagesStack;



                