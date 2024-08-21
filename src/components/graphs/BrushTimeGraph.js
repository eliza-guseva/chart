import React, { useRef, useState, useMemo, useEffect } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { extent } from 'd3-array';
import { max } from 'd3-array';
import moment from 'moment';

import { 
    TooltipWithBounds, 
    defaultStyles
} from '@visx/tooltip';
import { 
    getDate, 
    aggregateData, 
    getAvg, 
    selectDaysAgo,
    selectFirstOf,
} from './fileAndDataProcessors';
import { 
    BrushSubGraph, 
} from './GraphComponents';

import { 
    getBrushHeight, 
    getXMax, 
    getMargin,
    calculateSvgWidth,
    calculateSvgHeight,
    getIdxFromEnd,
    formatDateWithWeekday
} from './graphHelpers';

function getAllKeys(keys, brushKey) {
    if (keys.includes(brushKey)) {
        return keys;
    }
    return [...keys, brushKey];
}

function getX0Weekly(x1, x0) {
    let nDays = moment(x1).diff(moment(x0), 'days');
    let remainder = nDays % 7;
    if (remainder !== 0) {
        x0 = moment(x1).subtract(nDays + (7 - remainder), 'days').toDate();
    }
    return x0;
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
    aggFn = getAvg,
    inverseBrush=false,
}) => {
    // STATES AND INITIALIZATION
    const allKeys = getAllKeys(keys, brushKey);
    const [aggrLevel, setAggrLevel] = useState('daily');
    const initIdxStart = getIdxFromEnd(dailyData, 75);
    const initIdxEnd = getIdxFromEnd(dailyData, 1);
    const brushRef = useRef(null);
    const [selection, setSelection] = useState(
        dailyData.slice(initIdxStart, initIdxEnd)
    );
    const [selectionDomain, setSelectionDomain] = useState(
        {
            x0: getDate(dailyData[initIdxStart]),
            x1: getDate(dailyData[initIdxEnd]),
            y0: 0,
            y1: max(dailyData, (d) => d[brushKey]),
        }

    )
    const [svgDimensions, setSvgDimensions] = useState(
        { 
            width: 600, 
            height: 600,
            margin: getMargin(600, left_factor),
        });
    const containerRef = useRef(null);
    const [tooltipInfo, setTooltipInfo] = useState([{
        tooltipData: null,
        tooltipTop: 0,
        tooltipLeft: 0,
    }]);
    // REACTIVE FUNCTIONS
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
        let aggregatedData;
        let dataCopy;
        switch (aggrLevel) {
            case 'daily':
                aggregatedData = dailyData;
                dataCopy = aggregatedData.filter((d) => {
                    const x = getDate(d);
                    return x >= x0 && x <= x1;
                });
                break;
            case 'weekly':
                x0 = getX0Weekly(x1, x0);
                aggregatedData = aggregateData(dailyData, 'week', allKeys, selectDaysAgo, aggFn);
                dataCopy = aggregatedData.filter((d) => {
                    const x = getDate(d);
                    return x >= x0 && x <= x1;
                });
                break;
            case 'monthly':
                x0 = moment(x0).startOf('month').toDate();
                let x1em = moment(x1).endOf('month').toDate();
                aggregatedData = aggregateData(dailyData, 'month', allKeys, selectFirstOf, aggFn);
                dataCopy = aggregatedData.filter((d) => {
                    const x = getDate(d);
                    return x >= x0 && x <= x1em;
                });
                dataCopy[dataCopy.length - 1]['calendarDate'] = new Date(x1);
                break;
            default:
                console.log('aggrLevel not recognized');
        }
        

        x1 = getDate(dataCopy[dataCopy.length - 1]);
        setSelection(dataCopy);
        setSelectionDomain({ x0, x1, y0, y1 });
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
            start: { x: brushXScale(getDate(dailyData[initIdxStart])) },
            end: { x: brushXScale(getDate(dailyData[initIdxEnd])) },
        }),
        [brushXScale, dailyData, initIdxStart, initIdxEnd]
    );

    const onChooseAggrLevel = (aggrLevel) => {
        setAggrLevel(aggrLevel);
    }

    useEffect(() => {
        // use appropriate selection data based on aggrLevel
        onBrushChange(selectionDomain)

    }, [aggrLevel]);

    let styleSvgHeader = {
        display: 'flex',
        flexDirection: 'row',
        width: svgWidth - margin.right + 'px',
        justifyContent: 'right',
        marginRight: svgWidth - xMax + 'px',
        marginBottom: '-33px',
        zIndex: 10,
    };
    let styleAggrButtons = {
        display: isAllowAgg ? 'flex' : 'none',
    };

    

    return (
    <div ref={containerRef} className='place-self-center w-full flex flex-col justify-center items-center pb-10'>
        <div className='w-full flex flex-col items-center'>
        <div style={styleSvgHeader}>
        <p className='md:text-3xl font-bold text-2xl z-10 self-start'>{graphTitle}</p>
        <div style={styleAggrButtons}>
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
                    aggrLevel,
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
            {/* for every tooltip in tooltipInfo depict tooltip */}
            {tooltipInfo.map((tooltip, idx) => {
                return (
                    tooltip.tooltipData && (
                        <TooltipWithBounds 
                        // tpp
                        key={idx}
                        top={tooltip.tooltipTop}
                        left={tooltip.tooltipLeft}
                        style={tooltip.style ? tooltip.style : defaultStyles}
                        >
                        {tooltip.tooltipData}
                        </TooltipWithBounds>
                    )
                );
            }
            )}
        </div>
    </div>
    );
};

export default BrushTimeGraph;




                