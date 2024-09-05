

export const MAIN_GRAPH_BCKG = "#f8f9fb11"
export const GRID_COLOR = "#858585"
export const BRUSH_GREEN = '#678e72';

export const GARMIN_GOOD = '#16982f';
export const GARMIN_FAIR = '#da6f2e';
export const GARMIN_POOR = '#d61321';
export const GARMIN_UNK = '#888888';
export const GARMIN_GREEN = '#2ebd65';


/**
 * The style object for the brush.
 * @type {Object}
 */

export function getBrushStyle(color) {
    return {
        fillColor: color,
        accentColor: "#f6acc8",
        selectedBoxStyle: {
            fill: 'url(#brush_pattern)',
            stroke: '#ffffff',
        },
    }
};

export function getTitleStyle(margin) {
    return {
        fontSize: '1.3em',
        fontWeight: 'bold',
        zIndex: 10,
        marginLeft: (margin.left + 4) + 'px',
    };
}

