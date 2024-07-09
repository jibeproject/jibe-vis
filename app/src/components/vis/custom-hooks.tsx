// Adapted from Amelia Wattenberger (2024-07-07)
// https://github.com/Wattenberger/Wattenberger-2019/blob/96ab49b8a5cba0d41d1ad9bca98e529f1d4673a8/src/components/_ui/Chart/utils/utils.js#L1C1-L65C2

import { useRef, useState, useEffect } from "react"
import PropTypes from "prop-types"
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';

const ResizeObserver = window.ResizeObserver || Polyfill;

export const dimensionsPropsType = (
    PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
        marginTop: PropTypes.number,
        marginRight: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
    })
)

export const combineChartDimensions = (dimensions:any) => {
    let parsedDimensions = {
        marginTop: 40,
        marginRight: 30,
        marginBottom: 40,
        marginLeft: 30,
        ...dimensions,
    }

    return {
        ...parsedDimensions,
        boundedHeight: Math.max(parsedDimensions.height - parsedDimensions.marginTop - parsedDimensions.marginBottom, 0),
        boundedWidth: Math.max(parsedDimensions.width - parsedDimensions.marginLeft - parsedDimensions.marginRight, 0),
    }
}

export const useChartDimensions = (passedSettings:any) => {
    const ref = useRef()
    const dimensions = combineChartDimensions(passedSettings)

    const [width, changeWidth] = useState(0)
    const [height, changeHeight] = useState(0)

    useEffect(() => {
        if (dimensions.width && dimensions.height) return () => [ref, dimensions]

        const element = ref.current
        if (element) {
            const resizeObserver = new ResizeObserver(entries => {
                if (!Array.isArray(entries)) return
                if (!entries.length) return

                const entry = entries[0]

                if (width != entry.contentRect.width) changeWidth(entry.contentRect.width)
                if (height != entry.contentRect.height) changeHeight(entry.contentRect.height)
            })

            resizeObserver.observe(element)

            return () => resizeObserver.unobserve(element)
        }
    }, [])

    const newSettings = combineChartDimensions({
        ...dimensions,
        width: dimensions.width || width,
        height: dimensions.height || height,
    })

    return [ref, newSettings]
}