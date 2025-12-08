import { useEffect, useRef, useState } from 'react';
import { Flex, View} from '@aws-amplify/ui-react';
import './jibe_model_diagram.css'
import { NavHeading } from '../navheading';
import { glossary } from '../glossary';
import { DownloadFileButton } from '../utilities';

// Suppress SVG rect width warnings that occur due to internal browser rendering
// These occur with responsive SVG scaling and don't affect actual display
const originalError = console.error;
const errorFilter = (...args: any[]) => {
  const errorMessage = args[0]?.toString() || '';
  // Filter out the specific SVG rect width error that occurs 2000+ times
  if (errorMessage.includes('rect') && errorMessage.includes('width') && errorMessage.includes('negative')) {
    return;
  }
  originalError(...args);
};
console.error = errorFilter;

export default function jibeDiagram() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; term: string; definition: string; alignLeft: boolean }>({
    visible: false,
    x: 0,
    y: 0,
    term: '',
    definition: '',
    alignLeft: false
  });

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      
      // Find the closest parent g element (wrapper) that contains text
      let gParent = target.closest('g#svg-element-wrapper') as SVGElement | null;
      
      // If not found, try the immediate g parent
      if (!gParent) {
        gParent = target.closest('g') as SVGElement | null;
      }

      let textContent = '';
      
      if (gParent) {
        // Get all text elements within this group
        const textElements = gParent.querySelectorAll('text');
        const textParts: string[] = [];
        textElements.forEach((el: SVGTextElement) => {
          if (el.textContent) {
            textParts.push(el.textContent);
          }
        });
        // Join text parts with space to handle multi-line labels
        textContent = textParts.join(' ');
      } else if (target.tagName === 'text') {
        textContent = target.textContent || '';
      }

      // Clean up text content (remove extra whitespace and normalize)
      textContent = textContent.trim().replace(/\s+/g, ' ');

      // Only proceed if there's actual text content
      if (!textContent) {
        // No text content, hide tooltip
        setTooltip(prev => ({
          ...prev,
          visible: false
        }));
        return;
      }

      // Look for matching glossary term
      // Try exact match first, then check if content contains the glossary key
      let matchedTerm = '';
      
      // First try exact match
      if (glossary[textContent]) {
        matchedTerm = textContent;
      } else {
        // Try finding a glossary term within the text content
        for (const key in glossary) {
          // Check if the extracted text contains the glossary key
          if (textContent.includes(key)) {
            matchedTerm = key;
            break;
          }
        }
      }

      if (matchedTerm && glossary[matchedTerm]) {
        const rect = svgElement.getBoundingClientRect();
        const xPos = e.clientX - rect.left;
        const svgWidth = rect.width;
        const shouldAlignLeft = xPos > svgWidth / 2;
        
        setTooltip({
          visible: true,
          x: xPos,
          y: e.clientY - rect.top,
          term: matchedTerm,
          definition: glossary[matchedTerm],
          alignLeft: shouldAlignLeft
        });
      } else {
        // No matching term found, hide tooltip
        setTooltip(prev => ({
          ...prev,
          visible: false
        }));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (tooltip.visible) {
        const rect = svgElement.getBoundingClientRect();
        const xPos = e.clientX - rect.left;
        const svgWidth = rect.width;
        // If cursor is in the right half of the SVG, align tooltip to the left
        const shouldAlignLeft = xPos > svgWidth / 2;
        
        setTooltip(prev => ({
          ...prev,
          x: xPos,
          y: e.clientY - rect.top,
          alignLeft: shouldAlignLeft
        }));
      }
    };

    const handleMouseOut = () => {
      setTooltip(prev => ({
        ...prev,
        visible: false
      }));
    };

    svgElement.addEventListener('mouseover', handleMouseOver);
    svgElement.addEventListener('mousemove', handleMouseMove);
    svgElement.addEventListener('mouseout', handleMouseOut);

    return () => {
      svgElement.removeEventListener('mouseover', handleMouseOver);
      svgElement.removeEventListener('mousemove', handleMouseMove);
      svgElement.removeEventListener('mouseout', handleMouseOut);
    };
  }, [tooltip]);

