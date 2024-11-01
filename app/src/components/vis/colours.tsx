// Crameri, F. (2023). Scientific colour maps (8.0.1). Zenodo. https://doi.org/10.5281/zenodo.8409685
// Colours using the batlow100 discrete colour map from the Scientific Colour Maps package by Fabio Crameri
const colours = ['#011959','#041E5A','#06215B','#08255B','#0A285C','#0B2D5D','#0C2F5D','#0D335E','#0E375E','#0F395F','#103D5F','#103F60','#114260','#114460','#124761','#134A61','#144C62','#154F62','#165062','#175362','#195662','#1A5762','#1C5A62','#1E5C62','#205E61','#226061','#256260','#28645F','#2B655E','#2F675C','#31695B','#356A59','#386C58','#3C6D56','#416F53','#447052','#48714F','#4C724D','#50744B','#537549','#587646','#5D7844','#607942','#657A3F','#687B3E','#6D7C3B','#717D39','#767F37','#7B8034','#7F8133','#848331','#88842F','#8E852E','#93872C','#97882C','#9D892B','#A18A2B','#A78B2C','#AB8C2D','#B18D2F','#B78E31','#BB8F33','#C09036','#C49138','#CA923C','#CD923F','#D29343','#D89448','#DB954B','#E09651','#E39754','#E7985A','#EA995E','#EE9B64','#F19D6B','#F39E70','#F6A077','#F8A17B','#F9A382','#FAA587','#FCA78E','#FCA995','#FDAB9A','#FDADA0','#FDAFA5','#FDB1AB','#FDB3B1','#FDB4B6','#FDB7BC','#FDB8C0','#FDBAC7','#FDBCCB','#FCBED1','#FCC0D8','#FCC2DC','#FCC4E3','#FBC6E8','#FBC8EF','#FBCAF3','#FACCFA']


export function getFocusColour(value: number, range: [number, number], polarity: string = 'positive') {
    // using a max of 99, as we don't want 0 to 100, we want 0 to 99, 
    // this serves as index for colours 1 to 100
    const [min, max] = range;
    const normalizedValue = (value - min) / (max - min) * 99;
    const index = Math.floor(normalizedValue);
    return polarity==='positive'?colours[index]:colours.reverse()[index];
}

interface LegendItem {
  level: string;
  colour: string;
}

export const getColourByLevel = (level: string, legendDefinition: LegendItem[]) => {
    const legendItem = legendDefinition.find(item => item.level === level);
    return legendItem ? legendItem.colour : '#FFF'; // Default color if no match
  };

export const determineColour = (item: any, index: number, polarity: string) => {
    if (item.range_greq_le) {
      return getFocusColour(index + 1, item.range_greq_le, polarity);
    } else if (item.colour) {
      return item.colour;
    }
    return '#FFF'; // Default color if no match
  };

export const getCategoricalColourList = (n: number): string[] => {
  if (n === 3) {
    return ['#fc4e57', '#a3488b', '#3196bc'];
  }
  return []; // Default return if no match
}