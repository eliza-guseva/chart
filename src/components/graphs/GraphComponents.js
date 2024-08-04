import React from 'react';
import { AreaClosed } from '@visx/shape';
import { getDate } from './fileAndDataProcessors';

// AreaStack component
export const MyAreaStackVsDate = ({data, xScale, yScale, keys, colors, ...props}) => {
    let stack = [];
    // iterate from the end of the keys array
    for (let i = keys.length - 1; i >= 0; i--) {
        console.log(i);
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
return <>{stack}</>;
};