//   const handleZoomIn = () => {
//     const svg = select(svgRef.current);
//     svg.transition().call(zoomBehaviorRef.current.scaleBy, 1.2);
//   };

//   const handleZoomOut = () => {
//     const svg = select(svgRef.current);
//     svg.transition().call(zoomBehaviorRef.current.scaleBy, 0.8);
//   };

//   const ResetSVG = () => {
//     const svg = select(svgRef.current);
//     svg.transition().call(zoomBehaviorRef.current.transform, zoomIdentity);
//   }

  return (
        <View width="100%" height={{base: "500px", large:"720px"}} marginTop="0rem" marginBottom="2rem">
          <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="10px">
            <NavHeading level={4} title="JIBE agent-based modelling workflow" id={'jibe-model-diagram'} stub='about'/>
            <div style={{ display: 'flex', justifyContent: 'right' }}>
              {/* <Button variant="outlined" onClick={handleZoomOut}><ZoomOut/></Button>
              <Button variant="outlined" onClick={handleZoomIn}><ZoomIn/></Button> */}
              {/* <Button variant="outlined" onClick={handleOpenDialog}><Fullscreen/></Button> */}
              {/* <Button variant="outlined" onClick={ResetSVG}><Refresh/></Button> */}
            <DownloadFileButton filepath={"/images/jibe-model-diagram.png"}/>
            </div>
          </Flex>
          <div id="jibe-model-diagram-container">
          <svg ref={svgRef} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
            <Diagram />
          </svg>
          {tooltip.visible && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.alignLeft ? 'auto' : `${tooltip.x}px`,
                right: tooltip.alignLeft ? `calc(100% - ${tooltip.x}px)` : 'auto',
                top: `${tooltip.y}px`,
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px 12px',
                maxWidth: '300px',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#084F6A' }}>
                {tooltip.term}
              </div>
              <div style={{ color: '#333' }}>
                {tooltip.definition}
              </div>
            </div>
          )}
          </div>
        </View>
  );
}


