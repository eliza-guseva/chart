import React, { useRef, useState, useMemo, useEffect } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { extent } from 'd3-array';
import { max, min } from 'd3-array';
import moment from 'moment';

import { 
    TooltipWithBounds, 
} from '@visx/tooltip';
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
    const [tooltipInfo, setTooltipInfo] = useState({
        tooltipData: null,
        tooltipTop: 0,
        tooltipLeft: 0,
    });

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

    const xMax = getXMax(svgWidth, margin);

    // preparing brush
    const onBrushChange = (domain) => {
        if (!domain) return;
        let { x0, x1, y0, y1 } = domain;
        let selectionData;
        switch (aggrLevel) {
            case 'daily':
                selectionData = dailyData;
                break;
            case 'weekly':
                selectionData = weeklyData;
                let lastSunday = moment(x1).endOf('week');
                x0 = moment(x0).startOf('week')
                x1 = lastSunday
                break;
            case 'monthly':
                selectionData = monthlyData;
                let lastDay = moment(x1).endOf('month') 
                // lastDay.add(1, 'days');
                x0 = moment(x0).startOf('month')
                x1 = lastDay
                break;
            default:
                selectionData = dailyData;
        }
        setSelectionDomain({ x0, x1, y0, y1 });
        console.log('x0', x0, 'x1', x1)
        console.log('selection domain', selectionDomain)
        const dataCopy = selectionData.filter((d) => {
            const x = getDate(d);
            return x >= x0 && x <= x1;
        });
        setSelection(dataCopy);
    };

    // scales
    const xScale = useMemo(
        () =>
            scaleTime({
            range: [margin.left, xMax],
            domain: selectionDomain ? [selectionDomain.x0, selectionDomain.x1] : extent(dailyData, getDate),
            }),
        [xMax, margin, selectionDomain, dailyData]
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

    let styleOuter = {
        display: 'flex',
        flexDirection: 'row',
        width: svgWidth - margin.right + 'px',
        justifyContent: 'right',
        marginRight: svgWidth - xMax + 'px',
        marginBottom: '-33px',
        zIndex: 10,
    };
    let styleInner = {
        display: isAllowAgg ? 'flex' : 'none',
    };

    

    return (
    <div ref={containerRef} className='place-self-center w-full flex flex-col justify-center items-center pb-10'>
        <div className='w-full flex flex-col items-center'>
        <div style={styleOuter}>
        <p className='md:text-3xl font-bold text-2xl z-10 self-start'>{graphTitle}</p>
        <div style={styleInner}>
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
            </div>
            <svg className="bg-dark rounded-lg" width={svgWidth} height={svgHeight}>
                {mainGraphComponent({
                    selection,
                    svgDimensions,
                    xScale,
                    tooltipInfo,
                    setTooltipInfo,
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
            {tooltipInfo.tooltipData && (
                <TooltipWithBounds 
                // tpp
                top={tooltipInfo.tooltipTop}
                left={tooltipInfo.tooltipLeft}
                >
                {tooltipInfo.tooltipData}
                </TooltipWithBounds>
            )}
        </div>
    </div>
    );
};

export default BrushTimeGraph;




                