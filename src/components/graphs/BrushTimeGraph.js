import React, { useRef, useState, useMemo, useEffect } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { extent } from 'd3-array';
import { max } from 'd3-array';
import { getDate, aggregateData, getAvg, selectFirstOf } from './fileAndDataProcessors';
import { 
    BrushSubGraph, 
} from './GraphComponents';

import { 
    getBrushHeight, 
    getXMax, 
    getMargin,
    calculateSvgWidth,
    calculateSvgHeight,
    getMainChartBottom,
    getIdxFromEnd,
} from './graphHelpers';

function getAllKeys(keys, brushKey) {
    if (keys.includes(brushKey)) {
        return keys;
    }
    return [...keys, brushKey];
}



const BrushTimeGraph = ({ 
    dailyData, 
    keys, 
    brushKey,
    mainGraphComponent,
    brushStyle,
    graphTitle,
    left_factor=1.0,
    isAllowAgg=true,
    groupFunction=selectFirstOf,
    aggFn = getAvg,
    inverseBrush=false,
}) => {
    const allKeys = getAllKeys(keys, brushKey);
    const weeklyData = aggregateData(dailyData, 'week', allKeys, groupFunction, aggFn);
    const monthlyData = aggregateData(dailyData, 'month', allKeys, groupFunction, aggFn);
    const [aggregatedData, setAggregatedData] = useState(dailyData);
    const [aggrLevel, setAggrLevel] = useState('daily');
    const initIdxStart = getIdxFromEnd(aggregatedData, 75);
    const initIdxEnd = getIdxFromEnd(aggregatedData, 1);
    const brushRef = useRef(null);
    const [selection, setSelection] = useState(
        aggregatedData.slice(initIdxStart, initIdxEnd)
    );
    const [selectionDomain, setSelectionDomain] = useState(
        {
            x0: getDate(aggregatedData[initIdxStart]),
            x1: getDate(aggregatedData[initIdxEnd]),
            y0: 0,
            y1: max(aggregatedData, (d) => d[brushKey]),
        }

    )
    const [svgDimensions, setSvgDimensions] = useState(
        { 
            width: 600, 
            height: 600,
            margin: getMargin(600, left_factor),
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
                    margin: getMargin(newWidth, left_factor),
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
        setSelectionDomain(domain);
        let selectionData;
        switch (aggrLevel) {
            case 'daily':
                selectionData = dailyData;
                break;
            case 'weekly':
                selectionData = weeklyData;
                break;
            case 'monthly':
                selectionData = monthlyData;
                break;
            default:
                selectionData = dailyData;
        }

        const dataCopy = selectionData.filter((d) => {
            const x = getDate(d);
            const y = d[brushKey];
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

    const brushXScale = useMemo(
    () =>
        scaleTime({
        range: [margin.left, xMax],
        domain: extent(dailyData, getDate),
        }),
    [xMax, dailyData, margin]
    );

    const brushYScale = useMemo(
        () =>
            scaleLinear({
            range: [getBrushHeight(svgHeight, margin), 0],
            domain: (inverseBrush) ? [max(dailyData, (d) => d[brushKey]), 0] : [0, max(dailyData, (d) => d[brushKey])],
            }),
        [dailyData, svgHeight, margin, brushKey, inverseBrush]
    );

    const initialBrushPosition = useMemo(
        () => ({
            start: { x: brushXScale(getDate(aggregatedData[initIdxStart])) },
            end: { x: brushXScale(getDate(aggregatedData[initIdxEnd])) },
        }),
        [brushXScale, aggregatedData, initIdxStart, initIdxEnd]
    );

    const onChooseAggrLevel = (aggrLevel) => {
        setAggrLevel(aggrLevel);
    }

    useEffect(() => {
        // use appropriate selection data based on aggrLevel
        onBrushChange(selectionDomain)

    }, [aggrLevel]);

    let style = {
        display: isAllowAgg ? 'flex' : 'none',
        width: svgWidth - margin.right + 'px',
        justifyContent: 'right',
        marginRight: svgWidth - xMax + 'px',
        marginBottom: '-33px',
        zIndex: 10
    };
    console.log(svgWidth - xMax - margin.left)

    return (
    <div ref={containerRef} className='place-self-center w-full flex flex-col justify-center items-center pb-10'>
        <h2 className='md:text-3xl font-bold text-2xl m-1'>{graphTitle}</h2>
        <div className='w-full flex flex-col items-center'>
        <div style={style}>
                <button 
                    className={aggrLevel === 'daily' ? 'btnaggrselect' : 'btnaggr'}
                    onClick={() => onChooseAggrLevel('daily')}
                    >Daily
                </button>
                <button 
                    className={aggrLevel === 'weekly' ? 'btnaggrselect' : 'btnaggr'}
                    onClick={() => onChooseAggrLevel('weekly')}
                    >Weekly
                </button>
                <button 
                    className={aggrLevel === 'monthly' ? 'btnaggrselect' : 'btnaggr'}
                    onClick={() => onChooseAggrLevel('monthly')}
                    >Monthly
                </button>
            </div>
            <svg className="bg-dark rounded-lg" width={svgWidth} height={svgHeight}>
                {mainGraphComponent({
                    selection,
                    svgDimensions,
                    xScale,
                })}
                <BrushSubGraph
                    allData={dailyData}
                    brushColumn={brushKey}
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
    </div>
    );
};

export default BrushTimeGraph;




                