export function Diagram() {
    return (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 1280 720" className="no-select" overflow="visible">
      <defs>
          <linearGradient x1="815.804" y1="103.921" x2="478.196" y2="771.079" gradientUnits="userSpaceOnUse"
              spreadMethod="reflect" id="fill0">
              <stop offset="0" stopColor="#E59EDD" stopOpacity="0.301961" />
              <stop offset="0.57" stopColor="#83CBEB" stopOpacity="0.301961" />
              <stop offset="1" stopColor="#8ED973" stopOpacity="0.301961" />
          </linearGradient>
      </defs>
      <g>
          <rect x="0" y="0" width="1280" height="720" fill="#FFFFFF" />
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M1002 229.228 1002 105 1113.83 105 1113.83 107 1003 107 1004 106 1004 229.228ZM1112.5 102 1120.5 106 1112.5 110Z"
              fill="#156082" /></g>
          <g id="svg-element-wrapper"><path
              d="M1121 36.6671C1121 22.4916 1132.49 11 1146.67 11L1249.33 11C1263.51 11 1275 22.4916 1275 36.6671L1275 172.333C1275 186.508 1263.51 198 1249.33 198L1146.67 198C1132.49 198 1121 186.508 1121 172.333Z"
              id="jibe-outputs"/><text id="jibe-bold" transform="translate(1137.35 33)">Mobility <output></output>utputs</text></g>
          <g id="svg-element-wrapper"><path
              d="M1136.5 100.834C1136.5 97.3356 1139.34 94.5001 1142.83 94.5001L1251.17 94.5001C1254.66 94.5001 1257.5 97.3356 1257.5 100.834L1257.5 126.167C1257.5 129.664 1254.66 132.5 1251.17 132.5L1142.83 132.5C1139.34 132.5 1136.5 129.664 1136.5 126.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(1155.69 119)">Travel times</text></g>
          <g id="svg-element-wrapper"><path
              d="M1136.5 148.834C1136.5 145.336 1139.34 142.5 1142.83 142.5L1251.17 142.5C1254.66 142.5 1257.5 145.336 1257.5 148.834L1257.5 174.167C1257.5 177.664 1254.66 180.5 1251.17 180.5L1142.83 180.5C1139.34 180.5 1136.5 177.664 1136.5 174.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(1174.56 166)">Stress</text></g>
          <g id="svg-element-wrapper"><path
              d="M1136.5 53.8335C1136.5 50.3356 1139.34 47.5001 1142.83 47.5001L1251.17 47.5001C1254.66 47.5001 1257.5 50.3356 1257.5 53.8335L1257.5 79.1666C1257.5 82.6645 1254.66 85.5001 1251.17 85.5001L1142.83 85.5001C1139.34 85.5001 1136.5 82.6645 1136.5 79.1666Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(1157.2 71)">Congestion</text></g>
          <g id="svg-element-wrapper"><path d="M979 338 1202.88 338 1202.88 340 979 340ZM1201.55 335 1209.55 339 1201.55 343Z" fill="#084F6A" /></g>
          <g id="svg-element-wrapper"><path
              d="M3 346.167C3 332.268 14.2677 321 28.1671 321L128.833 321C142.732 321 154 332.268 154 346.167L154 607.833C154 621.732 142.732 633 128.833 633L28.1671 633C14.2677 633 3 621.732 3 607.833Z"
              id="jibe-outputs"/><text id="jibe-bold" transform="translate(22.1062 344)">Health outputs</text></g>
          <g id="svg-element-wrapper"><path
              d="M18.5001 362.667C18.5001 359.261 21.261 356.5 24.6669 356.5L132.333 356.5C135.739 356.5 138.5 359.261 138.5 362.667L138.5 387.333C138.5 390.739 135.739 393.5 132.333 393.5L24.6669 393.5C21.261 393.5 18.5001 390.739 18.5001 387.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(53.1628 380)">Deaths</text></g>
          <g id="svg-element-wrapper"><path
              d="M18.5001 470.834C18.5001 467.336 21.3356 464.5 24.8335 464.5L132.167 464.5C135.664 464.5 138.5 467.336 138.5 470.834L138.5 496.167C138.5 499.664 135.664 502.5 132.167 502.5L24.8335 502.5C21.3356 502.5 18.5001 499.664 18.5001 496.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(45.3462 488)">Life years</text></g>
          <g id="svg-element-wrapper"><path
              d="M18.5001 578.833C18.5001 575.336 21.3356 572.5 24.8335 572.5L132.167 572.5C135.664 572.5 138.5 575.336 138.5 578.833L138.5 604.167C138.5 607.664 135.664 610.5 132.167 610.5L24.8335 610.5C21.3356 610.5 18.5001 607.664 18.5001 604.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(32.5262 597)">Quality of life</text></g>
          <g id="svg-element-wrapper"><path
              d="M18.5001 416.834C18.5001 413.336 21.3356 410.5 24.8335 410.5L132.167 410.5C135.664 410.5 138.5 413.336 138.5 416.834L138.5 442.167C138.5 445.664 135.664 448.5 132.167 448.5L24.8335 448.5C21.3356 448.5 18.5001 445.664 18.5001 442.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(46.0929 434)">Diseases</text></g>
          <g id="svg-element-wrapper"><path
              d="M18.5001 524.833C18.5001 521.336 21.3356 518.5 24.8335 518.5L132.167 518.5C135.664 518.5 138.5 521.336 138.5 524.833L138.5 550.167C138.5 553.664 135.664 556.5 132.167 556.5L24.8335 556.5C21.3356 556.5 18.5001 553.664 18.5001 550.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(65.5262 533)">Life</text><text id="jibe" transform="translate(38.5129 552)">expectancy</text></g>
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M0.00762689-0.999971 70.6452-0.46121 70.63 1.53873-0.00762689 0.999971ZM69.3348-3.47129 77.304 0.589606 69.2738 4.52847Z"
              fill="#156082" transform="matrix(-1 0 0 1 236.304 339)" /></g>
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M1202.17 398.167 1202.17 419.396 1200.83 419.396 1200.83 398.167ZM1197.5 399.5 1201.5 391.5 1205.5 399.5Z"
              fill="#084F6A" /></g>
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M1202.17 457.5 1202.17 478.73 1200.83 478.73 1200.83 457.5ZM1205.5 477.396 1201.5 485.396 1197.5 477.396Z"
              fill="#084F6A" /></g>
          <g id="svg-element-wrapper"><path
              d="M1121 296.667C1121 282.492 1132.49 271 1146.67 271L1249.33 271C1263.51 271 1275 282.492 1275 296.667L1275 554.333C1275 568.508 1263.51 580 1249.33 580L1146.67 580C1132.49 580 1121 568.508 1121 554.333Z"
              id="jibe-outputs"/><text id="jibe-bold" transform="translate(1144.9 293)">Environmental</text><text id="jibe-bold" transform="translate(1168.26 312)">outputs</text></g>
          <g id="svg-element-wrapper"><path
              d="M1140.5 526.833C1140.5 523.336 1143.34 520.5 1146.83 520.5L1255.17 520.5C1258.66 520.5 1261.5 523.336 1261.5 526.833L1261.5 552.167C1261.5 555.664 1258.66 558.5 1255.17 558.5L1146.83 558.5C1143.34 558.5 1140.5 555.664 1140.5 552.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(1180.34 545)">Noise</text></g>
          <g id="svg-element-wrapper"><path
              d="M1140.5 395.834C1140.5 392.336 1143.34 389.5 1146.83 389.5L1255.17 389.5C1258.66 389.5 1261.5 392.336 1261.5 395.834L1261.5 421.167C1261.5 424.664 1258.66 427.5 1255.17 427.5L1146.83 427.5C1143.34 427.5 1140.5 424.664 1140.5 421.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(1164.84 413)">Emissions</text></g>
          <g id="svg-element-wrapper"><path
              d="M1140.5 329.834C1140.5 326.336 1143.34 323.5 1146.83 323.5L1255.17 323.5C1258.66 323.5 1261.5 326.336 1261.5 329.834L1261.5 355.167C1261.5 358.664 1258.66 361.5 1255.17 361.5L1146.83 361.5C1143.34 361.5 1140.5 358.664 1140.5 355.167Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(1174.76 338)">Carbon</text><text id="jibe" transform="translate(1168.94 357)">Footprint</text></g>
          <g id="svg-element-wrapper"><path
              d="M1140.5 461.667C1140.5 458.261 1143.26 455.5 1146.67 455.5L1255.33 455.5C1258.74 455.5 1261.5 458.261 1261.5 461.667L1261.5 486.333C1261.5 489.739 1258.74 492.5 1255.33 492.5L1146.67 492.5C1143.26 492.5 1140.5 489.739 1140.5 486.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(1158.12 479)">Air pollutant</text></g>
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M1139.76 540.49 1083.38 540.49 1083.38 507 1084.38 508 1035.67 508 1035.67 506 1085.38 506 1085.38 539.49 1084.38 538.49 1139.76 538.49ZM1037 511 1029 507 1037 503Z"
              fill="#156082" /></g>
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M0-1 56.3793-1 56.3793 33.202 55.3793 32.202 104.092 32.202 104.092 34.202 54.3793 34.202 54.3793 0 55.3793 1 0 1ZM102.759 29.202 110.759 33.202 102.759 37.202Z"
              fill="#156082" transform="matrix(-1 1.22465e-16 1.22465e-16 1 1139.76 473)" /></g>
          <g id="svg-element-wrapper"><path
              d="M233 297.835C233 259.266 264.266 228 302.835 228L991.165 228C1029.73 228 1061 259.266 1061 297.835L1061 560C1061 598.569 1029.73 629.834 991.165 629.834L302.835 629.834C264.266 629.834 233 598.569 233 560Z"
              fill="url(#fill0)" fillRule="evenodd" /><text id="jibe-bold" transform="translate(500.693 263)">Agent-based transport and health model</text></g>
          <g id="svg-element-wrapper"><path
              d="M499 463.501C499 443.342 515.342 427 535.501 427L992.499 427C1012.66 427 1029 443.342 1029 463.501L1029 536.333C1029 556.492 1012.66 573 992.499 573L535.501 573C515.342 573 499 556.492 499 536.333Z"
              stroke="#4E95D9" strokeWidth="2" strokeMiterlimit="8" fill="#4E95D9" fillRule="evenodd"
              fillOpacity="0.301961" /><text fill="#084F6A" fontFamily="Aptos,Aptos_MSFontService,sans-serif"
              fontWeight="700" fontSize="16" transform="translate(702.041 453)">Health model</text></g>
          <g id="svg-element-wrapper"><path
              d="M525 294.334C525 283.656 533.656 275 544.334 275L983.666 275C994.344 275 1003 283.656 1003 294.334L1003 371.666C1003 382.344 994.344 391 983.666 391L544.334 391C533.656 391 525 382.344 525 371.666Z"
              fill="#E59EDD" fillRule="evenodd" fillOpacity="0.301961" /><text id="jibe-bold" transform="translate(691.388 295)">Transport model</text></g>
          <g id="svg-element-wrapper"><path id="jibe-arrow" d="M707 338 799.627 338 799.627 340 707 340ZM798.293 335 806.293 339 798.293 343Z" fill="#084F6A" /></g>
          <g id="svg-element-wrapper"><path
              d="M0.00476477-0.999989 147.178-0.298736 147.168 1.70124-0.00476477 0.999989ZM145.859-3.30505 153.84 0.733018 145.821 4.69486Z"
              fill="#084F6A" transform="matrix(1 0 0 -1 399 339.733)" /></g>
          <g id="svg-element-wrapper"><path id="jibe-arrow" d="M765 391 765 420.605 763 420.605 763 391ZM768 419.272 764 427.272 760 419.272Z" fill="#156082" /></g>
          <g id="svg-element-wrapper"><path
              d="M264 318.834C264 312.85 268.85 308 274.834 308L442.166 308C448.15 308 453 312.85 453 318.834L453 362.166C453 368.15 448.15 373 442.166 373L274.834 373C268.85 373 264 368.15 264 362.166Z"
              id="jibe-demographics"/><text id="jibe-bold" transform="translate(280 346)">Demographic models</text></g>
          <g id="svg-element-wrapper"><path
              d="M552.5 318.167C552.5 312.276 557.276 307.5 563.167 307.5L696.833 307.5C702.724 307.5 707.5 312.276 707.5 318.167L707.5 360.833C707.5 366.724 702.724 371.5 696.833 371.5L563.167 371.5C557.276 371.5 552.5 366.724 552.5 360.833Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(575.438 335)">Individual travel</text><text id="jibe" transform="translate(596.118 354)">behaviors</text></g>
          <g id="svg-element-wrapper"><path
              d="M807 317.667C807 311.776 811.776 307 817.667 307L968.333 307C974.224 307 979 311.776 979 317.667L979 360.333C979 366.224 974.224 371 968.333 371L817.667 371C811.776 371 807 366.224 807 360.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(848.785 326)">Agent-based</text><text id="jibe" transform="translate(822.705 345)">transport simulation</text><text id="jibe" transform="translate(860.565 364)">(MATSim)</text></g>
          <g id="svg-element-wrapper"><path
              d="M861 481.667C861 475.776 865.776 471 871.667 471L998.333 471C1004.22 471 1009 475.776 1009 481.667L1009 524.333C1009 530.224 1004.22 535 998.333 535L871.667 535C865.776 535 861 530.224 861 524.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(899.068 499)">Exposure</text><text id="jibe" transform="translate(909.541 518)">models</text></g>
          <g id="svg-element-wrapper"><path
              d="M690 481.667C690 475.776 694.776 471 700.667 471L827.333 471C833.224 471 838 475.776 838 481.667L838 524.333C838 530.224 833.224 535 827.333 535L700.667 535C694.776 535 690 530.224 690 524.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(717.588 509)">Injury Models</text></g>
          <g id="svg-element-wrapper"><path
              d="M519 481.667C519 475.776 523.776 471 529.667 471L656.333 471C662.224 471 667 475.776 667 481.667L667 524.333C667 530.224 662.224 535 656.333 535L529.667 535C523.776 535 519 530.224 519 524.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(537.968 499)">Physical activity</text><text id="jibe" transform="translate(567.041 518)">models</text></g>
          <g id="svg-element-wrapper"><path
              d="M14 665.833C14 663.164 16.1638 661 18.8331 661L1256.17 661C1258.84 661 1261 663.164 1261 665.833L1261 685.167C1261 687.836 1258.84 690 1256.17 690L18.8331 690C16.1638 690 14 687.836 14 685.167Z"
              id="jibe-outputs"/><text fill="#084F6A" fontFamily="Aptos,Aptos_MSFontService,sans-serif"
              fontWeight="700" fontSize="16" transform="translate(576.507 681)">Equity outcomes</text></g>
          <g id="svg-element-wrapper"><path
              d="M342 20.6672C342 13.119 348.119 7 355.667 7L879.333 7C886.881 7 893 13.119 893 20.6672L893 75.3328C893 82.881 886.881 89 879.333 89L355.667 89C348.119 89 342 82.881 342 75.3328Z"
              fill="#FBE3D6" fillRule="evenodd" fillOpacity="0.301961" /><text id="jibe-bold" transform="translate(535.54 26)">Scenario development</text></g>
          <g id="svg-element-wrapper"><path
              d="M638 42.3335C638 38.8356 640.836 36 644.333 36L820.667 36C824.164 36 827 38.8356 827 42.3335L827 67.6665C827 71.1644 824.164 74 820.667 74L644.333 74C640.836 74 638 71.1644 638 67.6665Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(681.822 61)">Policy analysis</text></g>
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M598.672 54.0349 631.321 54.2056 631.311 56.2056 598.661 56.0348ZM599.979 59.0418 592 55 600.021 51.0419ZM630.003 51.1986 637.982 55.2404 629.962 59.1985Z"
              fill="#156082" /></g>
          <g id="svg-element-wrapper"><path
              d="M403 42.3335C403 38.8356 405.836 36 409.333 36L585.667 36C589.164 36 592 38.8356 592 42.3335L592 67.6665C592 71.1644 589.164 74 585.667 74L409.333 74C405.836 74 403 71.1644 403 67.6665Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(424.64 60)">Policy advisory group</text></g>
          <g id="svg-element-wrapper"><path
              d="M343 128.667C343 121.119 349.119 115 356.667 115L878.333 115C885.881 115 892 121.119 892 128.667L892 183.333C892 190.881 885.881 197 878.333 197L356.667 197C349.119 197 343 190.881 343 183.333Z"
              fill="#CAEEFB" fillRule="evenodd" fillOpacity="0.301961" /><text id="jibe-bold" transform="translate(494.184 134)">Built environment spatial analysis</text></g>
          <g id="svg-element-wrapper"><path
              d="M639 154.667C639 150.985 641.985 148 645.667 148L820.333 148C824.015 148 827 150.985 827 154.667L827 181.333C827 185.015 824.015 188 820.333 188L645.667 188C641.985 188 639 185.015 639 181.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(664.376 164)">Transport networks:</text><text id="jibe" transform="translate(666.083 183)">vehicles, walk, bike</text></g>
          <g id="svg-element-wrapper"><path
              d="M403 151.334C403 147.836 405.836 145 409.333 145L585.667 145C589.164 145 592 147.836 592 151.334L592 176.666C592 180.164 589.164 183 585.667 183L409.333 183C405.836 183 403 180.164 403 176.666Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(465.65 169)">Land use</text></g>
          <g id="svg-element-wrapper"><path
              d="M1.00003 6.66666 1.00008 19.0396-0.999922 19.0396-0.999973 6.66667ZM-3.99997 8.00002 0 0 4.00003 7.99998ZM4.00007 17.7062 0.000104987 25.7062-3.99993 17.7063Z"
              fill="#156082" transform="matrix(-1 0 0 1 617 89)" /></g>
          <g id="svg-element-wrapper"><path id="jibe-arrow" d="M343.146 157 164.667 157 164.667 155 343.146 155ZM166 160 158 156 166 152Z" fill="#156082" /></g>
          <g id="svg-element-wrapper"><path
              d="M1 36.5004C1 22.4169 12.4169 11 26.5004 11L128.5 11C142.583 11 154 22.4169 154 36.5004L154 249.5C154 263.583 142.583 275 128.5 275L26.5004 275C12.4169 275 1 263.583 1 249.5Z"
              id="jibe-outputs"/><text id="jibe-bold" transform="translate(12.3574 33)">Built environment</text><text id="jibe-bold" transform="translate(47.4107 52)">outputs</text></g>
          <g id="svg-element-wrapper"><path
              d="M16.5001 170.667C16.5001 166.709 19.7088 163.5 23.6669 163.5L130.333 163.5C134.291 163.5 137.5 166.709 137.5 170.667L137.5 199.333C137.5 203.291 134.291 206.5 130.333 206.5L23.6669 206.5C19.7088 206.5 16.5001 203.291 16.5001 199.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(51.0174 181)">Cycling</text><text id="jibe" transform="translate(29.4174 200)">infrastructure</text></g>
          <g id="svg-element-wrapper"><path
              d="M17.5001 79.3337C17.5001 71.6936 23.6936 65.5001 31.3337 65.5001L124.666 65.5001C132.307 65.5001 138.5 71.6936 138.5 79.3337L138.5 134.666C138.5 142.307 132.307 148.5 124.666 148.5L31.3337 148.5C23.6936 148.5 17.5001 142.307 17.5001 134.666Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(34.1741 83)">JIBE network</text><text id="jibe" transform="translate(63.0941 102)">with</text><text id="jibe" transform="translate(27.8607 121)">environmental</text><text id="jibe" transform="translate(42.0741 140)">exposures</text></g>
          <g id="svg-element-wrapper"><path
              d="M17.5001 231.667C17.5001 227.709 20.7087 224.5 24.6669 224.5L130.333 224.5C134.291 224.5 137.5 227.709 137.5 231.667L137.5 260.333C137.5 264.291 134.291 267.5 130.333 267.5L24.6669 267.5C20.7087 267.5 17.5001 264.291 17.5001 260.333Z"
              id="jibe-specific-outputs"/><text id="jibe" transform="translate(58.1796 241)">Local</text><text id="jibe" transform="translate(33.8996 260)">accessibility</text></g>
          <g id="svg-element-wrapper"><path
              id="jibe-arrow" d="M1.00003 6.66666 1.00008 19.0396-0.999922 19.0396-0.999973 6.66667ZM-3.99997 8.00002 0 0 4.00003 7.99998ZM4.00007 17.7062 0.000104987 25.7062-3.99993 17.7063Z"
              fill="#156082" transform="matrix(-1 0 0 1 617 199)" /></g>
      </g>
  </svg>
    );
  }
  