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
    getMainChartBottom,
    getMargin,
    calculateSvgWidth,
    calculateSvgHeight,
    getIdxFromEnd,
} from './graphHelpers';
import { getTitleStyle } from './styles';



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

function getSvgDimensions(height, width, left_factor) {
    const margin = getMargin(width, left_factor);
    return {
        width: width,
        height: height,
        margin: margin,
        xMax: getXMax(width, margin),
        yMax: getMainChartBottom(margin, height, width),
    };
}

function getAggrLevelSelection(aggrLevel, dailyData, weeklyData, allKeys, selectFirstOf, aggFn, x0, x1) {
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
            aggregatedData = weeklyData;
            dataCopy = aggregatedData.filter((d) => {
                const x = getDate(d);
                return x >= x0 && x <= x1;
            });
            break;
        case 'monthly':
            aggregatedData = aggregateData(
                dailyData.filter((d) => {
                    const x = getDate(d);
                    return x <= x1;
                }), 'month', allKeys, selectFirstOf, aggFn);
            dataCopy = aggregatedData.filter((d) => {
                const x = getDate(d);
                return x >= x0 && x <= x1;
            });
            dataCopy[dataCopy.length - 1]['calendarDate'] = new Date(x1);
            break;
        default:
            console.log('aggrLevel not recognized');
    }
    return { dataCopy, x0, x1 };
}


const YVariableChooser = ({
    graphTitle, 
    margin,
    isAllowChoice=false,
    onChooseYVariable=null,
}) => {
    let titleStyle = getTitleStyle(margin);
    if (!isAllowChoice) {
        return (
            <p style={titleStyle}>{graphTitle}</p>
        );
    }
    else {
        return (
            <div>
                {/* <button onClick={() => onChooseYVariable('distance')}>Distance</button> */}
                <p style={titleStyle}>{graphTitle}</p>
            </div>
        );
    }
}


const AggrButtons = ({ aggrLevel, onChooseAggrLevel, isAllowAgg }) => {
    const styleAggrButtons = {
        display: isAllowAgg ? 'flex' : 'none',
        alignSelf: 'end',
    };
    return (
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
    );
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
    aggFn=getAvg,
    inverseBrush=false,
    SelectionStats=null,
    svg_id='brushTimeGraph',
}) => {
    // STATES AND INITIALIZATION
    const allKeys = getAllKeys(keys, brushKey);
    const weeklyData = aggregateData(dailyData, 'week', allKeys, selectDaysAgo, aggFn);
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
        getSvgDimensions(400, 600, left_factor));
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
                setSvgDimensions(
                    getSvgDimensions(newHeight, newWidth, left_factor)
                );
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

    const { width: svgWidth, height: svgHeight, margin, xMax, yMax } = svgDimensions;

    // preparing brush
    const onBrushChange = (domain) => {
        if (!domain) return;
        let { x0, x1, y0, y1 } = domain;
        let dataCopy;
        (
            { dataCopy, x0, x1 } = getAggrLevelSelection(
                aggrLevel, 
                dailyData, 
                weeklyData, 
                allKeys, 
                selectFirstOf, 
                aggFn, 
                x0, 
                x1
        ));
        
        if (dataCopy.length !== 0) {
            x1 = getDate(dataCopy[dataCopy.length - 1]);
        }
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
        justifyContent: 'space-between',
        width: svgWidth - margin.right + 'px',
        marginRight: svgWidth - xMax + 'px',
        marginBottom: '-30px',
        zIndex: 10,
    };

    return (
    <div ref={containerRef} className='place-self-center w-full flex flex-col justify-center items-center pb-10'>
        <div className='w-full flex flex-col items-center'>
            <div style={styleSvgHeader}>
                <YVariableChooser graphTitle={graphTitle} margin={margin} />
                <AggrButtons 
                    aggrLevel={aggrLevel} 
                    onChooseAggrLevel={onChooseAggrLevel} 
                    isAllowAgg={isAllowAgg}
                />
            </div>
            <svg id={svg_id} className="bg-dark rounded-lg" width={svgWidth} height={svgHeight}>
                {mainGraphComponent({
                    selection,
                    svgDimensions,
                    xScale,
                    tooltipInfo,
                    setTooltipInfo,
                    aggrLevel,
                    brushKey,
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
            {SelectionStats && 
                <SelectionStats 
                selection={selection} 
                allData={dailyData} 
                svgDimensions={svgDimensions}
                />
            }
        </div>
    </div>
    );
};

export default BrushTimeGraph;




                