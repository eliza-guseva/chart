import React from 'react';
import { AreaClosed } from '@visx/shape';
import { StandardAxisBottom } from './GraphComponents';
import { getDate } from './fileAndDataProcessors';
import { Bar } from '@visx/shape';
import { getBarWidth, getBarX } from './graphHelpers';

export const MyAreaStackVsDate = ({
    data, 
    xScale, 
    yScale,
    yMax,
    keys, 
    colors,
    aggrLevel,
    ...props}) => {
    let stack = [];
    // iterate from the end of the keys array
    for (let i = keys.length - 1; i >= 0; i--) {
        stack.push(
            <AreaClosed
                className={keys[i]}
                key={i}
                data={data}
                x={(d) => xScale(getDate(d))}
                // y = sum of all previous keys
                y={(d) => {
                    let sum = keys.slice(0, i + 1).reduce((acc, key) => acc + d[key], 0)
                    return yScale(sum)}
                }
                fill={colors[i]}
                yScale={yScale}
                xScale={xScale}
                {...props}
            />
        );
}
return <>
        {stack}
        <StandardAxisBottom
            data={data}
            yMax={yMax}
            xScale={xScale}
            aggrLevel={aggrLevel}

        />
    </>;
};
