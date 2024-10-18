# JIBE Melbourne Mode Choice Preparation and Analysis


# JIBE-Vis data preparation

The JIBE-Vis project (aka VicHealth-Viz) aims to make the [Joining
Impact models of transport with spatial measures of the Built
Environment (JIBE) project](https://jibeproject.com) modelling outputs
accessible and useful for stakeholders, both in Melbourne and
Manchester. More broadly, the proposed platform
(https://transporthealthimpacts.org) is intended to serve as an ongoing
outlet for data stories illustrating the health impacts of transport
planning scenarios.

This [Quarto](https://quarto.org/) markdown document will be used to
record additional data processing undertaken using JIBE modelling
outputs and additional external data for inclusion in the [Transport
Health Impacts](https://transporthealthimpacts.org) data platform.

## Status

14 October 2024: commenced, in progress

## Background

Through the JIBE project (Joining Impact models of transport with
spatial measures of the Built Environment) and the associated [AToM
project](https://doi.org/10.1080/15472450.2024.2372894) ( Activity-based
and agent-based Transport model of Melbourne), we have developed
agent-based transport simulation models (ABMs) capable of depicting
complex urban systems. These ABMs model how street-level built
environment exposures influence behaviour, accessibility and health with
high spatial and demographic granularity. By forecasting travel
itineraries, behaviours, exposures, and health for a synthetic
population of individuals, these ABMs allow us to simulate scenarios of
interest to health and transport planners. However, the complexity of
the models and their extensive, detailed outputs can be a barrier to
effective knowledge translation and therefore impact.

This web site provides illustrative examples of potential functionality
that we could implement in an interactive tool to make transport and
health modelling results from JIBE and similar projects accessible and
useful. Through our engagement with stakeholders, we will incorporate
and test new functionality that can help meet their needs and achieve
this goal. The website is being developed as open source software on
[GitHub](https://github.com/jibeproject/jibe-vis).

The approach to complex systems modelling undertaken in the JIBE project
is illustrated in the following diagram: ![JIBE model
diagram](https://github.com/jibeproject/jibe-vis/blob/main/diagrams/jibe-model-diagram.png?raw=true)

### Aims

We plan to engage government and advocacy stakeholders and researchers
to co-develop an interactive platform with two related aims:

1.  To make complex urban systems modelling evidence accessible and
    useful for informing healthy transport planning policy and localised
    infrastructure interventions; and
2.  Support visualising the impacts of modelled transportation
    scenarios.

We plan to publish the methods and visualisation platform developed
through this work as open source code that can be adapted by other
researchers and practitioners for new settings for translation of
research evidence into practice.

## JIBE outputs

The JIBE outputs are stored in a shared sharepoint/Teams folder ([JIBE
working
group](https://rmiteduau.sharepoint.com/:f:/r/sites/JIBEworkinggroup/Shared%20Documents/General?csf=1&web=1&e=xxdKd0))
that contains the following sub-folders:

- documentation
  - a spreadsheet for documenting outputs and their documentation
- manchester
  - documentation and outputs relating to the Manchester modelling
    components:
    - accessibility
    - airPollutant
    - health
    - MATSim
    - network
    - noise
    - physicalActivity
    - skims
    - synPop
- melbourne
  - documentation and outputs relating to the Melbourne modelling
    components
    - 20min_interventions
    - addresses
    - cycling_intervention
    - dem
    - freight
    - gtfs
    - health
    - injuries
    - network
    - noise
    - osm
    - poi
    - regions
    - synthetic_population
- visualisation
  - documentation and outputs related to the JIBE visualisation research
    translation project component, including this notebook and a copy of
    the Transport Health Impacts website code (a NodeJS typescript
    website, authored using the React framework). Because of challenges
    with syncing and building/rebuilding NodeJS libraries, the actual
    development is occurring in an offline folder. This folder contains
    a copy of the code repository
    https://github.com/jibeproject/jibe-vis. The app itself is deployed
    upon successful code pushes to GitHub using AWS Amplify, at
    https://transporthealthimpacts.org.
  - This notebook is now being commenced as a refinement of seperate
    OneNote records, and will also record future planned data
    preparation drawing on data located in the above mentioned folders.

## Pre-requisites

Code was authored using [R](https://cloud.r-project.org/) 4.4.1 and
[Positron
2024.10.0-14](https://github.com/posit-dev/positron/releases/tag/2024.10.0-14)
IDE.

No data or data-related outputs will be included in this document or
repository. By default, output is set to False. For non-sensitive
aspects, e.g. displaying the sessionInfo() after running analysis, this
may be over-ridden.

Note that due to limitations of the Postrion IDA (currently in Beta),
large code chunks must be split up in order to note exceed R’s internal
console buffer size. So, this will be done below (for example, when
defining area data).

The following code will help ensure all following code is run from a
fresh R instance.

``` r
rm(list = ls()) # clear memory
```

## General principles

A number of steps must be undertake for data to be included in the
Transport Health Impacts (aka JIBE Vis) platform. Data should be
prepared at the appropriate scales required for visualisation with only
the relevant variables that will be used. Reducing the complexity of
data in this way will result in lower file sizes and improved
performance when streaming data over the internet and processing it on
user’s computers (which may be mobile phones, laptops or desktop
computers).

In general, data which is to be mapped is required in the Protomaps
[pmtiles](https://docs.protomaps.com/pmtiles/) format. These is a vector
map tile format, optimised for streaming complex data at a range of
spatial scales for use in interactive map visualisations. These files
will be uploaded to the `tiles` folder in the Transport Health Impacts
platform’s Amazon Web Services (AWS) S3 storage bucket.

In order to get spatial data into the pmtiles format, the software
[Tippecanoe](https://github.com/felt/tippecanoe) is used. Tippecanoe can
convert CSV, Geojson, or ideally Flatgeobuf data into vector map tiles
in the required format. Details on the conversion of source data into
the required formats will be included in this document. Tippecanoe
should be installed in order to perform this conversion. The above link
contains
[instructions](https://github.com/felt/tippecanoe?tab=readme-ov-file#installation)
for installing and/or running Tippecanoe locally. It is easiest on MacOS
(`$ brew install tippecanoe`); the code below will assume a local
installation has been conducted in this way. Windows users may find it
more convenient running Tippecanoe in a
[Docker](https://github.com/felt/tippecanoe?tab=readme-ov-file#docker-image)
container, in which case the equivalent Tippecanoe commands listed in
this document may be better run directly.

Additional data processing and formatting will be undertaken as
required, and documented here.

The following helper function(s) will be used later:

``` r
spatial_data_to_fgb <- function(spatial_data, output_path, layer = NULL, filter_condition = NULL) {

  if (is.null(layer)) {
    feature_data <- st_read(spatial_data)
  }  else {
    feature_data <- st_read(spatial_data, layer = layer)
  }
  
  # Filter, if defined
  if (!is.null(filter_condition)) {
    feature_data <- feature_data %>%
      filter(!!rlang::parse_expr(filter_condition))
  }
  
  # Transform the boundary to EPSG 4326
  feature_data <- st_transform(feature_data, crs = 4326)
  
  # Extract the directory path from the output file path
  output_dir <- dirname(output_path)
  
  # Check if the directory exists, and if not, create it
  if (!dir.exists(output_dir)) {
    dir.create(output_dir, recursive = TRUE)
  }
  
  # Export the filtered boundary to a FlatGeobuf (fgb) file
  st_write(feature_data, output_path, append = FALSE)
  
  # Confirm the export
  cat("Feature data exported to", output_path, "\n")
  
  return(feature_data)
}
```

## System environment set up

Project dependencies are described in the [`renv.lock`](./renv.lock)
file; see [renv](https://rstudio.github.io/renv/) for more information.
Instructions on installing dependencies using an `renv` lock file are
[here](https://rstudio.github.io/renv/articles/renv.html#installing-packages).

With `renv` installed, dependencies were installed by running:

    renv::install(c('arrow','conflicted','fastDummies','janitor','knitr','tidyverse','sf','dplyr'))

``` r
library(arrow) # for writing Parquet files
library(conflicted) # package conflict handling https://stackoverflow.com/a/75058976
library(janitor) # data cleaning
library(knitr) # presentation
library(tidyverse) # data handling
library(fastDummies) # binary dummy variable utility
library(sf) # for spatial data handling
library(dplyr)

conflict_prefer("filter", "dplyr")
conflict_prefer("lag", "dplyr")
```

## Data sources

Initialising `data` object which will contain descriptions of the data
used for modelling and representing aspects each of Manchester and
Melbourne.

``` r
data <- list(Manchester = list(), Melbourne = list(), Munich = list())
```

All data used should be specified including the following aspects,
separated by commas (as demonstrated below):

- source: the path to the data relative to shared project folder (JIBE
  Working Group)
- description: A brief plain language description of this data
- variable: A list of relevant variables present in this data (using
  revised names, if optionally renamed, below)
- rename: An optional list mapping old names to new names in the order:
  old = new
- metadata: A list detailing this dataset’s provenance:
  - publisher: For example, ‘Office of National Statistics (UK)’
  - date_published: For example, ‘2023’
  - dataset: The official name for this data.
  - url: The URL from which this data may be retrieved.
  - date_accessed: For example, ‘11 October 2024’
  - licence: The licence governing usage of this data
  - notes: Any relevant notes on usage
- layer: The layer this data is contained with in (option, if relevant,
  e.g. for a layer in a geopackage)
- filter: An optional filter expression (e.g. “Name == ‘Greater
  Manchester’”)
- output: A file path for any derived outputs based on this data

### Manchester areas

``` r
data$Manchester[["areas"]] <- list()
```

#### Output Areas (OA)

``` r
data$Manchester$areas[["OA"]] = list(
  source="manchester/synPop/sp_2021/OA_2021_MCR.shp",
  description = "Output Areas (2021)",
  variable = list(
    OA21CD = 'Output Area 2021 code',
    LSOA21CD = 'LSOA 2021 code',
    LSOA21NM = 'LSOA 2021 name',
    id = 'Synthetic population zone linkage code for Output Areas'
  ),
  metadata = list(
    publisher = 'Office for National Statistics',
    date_published = '2023',
    dataset = 'Output Areas (December 2021) Boundaries EW BGC (V2)',
    url = 'https://geoportal.statistics.gov.uk/datasets/6beafcfd9b9c4c9993a06b6b199d7e6d_0',
    date_accessed = '19 August 2024',
    notes = "This data has been modified with a seprate unique linkage code zone id by the JIBE project team for modelling purposes.",
    licence = 'Open Government Licence (UK)'
  )
)


data$Manchester$areas[["OA_linkage"]] = list(
  source="visualisation/external_data/Office of National Statistics/Output_Area_to_Lower_layer_Super_Output_Area_to_Middle_layer_Super_Output_Area_to_Local_Authority_District_(December_2021)_Lookup_in_England_and_Wales_v3.csv",
  description = "Output Areas linkage codes (LSOA, MSOA, LAD) (2021)",
  variable = list(
  ),
  metadata = list(
    publisher = 'Office for National Statistics',
    date_published = '2024',
    dataset = 'Output Area (2021) to LSOA to MSOA to LAD (December 2021) Exact Fit Lookup in EW (V3) Office for National Statistics Exact Fit Lookup',
    url = 'https://geoportal.statistics.gov.uk/datasets/b9ca90c10aaa4b8d9791e9859a38ca67_0',
    date_accessed = '16 October 2024',
    licence = 'Open Government Licence (UK)'
  )
)
```

#### Lower layer Super Output Areas (LSOA)

``` r
data$Manchester$areas[["LSOA"]] = list(
  source="visualisation/external_data/Office of National Statistics/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_4023609225507911834.gpkg",
  description = "Lower layer Super Output Areas (2021)",
  variable = list(
  ),
  metadata = list(
    publisher = 'Office for National Statistics',
    date_published = '2024',
    dataset = 'Lower layer Super Output Areas (December 2021) Boundaries EW BGC (V3)',
    url = 'https://geoportal.statistics.gov.uk/datasets/d082c4679075463db28bcc8ca2099ade_0',
    date_accessed = '16 October 2024',
    licence = 'Open Government Licence (UK)'
  ),
  output = "visualisation/derived_data/FlatGeobufs/GreaterManchester_LSOA_ONS_2024.fgb"
)
```

#### Middle layer Super Output Areas (MSOA)

``` r
data$Manchester$areas[["MSOA"]] = list(
  source="visualisation/external_data/Office of National Statistics/MSOA_2021_EW_BGC_V2_6515647442419654873.gpkg",
  description = "Middle layer Super Output Areas (2021)",
  variable = list(
  ),
  metadata = list(
    publisher = 'Office for National Statistics',
    date_published = '2023',
    dataset = 'Middle layer Super Output Areas (December 2021) Boundaries EW BGC (V2)',
    url = 'https://geoportal.statistics.gov.uk/datasets/ed5c7b7d733d4fd582281f9bfc9f02a2_0',
    date_accessed = '16 October 2024',
    licence = 'Open Government Licence (UK)'
  ),
  output = "visualisation/derived_data/FlatGeobufs/GreaterManchester_MSOA_ONS_2024.fgb"
)
```

#### Local Authority Districts (LAD)

``` r
data$Manchester$areas[["LAD"]] = list(
  source="visualisation/external_data/Office of National Statistics/Local_Authority_Districts_December_2022_UK_BGC_V2_-4517174194749745377.gpkg",
  description = "Local Authority Districts (2022)",
  variable = list(
  ),
  metadata = list(
    publisher = 'Office for National Statistics',
    date_published = '2023',
    dataset = 'Local Authority Districts (December 2022) Boundaries UK BGC',
    url = 'https://geoportal.statistics.gov.uk/datasets/995533eee7e44848bf4e663498634849_0',
    date_accessed = '16 October 2024',
    licence = 'Open Government Licence (UK)'
  ),
  output = "visualisation/derived_data/FlatGeobufs/GreaterManchester_LAD_ONS_2024.fgb"
)
```

#### Greater Manchester

Greater Manchester is a ceremonial county; documentation on cermonial
counties is included in the Ordnance Survey Boundary-Line geopackage
download, specified below.

``` r
data$Manchester$areas[["GreaterManchester"]] = list(
  source="visualisation/external_data/Ordnance Survey/bdline_gpkg_gb/Data/bdline_gb.gpkg",
  description = "Greater Manchester",
  variable = list(
  ),
  metadata = list(
    publisher = 'Ordnance Survey',
    date_published = '2024',
    dataset = 'Boundary-Line™',
    url = 'https://osdatahub.os.uk/downloads/open/BoundaryLine',
    date_accessed = '11 October 2024',
    licence = 'Open Government Licence (UK)',
    notes = "bdline_gpkg_gb/Data/bdline_gb.gpkg|layername=boundary_line_ceremonial_counties|subset=\"Name\" = 'Greater Manchester'"
  ),
  layer = "boundary_line_ceremonial_counties",
  filter = "Name == 'Greater Manchester'",
  output = "visualisation/derived_data/FlatGeobufs/GreaterManchester_OrdnanceSurvey_2024.fgb"
)
```

### Manchester Network

``` r
data$Manchester[["network"]] <- list()
```

``` r
data$Manchester$network[["reference"]] <- list(
  source="visualisation/network/net2way_manchester.gpkg",
  description = "Manchester reference network"
)
```

``` r
data$Manchester$network[["intervention"]] <- list(
  source="visualisation/network/net2way_manchester_cycleIntervention.gpkg",
  description = "Manchester network with reduced speed limits and improved cycling infrastructure"
)
```

### Manchester Synthetic population

``` r
data$Manchester[["population"]] <- list()
```

#### Persons

``` r
data$Manchester$population[["persons"]] <- list(
  source = "manchester/synpop/sp_2021/pp_health_2021.csv",
  description = "A generated representation of Greater Manchester's population characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    personid = "person id", # renamed from id
    hhid = "household id",
    age = "in years",
    gender = "male (1), female (2)",
    relationship = "role within the household",
    occupation = "toddler (0), student (3), employed (1), unemployed (2), retiree (4)",
    driversLicense = "true or false",
    workplace = "job id (0 if person is not employed)",
    income = "in £",
    disability = "Disability status (?)",
    schoolId = "N/A (unless we present flow models)",
    totalTravelTime_sec = "Travel time to…",
    totalActivityTime_min = "Moderate/vigorous physical activity (?; mins)",
    totalTimeAtHome_min = "Time spend at home (mins)",
    lightInjuryRisk = "?",
    severeInjuryRisk = "?",
    fatalityRisk = "?",
    mmetHr_walk = "marginal metabolic equivalent task hours per week (mMET-h/wk) 1 ",
    mmetHr_cycle = "mMET (h/wk)",
    exposure_pm25 = "Exclude ?",
    exposure_no2 = "Exclude ?",
    exposure_normalised_pm25 = "PM2.5 exposure (µg/m3?) 2",
    exposure_normalised_no2 = "NO2 exposure (µg/m3?) 3",
    rr_walk = "Relative risk of injury when taking a walking trip?",
    rr_cycle = "Relative risk of injury when taking a cycling trip?",
    rr_pm25 = "Relative risk of injury per cubic metre exposure to …",
    rr_no2 = "Relative risk of injury per cubic metre exposure to …",
    rr_all = "?"
  ),
  rename = list(
    'id'= 'personId'
  )
)
```

#### Households

Dwelling ID (dwelling) and Household ID (id; omitted) appear identical
(assert id==dwelling)

``` r
data$Manchester$population[["households"]] <- list(
  source = "manchester/synpop/sp_2021/hh_2021.csv",
  description = "A generated representation of Greater Manchester household characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    hhid = "Household id",
    zone = "Output Area",
    hhSize = "Number of persons in household",
    autos = "Number of cars in household (0, 1, 2, >3)"
  ),
  rename = list(
    'id'= 'hhid',
    'zone' = 'zone_hh'
  )
)
```

#### Dwellings

As per investigation further below, dwelling ID are household ID are
identical in households dataset, but not in this data (assert id==hhID).
To link with households, hhID must be used. Will omit dwelling
coordinates from merged data.

``` r
data$Manchester$population[["dwellings"]] <- list(
  source = "manchester/synpop/sp_2021/dd_2021.csv",
  description = "A generated representation of Manchester's population characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    hhid = "household id", #renamed for consistency
    zone = "Output Area",
    dw_type = "Dwelling type ((SFD: single-family detached, SFA: single-family attached, MF234: building with 2 to 4 units, MF5plus: building with 5 or more units)",
    bedrooms = "Number of bedrooms",
    quality = "Dwelling quality (1 to 4, being 1 top quality)",
    monthlyCost = "Rent (£/month)",
    yearBuilt = "Construction year",
    floor = "Floor area (m²)"
  ),
  rename = list(
    'zone' = 'zone_dw',
    'id' = 'dwid',
    'type' = 'dw_type'
  )
)
```

#### Jobs

``` r
data$Manchester$population[["jobs"]] <- list(
  source = "manchester/synpop/sp_2021/jj_2021.csv",
  description = "A generated representation of Greater Manchester's employment characteristics, risks and outcomes (synthetic population).",
  citation = "?",
  variables = list(
    jobid = "job id",
    zone = "Output Area",
    personId = "person id",  # renamed for consistency
    job_type = "job type by industry"
  ),
  rename = list(
    'id' = 'jobid',
    'zone' = 'zone_jj',
    'type' = 'job_type'
  )
)
```

## Processing

### Manchester population

``` r
synpop <- list()
for (key in names(data$Manchester$population)) {
  synpop[[key]] <- read_csv(paste0("../../../",data$Manchester$population[[key]]$source))
}
```

#### Check population data

Household and dwelling ID are identical in the households dataset
(confirmed below). This is because only allow one household lives in the
dwelling (discussed with Dr Qin Zhang, who prepared this data, on 16
October 2024).

``` r
stopifnot(identical(synpop$households$id, synpop$households$dwelling))
```

However, in the dwellings dataset the dwelling and household IDs differ
(confirmed below; commented out) due to presence of vacant dwellings,
where household ID has been coded as -1.

``` r
# stopifnot(identical(synpop$dwellings$id, synpop$dwellings$hhID))
```

Its not true for the dwellings data that dwelling id and household id
variables are identical… which makes things a bit awkward, as it implies
that linkage of one or the other may have an error.

Here is demonstration that household id and dwelling id are identical
for households data:

``` r
synpop$households[c("id","dwelling")] %>% summary()
##        id             dwelling      
##  Min.   :      1   Min.   :      1  
##  1st Qu.: 294548   1st Qu.: 294548  
##  Median : 589095   Median : 589095  
##  Mean   : 589095   Mean   : 589095  
##  3rd Qu.: 883642   3rd Qu.: 883642  
##  Max.   :1178189   Max.   :1178189
```

Here is demonstration of how they differ within the dwellings data:

``` r
synpop$dwellings[c("id","hhID")] %>% summary()
##        id               hhID        
##  Min.   :      1   Min.   :     -1  
##  1st Qu.: 304834   1st Qu.: 263688  
##  Median : 609668   Median : 568522  
##  Mean   : 609668   Mean   : 569216  
##  3rd Qu.: 914502   3rd Qu.: 873356  
##  Max.   :1219335   Max.   :1178189
```

I confirmed with Dr Qin Zhang that matching on householed ID is the
appropriate approach.

Renaming some variables to avoid ambiguity and for consistency to
simplify linkage:

``` r
for (key in names(data$Manchester$population)) {
  if ('rename' %in% names(data$Manchester$population[[key]])) {
      cat(key)
      rename_list <- setNames(
        names(data$Manchester$population[[key]]$rename),
        data$Manchester$population[[key]]$rename
      )
      # Rename the columns in synpop[[key]]
      synpop[[key]] <- synpop[[key]] %>% rename(!!!rename_list)
  }
}
```

We should now be ready to join datasets

#### Join population data

``` r
synpop[["merged"]] <- synpop$persons %>%
   left_join(synpop$jobs, by = "personId") %>%
   left_join(synpop$households, by = "hhid") %>%
   left_join(synpop$dwellings, by = c("hhid" = "hhID"))
```

Display a summary of the merged data

``` r
synpop$merged %>% summary(na.rm=False)
##     personId            hhid              age            gender     
##  Min.   :      1   Min.   :      1   Min.   : 0.00   Min.   :1.000  
##  1st Qu.: 706816   1st Qu.: 286526   1st Qu.:19.00   1st Qu.:1.000  
##  Median :1413632   Median : 566631   Median :37.00   Median :2.000  
##  Mean   :1413632   Mean   : 576797   Mean   :38.38   Mean   :1.508  
##  3rd Qu.:2120447   3rd Qu.: 870327   3rd Qu.:56.00   3rd Qu.:2.000  
##  Max.   :2827262   Max.   :1178189   Max.   :95.00   Max.   :2.000  
##                                                                     
##  relationShip         occupation    driversLicense    workplace      
##  Length:2827262     Min.   :0.000   Mode :logical   Min.   :     -1  
##  Class :character   1st Qu.:1.000   FALSE:904329    1st Qu.:     -1  
##  Mode  :character   Median :1.000   TRUE :1922933   Median :     -1  
##                     Mean   :1.894                   Mean   : 296450  
##                     3rd Qu.:3.000                   3rd Qu.: 575286  
##                     Max.   :4.000                   Max.   :1357541  
##                                                                      
##      income         disability    schoolId  totalTravelTime_sec
##  Min.   :     0   Min.   :0    Min.   :-1   Min.   :     0     
##  1st Qu.:  5352   1st Qu.:0    1st Qu.:-1   1st Qu.:  5387     
##  Median : 12468   Median :0    Median :-1   Median :  9943     
##  Mean   : 17927   Mean   :0    Mean   :-1   Mean   : 11583     
##  3rd Qu.: 24744   3rd Qu.:0    3rd Qu.:-1   3rd Qu.: 15856     
##  Max.   :270744   Max.   :0    Max.   :-1   Max.   :221354     
##                                                                
##  totalActivityTime_min totalTimeAtHome_min lightInjuryRisk severeInjuryRisk
##  Min.   : -206.3       Min.   :    0       Min.   :0       Min.   :0       
##  1st Qu.:  318.2       1st Qu.: 7849       1st Qu.:0       1st Qu.:0       
##  Median : 1230.1       Median : 8639       Median :0       Median :0       
##  Mean   : 1326.2       Mean   : 8561       Mean   :0       Mean   :0       
##  3rd Qu.: 1983.1       3rd Qu.: 9619       3rd Qu.:0       3rd Qu.:0       
##  Max.   :13670.0       Max.   :10080       Max.   :0       Max.   :0       
##                                                                            
##   fatalityRisk  mmetHr_walk        mmetHr_cycle      exposure_pm25   
##  Min.   :0     Min.   :  0.0000   Min.   :  0.0000   Min.   : 741.5  
##  1st Qu.:0     1st Qu.:  0.6794   1st Qu.:  0.0000   1st Qu.: 785.2  
##  Median :0     Median :  2.4934   Median :  0.0000   Median : 815.2  
##  Mean   :0     Mean   :  3.4450   Mean   :  0.5732   Mean   : 827.1  
##  3rd Qu.:0     3rd Qu.:  5.0596   3rd Qu.:  0.0000   3rd Qu.: 855.1  
##  Max.   :0     Max.   :105.8128   Max.   :113.6398   Max.   :2328.4  
##                                                                      
##   exposure_no2  exposure_normalised_pm25 exposure_normalised_no2
##  Min.   :1454   Min.   : 8.887           Min.   :17.42          
##  1st Qu.:1645   1st Qu.: 9.410           1st Qu.:19.71          
##  Median :1786   Median : 9.770           Median :21.41          
##  Mean   :1833   Mean   : 9.913           Mean   :21.97          
##  3rd Qu.:1967   3rd Qu.:10.248           3rd Qu.:23.58          
##  Max.   :7980   Max.   :27.905           Max.   :95.63          
##                                                                 
##     rr_walk          rr_cycle         rr_pm25          rr_no2     
##  Min.   :0.7000   Min.   :0.5500   Min.   :1.071   Min.   :1.035  
##  1st Qu.:0.9409   1st Qu.:1.0000   1st Qu.:1.075   1st Qu.:1.040  
##  Median :0.9704   Median :1.0000   Median :1.078   Median :1.043  
##  Mean   :0.9603   Mean   :0.9934   Mean   :1.079   Mean   :1.044  
##  3rd Qu.:0.9919   3rd Qu.:1.0000   3rd Qu.:1.082   3rd Qu.:1.048  
##  Max.   :1.0000   Max.   :1.0000   Max.   :1.240   Max.   :1.209  
##                                                                   
##      rr_all          jobid            zone_jj          job_type        
##  Min.   :0.570   Min.   :      1   Min.   :   1      Length:2827262    
##  1st Qu.:1.055   1st Qu.: 335764   1st Qu.:2530      Class :character  
##  Median :1.086   Median : 674566   Median :4269      Mode  :character  
##  Mean   :1.075   Mean   : 676358   Mean   :4467                        
##  3rd Qu.:1.108   3rd Qu.:1019687   3rd Qu.:6862                        
##  Max.   :1.209   Max.   :1357541   Max.   :8966                        
##                  NA's   :1588062   NA's   :1588062                     
##     dwelling           hhSize          zone_hh         autos      
##  Min.   :      1   Min.   : 1.000   Min.   :   1   Min.   :0.000  
##  1st Qu.: 286526   1st Qu.: 2.000   1st Qu.:2246   1st Qu.:1.000  
##  Median : 566631   Median : 3.000   Median :4500   Median :1.000  
##  Mean   : 576797   Mean   : 3.258   Mean   :4491   Mean   :1.288  
##  3rd Qu.: 870327   3rd Qu.: 4.000   3rd Qu.:6740   3rd Qu.:2.000  
##  Max.   :1178189   Max.   :12.000   Max.   :8966   Max.   :3.000  
##                                                                   
##       dwid            zone_dw       dw_type             bedrooms     
##  Min.   :      1   Min.   :   1   Length:2827262     Min.   : 1.000  
##  1st Qu.: 286526   1st Qu.:2246   Class :character   1st Qu.: 3.000  
##  Median : 566631   Median :4500   Mode  :character   Median : 3.000  
##  Mean   : 576797   Mean   :4491                      Mean   : 3.097  
##  3rd Qu.: 870327   3rd Qu.:6740                      3rd Qu.: 3.000  
##  Max.   :1178189   Max.   :8966                      Max.   :13.000  
##                                                                      
##     quality       monthlyCost      yearBuilt     floor  
##  Min.   :1.000   Min.   :  311   Min.   :0   Min.   :0  
##  1st Qu.:2.000   1st Qu.:  868   1st Qu.:0   1st Qu.:0  
##  Median :3.000   Median : 1030   Median :0   Median :0  
##  Mean   :2.926   Mean   : 1114   Mean   :0   Mean   :0  
##  3rd Qu.:3.000   3rd Qu.: 1226   3rd Qu.:0   3rd Qu.:0  
##  Max.   :4.000   Max.   :26234   Max.   :0   Max.   :0  
## 
```

Confirm that the zone variable from households and dwellings are
identical, as an extra check that this merge has worked as intended

``` r
stopifnot(identical(synpop$merged$zone_hh,synpop$merged$zone_dw))
```

In the above data, I have renamed variables to ensure they are unique
(e.g. ‘type’ for dwellings and jobs, respectively renamed to ‘type_dw’
and ‘type_jobs’. In this way, all the variables listed in the data
dictionaries above reflect the variables post-renaming that may be
exported in the joined dataset.

#### How to use the population data?

I am thinking, because there are so many records (approximately 3
million) it will be inefficient to attach to store all these variables
with geometries for querying. Better might be, have the LSOA geometries
with zone id that can then be used to retrieve and query the relevant
subset of persons on click and display summary statistics. Could maybe
use parquet on S3, queried with Amazon Athena… apparently that’s quite
cheap and fast for this kind of task.

But… these persons etc are not linked to LSOAs, they are linked to
Output Areas. So — in fact, what we want to do is get the relevant other
area linkage variables all attached to people…

Retrieved OA look up tables for LSOA, MSOA and LAD (regions). Need to

- Link up the merged data with the MCR output area data using the
  derived ‘zone’ id and get the 2021 OA and LSOA codes.  
- Join with the look up table to get MSOA and LAD codes.  
- Then retrieve 2021 LSOA, MSOA and LAD geometries,
  - restrict them to linkage codes present in the data
  - export as geojson or if possible, FlatGeoBuf files for use with
    [Tippecanoe](https://github.com/felt/tippecanoe)
  - create pmtiles using Tippecanoe, and upload to S3 bucket

Should consider whether its worth pre-processing summaries in the area
data, or better to just retrieve on demand… But first things first.

#### Link up merged data with OA and LSOA codes for further linkage

``` r
oa_geoms <- st_read(paste0("../../../",data$Manchester$areas$OA$source))
## Reading layer `OA_2021_MCR' from data source 
##   `/Users/E33390/Library/CloudStorage/OneDrive-RMITUniversity/General - JIBE working group/manchester/synPop/sp_2021/OA_2021_MCR.shp' 
##   using driver `ESRI Shapefile'
## Simple feature collection with 8966 features and 10 fields
## Geometry type: MULTIPOLYGON
## Dimension:     XY
## Bounding box:  xmin: 351662.3 ymin: 381166 xmax: 406087.2 ymax: 421037.7
## Projected CRS: OSGB36 / British National Grid

# Select the relevant attributes, omitting the geometries
shp_attributes <- oa_geoms %>%
  st_set_geometry(NULL) %>%
  select(id, OA21CD, LSOA21CD)  # Replace with actual attribute names

# Perform a left join to merge the attributes with your existing data frame
# And rename variables ending in .x as home, and .y as job
# "OA21CD.x"                 "LSOA21CD.x"            
# "OA21CD.y"                 "LSOA21CD.y"        
synpop$merged <- (synpop$merged %>%
  left_join(shp_attributes, by = c("zone_hh" = "id")) %>%
  left_join(shp_attributes, by = c("zone_jj" = "id")))%>%
  rename("OA21CD.home" = "OA21CD.x") %>%
  rename("LSOA21CD.home" = "LSOA21CD.x") %>%
  rename("OA21CD.job" = "OA21CD.y") %>%
  rename("LSOA21CD.job" = "LSOA21CD.y")
synpop$merged %>% names()
##  [1] "personId"                 "hhid"                    
##  [3] "age"                      "gender"                  
##  [5] "relationShip"             "occupation"              
##  [7] "driversLicense"           "workplace"               
##  [9] "income"                   "disability"              
## [11] "schoolId"                 "totalTravelTime_sec"     
## [13] "totalActivityTime_min"    "totalTimeAtHome_min"     
## [15] "lightInjuryRisk"          "severeInjuryRisk"        
## [17] "fatalityRisk"             "mmetHr_walk"             
## [19] "mmetHr_cycle"             "exposure_pm25"           
## [21] "exposure_no2"             "exposure_normalised_pm25"
## [23] "exposure_normalised_no2"  "rr_walk"                 
## [25] "rr_cycle"                 "rr_pm25"                 
## [27] "rr_no2"                   "rr_all"                  
## [29] "jobid"                    "zone_jj"                 
## [31] "job_type"                 "dwelling"                
## [33] "hhSize"                   "zone_hh"                 
## [35] "autos"                    "dwid"                    
## [37] "zone_dw"                  "dw_type"                 
## [39] "bedrooms"                 "quality"                 
## [41] "monthlyCost"              "yearBuilt"               
## [43] "floor"                    "OA21CD.home"             
## [45] "LSOA21CD.home"            "OA21CD.job"              
## [47] "LSOA21CD.job"
```

### Manchester areas

#### Which boundaries to use?

When retrieving boundaries from the UK Office of National Statistics,
these are offered at a range of resolutions:

> - Full Extent (BFE) – Full resolution boundaries go to the Extent of
>   the Realm (Low Water Mark) and are the most detailed of the
>   boundaries.
> - Full Clipped (BFC) – Full resolution boundaries that are clipped to
>   the coastline (Mean High Water mark).
> - Generalised Clipped (BGC) - Generalised to 20m and clipped to the
>   coastline (Mean High Water mark) and more generalised than the BFE
>   boundaries.
> - Super Generalised Clipped (BSC) (200m) – Generalised to 200m and
>   clipped to the coastline (Mean High Water mark).
> - Ultra Generalised Clipped (BUC) (500m) – Generalised to 500m and
>   clipped to the coastline (Mean High Water mark).
> - Grid, Extent (BGE) - Grid formed of equally sized cells which extend
>   beyond the coastline.
> - Generalised, Grid (BGG) - Generalised 50m grid squares.

(copied from https://geoportal.statistics.gov.uk/)

We do not require full resolution boundaries; generalised clipped
boundaries (to 20m; BGC) will be sufficient for purposes of providing
contextual information for Manchester regions.

While we could retrieve and use the OA boundaries, and we will retain
the OA code in case we want to later, for now we will just get LSOA,
MSOA and LAD (local area districts). Even then, maybe for now, I will
just use MSOA and LAD for proof of concept. Then we can trial
representing them with minimal data as a boundary overlay of JIBE
attributes; when an area is clicked on, population data will be queried
and an interactive graphical distirbution summary for that area
provided. Perhaps, as a reference, we could produce one set of summary
statistics for Manchester as a whole, so the selected area can be
compared against the region (eg min, 25th, 50th, 75th percentiles and
max, as well as mean and standard deviation).

#### Read in OA look up tables for MSOA and LAD codes

``` r
oa_lookup <- read_csv(paste0('../../../',data$Manchester$areas$OA_linkage$source))
oa_lookup_selected <- oa_lookup %>%
  select(OA21CD, MSOA21CD, LAD22CD)

synpop$merged <- synpop$merged %>%
  left_join(oa_lookup_selected, by = c("OA21CD.home"="OA21CD")) %>%
  left_join(oa_lookup_selected, by = c("OA21CD.job"="OA21CD")) %>%
  rename("MSOA21CD.home" = "MSOA21CD.x") %>%
  rename("LAD22CD.home" = "LAD22CD.x") %>%
  rename("MSOA21CD.job" = "MSOA21CD.y") %>%
  rename("LAD22CD.job" = "LAD22CD.y")
synpop$merged %>% names()
##  [1] "personId"                 "hhid"                    
##  [3] "age"                      "gender"                  
##  [5] "relationShip"             "occupation"              
##  [7] "driversLicense"           "workplace"               
##  [9] "income"                   "disability"              
## [11] "schoolId"                 "totalTravelTime_sec"     
## [13] "totalActivityTime_min"    "totalTimeAtHome_min"     
## [15] "lightInjuryRisk"          "severeInjuryRisk"        
## [17] "fatalityRisk"             "mmetHr_walk"             
## [19] "mmetHr_cycle"             "exposure_pm25"           
## [21] "exposure_no2"             "exposure_normalised_pm25"
## [23] "exposure_normalised_no2"  "rr_walk"                 
## [25] "rr_cycle"                 "rr_pm25"                 
## [27] "rr_no2"                   "rr_all"                  
## [29] "jobid"                    "zone_jj"                 
## [31] "job_type"                 "dwelling"                
## [33] "hhSize"                   "zone_hh"                 
## [35] "autos"                    "dwid"                    
## [37] "zone_dw"                  "dw_type"                 
## [39] "bedrooms"                 "quality"                 
## [41] "monthlyCost"              "yearBuilt"               
## [43] "floor"                    "OA21CD.home"             
## [45] "LSOA21CD.home"            "OA21CD.job"              
## [47] "LSOA21CD.job"             "MSOA21CD.home"           
## [49] "LAD22CD.home"             "MSOA21CD.job"            
## [51] "LAD22CD.job"
```

#### Write population with linkage codes to Parquet

``` r
parquet_output_path <- "../../../visualisation/derived_data/parquet/synpop_manchester_2021.parquet"
output_dir <- dirname(parquet_output_path)
if (!dir.exists(output_dir)) {
  dir.create(output_dir, recursive = TRUE)
}
write_parquet(synpop$merged, parquet_output_path)
cat("Merged synthetic population data written to Parquet file at", parquet_output_path, "\n")
## Merged synthetic population data written to Parquet file at ../../../visualisation/derived_data/parquet/synpop_manchester_2021.parquet
```

#### Convert Manchester areas to FlatGeobuf data

``` r
area <- data$Manchester$areas$GreaterManchester

# Check if the output is specified and ends with .fgb
if (!is.null(area$output) && grepl("\\.fgb$", area$output)) {
  # Define the geopackage path and output path
  in_path <- paste0('../../../', area$source)
  out_path <- paste0('../../../', area$output)
  if ('layer' %in% names(area)) {
    layer <- area$layer
  } else {
    layer <- NULL
  }
  if ('filter' %in% names(area)) {
    filter <- area$filter
  } else {
    filter <- NULL
  }
  
  # Apply the spatial_data_to_fgb function
  data$Manchester$areas$GreaterManchester[['data']] <- spatial_data_to_fgb(in_path, out_path, layer, filter)
}
## Reading layer `boundary_line_ceremonial_counties' from data source 
##   `/Users/E33390/Library/CloudStorage/OneDrive-RMITUniversity/General - JIBE working group/visualisation/external_data/Ordnance Survey/bdline_gpkg_gb/Data/bdline_gb.gpkg' 
##   using driver `GPKG'
## Simple feature collection with 91 features and 2 fields
## Geometry type: MULTIPOLYGON
## Dimension:     XY
## Bounding box:  xmin: 5512.999 ymin: 5333.602 xmax: 655989 ymax: 1220302
## Projected CRS: OSGB36 / British National Grid
## Writing layer `GreaterManchester_OrdnanceSurvey_2024' to data source 
##   `../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_OrdnanceSurvey_2024.fgb' using driver `FlatGeobuf'
## Writing 1 features with 2 fields and geometry type Multi Polygon.
## Feature data exported to ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_OrdnanceSurvey_2024.fgb
```

The LSOA data is actually really quite detailed with many features; we
may not even depict this except perhaps for home/work trajectory
representation. It will be better restricting LSOA, MSOA and LAD to
those referenced in the synpop\$merged dataset, so we’ll run that output
again manually restricting only to those areas having recorded home or
job locations.

``` r
# Define the area types to loop over
area_types <- c('LSOA', 'MSOA','LAD')
area_id_lookup <- list(
  LSOA = 'LSOA21CD',
  MSOA = 'MSOA21CD',
  LAD = 'LAD22CD'
)
# Loop over each area type
for (area_type in area_types) {
  area_id <- area_id_lookup[area_type]
  # Create a unique list of values for homes and jobs based on the area type
  filter_values <- unique(c(synpop$merged[[paste0(area_id,'.home')]], synpop$merged[[paste0(area_id,'.job')]]))
  
  # Format these values as a character vector within the filter string
  filter_string <- paste0(
    area_id,
    " %in% c('", 
    paste(filter_values, collapse = "','"),
    "')"
  )
  print(filter_string)
 
  # Apply the spatial_data_to_fgb function with the correct filter string
  spatial_data_to_fgb(
    paste0('../../../', data$Manchester$areas[[area_type]]$source),
    paste0('../../../', data$Manchester$areas[[area_type]]$output),
    filter_condition = filter_string
  )
}
## [1] "LSOA21CD %in% c('E01004766','E01004767','E01004768','E01004769','E01004770','E01004771','E01004772','E01004773','E01004774','E01004775','E01004776','E01004777','E01004778','E01004779','E01004780','E01004781','E01004782','E01004783','E01004784','E01004785','E01004786','E01004787','E01004788','E01004789','E01004790','E01004791','E01004792','E01004793','E01004794','E01004795','E01004796','E01004797','E01004798','E01004799','E01004800','E01004801','E01004802','E01004803','E01004804','E01004805','E01004806','E01004807','E01004808','E01004809','E01004810','E01004811','E01004812','E01004813','E01004814','E01004815','E01004816','E01004817','E01004818','E01004819','E01004820','E01004822','E01004823','E01004824','E01004825','E01004826','E01004827','E01004828','E01004829','E01004830','E01004831','E01004832','E01004833','E01004834','E01004835','E01004836','E01004837','E01004838','E01004839','E01004840','E01004841','E01004842','E01004843','E01004844','E01004845','E01004846','E01004847','E01004848','E01004849','E01004850','E01004851','E01004852','E01004853','E01004854','E01004855','E01004856','E01004857','E01004858','E01004859','E01004860','E01004861','E01004862','E01004863','E01004864','E01004865','E01004866','E01004867','E01004868','E01004869','E01004870','E01004871','E01004872','E01004873','E01004874','E01004875','E01004876','E01004877','E01004878','E01004879','E01004880','E01004881','E01004882','E01004883','E01004884','E01004885','E01004886','E01004887','E01004888','E01004889','E01004890','E01004891','E01004892','E01004893','E01004894','E01004895','E01004896','E01004897','E01004899','E01004900','E01004901','E01004902','E01004903','E01004904','E01004905','E01004906','E01004907','E01004908','E01004909','E01004910','E01004911','E01004912','E01004913','E01004914','E01004915','E01004916','E01004917','E01004918','E01004919','E01004920','E01004921','E01004922','E01004923','E01004924','E01004925','E01004926','E01004927','E01004928','E01004929','E01004930','E01004931','E01004932','E01004933','E01004934','E01004935','E01004936','E01004937','E01004938','E01004939','E01004940','E01004941','E01004942','E01004943','E01004944','E01004945','E01004946','E01004947','E01004948','E01004949','E01004950','E01004951','E01004952','E01004953','E01004954','E01004955','E01004956','E01004957','E01004958','E01004959','E01004960','E01004961','E01004962','E01004963','E01004964','E01004965','E01004966','E01004967','E01004968','E01004969','E01004970','E01004971','E01004972','E01004973','E01004974','E01004975','E01004976','E01004977','E01004978','E01004979','E01004980','E01004981','E01004982','E01004983','E01004984','E01004985','E01004986','E01004987','E01004988','E01004989','E01004990','E01004991','E01004992','E01004993','E01004994','E01004995','E01004996','E01004997','E01004998','E01004999','E01005000','E01005001','E01005002','E01005003','E01005004','E01005005','E01005006','E01005007','E01005008','E01005009','E01005010','E01005011','E01005012','E01005013','E01005014','E01005015','E01005016','E01005017','E01005018','E01005019','E01005020','E01005021','E01005022','E01005023','E01005024','E01005025','E01005026','E01005027','E01005028','E01005029','E01005030','E01005031','E01005032','E01005033','E01005034','E01005035','E01005036','E01005037','E01005038','E01005039','E01005040','E01005041','E01005042','E01005043','E01005044','E01005045','E01005046','E01005047','E01005048','E01005049','E01005050','E01005051','E01005052','E01005053','E01005054','E01005055','E01005056','E01005057','E01005058','E01005059','E01005060','E01005061','E01005063','E01005065','E01005066','E01005067','E01005068','E01005069','E01005070','E01005071','E01005072','E01005073','E01005074','E01005075','E01005076','E01005077','E01005078','E01005079','E01005081','E01005082','E01005083','E01005084','E01005085','E01005086','E01005087','E01005088','E01005089','E01005090','E01005091','E01005092','E01005093','E01005094','E01005097','E01005098','E01005099','E01005100','E01005101','E01005102','E01005103','E01005104','E01005105','E01005106','E01005107','E01005111','E01005112','E01005113','E01005114','E01005115','E01005116','E01005117','E01005118','E01005119','E01005120','E01005121','E01005122','E01005123','E01005124','E01005125','E01005126','E01005128','E01005129','E01005130','E01005132','E01005135','E01005136','E01005138','E01005139','E01005141','E01005142','E01005143','E01005145','E01005147','E01005149','E01005150','E01005151','E01005152','E01005153','E01005154','E01005155','E01005156','E01005157','E01005158','E01005159','E01005160','E01005161','E01005162','E01005163','E01005164','E01005165','E01005166','E01005167','E01005168','E01005169','E01005170','E01005171','E01005172','E01005173','E01005174','E01005175','E01005176','E01005177','E01005178','E01005179','E01005180','E01005181','E01005182','E01005183','E01005184','E01005185','E01005186','E01005187','E01005188','E01005189','E01005190','E01005191','E01005192','E01005193','E01005195','E01005197','E01005198','E01005199','E01005200','E01005201','E01005202','E01005203','E01005205','E01005206','E01005207','E01005208','E01005210','E01005212','E01005213','E01005214','E01005215','E01005216','E01005217','E01005218','E01005219','E01005220','E01005221','E01005222','E01005223','E01005224','E01005225','E01005226','E01005227','E01005228','E01005229','E01005230','E01005231','E01005232','E01005233','E01005234','E01005235','E01005236','E01005237','E01005238','E01005239','E01005243','E01005244','E01005245','E01005246','E01005247','E01005248','E01005249','E01005250','E01005251','E01005252','E01005253','E01005254','E01005255','E01005256','E01005257','E01005258','E01005259','E01005260','E01005261','E01005262','E01005263','E01005264','E01005265','E01005266','E01005267','E01005268','E01005269','E01005270','E01005271','E01005272','E01005273','E01005274','E01005275','E01005276','E01005277','E01005278','E01005279','E01005280','E01005281','E01005284','E01005285','E01005286','E01005287','E01005288','E01005289','E01005290','E01005291','E01005292','E01005293','E01005294','E01005295','E01005296','E01005297','E01005298','E01005299','E01005300','E01005301','E01005302','E01005304','E01005305','E01005306','E01005307','E01005308','E01005309','E01005310','E01005311','E01005312','E01005313','E01005314','E01005315','E01005316','E01005317','E01005318','E01005319','E01005320','E01005321','E01005322','E01005323','E01005324','E01005325','E01005326','E01005327','E01005328','E01005329','E01005330','E01005331','E01005332','E01005333','E01005334','E01005335','E01005336','E01005337','E01005338','E01005339','E01005340','E01005341','E01005342','E01005343','E01005344','E01005345','E01005346','E01005347','E01005348','E01005349','E01005350','E01005351','E01005352','E01005353','E01005354','E01005355','E01005356','E01005357','E01005358','E01005359','E01005360','E01005361','E01005362','E01005363','E01005364','E01005365','E01005366','E01005367','E01005368','E01005369','E01005370','E01005371','E01005372','E01005373','E01005374','E01005375','E01005376','E01005377','E01005378','E01005379','E01005380','E01005381','E01005382','E01005383','E01005386','E01005387','E01005388','E01005389','E01005390','E01005391','E01005392','E01005393','E01005394','E01005395','E01005396','E01005397','E01005398','E01005399','E01005400','E01005401','E01005402','E01005403','E01005406','E01005407','E01005408','E01005409','E01005410','E01005411','E01005412','E01005413','E01005414','E01005415','E01005416','E01005417','E01005418','E01005419','E01005420','E01005421','E01005422','E01005427','E01005428','E01005429','E01005430','E01005431','E01005432','E01005433','E01005434','E01005435','E01005436','E01005437','E01005438','E01005439','E01005440','E01005441','E01005442','E01005443','E01005444','E01005445','E01005446','E01005447','E01005448','E01005449','E01005450','E01005451','E01005452','E01005453','E01005454','E01005455','E01005456','E01005459','E01005460','E01005461','E01005462','E01005463','E01005464','E01005465','E01005466','E01005467','E01005468','E01005469','E01005470','E01005471','E01005472','E01005473','E01005474','E01005475','E01005476','E01005477','E01005478','E01005479','E01005480','E01005481','E01005482','E01005483','E01005484','E01005485','E01005486','E01005487','E01005488','E01005489','E01005490','E01005491','E01005492','E01005493','E01005494','E01005495','E01005496','E01005497','E01005498','E01005499','E01005500','E01005501','E01005502','E01005503','E01005504','E01005505','E01005506','E01005507','E01005508','E01005509','E01005510','E01005511','E01005512','E01005513','E01005514','E01005515','E01005516','E01005517','E01005518','E01005519','E01005520','E01005521','E01005522','E01005523','E01005524','E01005525','E01005526','E01005527','E01005528','E01005529','E01005530','E01005531','E01005532','E01005533','E01005534','E01005535','E01005536','E01005537','E01005538','E01005539','E01005540','E01005541','E01005542','E01005543','E01005544','E01005545','E01005546','E01005547','E01005548','E01005549','E01005550','E01005551','E01005552','E01005553','E01005554','E01005555','E01005556','E01005557','E01005558','E01005559','E01005560','E01005561','E01005562','E01005563','E01005564','E01005565','E01005566','E01005567','E01005568','E01005569','E01005570','E01005571','E01005572','E01005573','E01005574','E01005575','E01005576','E01005577','E01005578','E01005579','E01005580','E01005581','E01005583','E01005585','E01005586','E01005587','E01005588','E01005589','E01005590','E01005591','E01005592','E01005593','E01005594','E01005595','E01005596','E01005597','E01005598','E01005599','E01005600','E01005601','E01005602','E01005603','E01005604','E01005605','E01005610','E01005611','E01005612','E01005613','E01005614','E01005615','E01005616','E01005617','E01005618','E01005619','E01005620','E01005621','E01005622','E01005623','E01005624','E01005625','E01005626','E01005627','E01005628','E01005629','E01005630','E01005631','E01005632','E01005633','E01005634','E01005635','E01005636','E01005637','E01005638','E01005639','E01005640','E01005641','E01005642','E01005643','E01005644','E01005645','E01005646','E01005647','E01005648','E01005649','E01005650','E01005651','E01005652','E01005653','E01005654','E01005656','E01005657','E01005659','E01005660','E01005661','E01005662','E01005663','E01005664','E01005665','E01005667','E01005670','E01005671','E01005672','E01005673','E01005674','E01005676','E01005677','E01005678','E01005679','E01005680','E01005681','E01005682','E01005683','E01005686','E01005687','E01005688','E01005689','E01005690','E01005691','E01005692','E01005693','E01005694','E01005695','E01005696','E01005697','E01005698','E01005699','E01005700','E01005701','E01005702','E01005703','E01005704','E01005706','E01005707','E01005708','E01005709','E01005710','E01005711','E01005712','E01005713','E01005714','E01005715','E01005716','E01005717','E01005718','E01005719','E01005721','E01005722','E01005723','E01005724','E01005725','E01005726','E01005727','E01005728','E01005729','E01005730','E01005731','E01005732','E01005733','E01005734','E01005735','E01005736','E01005737','E01005738','E01005739','E01005740','E01005741','E01005742','E01005743','E01005744','E01005745','E01005746','E01005747','E01005748','E01005749','E01005750','E01005751','E01005752','E01005753','E01005754','E01005755','E01005756','E01005757','E01005759','E01005760','E01005761','E01005762','E01005763','E01005764','E01005765','E01005766','E01005767','E01005768','E01005769','E01005770','E01005771','E01005772','E01005773','E01005774','E01005775','E01005776','E01005777','E01005778','E01005779','E01005780','E01005781','E01005782','E01005783','E01005784','E01005785','E01005786','E01005787','E01005788','E01005789','E01005790','E01005791','E01005792','E01005793','E01005794','E01005795','E01005796','E01005797','E01005798','E01005799','E01005800','E01005801','E01005802','E01005803','E01005804','E01005805','E01005806','E01005807','E01005808','E01005809','E01005810','E01005811','E01005812','E01005813','E01005814','E01005815','E01005816','E01005817','E01005818','E01005819','E01005820','E01005821','E01005822','E01005823','E01005824','E01005825','E01005826','E01005827','E01005828','E01005829','E01005830','E01005831','E01005832','E01005833','E01005834','E01005835','E01005836','E01005837','E01005838','E01005839','E01005840','E01005841','E01005842','E01005843','E01005844','E01005845','E01005846','E01005847','E01005848','E01005849','E01005850','E01005851','E01005852','E01005853','E01005854','E01005855','E01005856','E01005857','E01005858','E01005859','E01005860','E01005861','E01005862','E01005863','E01005864','E01005865','E01005866','E01005867','E01005868','E01005869','E01005870','E01005871','E01005872','E01005873','E01005874','E01005875','E01005876','E01005877','E01005878','E01005879','E01005880','E01005881','E01005882','E01005883','E01005884','E01005885','E01005886','E01005887','E01005888','E01005889','E01005890','E01005891','E01005892','E01005893','E01005894','E01005895','E01005896','E01005897','E01005898','E01005899','E01005900','E01005901','E01005902','E01005903','E01005904','E01005905','E01005906','E01005907','E01005908','E01005909','E01005910','E01005911','E01005912','E01005913','E01005914','E01005915','E01005916','E01005917','E01005918','E01005919','E01005920','E01005921','E01005922','E01005923','E01005924','E01005925','E01005926','E01005927','E01005928','E01005929','E01005930','E01005931','E01005932','E01005933','E01005934','E01005935','E01005936','E01005937','E01005938','E01005939','E01005940','E01005941','E01005942','E01005943','E01005944','E01005945','E01005946','E01005947','E01005948','E01005949','E01005950','E01005951','E01005953','E01005954','E01005955','E01005956','E01005957','E01005958','E01005959','E01005960','E01005961','E01005962','E01005963','E01005964','E01005965','E01005966','E01005967','E01005968','E01005969','E01005970','E01005971','E01005972','E01005973','E01005974','E01005975','E01005976','E01005977','E01005978','E01005979','E01005980','E01005981','E01005982','E01005983','E01005984','E01005985','E01005986','E01005987','E01005988','E01005989','E01005990','E01005991','E01005992','E01005993','E01005994','E01005995','E01005996','E01005997','E01005998','E01005999','E01006000','E01006001','E01006002','E01006003','E01006004','E01006005','E01006006','E01006007','E01006008','E01006009','E01006010','E01006011','E01006012','E01006013','E01006014','E01006015','E01006016','E01006017','E01006018','E01006019','E01006020','E01006021','E01006022','E01006023','E01006024','E01006025','E01006026','E01006027','E01006028','E01006029','E01006030','E01006031','E01006032','E01006033','E01006034','E01006035','E01006036','E01006037','E01006038','E01006039','E01006040','E01006041','E01006042','E01006043','E01006044','E01006045','E01006046','E01006047','E01006048','E01006049','E01006050','E01006051','E01006052','E01006053','E01006054','E01006055','E01006056','E01006057','E01006058','E01006059','E01006060','E01006061','E01006062','E01006063','E01006064','E01006065','E01006066','E01006067','E01006068','E01006069','E01006070','E01006071','E01006072','E01006073','E01006074','E01006075','E01006076','E01006077','E01006078','E01006079','E01006080','E01006081','E01006082','E01006083','E01006084','E01006085','E01006086','E01006087','E01006088','E01006089','E01006090','E01006091','E01006092','E01006093','E01006094','E01006095','E01006096','E01006097','E01006098','E01006099','E01006100','E01006101','E01006102','E01006103','E01006104','E01006105','E01006106','E01006107','E01006108','E01006109','E01006110','E01006111','E01006112','E01006113','E01006114','E01006115','E01006116','E01006117','E01006118','E01006119','E01006120','E01006121','E01006122','E01006123','E01006124','E01006125','E01006126','E01006127','E01006128','E01006129','E01006130','E01006131','E01006132','E01006133','E01006134','E01006135','E01006136','E01006137','E01006138','E01006139','E01006140','E01006141','E01006142','E01006143','E01006144','E01006145','E01006146','E01006147','E01006148','E01006149','E01006150','E01006151','E01006152','E01006153','E01006154','E01006155','E01006156','E01006157','E01006158','E01006159','E01006160','E01006161','E01006162','E01006163','E01006164','E01006165','E01006166','E01006167','E01006168','E01006169','E01006170','E01006171','E01006172','E01006173','E01006174','E01006175','E01006176','E01006177','E01006178','E01006179','E01006180','E01006181','E01006182','E01006183','E01006184','E01006186','E01006187','E01006188','E01006189','E01006190','E01006191','E01006192','E01006193','E01006194','E01006195','E01006196','E01006197','E01006198','E01006199','E01006200','E01006201','E01006202','E01006203','E01006204','E01006205','E01006206','E01006207','E01006208','E01006209','E01006210','E01006211','E01006212','E01006213','E01006214','E01006215','E01006216','E01006217','E01006218','E01006219','E01006220','E01006221','E01006222','E01006223','E01006224','E01006225','E01006226','E01006227','E01006228','E01006229','E01006230','E01006231','E01006232','E01006233','E01006234','E01006235','E01006236','E01006237','E01006238','E01006239','E01006240','E01006241','E01006242','E01006243','E01006244','E01006245','E01006246','E01006247','E01006248','E01006249','E01006250','E01006251','E01006252','E01006253','E01006254','E01006255','E01006256','E01006257','E01006258','E01006259','E01006260','E01006261','E01006262','E01006263','E01006264','E01006265','E01006266','E01006267','E01006268','E01006269','E01006270','E01006271','E01006272','E01006273','E01006274','E01006275','E01006276','E01006277','E01006278','E01006279','E01006280','E01006281','E01006282','E01006283','E01006284','E01006285','E01006286','E01006287','E01006288','E01006289','E01006290','E01006291','E01006292','E01006293','E01006294','E01006295','E01006296','E01006297','E01006298','E01006299','E01006300','E01006301','E01006302','E01006303','E01006304','E01006305','E01006306','E01006307','E01006308','E01006309','E01006310','E01006311','E01006312','E01006313','E01006314','E01006315','E01006316','E01006317','E01006318','E01006319','E01006320','E01006321','E01006322','E01006323','E01006324','E01006325','E01006326','E01006327','E01006328','E01006329','E01006330','E01006331','E01006332','E01006333','E01006334','E01006335','E01006336','E01006337','E01006338','E01006339','E01006340','E01006341','E01006342','E01006343','E01006344','E01006345','E01006346','E01006347','E01006348','E01006349','E01006350','E01006351','E01006352','E01006353','E01006354','E01006355','E01006356','E01006357','E01006358','E01006359','E01006360','E01006361','E01006362','E01006363','E01006364','E01006365','E01006366','E01006367','E01006368','E01006369','E01006370','E01006371','E01006372','E01006373','E01006374','E01006375','E01006376','E01006377','E01006378','E01006379','E01006380','E01006381','E01006382','E01006383','E01006384','E01006385','E01006386','E01006387','E01006388','E01006389','E01006390','E01006391','E01006392','E01006393','E01006394','E01006395','E01006396','E01006397','E01006398','E01006399','E01006400','E01006401','E01006402','E01006403','E01006404','E01006405','E01006406','E01006407','E01006408','E01006409','E01006410','E01006411','E01032556','E01032557','E01032558','E01032559','E01032684','E01032906','E01032909','E01032912','E01032914','E01032915','E01032920','E01032922','E01033217','E01033218','E01033219','E01033220','E01033330','E01033651','E01033653','E01033654','E01033655','E01033656','E01033658','E01033660','E01033661','E01033662','E01033664','E01033665','E01033667','E01033668','E01033669','E01033670','E01033671','E01033672','E01033673','E01033674','E01033675','E01033676','E01033677','E01033678','E01033679','E01033680','E01033681','E01033682','E01033684','E01033685','E01033686','E01033687','E01033688','E01033947','E01033948','E01033949','E01033950','E01033976','E01033977','E01033978','E01033979','E01033980','E01033981','E01033982','E01033983','E01033984','E01033985','E01033986','E01033987','E01033988','E01033989','E01033990','E01033991','E01033992','E01033993','E01033994','E01033995','E01033996','E01033997','E01033998','E01033999','E01034000','E01034001','E01034107','E01034108','E01034109','E01034110','E01034111','E01034112','E01034113','E01034114','E01034115','E01034116','E01034117','E01034118','E01034119','E01034120','E01034121','E01034122','E01034123','E01034124','E01034125','E01034126','E01034127','E01034128','E01034129','E01034130','E01034131','E01034132','E01034133','E01034134','E01034135','E01034136','E01034137','E01034138','E01034232','E01034233','E01034234','E01034235','NA')"
## Reading layer `LSOA_2021_EW_BGC_V3' from data source 
##   `/Users/E33390/Library/CloudStorage/OneDrive-RMITUniversity/General - JIBE working group/visualisation/external_data/Office of National Statistics/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_4023609225507911834.gpkg' 
##   using driver `GPKG'
## Simple feature collection with 35672 features and 7 fields
## Geometry type: MULTIPOLYGON
## Dimension:     XY
## Bounding box:  xmin: 82668.52 ymin: 5352.6 xmax: 655653.8 ymax: 657539.4
## Projected CRS: OSGB36 / British National Grid
## Writing layer `GreaterManchester_LSOA_ONS_2024' to data source 
##   `../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_LSOA_ONS_2024.fgb' using driver `FlatGeobuf'
## Writing 1702 features with 7 fields and geometry type Multi Polygon.
## Feature data exported to ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_LSOA_ONS_2024.fgb 
## [1] "MSOA21CD %in% c('E02000988','E02000984','E02000986','E02000997','E02001014','E02000987','E02000992','E02000990','E02000989','E02000996','E02000985','E02001002','E02000993','E02001005','E02001010','E02001012','E02001000','E02000994','E02000999','E02001004','E02001006','E02001009','E02001001','E02001003','E02000995','E02001008','E02001015','E02001016','E02000991','E02000998','E02001011','E02001013','E02001017','E02001007','E02001018','E02001039','E02001035','E02001027','E02001028','E02001025','E02001026','E02001023','E02001024','E02001040','E02001041','E02001042','E02001022','E02001038','E02001037','E02001034','E02001033','E02001036','E02001032','E02001030','E02001019','E02001020','E02001021','E02001029','E02001031','E02001043','E02001044','E02001062','E02001064','E02001095','E02001091','E02001092','E02001083','E02001086','E02001081','E02001093','E02001094','E02001059','E02001056','E02001045','E02001046','E02001048','E02001088','E02001078','E02001085','E02001084','E02001089','E02006912','E02006983','E02006902','E02001047','E02006915','E02006913','E02001052','E02001073','E02001077','E02001050','E02001087','E02001074','E02001076','E02001065','E02001061','E02001067','E02006986','E02001053','E02001063','E02006914','E02006916','E02001075','E02001051','E02001066','E02006985','E02001068','E02001069','E02001049','E02001055','E02001090','E02001079','E02001082','E02001070','E02001096','E02001072','E02001080','E02001097','E02001121','E02001119','E02001126','E02001114','E02001112','E02001125','E02001107','E02001124','E02001111','E02001113','E02001102','E02001098','E02001100','E02001128','E02001129','E02001130','E02001131','E02001127','E02001123','E02001115','E02001101','E02001105','E02001106','E02001118','E02001110','E02001117','E02001103','E02001108','E02001116','E02007001','E02001099','E02001109','E02001104','E02007000','E02001147','E02001143','E02001146','E02001141','E02001142','E02001148','E02001137','E02001136','E02001140','E02001149','E02001151','E02001150','E02001134','E02001132','E02001133','E02001152','E02001153','E02001156','E02001155','E02001154','E02001145','E02001144','E02001138','E02001135','E02001139','E02001182','E02001183','E02006960','E02006958','E02006957','E02001186','E02001174','E02001173','E02001171','E02001177','E02001176','E02001185','E02001166','E02001167','E02001179','E02001157','E02001160','E02006961','E02001161','E02001168','E02001164','E02001180','E02001162','E02001165','E02001170','E02001159','E02001158','E02001163','E02001169','E02001175','E02001181','E02001195','E02001191','E02001198','E02001190','E02001200','E02001209','E02001212','E02001202','E02001204','E02001214','E02001211','E02001208','E02001220','E02001216','E02001225','E02001227','E02001213','E02001221','E02001219','E02001223','E02001210','E02001205','E02001207','E02001217','E02001224','E02001222','E02001226','E02001199','E02001197','E02001194','E02001189','E02001192','E02001201','E02001206','E02001203','E02001187','E02001188','E02001196','E02001215','E02001193','E02001228','E02001218','E02001234','E02001232','E02001230','E02001235','E02001241','E02001233','E02001242','E02001247','E02001249','E02001253','E02001254','E02001257','E02001252','E02001238','E02001239','E02001240','E02001245','E02001244','E02001246','E02001243','E02001250','E02001255','E02001256','E02001248','E02001258','E02001251','E02001229','E02001231','E02001236','E02001237','E02001283','E02001285','E02001282','E02001284','E02001278','E02001277','E02001281','E02001273','E02001272','E02001279','E02001276','E02001275','E02001259','E02001262','E02001260','E02001268','E02001263','E02001265','E02001286','E02001261','E02001269','E02001270','E02001274','E02001264','E02001266','E02001271','E02001267','E02001280','E02001312','E02001310','E02001321','E02001322','E02001324','E02001288','E02001290','E02001293','E02001303','E02001309','E02001320','E02001317','E02001315','E02001291','E02001294','E02001289','E02001318','E02001299','E02001302','E02001305','E02001313','E02001311','E02001308','E02001323','E02001326','E02001298','E02001295','E02001287','E02001319','E02001316','E02001325','E02001301','E02001296','E02001300','E02001297','E02001304','E02001292','E02001314','E02001307','E02001306','E02006959','E02006962','E02006917','E02006984','E02006963','NA')"
## Reading layer `MSOA_2021_EW_BGC_V2' from data source 
##   `/Users/E33390/Library/CloudStorage/OneDrive-RMITUniversity/General - JIBE working group/visualisation/external_data/Office of National Statistics/MSOA_2021_EW_BGC_V2_6515647442419654873.gpkg' 
##   using driver `GPKG'
## Simple feature collection with 7264 features and 7 fields
## Geometry type: MULTIPOLYGON
## Dimension:     XY
## Bounding box:  xmin: 82668.52 ymin: 5352.6 xmax: 655653.8 ymax: 657539.4
## Projected CRS: OSGB36 / British National Grid
## Writing layer `GreaterManchester_MSOA_ONS_2024' to data source 
##   `../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_MSOA_ONS_2024.fgb' using driver `FlatGeobuf'
## Writing 353 features with 7 fields and geometry type Multi Polygon.
## Feature data exported to ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_MSOA_ONS_2024.fgb 
## [1] "LAD22CD %in% c('E08000001','E08000002','E08000003','E08000004','E08000005','E08000006','E08000007','E08000008','E08000009','E08000010','NA')"
## Reading layer `LAD_DEC_2022_UK_BGC_V2' from data source 
##   `/Users/E33390/Library/CloudStorage/OneDrive-RMITUniversity/General - JIBE working group/visualisation/external_data/Office of National Statistics/Local_Authority_Districts_December_2022_UK_BGC_V2_-4517174194749745377.gpkg' 
##   using driver `GPKG'
## Simple feature collection with 374 features and 7 fields
## Geometry type: MULTIPOLYGON
## Dimension:     XY
## Bounding box:  xmin: -116.1928 ymin: 5352.6 xmax: 655653.8 ymax: 1220299
## Projected CRS: OSGB36 / British National Grid
## Writing layer `GreaterManchester_LAD_ONS_2024' to data source 
##   `../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_LAD_ONS_2024.fgb' using driver `FlatGeobuf'
## Writing 10 features with 7 fields and geometry type Multi Polygon.
## Feature data exported to ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_LAD_ONS_2024.fgb
```

#### Generate pmtiles file containing Manchester area layers

``` r
output_pmtiles <- "../../../visualisation/derived_data/PMTiles/Manchester.pmtiles"
output_dir <- dirname(output_pmtiles)

# Check if the directory exists, and if not, create it
if (!dir.exists(output_dir)) {
  dir.create(output_dir, recursive = TRUE)
}
areas <- c()
# Get the list of output fgb files
for (area_name in names(data$Manchester$areas)) {
  area <- data$Manchester$areas[[area_name]]
  # Check if the output is specified and ends with .fgb
  if (!is.null(area$output) && is.character(area$output)) {
    areas <- areas %>% append(paste0('../../../', area$output))
  }
}
tippecanoe_command <- paste(
    "tippecanoe",
    "-o", 
    output_pmtiles,
    "-zg",
    paste(areas, collapse=" ")
)

# Print the command to verify
cat("Running command:", tippecanoe_command)
## Running command: tippecanoe -o ../../../visualisation/derived_data/PMTiles/Manchester.pmtiles -zg ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_LSOA_ONS_2024.fgb ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_MSOA_ONS_2024.fgb ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_LAD_ONS_2024.fgb ../../../visualisation/derived_data/FlatGeobufs/GreaterManchester_OrdnanceSurvey_2024.fgb

# Run the tippecanoe command
system(tippecanoe_command)
```
