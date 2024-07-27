import React, { useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { scaleTime, scaleLinear } from '@visx/scale';
import { LinePath, AreaClosed, AreaStack } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { extent } from 'd3-array';
import { format as d3Format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import { PatternLines } from '@visx/pattern';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush, { BaseBrushState, UpdateBrush } from '@visx/brush/lib/BaseBrush';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { Axis } from '@visx/visx';
import { max } from 'd3-array';

const formatDate = timeFormat('%b %d %Y');
const WIDTH = 1200;
const HEIGHT = 600;
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };
const CHART_SEPARATION = 30;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
export const accentColor = '#f6acc8';
export const background = '#584153';
export const background2 = '#af8baf';
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: 'white',
};

function getInnerHeight(height, margin) {
  return height - margin.top - margin.bottom;
}

function getBrushHeight(height, margin) {
  return getInnerHeight(height, margin) * 0.2;
}

function getMainChartBottom(margin) {
  let innerHeight = getInnerHeight(HEIGHT, MARGIN);
  let brushHeight = getBrushHeight(HEIGHT, MARGIN);
  return margin.top + innerHeight - brushHeight - CHART_SEPARATION; 
}

function getXMax(width, margin) {
  return width - margin.left - margin.right;
}

function getBrushBottom(height, margin) {
  return height - margin.bottom;
}

function getBrushTop(height, margin) {
  let brushHeight = getBrushHeight(height, margin);
  return height - margin.bottom - brushHeight ;
}

function getIdxFromEnd(array, indexFromEnd) {
  return array.length - indexFromEnd;
}

function getDate(d) {
  return new Date(d.calendarDate);
}

function getSafeData(data, attribute) {
    return (data[attribute] ?? 0) / 3600;
}

const SleepStagesStack = ({ sleepData }) => {
  const initIdxStart = getIdxFromEnd(sleepData, 60);
  const initIdxEnd = getIdxFromEnd(sleepData, 1);
  const brushRef = useRef(null);
  const [selection, setSelection] = useState(
    sleepData.slice(initIdxStart, initIdxEnd)
  );
  // margins and heights
  const yMax = getMainChartBottom(MARGIN);
  const xMax = getXMax(WIDTH, MARGIN);
  // add total sleep to sleepData

  // preparing brush
  const onBrushChange = (domain) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const dataCopy = sleepData.filter((d) => {
      const x = getDate(d);
      const y = d.totalSleepSeconds / 3600;
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
        domain: [0, 11],
        nice: true,
      }),
    [yMax]
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
        range: [getBrushHeight(HEIGHT, MARGIN), 0],
        domain: [0, max(sleepData, (d) => d.totalSleepSeconds / 3600)],
      }),
    [sleepData]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: brushXScale(getDate(sleepData[initIdxStart])) },
      end: { x: brushXScale(getDate(sleepData[initIdxEnd])) },
    }),
    [brushXScale, sleepData, initIdxStart, initIdxEnd]
  );

  // event handlers
  const handleClearClick = () => {
    if (brushRef?.current) {
      setSelection(sleepData);
      brushRef.current.reset();
    }
  };

  const handleResetClick = () => {
    if (brushRef?.current) {
      const updater = (prevBrush) => {
        const newExtent = brushRef.current.getExtent(
          initialBrushPosition.start,
          initialBrushPosition.end
        );

        const newState = {
          ...prevBrush,
          start: { y: newExtent.y0, x: newExtent.x0 },
          end: { y: newExtent.y1, x: newExtent.x1 },
          extent: newExtent,
        };

        return newState;
      };
      brushRef.current.updateBrush(updater);
    }
  };

  console.log(HEIGHT, MARGIN);

  return (
    <div>
      <h2>Sleep Graph</h2>
      <svg width={WIDTH} height={HEIGHT} className="bg-darkbtnhover rounded-lg">
      <defs>
        <PatternLines
        id={PATTERN_ID}
        height={8}
        width={8}
        stroke={accentColor}
        strokeWidth={1}
        orientation={['diagonal']}
        />
      </defs>
          <LinePath
            data={selection}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(getSafeData(d, 'remSleepSeconds'))}
            stroke="#000000"
            strokeWidth={2}
            width={WIDTH}
            yMax={yMax}
          />
          <LinePath
            data={selection}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(getSafeData(d, 'lightSleepSeconds'))}
            strokeWidth={1}
            stroke="#ff0000"
            curve={curveMonotoneX}
          />
          <LinePath
            data={selection}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(getSafeData(d, 'deepSleepSeconds'))}
            stroke="#007bff"
            strokeWidth={2}
          />
          <AreaStack
            data={selection}
            keys={['awakeSleepSeconds', 'remSleepSeconds', 'lightSleepSeconds', 'deepSleepSeconds']}
            x={(d) => xScale(getDate(d))}
            y={(d) => yScale(getSafeData(d, 'lightSleepSeconds'))}
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
        <Group top={getBrushTop(HEIGHT, MARGIN) }> {/* Added top positioning for brush chart */}
          <AreaClosed
            data={sleepData}
            x={(d) => brushXScale(getDate(d))}
            y={(d) => brushYScale(d.totalSleepSeconds / 3600)}
            yScale={brushYScale}
            fill="#ffddff"
            stroke={`url(#${GRADIENT_ID})`}
            strokeWidth={1}
          />
          <AxisBottom
            top={getBrushHeight(HEIGHT, MARGIN)}
            scale={brushXScale}
            tickFormat={formatDate}
          />
          <AxisLeft
            left={MARGIN.left}
            scale={brushYScale}
            hideTicks
            tickFormat={() => ''}
          />
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={brushXScale}
            yScale={brushYScale}
            width={xMax}
            height={getBrushHeight(HEIGHT, MARGIN)}
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            selectedBoxStyle={selectedBrushStyle}
            ref={brushRef}
            useWindowMoveEvents
          />
        </Group>
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



                