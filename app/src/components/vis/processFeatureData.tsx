import { useEffect, useState } from 'react';

// Define structures for JSON data
interface Node {
  Code: string;
  References: number;
  Intersecting: string;
};


export interface UnGroupedData {
    [key: string]: {
        References: number;
        Intersecting: string[];
    };
  };

export interface GroupedData {
  [key: string]: UnGroupedData
};

// Function for pre-processing feature data from workshops.
// This is not intended to be used live, but to be run once to generate a processed file.
// It is included here as a record of the methods used to shape data for visualisation.
// Only the processed data will be included in the repository.
export function processFeatureData() {
    const [data, setData] = useState<Node[]>([]);
    // load data
    useEffect(() => {
        import('./data/workshop_cleaned_2024-07-10.json')
        .then(data => {
            setData(data.default as Node[]);
        });
    }, []);

    if (data) {
        // filter to only use Themes for visualisation
        const filtered = data.filter((node) => 
            node.Code.startsWith('Theme') && 
            node.Intersecting.startsWith('Theme')
        );
        // Get the count of parent codes that will be added to for subsequent filtering
        // Idea is, for visualisation purposes, we can restrict to unique codes
        // If other codes build on this one as a stub, let's use those instead
        // And only retain the unique, focused codes.
        var parentCodes = filtered.reduce((acc: string[], curr: Node) => {
            const isStub = filtered.some((node) => node.Code !== curr.Code && node.Code.startsWith(curr.Code));
            if (isStub) {
                const parentCode = curr.Code.split('\\\\')[1]
                let existingEntry = acc
                if (!existingEntry.includes(parentCode)) {
                    return acc.concat(parentCode);
                }
            }
            return acc;
        }, []);
        // console.log(parentCodes)
        if (parentCodes) {
            const groupedData: GroupedData = filtered.reduce((acc: GroupedData, curr: Node) => {
                const hierarchy = curr.Code.split('\\\\')[1].split('\\');
                const prefix = hierarchy[0];
                const new_code = hierarchy.slice(1).join('\\')
                const Intersecting = curr.Intersecting.split('\\\\')[1].replace('\\','\\');
                const IncludeIntersecting = !parentCodes.includes(Intersecting);
                const IncludeCode = !parentCodes.includes(new_code);
                // initialise grouping category with prefix if it doesn't exist
                if (!acc[prefix]) {
                    acc[prefix] = {};
                }
                if (IncludeCode && new_code!="") {
                    let existingEntry = acc[prefix][new_code];
                    if (existingEntry) {
                        // Append intersecting codes to intersecting list other than parent codes
                        if (IncludeIntersecting) {
                            existingEntry.Intersecting = [...new Set([...existingEntry.Intersecting, Intersecting])];
                        };
                    } else if (IncludeIntersecting) {
                        acc[prefix][new_code] = {
                            // add references and initialise intersecting code list using this code
                            References: curr.References,
                            Intersecting: [Intersecting],
                        };
                    } else {
                        acc[prefix][new_code] = {
                            // add references and initialise empty intersecting code list 
                            References: curr.References,
                            Intersecting: [],
                    };
                }
                }
                return acc;
            }, {});
            if (groupedData) {
                console.log(groupedData);
                console.log("Copy the above object log from console and paste into the processedFeatureData-yyyy-mm-dd.json file");
            }
            return (
                null
            );
        };
    };
};

export function loadFeatureData() {
    const [data, setData] = useState<GroupedData>();
  
    useEffect(() => {
      import('./data/processedFeatureData-2024-07-11.json')
        .then(data => {
          setData(data.default as GroupedData);
        });
    }, []);
    return data
};

    // export default processFeatureData;
    export default loadFeatureData;
