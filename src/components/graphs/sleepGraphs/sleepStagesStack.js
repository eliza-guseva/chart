import React, { useRef, useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { scaleTime, scaleLinear } from '@visx/scale';
import {curveStepAfter } from '@visx/curve';
import { extent } from 'd3-array';
import { max } from 'd3-array';
import { getDate } from '../fileAndDataProcessors';
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

function calculateSvgWidth(containerWidth) {
    if (containerWidth < 600) {
        return containerWidth;
    }
    else if (containerWidth < 1200) {
        return containerWidth * 0.9;
    }
    return containerWidth * 0.8;
  }

function calculateWHRatio(containerWidth) {
    if (containerWidth < 600) {
        return 0.9;
    }
    return 0.65;
}

function calculateSvgHeight(containerWidth) {
    return calculateSvgWidth(containerWidth) * calculateWHRatio(containerWidth);
}

function getMainChartBottom(margin, height, width) {
    let chart_separation;
    if (width < 600) {
        chart_separation = 50;
    }
    else if (width < 1200) {
        chart_separation = 60;
    }
    else {
        chart_separation = 70;
    }
    let innerHeight = getInnerHeight(height, margin);
    let brushHeight = getBrushHeight(height, margin);
    return margin.top + innerHeight - brushHeight - chart_separation; 
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
    const [svgDimensions, setSvgDimensions] = useState(
        { 
            width: 600, 
            height: 600,
            margin: getMargin(600),
        });
    const containerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const newWidth = calculateSvgWidth(containerWidth);
            const newHeight = calculateSvgHeight(containerWidth);

            // Only update state if the new dimensions are different
            if (newWidth !== svgDimensions.width || newHeight !== svgDimensions.height) {
                setSvgDimensions({ 
                    width: newWidth, 
                    height: newHeight,
                    margin: getMargin(newWidth),
                });
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

    const { width: svgWidth, height: svgHeight, margin } = svgDimensions;
    // adjust font size based on svgWidth
    


    const yMax = getMainChartBottom(margin, svgHeight, svgWidth);
    const xMax = getXMax(svgWidth, margin);

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
        range: [margin.left, xMax],
        domain: extent(selection, getDate),
      }),
    [xMax, selection, margin]
  );
  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, margin.top],
        domain: [0, max(selection, (d) => d[TSH])],
        nice: true,
      }),
    [yMax, selection, margin]
  );

  const brushXScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, xMax],
        domain: extent(sleepData, getDate),
      }),
    [xMax, sleepData, margin]
  );

  const brushYScale = useMemo(
    () =>
      scaleLinear({
        range: [getBrushHeight(svgHeight, margin), 0],
        domain: [0, max(sleepData, (d) => d[TSH])],
      }),
    [sleepData, svgHeight, margin]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: brushXScale(getDate(sleepData[initIdxStart])) },
      end: { x: brushXScale(getDate(sleepData[initIdxEnd])) },
    }),
    [brushXScale, sleepData, initIdxStart, initIdxEnd]
  );

  console.log(getDate(sleepData[initIdxStart]));

  return (
    <div ref={containerRef} className='place-self-center w-full flex flex-col justify-center items-center'>
        <h1 className='md:text-4xl font-bold text-2xl'>Sleep Stages</h1>
      <svg className="bg-gentlewhite rounded-lg" width={svgWidth} height={svgHeight}>
      
      <MyAreaStackVsDate
            data={selection}
            xScale={xScale}
            yScale={yScale}
            yMax={yMax}
            keys={KEYS}
            colors={COLORS}
            curve={curveStepAfter}
        />  
        <StandardAxisLeft
            label='Hours'
            yScale={yScale}
            margin={margin}
            svgDimensions={svgDimensions}
        />
        <BrushSubGraph
            allData={sleepData}
            brushColumn={TSH}
            brushXScale={brushXScale}
            brushYScale={brushYScale}
            svgDimensions={svgDimensions}
            margin={margin}
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



                