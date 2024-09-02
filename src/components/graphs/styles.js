

export const MAIN_GRAPH_BCKG = "#f8f9fb11"
export const GRID_COLOR = "#858585"
/**
 * The style object for the brush.
 * @type {Object}
 */

export const brushStyle = {
    fillColor: "#ffddff",
    accentColor: "#f6acc8",
    selectedBoxStyle: {
        fill: 'url(#brush_pattern)',
        stroke: '#ffffff',
    },
};

export function getTitleStyle(margin) {
    return {
        fontSize: '1.3em',
        fontWeight: 'bold',
        zIndex: 10,
        marginLeft: (margin.left + 4) + 'px',
    };
}
